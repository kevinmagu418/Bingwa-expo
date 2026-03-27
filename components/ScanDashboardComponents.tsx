import React from 'react';
import { View, Text, Pressable, Image, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const CreditsCard = ({ count }: { count: number }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', delay: 200 }}
    className="bg-white dark:bg-darkSurface p-5 rounded-[28px] flex-row items-center justify-between border border-black/5 dark:border-white/5 shadow-lg mb-6 relative overflow-hidden"
  >
    {/* Decorative background circle */}
    <View className="absolute -right-6 -top-6 w-24 h-24 bg-accent/5 rounded-full" />
    
    <View className="flex-row items-center">
      <LinearGradient
        colors={['#25D366', '#128C7E']}
        className="p-3 rounded-2xl mr-4 shadow-lg shadow-accent/20"
      >
        <Ionicons name="flash" size={24} color="white" />
      </LinearGradient>
      <View>
        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-base">
          Scan Credits
        </Text>
        <Text className="text-textSecondary dark:text-darkTextSecondary text-[11px] font-poppins-regular opacity-60">
          {count > 0 ? 'Ready for your next scan' : 'Credits exhausted'}
        </Text>
      </View>
    </View>
    <View className={`${count > 0 ? 'bg-accent/10' : 'bg-red-500/10'} px-4 py-2 rounded-2xl border border-accent/20`}>
      <Text className={`${count > 0 ? 'text-accent' : 'text-red-500'} font-poppins-black text-lg`}>{count}</Text>
    </View>
  </MotiView>
);

export const ScanCard = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress} className="active:scale-[0.98]">
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay: 300 }}
      className="h-56 rounded-[36px] overflow-hidden relative shadow-2xl shadow-accent/30 mb-8"
    >
      <LinearGradient
        colors={['#25D366', '#128C7E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      
      {/* Premium glassmorphism effects */}
      <View className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <View className="absolute -left-12 -bottom-12 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
      
      <View className="flex-1 p-8 justify-between">
        <View className="flex-row justify-between items-start">
          <View className="bg-white/20 p-4 rounded-2xl backdrop-blur-xl border border-white/30">
            <Ionicons name="scan-circle" size={36} color="white" />
          </View>
          <View className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-xl border border-white/20">
            <Text className="text-white font-poppins-black text-[10px] uppercase tracking-[2px]">AI Analysis</Text>
          </View>
        </View>
        
        <View>
          <Text className="text-white font-poppins-black text-3xl leading-tight">
            New Diagnosis
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-white/80 font-poppins-regular text-sm">
                Identify crop diseases instantly
            </Text>
            <Ionicons name="arrow-forward-circle" size={20} color="white" className="ml-2" />
          </View>
        </View>
      </View>
    </MotiView>
  </Pressable>
);

export const RecentScanItem = ({ item, index }: { item: any, index: number }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9, translateX: 20 }}
    animate={{ opacity: 1, scale: 1, translateX: 0 }}
    transition={{ type: 'spring', delay: 400 + index * 100 }}
    className="mr-5 w-48"
  >
    <View className="h-64 rounded-[32px] bg-white dark:bg-darkSurface overflow-hidden border border-black/5 dark:border-white/5 shadow-lg relative">
      <Image source={item.image} className="w-full h-40" resizeMode="cover" />
      
      {/* Severity badge on image */}
      <View className={`absolute top-3 right-3 px-2 py-1 rounded-full backdrop-blur-md border ${
        item.severity === 'high' ? 'bg-red-500/20 border-red-500/30' : 
        item.severity === 'medium' ? 'bg-orange-500/20 border-orange-500/30' : 'bg-accent/20 border-accent/30'
      }`}>
         <View className={`w-1.5 h-1.5 rounded-full ${
            item.severity === 'high' ? 'bg-red-500' : 
            item.severity === 'medium' ? 'bg-orange-500' : 'bg-accent'
         }`} />
      </View>

      <View className="p-4 flex-1 justify-between">
        <View>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-sm leading-tight mb-1" numberOfLines={1}>
            {item.disease}
            </Text>
            <View className="flex-row items-center opacity-50">
                <Ionicons name="calendar-outline" size={10} color="#8696A0" className="mr-1" />
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[9px]">
                {item.date}
                </Text>
            </View>
        </View>

        <View className="flex-row items-center justify-between mt-2">
            <View className="bg-accent/10 px-2 py-1 rounded-lg">
                <Text className="text-accent font-poppins-bold text-[9px] uppercase">{item.confidence}% Match</Text>
            </View>
            <TouchableOpacity className="w-7 h-7 bg-gray-100 dark:bg-white/10 rounded-full items-center justify-center">
                <Ionicons name="chevron-forward" size={14} color="#25D366" />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  </MotiView>
);
