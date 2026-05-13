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

// --- History Card ---
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
  const severityColor = isHealthy ? '#25D366' : 
                   item.severity === 'High' ? '#D64545' : 
                   item.severity === 'Moderate' ? '#F4A261' : '#2A9D8F';

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-3"
    >
      <Pressable 
        onPress={onPress}
        onLongPress={onLongPress}
        className={`bg-white dark:bg-darkSurface p-3 rounded-3xl flex-row items-center border shadow-sm ${
          isSelected ? 'border-accent bg-accent/5' : 'border-black/5 dark:border-white/5'
        }`}
      >
        {isSelectionMode && (
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            isSelected ? 'bg-accent border-accent' : 'border-black/10 dark:border-white/20'
          }`}>
            {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
        )}

        <Image 
          source={{ uri: item.image }} 
          style={{ width: 64, height: 64, borderRadius: 18, marginRight: 12 }}
          contentFit="cover"
          transition={200}
        />
        
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm leading-tight">
              {item.crop}
            </Text>
            <View 
              className="px-2 py-0.5 rounded-full" 
              style={{ backgroundColor: `${severityColor}15` }}
            >
              <Text style={{ color: severityColor }} className="text-[7px] font-poppins-black uppercase">
                {isHealthy ? 'Healthy' : `${item.severity}`}
              </Text>
            </View>
          </View>
          
          <Text className={`font-poppins-bold text-[11px] mb-1 opacity-70 ${isHealthy ? 'text-accent' : 'text-textPrimary dark:text-darkTextPrimary'}`}>
            {item.result}
          </Text>
          
          <Text className="text-textSecondary dark:text-darkTextSecondary text-[9px] font-poppins-regular opacity-50">
            {item.date}
          </Text>
        </View>
        
        {!isSelectionMode && (
          <Ionicons name="chevron-forward" size={16} color={isDark ? "white" : "#111B21"} className="ml-2 opacity-20" />
        )}
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
