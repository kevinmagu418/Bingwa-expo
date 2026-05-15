import React from 'react';
import { View, Text, Pressable, Platform, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

// --- Alive Stats Card ---
export const StatCard = ({ label, value, icon, color, delay }: { label: string, value: string | number, icon: keyof typeof Ionicons.glyphMap, color: string, delay: number }) => {
    const { isDark } = useTheme();
    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay }}
            className="flex-1 bg-black/5 dark:bg-white/5 rounded-3xl p-4 items-center border border-black/5 dark:border-white/5"
        >
            <View 
                className="w-10 h-10 rounded-2xl items-center justify-center mb-2"
                style={{ backgroundColor: `${color}15` }}
            >
                <Ionicons name={icon} size={18} color={color} />
            </View>

            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg mb-0.5">{value}</Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary text-[8px] font-poppins-bold uppercase tracking-widest opacity-40 text-center">
                {label}
            </Text>
        </MotiView>
    );
};

// --- Receiptify Teaser ---
export const ReceiptifyTeaser = ({ onPress }: { onPress: () => void }) => {
    const { isDark } = useTheme();
    return (
        <TouchableOpacity onPress={onPress} className="mb-8">
            <LinearGradient
                colors={isDark ? ['#1F2C34', '#121B22'] : ['#FFFFFF', '#F8F9FA']}
                className="flex-row items-center p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm"
            >
                <View className="w-10 h-10 bg-accent/20 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="receipt" size={20} color="#25D366" />
                </View>
                <View className="flex-1">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">Receipt-ify Records</Text>
                    <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px]">Create professional reports from scans</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={isDark ? "white" : "#111B21"} />
            </LinearGradient>
        </TouchableOpacity>
    );
};

export const HistoryCard = ({ 
  item, 
  onPress, 
  onLongPress, 
  isSelected, 
  isSelectionMode 
}: { 
  item: any, 
  onPress: () => void, 
  onLongPress?: () => void,
  isSelected?: boolean,
  isSelectionMode?: boolean
}) => {
  const { isDark } = useTheme();
  const isHealthy = item.status === 'Healthy';

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-4"
    >
      <Pressable 
        onPress={onPress}
        onLongPress={onLongPress}
        className={`bg-white dark:bg-darkSurface rounded-[28px] flex-row items-stretch border shadow-md overflow-hidden min-h-[110px] ${
          isSelected ? 'border-accent bg-accent/5' : 'border-black/5 dark:border-white/5'
        }`}
      >
        <View className="relative w-[110px] h-full">
          <Image 
            source={{ uri: item.image }} 
            style={{ width: '100%', height: '100%' }} 
            contentFit="cover"
            transition={200}
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} className="absolute inset-0" />
          <View className="absolute bottom-2 left-2 right-2 flex-row justify-center">
            {isHealthy ? (
              <View className="bg-accent/90 backdrop-blur-md px-2 py-1 rounded-[10px]">
                <Text className="text-white font-poppins-black text-[8px] uppercase tracking-[2px]">Healthy</Text>
              </View>
            ) : (
              <View className="bg-red-500/90 backdrop-blur-md px-2 py-1 rounded-[10px]">
                <Text className="text-white font-poppins-black text-[8px] uppercase tracking-[2px]">Diseased</Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-1 p-4 justify-center">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-base leading-tight" numberOfLines={1}>
              {item.crop}
            </Text>
            {isSelectionMode && (
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                isSelected ? 'bg-accent border-accent' : 'border-black/10 dark:border-white/20'
              }`}>
                {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
            )}
          </View>
          
          <Text className={`font-poppins-bold text-xs mb-2 leading-tight ${isHealthy ? 'text-accent' : 'text-textSecondary dark:text-darkTextSecondary'}`} numberOfLines={2}>
            {item.result}
          </Text>
          
          <View className="flex-row items-center justify-between mt-auto">
            <View className="flex-row items-center opacity-40">
              <Ionicons name="calendar" size={10} color={isDark ? "white" : "black"} />
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-[9px] ml-1.5 uppercase tracking-widest">{item.date}</Text>
            </View>
            
            {!isSelectionMode && (
              <View className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center">
                <Ionicons name="arrow-forward" size={12} color={isDark ? "white" : "black"} />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
};

// --- Empty State ---
export const HistoryEmptyState = ({ onScan }: { onScan: () => void }) => {
    const { isDark } = useTheme();
    return (
        <View className="flex-1 items-center justify-center py-16 px-10">
            <View className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full items-center justify-center mb-6">
                <Ionicons name="leaf-outline" size={40} color="#25D366" opacity={0.3} />
            </View>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl text-center mb-2">
                No scans yet
            </Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs text-center opacity-60 mb-8 max-w-[200px]">
                Take a photo of a crop to start tracking your farm's health.
            </Text>
            
            <Pressable 
                onPress={onScan}
                className="bg-accent px-8 py-3 rounded-2xl active:scale-[0.95]"
            >
                <Text className="text-white font-poppins-black text-xs uppercase tracking-widest">Start Scanning</Text>
            </Pressable>
        </View>
    );
};
