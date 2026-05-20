import React from 'react';
import { View, Text, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface OfflineMessageProps {
  onRetry: () => void;
}

export const OfflineMessage = ({ onRetry }: OfflineMessageProps) => {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onRetry();
  };

  return (
    <View className="flex-1 bg-white dark:bg-darkBackground">
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
      <View 
        className="flex-1 px-10 items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          className="mb-10"
        >
          <View className="bg-orange-50 dark:bg-orange-900/10 w-28 h-28 rounded-[40px] items-center justify-center border border-orange-100 dark:border-orange-900/20">
            <Ionicons name="cloud-offline" size={48} color="#F4A261" />
          </View>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 400 }}
          className="items-center"
        >
          <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl text-center leading-tight mb-4">
            Connection<Text className="text-orange-500"> Paused</Text>
          </Text>
          
          <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-base text-center leading-6 mb-12 opacity-70">
            You're currently offline. Check your internet connection to access live AI insights and sync your latest scans.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 600 }}
          className="w-full"
        >
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            className="h-16 rounded-[24px] bg-accent items-center justify-center shadow-lg shadow-accent/20"
          >
            <View className="flex-row items-center">
              <Ionicons name="refresh" size={20} color="white" />
              <Text className="text-white font-poppins-black text-sm ml-3 uppercase tracking-widest">
                Check Again
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handlePress}
            className="mt-6 py-2"
          >
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-center text-[10px] uppercase tracking-[3px] opacity-40">
              Offline Mode Active
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    </View>
  );
};

export const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <MotiView 
      from={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      className="bg-orange-50 dark:bg-[#2C1E12] px-6 py-2 shadow-sm z-50 border-b border-orange-100 dark:border-orange-900/20"
      style={{ paddingTop: Math.max(insets.top, 12), paddingBottom: 8 }}
    >
      <View className="flex-row items-center justify-center">
        <MotiView
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ loop: true, duration: 3000, type: 'timing' }}
          className="mr-2"
        >
          <Ionicons name="wifi-outline" size={14} color="#F59E0B" />
        </MotiView>
        <Text className="text-orange-800 dark:text-orange-300 text-[10px] font-poppins-bold uppercase tracking-[1px]">
          Working Offline • All features are still active
        </Text>
      </View>
    </MotiView>
  );
};
