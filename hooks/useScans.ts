import { useEffect, useState } from 'react';
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
  };
  recommendations?: {
    organic_advice: string;
    chemical_advice: string;
    prevention: string;
  }[];
}

// Manual Cache for scans
let scansCache: Scan[] = [];
let scansListeners: Array<(s: Scan[]) => void> = [];

export const useScans = (limit?: number) => {
  const [scans, setScans] = useState<Scan[]>(scansCache);
  const [loading, setLoading] = useState(scansCache.length === 0);
  const [error, setError] = useState<string | null>(null);

  const notifyListeners = (s: Scan[]) => {
    scansCache = s;
    scansListeners.forEach(listener => listener(s));
  };

  const fetchScans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        notifyListeners([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('scans')
        .select(`
          *,
          diseases (
            name,
            crop
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
      notifyListeners(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const listener = (s: Scan[]) => setScans(s);
    scansListeners.push(listener);

    if (scansCache.length === 0) {
      fetchScans();
    }

    // Realtime listener for new scans
    let scansSubscription: any;
    const setupRealtime = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        scansSubscription = supabase
            .channel(`scans-cache-${user.id}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'scans',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchScans(); // Refresh on new scan
            })
            .subscribe();
    };

    setupRealtime();

    return () => {
      scansListeners = scansListeners.filter(l => listener !== l);
      if (scansSubscription) supabase.removeChannel(scansSubscription);
    };
  }, [limit]);

  return { scans, loading, error, refreshScans: fetchScans };
};
