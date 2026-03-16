import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../hooks/useProfile';
import AuthInput from '../../components/AuthInput';

import { BingwaLoader } from '../../components/Loader';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, updateProfile, refreshProfile } = useProfile();
  
  const [fullName, setFullName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name cannot be empty");
      return;
    }

    setUpdating(true);
    const result = await updateProfile({ full_name: fullName });
    setUpdating(false);

    if (result?.success) {
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } else {
      Alert.alert("Error", result?.error || "Failed to update profile");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('scans') // Using the 'scans' bucket for now as per previous setup, or create an 'avatars' one
        .upload(filePath, formData);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('scans')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      await refreshProfile();
      Alert.alert("Success", "Avatar updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  if (profileLoading) {
    return <BingwaLoader label="Loading Profile Details..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <View className="px-6 flex-row items-center justify-between py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white dark:bg-darkSurface rounded-full items-center justify-center shadow-sm border border-black/5 dark:border-white/5"
        >
          <Ionicons name="arrow-back" size={20} color="#25D366" />
        </TouchableOpacity>
        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Edit Profile</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
          
          <View className="items-center py-10">
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <View className="w-32 h-32 rounded-[40px] bg-accent/10 items-center justify-center border-4 border-white dark:border-darkSurface shadow-2xl overflow-hidden">
                {uploading ? (
                  <ActivityIndicator color="#25D366" />
                ) : profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={50} color="#25D366" />
                )}
              </View>
              <TouchableOpacity 
                className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-2xl items-center justify-center border-4 border-white dark:border-darkSurface shadow-lg"
                onPress={pickImage}
                disabled={uploading}
              >
                <Ionicons name="camera" size={18} color="white" />
              </TouchableOpacity>
            </MotiView>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs mt-4 opacity-60">
              Tap the camera to change your photo
            </Text>
          </View>

          <View className="space-y-6">
            <AuthInput
              label="Full Name"
              icon="person-outline"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />

            <View className="mb-5">
              <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[10px] uppercase tracking-widest mb-2 ml-1">
                Email Address
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-darkSurface/50 border border-black/5 dark:border-white/5 rounded-[20px] px-4 h-14 opacity-60">
                <Ionicons name="mail-outline" size={20} color="#8696A0" style={{ marginRight: 12 }} />
                <Text className="flex-1 text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm">
                  {profile?.email}
                </Text>
                <Ionicons name="lock-closed" size={16} color="#8696A0" />
              </View>
              <Text className="text-[#8696A0] font-poppins-regular text-[10px] mt-2 ml-1">
                Email cannot be changed once verified.
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleUpdate}
            disabled={updating || uploading}
            className={`mt-10 h-16 rounded-[24px] overflow-hidden shadow-xl shadow-accent/30 ${updating ? 'opacity-70' : ''}`}
          >
            <LinearGradient
              colors={['#25D366', '#128C7E']}
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }}
              className="flex-1 items-center justify-center flex-row"
            >
              {updating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" className="mr-2" />
                  <Text className="text-white font-poppins-black text-sm uppercase tracking-widest ml-2">Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
