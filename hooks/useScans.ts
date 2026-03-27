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
}

export const useScans = (limit?: number) => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('scans')
        .select(`
          *,
          diseases (
            name,
            crop
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setScans(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let scansSubscription: any;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      scansSubscription = supabase
        .channel(`scans-${user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'scans',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchScans();
        })
        .subscribe();
    };

    fetchScans();
    setupSubscription();

    return () => {
      if (scansSubscription) supabase.removeChannel(scansSubscription);
    };
  }, []);

  return { scans, loading, error, refreshScans: fetchScans };
};
