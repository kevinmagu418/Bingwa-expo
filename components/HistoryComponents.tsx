import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

// --- Stats Card ---
export const StatCard = ({ label, value, icon, color, delay }: { label: string, value: string | number, icon: keyof typeof Ionicons.glyphMap, color: string, delay: number }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9, translateY: 10 }}
    animate={{ opacity: 1, scale: 1, translateY: 0 }}
    transition={{ type: 'spring', delay }}
    className="flex-1 bg-white dark:bg-darkSurface p-4 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm items-center"
  >
    <View className="w-10 h-10 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg">{value}</Text>
    <Text className="text-textSecondary dark:text-darkTextSecondary text-[9px] font-poppins-bold uppercase opacity-60 text-center">
      {label}
    </Text>
  </MotiView>
);

// --- History Card ---
export const HistoryCard = ({ item, onPress }: { item: any, onPress: () => void }) => {
  const isHealthy = item.status === 'Healthy';
  const severityColor = isHealthy ? '#25D366' : 
                   item.severity === 'High' ? '#D64545' : 
                   item.severity === 'Moderate' ? '#F4A261' : '#2A9D8F';

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      className="mb-4"
    >
      <Pressable 
        onPress={onPress}
        className="bg-white dark:bg-darkSurface p-4 rounded-[32px] flex-row items-center border border-black/5 dark:border-white/5 shadow-sm active:scale-[0.98] transition-transform"
      >
        <Image source={{ uri: item.image }} className="w-20 h-20 rounded-[22px] mr-4" resizeMode="cover" />
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-base leading-tight">
              {item.crop}
            </Text>
            <View 
              className="px-2.5 py-1 rounded-full border" 
              style={{ backgroundColor: `${severityColor}10`, borderColor: `${severityColor}20` }}
            >
              <Text style={{ color: severityColor }} className="text-[8px] font-poppins-black uppercase">
                {isHealthy ? 'Healthy' : `${item.severity} Severity`}
              </Text>
            </View>
          </View>
          
          <Text className={`font-poppins-bold text-xs mb-1 ${isHealthy ? 'text-accent' : 'text-textPrimary/80'}`}>
            {item.result}
          </Text>
          
          <View className="flex-row items-center opacity-40">
            <Ionicons name="calendar-outline" size={10} color="#8696A0" />
            <Text className="text-textSecondary dark:text-darkTextSecondary text-[10px] font-poppins-regular ml-1">
              {item.date}
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#8696A0" className="ml-2 opacity-30" />
      </Pressable>
    </MotiView>
  );
};

// --- Empty State ---
export const HistoryEmptyState = ({ onScan }: { onScan: () => void }) => (
  <View className="flex-1 items-center justify-center py-20 px-10">
    <MotiView
      from={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' }}
      className="w-48 h-48 bg-accent/5 rounded-full items-center justify-center mb-8 border border-accent/10"
    >
      <Ionicons name="leaf-outline" size={80} color="#25D366" opacity={0.3} />
      <View className="absolute bottom-10 right-10 bg-white dark:bg-darkSurface p-3 rounded-2xl shadow-lg border border-black/5">
        <Ionicons name="camera" size={24} color="#F4A261" />
      </View>
    </MotiView>
    
    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl text-center mb-2">
      No scans yet
    </Text>
    <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center opacity-60 mb-10 leading-relaxed">
      Take a photo of a crop leaf to get your first AI diagnosis and start tracking your farm's health.
    </Text>
    
    <Pressable 
      onPress={onScan}
      className="bg-accent px-10 py-4 rounded-[24px] shadow-xl shadow-accent/30 active:scale-[0.95]"
    >
      <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">Scan Crop</Text>
    </Pressable>
  </View>
);
