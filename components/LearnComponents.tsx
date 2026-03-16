import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// --- Category Chip ---
export const CategoryChip = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <MotiView
      animate={{
        backgroundColor: active ? '#25D366' : 'rgba(134, 150, 160, 0.1)',
        scale: active ? 1.05 : 1,
      }}
      className="px-6 py-2.5 rounded-full mr-3 border border-black/5 dark:border-white/5"
    >
      <Text className={`font-poppins-bold text-xs ${active ? 'text-white' : 'text-textSecondary dark:text-darkTextSecondary'}`}>
        {label}
      </Text>
    </MotiView>
  </Pressable>
);

// --- Featured Guide Card ---
export const FeaturedGuideCard = ({ item }: { item: any }) => (
  <MotiView
    from={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="mr-5 w-72 h-44 rounded-[32px] overflow-hidden shadow-xl shadow-black/10"
  >
    <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      className="absolute inset-0 p-5 justify-end"
    >
      <Text className="text-white font-poppins-black text-lg leading-tight">{item.title}</Text>
      <Text className="text-white/70 font-poppins-regular text-[10px] mt-1" numberOfLines={2}>
        {item.description}
      </Text>
    </LinearGradient>
  </MotiView>
);

// --- Disease Library Card ---
export const DiseaseCard = ({ item }: { item: any }) => {
  const severityColor = item.severity === 'high' ? '#D64545' : item.severity === 'medium' ? '#F4A261' : '#2A9D8F';
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="bg-white dark:bg-darkSurface p-4 rounded-[28px] mb-4 flex-row items-center border border-black/5 dark:border-white/5 shadow-sm"
    >
      <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl mr-4" />
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm flex-1 mr-2" numberOfLines={1}>
            {item.name}
          </Text>
          <View 
            className="px-2 py-0.5 rounded-full" 
            style={{ backgroundColor: `${severityColor}15` }}
          >
            <Text style={{ color: severityColor }} className="text-[8px] font-poppins-black uppercase">
              {item.severity}
            </Text>
          </View>
        </View>
        <Text className="text-accent font-poppins-bold text-[10px] uppercase mb-1">{item.crop}</Text>
        <Text className="text-textSecondary dark:text-darkTextSecondary text-[11px] font-poppins-regular opacity-60" numberOfLines={2}>
          {item.summary}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#8696A0" className="ml-2" />
    </MotiView>
  );
};

// --- Quick Tip Card ---
export const QuickTipCard = ({ tip }: { tip: string }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-[28px] flex-row items-start border border-orange-100 dark:border-orange-900/20 mb-10"
  >
    <View className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-xl mr-4">
      <Ionicons name="bulb" size={20} color="#F4A261" />
    </View>
    <View className="flex-1">
      <Text className="text-orange-600 dark:text-orange-400 font-poppins-black text-xs uppercase tracking-widest mb-1">Farming Tip</Text>
      <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-regular text-xs leading-5 opacity-80">{tip}</Text>
    </View>
  </MotiView>
);
