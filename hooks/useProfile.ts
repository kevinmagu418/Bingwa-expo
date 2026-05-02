import { useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_premium: boolean;
  scan_credits: number;
  farm_size?: string;
  primary_crops?: string[];
  location?: string;
  county?: string;
  country?: string;
}

const PROFILE_CACHE_KEY = 'bingwa_profile_cache';

export const useProfile = () => {
  const queryClient = useQueryClient();

  // Query to fetch profile
  const { data: profile, isLoading, error, refetch } = useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      // 1. Try to get from AsyncStorage first (as a backup if cache is empty)
      const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      const initialData = cached ? JSON.parse(cached) : null;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        const socialName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const socialAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

        const mergedProfile: Profile = {
          id: user.id,
          email: user.email || '',
          full_name: data?.full_name || socialName || 'Bingwa Farmer',
          avatar_url: data?.avatar_url || socialAvatar || '',
          is_premium: data?.is_premium || false,
          scan_credits: data?.scan_credits || 0,
          farm_size: data?.farm_size,
          primary_crops: data?.primary_crops,
          location: data?.location,
          county: data?.county,
          country: data?.country
        };

        // 2. Save fresh data to AsyncStorage
        await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(mergedProfile));
        return mergedProfile;
      } catch (err) {
        console.warn("Profile fetch failed, using cache:", err);
        // If API fails, return cached data if we have it
        if (initialData) return initialData;
        throw err;
      }
    },
    // Use initial data from AsyncStorage if available
    initialData: undefined, 
  });

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      return updates;
    },
    onSuccess: (updates) => {
      // Optimistically update the cache
      queryClient.setQueryData(['profile'], (old: Profile | undefined) => {
        if (!old) return old;
        const updated = { ...old, ...updates };
        AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
  });

  // Real-time listener setup
  useEffect(() => {
    let profileSubscription: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      profileSubscription = supabase
        .channel(`profile-changes-${user.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        })
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (profileSubscription) supabase.removeChannel(profileSubscription);
    };
  }, [queryClient]);

  const uploadAvatar = async (uri: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const fileExt = uri.split(/[?#]/)[0].split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const mimeType = fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' : `image/${fileExt}`;

      let uploadBody: any;
      if (Platform.OS !== 'web') {
        const formData = new FormData();
        formData.append('file', { uri, name: fileName, type: mimeType } as any);
        uploadBody = formData;
      } else {
        const response = await fetch(uri);
        uploadBody = await response.blob();
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, uploadBody, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      if (data) {
        await updateProfileMutation.mutateAsync({ avatar_url: data.publicUrl });
      }
      
      return { success: true, publicUrl: data?.publicUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      await updateProfileMutation.mutateAsync(updates);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const refreshProfile = async () => {
    const result = await refetch();
    return result.data;
  };

  return { 
    profile: profile || null, 
    loading: isLoading, 
    error: error instanceof Error ? error.message : null, 
    refreshProfile, 
    updateProfile, 
    uploadAvatar 
  };
};
