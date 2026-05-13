import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface WeeklySpotlight {
  id: string;
  title: string;
  description: string;
  category: string;
  author_name: string;
  author_role: string;
  image_url: string;
  tips: string[];
  created_at?: string;
}

export const useWeeklySpotlight = () => {
  const { data: spotlight, isLoading, error, refetch } = useQuery<WeeklySpotlight>({
    queryKey: ['weekly-spotlight'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_spotlight')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching weekly spotlight:", error);
        // Fallback data if table doesn't exist yet or is empty
        return {
          id: 'fallback',
          title: 'The Secret of Volcanic Soil',
          description: 'How farmers in Rift Valley are doubling their potato yields using traditional composting and volcanic minerals.',
          category: 'Success Story',
          author_name: 'Mzee Juma',
          author_role: 'Lead Farmer, Nakuru',
          image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=800&auto=format&fit=crop',
          tips: [
            'Mix volcanic ash with organic manure for better drainage.',
            'Rotate potatoes with legumes to fix nitrogen naturally.',
            'Harvest only when the soil is dry to prevent rot.'
          ]
        } as WeeklySpotlight;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return { 
    spotlight, 
    loading: isLoading, 
    error: error instanceof Error ? error.message : null, 
    refreshSpotlight: refetch 
  };
};
