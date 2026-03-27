import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '../../hooks/useProfile';

import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export default function PreviewScreen() {
  const router = useRouter();
  const { imageUri, cropType } = useLocalSearchParams();
  const [isValidating, setIsValidating] = useState(false);

  const { profile, loading: profileLoading } = useProfile();

  const handleRetake = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAnalyze = async () => {
    if (profileLoading || isValidating) return;

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!profile?.is_premium && (profile?.scan_credits || 0) <= 0) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push('/(modals)/payment-required');
      return;
    }

    setIsValidating(true);
    try {
        // Simulate a quick check or initial local preprocessing
        setTimeout(() => {
            router.push({
                pathname: '/(scan)/processing',
                params: { imageUri: imageUri, cropType: cropType }
            });
            setIsValidating(false);
        }, 800);
    } catch (error) {
        setIsValidating(false);
        Alert.alert("Analysis Error", "Something went wrong while preparing the image. Please try again.");
    }
  };

  if (!imageUri) {
      return (
          <View className="flex-1 items-center justify-center bg-black">
              <Text className="text-white font-poppins-bold">No image found</Text>
              <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-2 bg-white/10 rounded-full">
                  <Text className="text-white font-poppins-medium">Go Back</Text>
              </TouchableOpacity>
          </View>
      );
  }

  return (
    <View className="flex-1 bg-black">
      <Image 
        source={{ uri: imageUri as string }} 
        className="absolute inset-0 w-full h-full opacity-60" 
        resizeMode="cover" 
        blurRadius={10}
      />
      
      <SafeAreaView className="flex-1 justify-between">
        <View className="flex-1 items-center justify-center px-6">
            <MotiView 
                from={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' }}
                className="w-full aspect-[3/4] rounded-[32px] overflow-hidden border-2 border-white/20 shadow-2xl bg-black relative"
            >
                <Image 
                    source={{ uri: imageUri as string }} 
                    className="w-full h-full" 
                    resizeMode="cover" 
                />
                
                {/* Crop Badge */}
                <View className="absolute top-4 left-4 bg-accent px-4 py-1.5 rounded-full shadow-lg">
                    <Text className="text-white font-poppins-bold text-[10px] uppercase tracking-widest">{cropType}</Text>
                </View>

                {isValidating && (
                   <View className="absolute inset-0 bg-black/40 items-center justify-center">
                      <BingwaLoader label="Preparing Image..." />
                   </View>
                )}
            </MotiView>
            
            {/* Validation Tips */}
            <MotiView 
                from={{ translateY: 20, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{ delay: 300 }}
                className="mt-8 bg-white/10 p-5 rounded-[24px] w-full backdrop-blur-md border border-white/10"
            >
                <Text className="text-white font-poppins-bold text-sm mb-3 uppercase tracking-widest text-center">Quality Check</Text>
                
                <View className="flex-row items-center mb-2">
                    <Ionicons name="checkmark-circle" size={16} color="#25D366" />
                    <Text className="text-white/80 font-poppins-regular text-xs ml-2">Leaf is clearly visible</Text>
                </View>
                <View className="flex-row items-center mb-2">
                    <Ionicons name="checkmark-circle" size={16} color="#25D366" />
                    <Text className="text-white/80 font-poppins-regular text-xs ml-2">Avoid heavy shadows or blur</Text>
                </View>
                 <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#25D366" />
                    <Text className="text-white/80 font-poppins-regular text-xs ml-2">Only one leaf in focus</Text>
                </View>
            </MotiView>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between items-center px-8 pb-10 pt-4">
             <TouchableOpacity 
                onPress={handleRetake}
                disabled={isValidating}
                className="w-14 h-14 rounded-full bg-white/10 items-center justify-center border border-white/20"
             >
                 <Ionicons name="close" size={24} color="white" />
             </TouchableOpacity>

             <TouchableOpacity 
                onPress={handleAnalyze}
                disabled={isValidating || profileLoading}
                className={`flex-1 ml-6 h-16 rounded-[24px] overflow-hidden shadow-xl ${isValidating ? 'opacity-70' : 'shadow-green-900/40'}`}
             >
                <LinearGradient
                    colors={['#25D366', '#128C7E']}
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 0 }}
                    className="flex-1 items-center justify-center flex-row"
                >
                    {isValidating ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Text className="text-white font-poppins-black text-sm uppercase tracking-widest mr-2">
                                Analyze Crop
                            </Text>
                            <Ionicons name="scan" size={18} color="white" />
                        </>
                    )}
                </LinearGradient>
             </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

import { ActivityIndicator } from 'react-native';
import { BingwaLoader } from '../../components/Loader';

