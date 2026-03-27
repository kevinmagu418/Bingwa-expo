import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import AuthInput from '../../components/AuthInput';
import { useProfile } from '../../hooks/useProfile';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  
  const [fullName, setFullName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    if (profile?.avatar_url) {
      setAvatarUri(profile.avatar_url);
    }
  }, [profile]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/scan');
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Avatar if changed
      let publicUrl = profile?.avatar_url;
      
      if (avatarUri && avatarUri !== profile?.avatar_url) {
        setUploading(true);
        const result = await uploadAvatar(avatarUri);
        if (result.success && result.publicUrl) {
           publicUrl = result.publicUrl;
        } else {
           throw new Error(result.error || "Failed to upload image");
        }
        setUploading(false);
      }

      // 2. Update Profile
      const updateResult = await updateProfile({
        full_name: fullName,
        avatar_url: publicUrl
      });

      if (updateResult.success) {
        router.replace('/(tabs)/scan');
      } else {
        throw new Error(updateResult.error || "Failed to update profile");
      }

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground">
      <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row justify-between items-center mt-6 mb-8">
            <TouchableOpacity onPress={handleSkip} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-full">
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-xs uppercase tracking-wide">Skip</Text>
            </TouchableOpacity>
        </View>

        <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="items-center mb-10"
        >
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl text-center mb-2">
                Almost There!
            </Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center opacity-60 px-4">
                Let's personalize your profile so we can address you properly.
            </Text>
        </MotiView>

        <View className="items-center mb-10">
            <TouchableOpacity onPress={pickImage} className="relative">
                <View className="w-32 h-32 rounded-full bg-gray-100 dark:bg-white/5 border-4 border-white dark:border-white/10 shadow-xl items-center justify-center overflow-hidden">
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} className="w-full h-full" />
                    ) : (
                        <Ionicons name="person" size={48} color="#CCCCCC" />
                    )}
                    {uploading && (
                        <View className="absolute inset-0 bg-black/40 items-center justify-center">
                            <ActivityIndicator color="#25D366" />
                        </View>
                    )}
                </View>
                <View className="absolute bottom-0 right-0 bg-accent w-10 h-10 rounded-full items-center justify-center border-4 border-white dark:border-darkBackground shadow-lg">
                    <Ionicons name="camera" size={18} color="white" />
                </View>
            </TouchableOpacity>
        </View>

        <View>
            <AuthInput
                label="Full Name"
                icon="person-outline"
                placeholder="How should we call you?"
                value={fullName}
                onChangeText={setFullName}
                isValid={fullName.length > 2}
            />

            <TouchableOpacity 
              onPress={handleSave}
              disabled={loading}
              className={`h-16 rounded-[28px] overflow-hidden shadow-2xl shadow-accent/30 mt-6 ${loading ? 'opacity-70' : ''}`}
            >
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }}
                className="flex-1 items-center justify-center flex-row"
              >
                {loading ? (
                    <ActivityIndicator color="white" className="mr-2" />
                ) : (
                    <Text className="text-white font-poppins-black text-sm uppercase tracking-[3px]">
                        Complete Profile
                    </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
