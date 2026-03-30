import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../../hooks/useProfile';
import AuthInput from '../../components/AuthInput';

import { BingwaLoader } from '../../components/Loader';

const FARM_SIZES = ["Small (0-2 acres)", "Medium (2-10 acres)", "Large (10+ acres)"];
const CROPS = ["Maize", "Tomatoes", "Potatoes", "Beans", "Coffee", "Tea", "Other"];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, updateProfile, refreshProfile, uploadAvatar } = useProfile();
  
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [county, setCounty] = useState('');
  const [country, setCountry] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setLocation(profile.location || '');
      setCounty(profile.county || '');
      setCountry(profile.country || '');
      setFarmSize(profile.farm_size || '');
      setSelectedCrops(profile.primary_crops || []);
    }
  }, [profile]);

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name cannot be empty");
      return;
    }

    setUpdating(true);
    const result = await updateProfile({ 
      full_name: fullName,
      location,
      county,
      country,
      farm_size: farmSize,
      primary_crops: selectedCrops
    });
    setUpdating(false);

    if (result?.success) {
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } else {
      Alert.alert("Error", result?.error || "Failed to update profile");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      const result = await uploadAvatar(uri);
      if (result.success) {
        await refreshProfile();
        Alert.alert("Success", "Avatar updated successfully");
      } else {
        throw new Error(result.error);
      }
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
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={['top']}>
      <View className="px-6 flex-row items-center justify-between py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-black/5"
        >
          <Ionicons name="arrow-back" size={20} color="#25D366" />
        </TouchableOpacity>
        <Text className="text-textPrimary font-poppins-black text-xl">Edit Profile</Text>
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
              <View className="w-32 h-32 rounded-[40px] bg-accent/10 items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
                {uploading ? (
                  <ActivityIndicator color="#25D366" />
                ) : profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={50} color="#25D366" />
                )}
              </View>
              <TouchableOpacity 
                className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-2xl items-center justify-center border-4 border-white shadow-lg"
                onPress={pickImage}
                disabled={uploading}
              >
                <Ionicons name="camera" size={18} color="white" />
              </TouchableOpacity>
            </MotiView>
          </View>

          <View className="space-y-6">
            <AuthInput
              label="Full Name"
              icon="person-outline"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />

            <View className="flex-row space-x-4">
              <View className="flex-1">
                <AuthInput
                    label="Town/Area"
                    icon="location-outline"
                    placeholder="e.g. Ruiru"
                    value={location}
                    onChangeText={setLocation}
                />
              </View>
              <View className="flex-1">
                <AuthInput
                    label="County"
                    icon="map-outline"
                    placeholder="e.g. Kiambu"
                    value={county}
                    onChangeText={setCounty}
                />
              </View>
            </View>

            <AuthInput
                label="Country"
                icon="globe-outline"
                placeholder="e.g. Kenya"
                value={country}
                onChangeText={setCountry}
            />

            {/* Farm Size */}
            <View className="mb-6">
                <Text className="text-textPrimary font-poppins-bold text-xs uppercase tracking-widest mb-3 ml-1 opacity-60">
                    Farm Size
                </Text>
                <View className="flex-row flex-wrap">
                    {FARM_SIZES.map((size) => (
                        <TouchableOpacity 
                            key={size}
                            onPress={() => setFarmSize(size)}
                            className={`mr-2 mb-2 px-4 py-2.5 rounded-2xl border ${farmSize === size ? 'bg-accent border-accent' : 'bg-white border-black/5'}`}
                        >
                            <Text className={`font-poppins-bold text-[10px] ${farmSize === size ? 'text-white' : 'text-textSecondary'}`}>
                                {size}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Primary Crops */}
            <View className="mb-6">
                <Text className="text-textPrimary font-poppins-bold text-xs uppercase tracking-widest mb-3 ml-1 opacity-60">
                    Your Primary Crops
                </Text>
                <View className="flex-row flex-wrap">
                    {CROPS.map((crop) => (
                        <TouchableOpacity 
                            key={crop}
                            onPress={() => toggleCrop(crop)}
                            className={`mr-2 mb-2 px-4 py-2.5 rounded-2xl border ${selectedCrops.includes(crop) ? 'bg-accent border-accent' : 'bg-white border-black/5'}`}
                        >
                            <Text className={`font-poppins-bold text-[10px] ${selectedCrops.includes(crop) ? 'text-white' : 'text-textSecondary'}`}>
                                {crop}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="mb-5">
              <Text className="text-textSecondary font-poppins-bold text-[10px] uppercase tracking-widest mb-2 ml-1">
                Email Address
              </Text>
              <View className="flex-row items-center bg-gray-100 border border-black/5 rounded-[20px] px-4 h-14 opacity-60">
                <Ionicons name="mail-outline" size={20} color="#8696A0" style={{ marginRight: 12 }} />
                <Text className="flex-1 text-textSecondary font-poppins-regular text-sm">
                  {profile?.email}
                </Text>
                <Ionicons name="lock-closed" size={16} color="#8696A0" />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleUpdate}
            disabled={updating || uploading}
            className={`mt-6 h-16 rounded-[24px] overflow-hidden shadow-xl shadow-accent/30 mb-10 ${updating ? 'opacity-70' : ''}`}
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
