import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Disease {
  id: string;
  name: string;
  crop: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
  image_url: string;
  description: string;
  featured: boolean;
  created_at: string;
}

export const useDiseases = (category?: string) => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [featuredDiseases, setFeaturedDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('diseases')
        .select('*')
        .order('name', { ascending: true });

      if (category && category !== 'All') {
        query = query.eq('crop', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setDiseases(data || []);
      setFeaturedDiseases((data || []).filter(d => d.featured));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, [category]);

  return { diseases, featuredDiseases, loading, error, refreshDiseases: fetchDiseases };
};
