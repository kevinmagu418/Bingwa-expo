import React from 'react';
import { View, Text, Pressable, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
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
    <View className="flex-1 bg-[#0B141A]">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#128C7E', 'rgba(11, 20, 26, 0.8)', '#0B141A']}
        className="flex-1"
        locations={[0, 0.4, 0.8]}
      >
        <View 
          className="flex-1 px-8 items-center justify-center"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.5, rotate: '0deg' }}
            animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
            transition={{ type: 'spring', delay: 200 }}
            className="mb-12"
          >
            <View className="bg-[#25D366]/20 w-32 h-32 rounded-[40px] items-center justify-center border border-[#25D366]/30 shadow-2xl shadow-[#25D366]/50">
              <Ionicons name="wifi-outline" size={64} color="#25D366" />
              <MotiView
                from={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ loop: true, duration: 2000, type: 'timing' }}
                className="absolute w-full h-full rounded-[40px] border border-[#25D366]/40"
              />
            </View>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 400 }}
            className="items-center"
          >
            <Text className="text-white font-poppins-black text-4xl text-center leading-tight mb-4">
              Lost In The<Text className="text-[#25D366]"> Field?</Text>
            </Text>
            
            <Text className="text-white/60 font-poppins-regular text-lg text-center leading-relaxed mb-12 max-w-[90%]">
              We can't reach our servers. Please check your internet connection and let's get back to farming.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 600 }}
            className="w-full"
          >
            <Pressable
              onPress={handlePress}
              className="h-16 rounded-[24px] items-center justify-center shadow-2xl shadow-[#25D366]/40 overflow-hidden"
            >
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute inset-0"
              />
              <View className="flex-row items-center">
                <Ionicons name="refresh-outline" size={24} color="white" />
                <Text className="text-white font-poppins-black text-lg ml-3 uppercase tracking-widest">
                  Retry Connection
                </Text>
              </View>
            </Pressable>
            
            <MotiText
              from={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1000 }}
              className="text-white font-poppins-bold text-center mt-8 text-[10px] uppercase tracking-[4px]"
            >
              BingwaShambani • Kenya
            </MotiText>
          </MotiView>
        </View>
      </LinearGradient>
    </View>
  );
};

export const OfflineBanner = () => {
  return (
    <MotiView 
      from={{ translateY: -100 }}
      animate={{ translateY: 0 }}
      className="bg-[#1C2C35] px-6 py-2 shadow-2xl z-50 border-b border-white/5"
      style={{ paddingTop: Platform.OS === 'ios' ? 50 : 15 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MotiView
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ loop: true, duration: 2000 }}
            className="w-2 h-2 rounded-full bg-orange-500 mr-3"
          />
          <Text className="text-white/90 text-[10px] font-poppins-bold uppercase tracking-[2px]">
            Offline Mode • Using Vault Cache
          </Text>
        </View>
        <Ionicons name="cloud-offline-outline" size={14} color="rgba(255,255,255,0.4)" />
      </View>
    </MotiView>
  );
};
