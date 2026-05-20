import React from 'react';
import { View, Text, Pressable, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Creative Suite Stat Card ---
export const StatCard = ({ label, value, icon, color, delay }: { label: string, value: string | number, icon: keyof typeof Ionicons.glyphMap, color: string, delay: number }) => {
    const { isDark } = useTheme();
    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay, damping: 15 }}
            className="flex-1 bg-white dark:bg-darkSurface rounded-[32px] p-6 items-center border border-orange-100 dark:border-white/5 shadow-sm mx-1.5"
        >
            <View 
                className="w-10 h-10 rounded-2xl items-center justify-center mb-4"
                style={{ backgroundColor: `${color}15` }}
            >
                <Ionicons name={icon} size={20} color={color} />
            </View>

            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl tracking-tighter">{value}</Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary text-[7px] font-poppins-bold uppercase tracking-[2px] opacity-40 text-center mt-1">
                {label}
            </Text>
        </MotiView>
    );
};

// --- Magazine/Editorial Receiptify Teaser ---
export const ReceiptifyTeaser = ({ onPress }: { onPress: () => void }) => {
    const { isDark } = useTheme();
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} className="mb-10">
            <MotiView 
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-darkSurface p-1 rounded-[40px] shadow-sm border border-orange-100 dark:border-white/5 overflow-hidden"
            >
                <View className="flex-row items-center p-6">
                    <View className="flex-1 pr-6 border-r border-orange-100 dark:border-white/10">
                        <Text className="text-orange-500 font-poppins-black text-[10px] uppercase tracking-[4px] mb-2">Exclusive Report</Text>
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl leading-7 tracking-tight">
                            Receipt-ify{"\n"}
                            <Text className="text-orange-500">Your Farm.</Text>
                        </Text>
                        <View className="flex-row items-center mt-4">
                            <View className="bg-orange-500 px-3 py-1 rounded-full mr-3">
                                <Text className="text-white font-poppins-bold text-[8px] uppercase tracking-widest">Premium</Text>
                            </View>
                            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[10px] uppercase tracking-widest opacity-40">Select Multiple Scans</Text>
                        </View>
                    </View>

                    <View className="pl-6 items-center">
                        <MotiView
                            animate={{ rotate: ['0deg', '5deg', '0deg'] }}
                            transition={{ loop: true, duration: 4000, type: 'timing' }}
                            className="w-20 h-24 bg-orange-50 dark:bg-black/20 rounded-xl items-center justify-center border border-dashed border-orange-200 dark:border-white/10 relative"
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(244, 162, 97, 0.1)']}
                                className="absolute inset-0 rounded-xl"
                            />
                            <Ionicons name="receipt-outline" size={32} color="#F4A261" opacity={0.3} />
                            <View className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-full items-center justify-center shadow-lg shadow-orange-500/40 border-4 border-white dark:border-darkSurface">
                                <Ionicons name="add" size={24} color="white" />
                            </View>
                        </MotiView>
                    </View>
                </View>
                
                <View className="bg-orange-50 dark:bg-orange-900/10 py-3 items-center border-t border-orange-100 dark:border-white/5">
                    <Text className="text-orange-500 font-poppins-black text-[8px] uppercase tracking-[3px]">Tap to start selecting records</Text>
                </View>
            </MotiView>
        </TouchableOpacity>
    );
};

// --- Editorial Recent Report Card ---
export const RecentReportCard = ({ report, onPress }: { report: any, onPress: () => void }) => {
    const { isDark } = useTheme();
    const date = new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const count = report.data?.length || 0;
    
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} className="mr-5">
            <MotiView 
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-[200px] bg-white dark:bg-darkSurface rounded-[32px] p-5 border border-orange-100 dark:border-white/5 shadow-sm"
            >
                <View className="flex-row justify-between items-start mb-4">
                    <View className="w-10 h-10 bg-orange-500 rounded-2xl items-center justify-center shadow-lg shadow-orange-500/20">
                        <Ionicons name="newspaper" size={20} color="white" />
                    </View>
                    <View className="bg-orange-50 px-2 py-1 rounded-lg">
                        <Text className="text-orange-500 font-poppins-black text-[7px] uppercase tracking-widest">{date}</Text>
                    </View>
                </View>

                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-sm tracking-tight mb-1" numberOfLines={1}>
                    Editorial Archive
                </Text>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-medium text-[10px] opacity-60 mb-4">
                    Vol. 0{Math.floor(Math.random() * 5) + 1} • {count} Scans
                </Text>

                <View className="h-[1px] w-full bg-orange-100/50 mb-4" />

                <View className="flex-row items-center justify-between">
                    <View className="flex-row -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <View key={i} className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white items-center justify-center">
                                <Ionicons name="leaf" size={10} color="#F4A261" />
                            </View>
                        ))}
                    </View>
                    <Ionicons name="arrow-forward-circle" size={24} color="#F4A261" />
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
  isSelectionMode,
  onSelectToggle
}: { 
  item: any, 
  onPress: () => void, 
  onLongPress?: () => void,
  isSelected?: boolean,
  isSelectionMode?: boolean,
  onSelectToggle?: () => void
}) => {
  const { isDark } = useTheme();
  const severity = (item.severity || 'low') as 'low' | 'medium' | 'high';
  
  const getTheme = (sev: string) => {
    switch (sev) {
      case 'high': return { color: '#EF4444', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500' };
      case 'medium': return { color: '#F4A261', bg: 'bg-orange-50', border: 'border-orange-100', dot: 'bg-orange-400' };
      default: return { color: '#25D366', bg: 'bg-green-50', border: 'border-green-100', dot: 'bg-green-500' };
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
        onPress={isSelectionMode ? onSelectToggle : onPress}
        onLongPress={onLongPress}
        className={`bg-white dark:bg-darkSurface rounded-[40px] flex-row items-center border shadow-sm overflow-hidden h-[140px] ${
          isSelected ? 'border-orange-500 bg-orange-50/30' : 'border-orange-100 dark:border-white/5'
        }`}
      >
        {/* Image Container */}
        <View className="relative w-[120px] h-full overflow-hidden bg-orange-50 dark:bg-white/5">
          <Image 
            source={item.image} 
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} className="absolute inset-0" />
          
          <View className="absolute bottom-3 left-3 right-3">
             <View className={`px-2 py-1 rounded-full self-start ${theme.bg} border ${theme.border} backdrop-blur-md`}>
                <View className="flex-row items-center">
                    <View className={`w-1.5 h-1.5 rounded-full ${theme.dot} mr-1.5`} />
                    <Text className="font-poppins-black text-[7px] uppercase tracking-widest" style={{ color: theme.color }}>
                    {severity}
                    </Text>
                </View>
             </View>
          </View>
        </View>

        {/* Content Container */}
        <View className="flex-1 p-5 h-full justify-between">
          <View>
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center mb-1">
                    <Text className="text-orange-500 font-poppins-black text-[8px] uppercase tracking-[2px]">Recorded Scan</Text>
                    <View className="w-1 h-1 rounded-full bg-orange-200 mx-2" />
                    <Text className="text-textSecondary font-poppins-bold text-[8px] uppercase tracking-[1px] opacity-40">{item.date}</Text>
                </View>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-base tracking-tight leading-tight" numberOfLines={1}>
                    {item.crop}
                </Text>
              </View>
              
              {isSelectionMode ? (
                <TouchableOpacity 
                    onPress={onSelectToggle}
                    className={`w-8 h-8 rounded-2xl border-2 items-center justify-center ${
                    isSelected ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/30' : 'border-orange-200 dark:border-white/20'
                    }`}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={18} color="white" />
                  ) : (
                    <View className="w-2 h-2 rounded-full bg-orange-100 dark:bg-white/20" />
                  )}
                </TouchableOpacity>
              ) : (
                <View className={`w-8 h-8 rounded-2xl border items-center justify-center ${theme.border} ${theme.bg}`}>
                   <Ionicons name={severity === 'high' ? "alert-circle" : severity === 'medium' ? "warning" : "checkmark-circle"} size={16} color={theme.color} />
                </View>
              )}
            </View>
            
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-medium text-[11px] mt-2 leading-relaxed opacity-60" numberOfLines={1}>
              {item.result}
            </Text>
          </View>
          
          <View className="flex-row items-center justify-between mt-auto">
            <View className="bg-orange-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-orange-100/50">
                <Text className="text-orange-500 font-poppins-bold text-[8px] uppercase tracking-widest">ID #{item.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            
            {!isSelectionMode && (
              <TouchableOpacity 
                onPress={onPress}
                className="w-9 h-9 rounded-2xl bg-orange-500 items-center justify-center shadow-lg shadow-orange-500/20"
              >
                <Ionicons name="chevron-forward" size={16} color="white" />
              </TouchableOpacity>
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
        <View className="flex-1 items-center justify-center py-24 px-10">
            <View className="w-24 h-24 bg-orange-100 dark:bg-white/5 rounded-[40px] items-center justify-center mb-8 border border-orange-200">
                <Ionicons name="sparkles" size={40} color="#F4A261" />
            </View>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl text-center mb-3">
                Knowledge Vault Empty
            </Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center opacity-60 mb-10 leading-relaxed">
                Unlock your farm's potential by scanning your first crop. Our AI is ready to help.
            </Text>
            
            <TouchableOpacity 
                onPress={onScan}
                className="bg-orange-500 px-10 py-4 rounded-[24px] shadow-xl shadow-orange-500/40 active:scale-[0.95]"
            >
                <Text className="text-white font-poppins-black text-xs uppercase tracking-widest">Begin Discovery</Text>
            </TouchableOpacity>
        </View>
    );
};
