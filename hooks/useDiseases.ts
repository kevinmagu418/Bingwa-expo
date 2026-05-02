import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const DISEASES_CACHE_KEY = 'bingwa_diseases_cache';

export const useDiseases = (category?: string) => {
  const { data: diseases, isLoading, error, refetch } = useQuery<Disease[]>({
    queryKey: ['diseases', category],
    queryFn: async () => {
      // 1. Try cache
      const cached = await AsyncStorage.getItem(DISEASES_CACHE_KEY);
      const initialData = cached ? JSON.parse(cached) : [];

      try {
        let query = supabase
          .from('diseases')
          .select('*')
          .order('name', { ascending: true });

        if (category && category !== 'All') {
          query = query.eq('crop', category);
        }

        const { data, error } = await query;
        if (error) throw error;

        const results = data || [];
        
        // 2. Only cache "All" or featured for general use
        if (!category || category === 'All') {
          await AsyncStorage.setItem(DISEASES_CACHE_KEY, JSON.stringify(results));
        }

        return results;
      } catch (err) {
        console.warn("Diseases fetch failed, using cache:", err);
        if (initialData.length > 0) {
          if (category && category !== 'All') {
            return initialData.filter((d: Disease) => d.crop === category);
          }
          return initialData;
        }
        throw err;
      }
    },
  });

  const featuredDiseases = (diseases || []).filter(d => d.featured);

  return { 
    diseases: diseases || [], 
    featuredDiseases, 
    loading: isLoading, 
    error: error instanceof Error ? error.message : null, 
    refreshDiseases: refetch 
  };
};
