import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useScans } from '../../hooks/useScans';
import { BingwaLoader, HistoryCardSkeleton } from '../../components/Loader';
import * as Haptics from 'expo-haptics';

export default function HistoryListScreen() {
  const router = useRouter();
  const { scans, loading, refreshScans } = useScans();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshScans();
    setRefreshing(false);
  }, []);

  const handleScanPress = (scan: any) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(scan)/result',
      params: { scanId: scan.id, imageUri: scan.image_url }
    });
  };

  const SEVERITY_BADGE = {
    low: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600', dot: 'bg-green-500' },
    medium: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600', dot: 'bg-orange-500' },
    high: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600', dot: 'bg-red-500' },
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground px-6">
        <View className="py-8">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">My History</Text>
        </View>
        {[1, 2, 3, 4, 5].map((i) => <HistoryCardSkeleton key={i} />)}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#25D366" />
        }
      >
        <View className="py-8 flex-row justify-between items-end">
          <View>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs uppercase tracking-[4px] mb-1">Archive</Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">My History</Text>
          </View>
          <View className="bg-accent/10 px-4 py-2 rounded-2xl border border-accent/20">
            <Text className="text-accent font-poppins-black text-xs uppercase tracking-widest">{scans.length} Scans</Text>
          </View>
        </View>

        {scans.length > 0 ? (
          <View className="pb-10">
            {scans.map((scan, index) => {
              const severity = SEVERITY_BADGE[scan.severity as keyof typeof SEVERITY_BADGE] || SEVERITY_BADGE.low;
              return (
                <MotiView
                  key={scan.id}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'spring', delay: index * 100 }}
                >
                  <TouchableOpacity 
                    onPress={() => handleScanPress(scan)}
                    className="bg-white dark:bg-darkSurface p-4 rounded-[28px] border border-black/5 dark:border-white/5 shadow-sm mb-4 flex-row items-center active:scale-[0.98]"
                  >
                    <View className="w-16 h-16 rounded-2xl overflow-hidden border border-black/5">
                      <Image source={{ uri: scan.image_url }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-center mb-1">
                        <View className={`w-2 h-2 rounded-full ${severity.dot} mr-2`} />
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-base" numberOfLines={1}>
                          {scan.diseases?.name || 'Processing...'}
                        </Text>
                      </View>
                      <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px] opacity-60">
                         {scan.diseases?.crop || 'Crop'} • {new Date(scan.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <View className={`px-2 py-1 rounded-lg ${severity.bg}`}>
                       <Text className={`font-poppins-bold text-[8px] uppercase tracking-wide ${severity.text}`}>
                         {scan.severity}
                       </Text>
                    </View>
                    
                    <Ionicons name="chevron-forward" size={18} color="#8696A0" style={{ marginLeft: 12 }} />
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
             <View className="bg-accent/5 w-24 h-24 rounded-[40px] items-center justify-center border border-accent/10 mb-6">
                <Ionicons name="leaf-outline" size={40} color="#8696A0" />
             </View>
             <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg">No scans yet</Text>
             <Text className="text-textSecondary font-poppins-regular text-sm text-center mt-2 opacity-60 max-w-[240px]">
               Your diagnosed crop records will appear here for easy tracking.
             </Text>
             <TouchableOpacity 
               onPress={() => router.push('/(tabs)/scan')}
               className="mt-8 px-8 h-12 bg-accent rounded-2xl items-center justify-center shadow-lg shadow-accent/20"
             >
                <Text className="text-white font-poppins-black text-xs uppercase tracking-widest">Start Scanning</Text>
             </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
