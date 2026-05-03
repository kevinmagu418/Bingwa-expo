import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Scan {
  id: string;
  user_id: string;
  disease_id: string;
  image_url: string;
  confidence_score: number;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  diseases: {
    name: string;
    crop: string;
    organic_remedies?: any;
    chemical_remedies?: any;
    prevention_tips?: any;
  };
  recommendations?: any;
}

const SCANS_CACHE_KEY = 'bingwa_scans_cache';
// Increment this whenever the query shape changes so stale caches are auto-cleared.
const CACHE_VERSION = 'v3'; // bumped: added chemical_remedies, organic_remedies, recommendations
const CACHE_VERSION_KEY = 'bingwa_scans_cache_version';

export const useScans = (limit?: number) => {
  const queryClient = useQueryClient();

  const { data: scans, isLoading, error, refetch } = useQuery<Scan[]>({
    queryKey: ['scans', limit],
    queryFn: async () => {
      // 1. Validate cache version — if stale, discard it so mobile doesn't
      //    serve old data that's missing chemical_remedies / recommendations.
      const cachedVersion = await AsyncStorage.getItem(CACHE_VERSION_KEY);
      if (cachedVersion !== CACHE_VERSION) {
        await AsyncStorage.removeItem(SCANS_CACHE_KEY);
        await AsyncStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
      }

      // 2. Load from (now-validated) cache first
      const cached = await AsyncStorage.getItem(SCANS_CACHE_KEY);
      const initialData = cached ? JSON.parse(cached) : [];

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
          .from('scans')
          .select(`
            *,
            diseases (
              name,
              crop,
              organic_remedies,
              chemical_remedies,
              prevention_tips
            ),
            recommendations (
              organic_advice,
              chemical_advice,
              prevention
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) throw error;

        const results = data || [];
        // 2. Save fresh data to cache (only if not limited for main list)
        if (!limit) {
          await AsyncStorage.setItem(SCANS_CACHE_KEY, JSON.stringify(results));
        }
        
        return results;
      } catch (err) {
        console.warn("Scans fetch failed, using cache:", err);
        if (initialData.length > 0) return limit ? initialData.slice(0, limit) : initialData;
        throw err;
      }
    },
  });

  useEffect(() => {
    let scansSubscription: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      scansSubscription = supabase
        .channel(`scans-changes-${user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'scans',
          filter: `user_id=eq.${user.id}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['scans'] });
        })
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (scansSubscription) supabase.removeChannel(scansSubscription);
    };
  }, [queryClient]);

  return { 
    scans: scans || [], 
    loading: isLoading, 
    error: error instanceof Error ? error.message : null, 
    refreshScans: refetch 
  };
};
