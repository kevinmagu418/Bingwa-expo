import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditsCard, ScanCard, RecentScanItem } from '../../components/ScanDashboardComponents';
import { BingwaAICard } from '../../components/BingwaAICard';
import { useCameraPermissions } from 'expo-camera';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '../../hooks/useProfile';
import { useScans } from '../../hooks/useScans';
import { useTheme } from '../../context/ThemeContext';
import { BingwaAvatar } from '../../components/BingwaAvatar';

import { BingwaLoader } from '../../components/Loader';

export default function ScanDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const { scans, loading: scansLoading, refreshScans } = useScans(5); // Last 5 scans
  const [refreshing, setRefreshing] = useState(false);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      refreshScans();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshScans()]);
    setRefreshing(false);
  }, [refreshProfile, refreshScans]);

  if (profileLoading || scansLoading) {
    return <BingwaLoader label="Gathering Scan Records..." />;
  }

  const handleScanPress = async () => {
    if (profile && (profile.scan_credits ?? 0) <= 0) {
      router.push('/(modals)/payment-required');
      return;
    }
    
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "We need camera access to scan your crops.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => router.push('/(onboarding)/permissions') }
          ]
        );
        return;
      }
    }
    router.push('/(scan)/camera');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-darkBackground" edges={['top']}>
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#25D366" />
        }
      >
        
        {/* Header */}
        <View className="flex-row justify-between items-center py-6">
          <View>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px] uppercase tracking-[3px] opacity-60 mb-1">
              Welcome back,
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl">
                Bingwa Farmer 
              </Text>
              {profile?.full_name && (
                <Text className="text-accent font-poppins-black text-2xl ml-2">
                  {profile.full_name.split(' ')[0]}
                </Text>
              )}
            </View>
          </View>
          <BingwaAvatar size={56} borderWidth={2} borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(37, 211, 102, 0.1)"} />
        </View>

        {/* Credits */}
        <CreditsCard count={profile?.scan_credits ?? 0} />

        {/* Main Action */}
        <ScanCard onPress={handleScanPress} />

        {/* Recent Scans */}
        <View className="mt-4 mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg">
              Recent Scans
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text className="text-accent font-poppins-bold text-xs uppercase tracking-wider">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible py-2">
            {scans && scans.length > 0 ? (
              scans.map((item: any, index: number) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => router.push({
                    pathname: '/(scan)/result',
                    params: { scanId: item.id, imageUri: item.image_url }
                  })}
                >
                  <RecentScanItem 
                    item={{
                      ...item,
                      disease: item.diseases?.name || 'Processing...',
                      date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                      image: item.image_url ? { uri: item.image_url } : require('../../assets/farmer.jpg'),
                      confidence: Math.round((item.confidence_score || 0) * 100)
                    }} 
                    index={index} 
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-white dark:bg-darkSurface p-8 rounded-[40px] border border-black/5 dark:border-white/5 w-[280px] items-center justify-center shadow-sm">
                <View className="bg-accent/5 w-16 h-16 rounded-full items-center justify-center mb-4">
                    <Ionicons name="leaf-outline" size={32} color="#25D366" opacity={0.5} />
                </View>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm text-center mb-1">No Scans Recorded</Text>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[11px] text-center opacity-60 mb-6">
                    Start your first crop diagnosis to see results here.
                </Text>
                <TouchableOpacity 
                    onPress={handleScanPress}
                    className="bg-accent px-6 py-2.5 rounded-full"
                >
                    <Text className="text-white font-poppins-black text-[10px] uppercase tracking-widest">Start First Scan</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        {/* AI Assistant Banner */}
        <BingwaAICard />

      </ScrollView>
    </SafeAreaView>
  );
}
