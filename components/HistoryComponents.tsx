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
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay }}
            className="flex-1 bg-white dark:bg-darkSurface rounded-[32px] p-5 items-center border border-black/5 dark:border-white/5 shadow-sm mx-1.5"
        >
            <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mb-3 shadow-lg"
                style={{ backgroundColor: color }}
            >
                <Ionicons name={icon} size={22} color="white" />
            </View>

            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl leading-none">{value}</Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary text-[7px] font-poppins-black uppercase tracking-[2px] opacity-40 text-center mt-1">
                {label}
            </Text>
        </MotiView>
    );
};

// --- Receiptify Teaser ---
export const ReceiptifyTeaser = ({ onPress }: { onPress: () => void }) => {
    const { isDark } = useTheme();
    return (
        <TouchableOpacity onPress={onPress} className="mb-10 active:scale-[0.98]">
            <MotiView 
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="bg-[#121B22] p-6 rounded-[40px] shadow-xl relative overflow-hidden"
            >
                <LinearGradient
                    colors={['rgba(37, 211, 102, 0.2)', 'transparent']}
                    className="absolute inset-0"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View className="flex-row items-center">
                    <View className="w-14 h-14 bg-accent/20 rounded-3xl items-center justify-center mr-5 border border-accent/20">
                        <Ionicons name="receipt" size={24} color="#25D366" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-poppins-black text-lg tracking-tight">Receipt-ify Records</Text>
                        <Text className="text-white/40 font-poppins-bold text-[10px] uppercase tracking-widest">Premium Export Suite</Text>
                    </View>
                    <View className="bg-white/10 p-3 rounded-2xl">
                        <Ionicons name="arrow-forward" size={18} color="white" />
                    </View>
                </View>
            </MotiView>
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
  const severity = (item.severity || 'low') as 'low' | 'medium' | 'high';
  
  const getTheme = (sev: string) => {
    switch (sev) {
      case 'high': return { color: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/20' };
      case 'medium': return { color: '#F4A261', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
      default: return { color: '#25D366', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    }
  };

  const theme = getTheme(severity);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="mb-5"
    >
    <Pressable 
        onPress={onPress}
        onLongPress={onLongPress}
        className={`bg-white dark:bg-darkSurface rounded-[40px] flex-row items-center border shadow-sm overflow-hidden h-[130px] ${
          isSelected ? 'border-accent bg-accent/5 shadow-accent/10' : 'border-black/5 dark:border-white/5'
        }`}
      >
        {/* Severity Indicator Strip */}
        <View style={{ width: 6, height: '100%', backgroundColor: theme.color }} />

        {/* Image Container */}
        <View className="relative w-[110px] h-full overflow-hidden bg-gray-50 dark:bg-white/5">
          <Image 
            source={{ uri: item.image }} 
            className="w-full h-full"
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)']} className="absolute inset-0" />
          
          <View className="absolute bottom-3 left-3 right-3">
             <View className={`px-2 py-1 rounded-lg self-start ${theme.bg} border ${theme.border} backdrop-blur-md`}>
                <Text className="font-poppins-black text-[7px] uppercase tracking-widest" style={{ color: theme.color }}>
                   {severity}
                </Text>
             </View>
          </View>
        </View>

        {/* Content Container */}
        <View className="flex-1 p-5 h-full justify-between">
          <View>
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-base tracking-tight leading-tight" numberOfLines={1}>
                    {item.crop}
                </Text>
                <View className="flex-row items-center mt-1 opacity-40">
                    <Ionicons name="calendar-outline" size={10} color={isDark ? "white" : "black"} />
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-[8px] ml-1.5 uppercase tracking-[2px]">{item.date}</Text>
                </View>
              </View>
              
              {isSelectionMode && (
                <MotiView 
                    animate={{ scale: isSelected ? 1.1 : 1 }}
                    className={`w-7 h-7 rounded-2xl border-2 items-center justify-center ${
                    isSelected ? 'bg-accent border-accent shadow-lg shadow-accent/30' : 'border-black/10 dark:border-white/20'
                    }`}
                >
                  {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </MotiView>
              )}
            </View>
            
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-medium text-[11px] mt-2 leading-relaxed opacity-60" numberOfLines={1}>
              {item.result}
            </Text>
          </View>
          
          <View className="flex-row items-center justify-between mt-auto">
            <View className="bg-orange-50 dark:bg-white/5 px-3 py-1 rounded-xl">
                <Text className="text-orange-500 font-poppins-bold text-[8px] uppercase tracking-widest">Report #{item.id.slice(0, 4).toUpperCase()}</Text>
            </View>
            
            {!isSelectionMode && (
              <View className="w-9 h-9 rounded-2xl bg-black/5 dark:bg-white/5 items-center justify-center border border-black/5">
                <Ionicons name="chevron-forward" size={16} color={isDark ? "white" : "black"} />
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
