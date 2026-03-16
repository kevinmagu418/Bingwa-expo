import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * A beautiful, full-screen or container-level loader 
 * that uses a "Scanning Leaf" motif instead of a spinner.
 */
export const BingwaLoader = ({ label = "Loading Shambani..." }: { label?: string }) => {
  return (
    <View className="flex-1 items-center justify-center bg-[#F8F9FA] dark:bg-darkBackground">
      <View className="items-center">
        {/* Pulsing Outer Rings */}
        <MotiView
          from={{ scale: 0.6, opacity: 0.2 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ loop: true, duration: 2000, type: 'timing' }}
          className="absolute w-32 h-32 rounded-full bg-accent/20"
        />
        <MotiView
          from={{ scale: 0.8, opacity: 0.3 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ loop: true, duration: 1500, type: 'timing', delay: 500 }}
          className="absolute w-32 h-32 rounded-full bg-accent/10"
        />

        {/* Central Leaf Container */}
        <View className="w-24 h-24 bg-white dark:bg-darkSurface rounded-[32px] items-center justify-center shadow-2xl shadow-accent/20 border border-accent/10 relative overflow-hidden">
          <Ionicons name="leaf" size={44} color="#25D366" />
          
          {/* Scanning Line Effect */}
          <MotiView
            from={{ translateY: -60 }}
            animate={{ translateY: 60 }}
            transition={{ loop: true, duration: 1500, type: 'timing' }}
            className="absolute w-full h-1 bg-accent/40 shadow-sm shadow-accent"
          />
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 300 }}
          className="mt-8"
        >
          <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm uppercase tracking-[4px] opacity-60">
            {label}
          </Text>
        </MotiView>
      </View>
    </View>
  );
};

/**
 * A shimmer-style Skeleton component for content blocks.
 */
export const Skeleton = ({ width, height, radius = 24, className }: { width: any, height: any, radius?: number, className?: string }) => {
  return (
    <View 
      style={{ width, height, borderRadius: radius, overflow: 'hidden' }} 
      className={`bg-gray-200 dark:bg-white/5 ${className}`}
    >
      <MotiView
        from={{ translateX: -width }}
        animate={{ translateX: width }}
        transition={{ loop: true, duration: 1500, type: 'timing' }}
        className="h-full w-full"
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-full w-full"
        />
      </MotiView>
    </View>
  );
};

/**
 * Pre-built Skeleton for List Items
 */
export const HistoryCardSkeleton = () => (
  <View className="flex-row items-center bg-white dark:bg-darkSurface p-4 rounded-[28px] border border-black/5 dark:border-white/5 mb-4">
    <Skeleton width={64} height={64} radius={20} className="mr-4" />
    <View className="flex-1">
      <Skeleton width="60%" height={16} radius={8} className="mb-2" />
      <Skeleton width="40%" height={12} radius={6} />
    </View>
    <Skeleton width={24} height={24} radius={12} />
  </View>
);
