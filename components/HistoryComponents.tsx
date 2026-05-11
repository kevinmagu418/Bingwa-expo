import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// --- Alive Stats Card ---
export const StatCard = ({ label, value, icon, color, delay }: { label: string, value: string | number, icon: keyof typeof Ionicons.glyphMap, color: string, delay: number }) => (
  <MotiView
    from={{ opacity: 0, translateY: 20, scale: 0.9 }}
    animate={{ opacity: 1, translateY: 0, scale: 1 }}
    transition={{ type: 'timing', duration: 600, delay }}
    className="flex-1 bg-white dark:bg-darkSurface rounded-[32px] border border-black/5 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden"
  >
    <LinearGradient
        colors={[`${color}05`, 'transparent']}
        className="p-5 items-center justify-center"
    >
        <MotiView
            animate={{ 
                translateY: [0, -4, 0],
            }}
            transition={{
                loop: true,
                duration: 3000,
                type: 'timing',
                delay: delay + 1000
            }}
            className="w-12 h-12 rounded-2xl items-center justify-center mb-3 shadow-lg"
            style={{ backgroundColor: `${color}15`, shadowColor: color, shadowOpacity: 0.2, shadowRadius: 10 }}
        >
            <Ionicons name={icon} size={22} color={color} />
        </MotiView>

        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl mb-0.5">{value}</Text>
        <Text className="text-textSecondary dark:text-darkTextSecondary text-[9px] font-poppins-black uppercase tracking-widest opacity-40 text-center">
            {label}
        </Text>
    </LinearGradient>
  </MotiView>
);

// --- Receiptify Teaser ---
export const ReceiptifyTeaser = ({ onPress }: { onPress: () => void }) => (
    <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 100 }}
        className="mb-8 overflow-hidden rounded-[32px] border border-accent/20 dark:border-accent/10 shadow-xl shadow-accent/5"
    >
        <Pressable onPress={onPress}>
            <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6 flex-row items-center justify-between"
            >
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <View className="bg-white/20 px-2 py-0.5 rounded-full mr-2">
                            <Text className="text-white font-poppins-bold text-[8px] uppercase tracking-widest">Premium Tool</Text>
                        </View>
                        <Ionicons name="sparkles" size={12} color="white" />
                    </View>
                    <Text className="text-white font-poppins-black text-xl mb-1">Receipt-ify</Text>
                    <Text className="text-white/80 font-poppins-regular text-[10px] leading-tight">
                        Convert multiple scans into a professional PDF report for your records or agrovet.
                    </Text>
                </View>

                <View className="ml-4 w-14 h-14 bg-white/20 rounded-2xl items-center justify-center border border-white/20">
                    <Ionicons name="receipt" size={28} color="white" />
                </View>
            </LinearGradient>
        </Pressable>
    </MotiView>
);

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
  const isHealthy = item.status === 'Healthy';
  const severityColor = isHealthy ? '#25D366' : 
                   item.severity === 'High' ? '#D64545' : 
                   item.severity === 'Moderate' ? '#F4A261' : '#2A9D8F';

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-4"
    >
      <Pressable 
        onPress={onPress}
        onLongPress={onLongPress}
        className={`bg-white dark:bg-darkSurface p-4 rounded-[32px] flex-row items-center border shadow-sm active:scale-[0.98] transition-transform ${
          isSelected ? 'border-accent bg-accent/5' : 'border-black/5 dark:border-white/5'
        }`}
      >
        {/* Selection Indicator */}
        <AnimatePresence>
          {isSelectionMode && (
            <MotiView
              from={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 32 }}
              exit={{ opacity: 0, width: 0 }}
              className="mr-2 items-center justify-center"
            >
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                isSelected ? 'bg-accent border-accent' : 'border-gray-300 dark:border-white/20'
              }`}>
                {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        <Image 
          source={{ uri: item.image }} 
          style={{ width: 80, height: 80, borderRadius: 22, marginRight: 16 }}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />
        
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
        
        {!isSelectionMode && (
          <Ionicons name="chevron-forward" size={20} color="#8696A0" className="ml-2 opacity-30" />
        )}
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
