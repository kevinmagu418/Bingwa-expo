import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const CreditsCard = ({ count }: { count: number }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', delay: 200 }}
    className="bg-white dark:bg-darkSurface p-4 rounded-[24px] flex-row items-center justify-between border border-black/5 dark:border-white/5 shadow-sm mb-6"
  >
    <View className="flex-row items-center">
      <View className="bg-green-100 dark:bg-green-900/20 p-2 rounded-xl mr-3">
        <Ionicons name="flash" size={20} color="#25D366" />
      </View>
      <View>
        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">
          Scan Credits
        </Text>
        <Text className="text-textSecondary dark:text-darkTextSecondary text-[10px] font-poppins-regular opacity-60">
          {count > 0 ? 'Ready for diagnosis' : 'Recharge to continue'}
        </Text>
      </View>
    </View>
    <View className={`${count > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'} px-3 py-1 rounded-full border`}>
      <Text className={`${count > 0 ? 'text-green-600' : 'text-red-600'} font-poppins-bold text-sm`}>{count} Left</Text>
    </View>
  </MotiView>
);

export const ScanCard = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay: 300 }}
      className="h-48 rounded-[32px] overflow-hidden relative shadow-xl shadow-green-900/20 mb-8"
    >
      <LinearGradient
        colors={['#25D366', '#128C7E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      
      {/* Background decoration */}
      <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
      <View className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
      
      <View className="flex-1 p-6 justify-between">
        <View className="flex-row justify-between items-start">
          <View className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <Ionicons name="scan-outline" size={32} color="white" />
          </View>
          <View className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            <Text className="text-white font-poppins-bold text-[10px] uppercase">AI Powered</Text>
          </View>
        </View>
        
        <View>
          <Text className="text-white font-poppins-black text-2xl leading-tight">
            New Diagnosis
          </Text>
          <Text className="text-white/80 font-poppins-regular text-sm mt-1">
            Tap to scan crops for diseases
          </Text>
        </View>
      </View>
    </MotiView>
  </Pressable>
);

export const RecentScanItem = ({ item, index }: { item: any, index: number }) => (
  <MotiView
    from={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ type: 'spring', delay: 400 + index * 100 }}
    className="mr-4 w-32"
  >
    <View className="h-32 rounded-[24px] bg-gray-100 dark:bg-darkSurface overflow-hidden border border-black/5 dark:border-white/5 relative">
      <Image source={item.image} className="w-full h-full" resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        className="absolute inset-0 justify-end p-3"
      >
        <Text className="text-white font-poppins-bold text-[10px] leading-tight" numberOfLines={1}>
          {item.disease}
        </Text>
        <Text className="text-white/70 font-poppins-regular text-[9px]" numberOfLines={1}>
          {item.date}
        </Text>
      </LinearGradient>
      
      <View className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
        item.severity === 'high' ? 'bg-red-500' : 
        item.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
      }`} />
    </View>
  </MotiView>
);
