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

const FARM_SIZES = ["Small (0-2 acres)", "Medium (2-10 acres)", "Large (10+ acres)"];
const CROPS = ["Maize", "Tomatoes", "Potatoes", "Beans", "Coffee", "Tea", "Other"];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [county, setCounty] = useState('');
  const [country, setCountry] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.full_name && profile.full_name !== 'Bingwa Farmer') setFullName(profile.full_name);
      if (profile.avatar_url) setAvatarUri(profile.avatar_url);
      if (profile.location) setLocation(profile.location);
      if (profile.county) setCounty(profile.county);
      if (profile.country) setCountry(profile.country);
      if (profile.farm_size) setFarmSize(profile.farm_size);
      if (profile.primary_crops) setSelectedCrops(profile.primary_crops);
    }
  }, [profile]);

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need gallery access to update your photo.');
        return;
      }

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
      let publicUrl = profile?.avatar_url;
      
      if (avatarUri && avatarUri !== profile?.avatar_url && !avatarUri.startsWith('http')) {
        setUploading(true);
        const result = await uploadAvatar(avatarUri);
        if (result.success && result.publicUrl) {
           publicUrl = result.publicUrl;
        } else {
           throw new Error(result.error || "Failed to upload image");
        }
        setUploading(false);
      }

      const updateResult = await updateProfile({
        full_name: fullName,
        avatar_url: publicUrl,
        location: location,
        county: county,
        country: country,
        farm_size: farmSize,
        primary_crops: selectedCrops
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
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row justify-between items-center mt-6 mb-8">
            <TouchableOpacity onPress={handleSkip} className="px-4 py-2 bg-gray-200 rounded-full">
                <Text className="text-textSecondary font-poppins-bold text-xs uppercase tracking-wide">Skip</Text>
            </TouchableOpacity>
        </View>

        <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="items-center mb-8"
        >
            <Text className="text-textPrimary font-poppins-black text-3xl text-center mb-2">
                Grow Smarter
            </Text>
            <Text className="text-textSecondary font-poppins-regular text-sm text-center opacity-60 px-4">
                Personalizing your profile helps Bingwa AI give better advice.
            </Text>
        </MotiView>

        {/* Profile Image */}
        <View className="items-center mb-10">
            <TouchableOpacity onPress={pickImage} className="relative">
                <View className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-xl items-center justify-center overflow-hidden">
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
                <View className="absolute bottom-0 right-0 bg-accent w-10 h-10 rounded-full items-center justify-center border-4 border-white shadow-lg">
                    <Ionicons name="camera" size={18} color="white" />
                </View>
            </TouchableOpacity>
        </View>

        <View className="mb-10">
            <AuthInput
                label="Full Name"
                icon="person-outline"
                placeholder="Enter your name"
                value={fullName}
                onChangeText={setFullName}
                isValid={fullName.length > 2}
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

            <TouchableOpacity 
              onPress={handleSave}
              disabled={loading}
              className={`h-16 rounded-[28px] overflow-hidden shadow-2xl shadow-accent/30 mt-6 mb-10 ${loading ? 'opacity-70' : ''}`}
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
                        Save & Continue
                    </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
