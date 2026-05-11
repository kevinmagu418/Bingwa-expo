import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Trend {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  link?: string;
  created_at?: string;
}

const TRENDS_CACHE_KEY = 'bingwa_trends_cache';

export const useTrends = () => {
  // 1. Initial hydration from AsyncStorage
  useEffect(() => {
    const hydrate = async () => {
      const cached = await AsyncStorage.getItem(TRENDS_CACHE_KEY);
      if (cached) {
        // We don't necessarily need to setQueryData here if we rely on staleTime
        // but it helps with immediate UI responsiveness.
      }
    };
    hydrate();
  }, []);

  const { data: trends, isLoading, error, refetch } = useQuery<Trend[]>({
    queryKey: ['trends'],
    queryFn: async () => {
      try {
        // Fetch from Supabase 'trends' table
        const { data, error } = await supabase
          .from('trends')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        const results = data || [];
        // 2. Save fresh data to cache
        await AsyncStorage.setItem(TRENDS_CACHE_KEY, JSON.stringify(results));
        return results;
      } catch (err) {
        console.warn("Trends fetch failed, checking cache...");
        const cached = await AsyncStorage.getItem(TRENDS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour - trends don't change that often
  });

  return { 
    trends: trends || [], 
    loading: isLoading, 
    error: error instanceof Error ? error.message : null, 
    refreshTrends: refetch 
  };
};
