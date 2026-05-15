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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
            console.warn("Reports table might not exist yet:", error.message);
            // Fallback to local storage if table doesn't exist
            const cached = await AsyncStorage.getItem(REPORTS_CACHE_KEY);
            return cached ? JSON.parse(cached) : [];
        }

        const results = data || [];
        await AsyncStorage.setItem(REPORTS_CACHE_KEY, JSON.stringify(results));
        return results;
      } catch (err) {
        const cached = await AsyncStorage.getItem(REPORTS_CACHE_KEY);
        return cached ? JSON.parse(cached) : [];
      }
    },
    staleTime: 1000 * 60 * 5,
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
          // If Supabase fails, save to local storage as fallback
          const cached = await AsyncStorage.getItem(REPORTS_CACHE_KEY);
          const reports = cached ? JSON.parse(cached) : [];
          const newReport = {
              id: Math.random().toString(36).substring(7),
              user_id: user.id,
              data: reportData,
              created_at: new Date().toISOString()
          };
          await AsyncStorage.setItem(REPORTS_CACHE_KEY, JSON.stringify([newReport, ...reports]));
          return newReport;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
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
