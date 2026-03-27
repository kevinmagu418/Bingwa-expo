import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView, MotiText } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const LOADING_STEPS = [
  "Analyzing leaf structure...",
  "Detecting pathogens...",
  "Matching with database...",
  "Generating remedies..."
];

import { processImageScan } from '../../services/api';
import { Alert } from 'react-native';

export default function ProcessingScreen() {
  const router = useRouter();
  const { imageUri, cropType } = useLocalSearchParams();
  const [stepIndex, setStepIndex] = useState(0);

  const startAnalysis = async () => {
    try {
      if (!imageUri) throw new Error("No image data found");

      const result = await processImageScan(imageUri as string, cropType as string);

      if (result.success) {        router.replace({
          pathname: '/(scan)/result',
          params: { scanId: result.scanId, imageUri }
        });
      } else {
        if (result.error === 'Insufficient scan credits') {
          router.replace('/(modals)/payment-required');
        } else {
          throw new Error(result.error || "Failed to analyze crop");
        }
      }
    } catch (error: any) {
      console.error("Scan processing error:", error);
      Alert.alert(
        "Analysis Failed",
        "We couldn't process your scan. Please check your connection and try again.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  };

  useEffect(() => {
    // Cycle through messages
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1500);

    startAnalysis();

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground items-center justify-center px-8">
      
      {/* Scanning Animation */}
      <View className="relative items-center justify-center mb-12">
        <MotiView
          from={{ rotate: '0deg' }}
          animate={{ rotate: '360deg' }}
          transition={{ loop: true, duration: 4000, type: 'timing' }}
          className="w-48 h-48 rounded-full border-4 border-dashed border-accent/20 absolute"
        />
        <MotiView
          from={{ rotate: '360deg' }}
          animate={{ rotate: '0deg' }}
          transition={{ loop: true, duration: 8000, type: 'timing' }}
          className="w-64 h-64 rounded-full border-2 border-dashed border-accent/10 absolute"
        />
        
        <View className="w-32 h-32 bg-white dark:bg-darkSurface rounded-full items-center justify-center shadow-2xl shadow-accent/20 border-4 border-white dark:border-white/5 relative overflow-hidden">
             <Image 
                source={{ uri: imageUri as string }} 
                className="w-full h-full opacity-50" 
                resizeMode="cover" 
            />
            <View className="absolute inset-0 items-center justify-center bg-accent/20 backdrop-blur-sm">
                <Ionicons name="hourglass-outline" size={40} color="#25D366" />
            </View>
        </View>
      </View>

      <MotiText
        key={stepIndex}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -10 }}
        className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl text-center mb-2"
      >
        Processing
      </MotiText>
      
      <MotiText
        key={`sub-${stepIndex}`}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center opacity-60 h-6"
      >
        {LOADING_STEPS[stepIndex]}
      </MotiText>

      <View className="mt-12 flex-row space-x-2">
         {[0, 1, 2, 3].map((i) => (
             <MotiView
                key={i}
                animate={{ 
                    scale: i === stepIndex ? 1.5 : 1,
                    opacity: i === stepIndex ? 1 : 0.3,
                    backgroundColor: i === stepIndex ? '#25D366' : '#8696A0'
                }}
                className="w-2 h-2 rounded-full"
             />
         ))}
      </View>

    </SafeAreaView>
  );
}
