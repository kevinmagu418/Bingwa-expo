import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Report {
  id: string;
  user_id: string;
  data: any[];
  created_at: string;
}

const REPORTS_CACHE_KEY = 'bingwa_reports_cache';

export const useReports = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading, error, refetch } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching reports:", error.message);
            throw error;
        }

        return data || [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const saveReport = useMutation({
    mutationFn: async (reportData: any[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          data: reportData,
        })
        .select()
        .single();

      if (error) {
          console.error("Error saving report:", error.message);
          throw error;
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['reports'] });
    },
  });

  return { 
    reports: reports || [], 
    loading: isLoading, 
    error: error instanceof Error ? error.message : null, 
    saveReport: saveReport.mutateAsync,
    refreshReports: refetch 
  };
};
