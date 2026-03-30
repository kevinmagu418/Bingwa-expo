import { useEffect, useState } from 'react';
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

// Manual Cache implementation to avoid bundling issues with 3rd party stores
let profileCache: Profile | null = null;
let profileListeners: Array<(p: Profile | null) => void> = [];

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(profileCache);
  const [loading, setLoading] = useState(!profileCache);
  const [error, setError] = useState<string | null>(null);

  const notifyListeners = (p: Profile | null) => {
    profileCache = p;
    profileListeners.forEach(listener => listener(p));
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        notifyListeners(null);
        setLoading(false);
        return;
      }

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

      notifyListeners(mergedProfile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add this component to listeners
    const listener = (p: Profile | null) => setProfile(p);
    profileListeners.push(listener);

    // Initial load logic
    if (!profileCache) {
      fetchProfile();
    }

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        notifyListeners(null);
      }
    });

    let profileSubscription: any;
    const setupRealtime = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        profileSubscription = supabase
            .channel(`profile-cache-${user.id}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'profiles',
                filter: `id=eq.${user.id}`
            }, (payload) => {
                const updated = payload.new as any;
                if (profileCache) {
                    notifyListeners({ ...profileCache, ...updated });
                } else {
                    fetchProfile();
                }
            })
            .subscribe();
    };

    setupRealtime();

    return () => {
      profileListeners = profileListeners.filter(l => listener !== l);
      authListener.unsubscribe();
      if (profileSubscription) supabase.removeChannel(profileSubscription);
    };
  }, []);

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'User not found' };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      if (profileCache) {
          notifyListeners({ ...profileCache, ...updates });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) {
        console.error("Supabase Storage Upload Error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (data) {
          await updateProfile({ avatar_url: data.publicUrl });
      }
      
      return { success: true, publicUrl: data.publicUrl };
    } catch (error: any) {
      console.error("Full upload process error:", error);
      return { success: false, error: error.message };
    }
  };

  return { profile, loading, error, refreshProfile: fetchProfile, updateProfile, uploadAvatar };
};
