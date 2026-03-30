import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditsCard, ScanCard, RecentScanItem } from '../../components/ScanDashboardComponents';
import { useCameraPermissions } from 'expo-camera';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '../../hooks/useProfile';
import { useScans } from '../../hooks/useScans';
import { BingwaAvatar } from '../../components/BingwaAvatar';

import { BingwaLoader } from '../../components/Loader';

export default function ScanDashboard() {
  const router = useRouter();
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
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground">
      <ScrollView 
        className="flex-1 px-6" 
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
              <Text className="text-[#128C7E] font-poppins-black text-2xl ml-2">
                {profile?.full_name?.split(' ')[0] || '...'}
              </Text>
            </View>
          </View>
          <BingwaAvatar size={56} borderWidth={2} />
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
              <View className="bg-white dark:bg-darkSurface p-6 rounded-[24px] border border-black/5 dark:border-white/5 w-64 items-center justify-center">
                <Ionicons name="leaf-outline" size={32} color="#8696A0" className="mb-2 opacity-50" />
                <Text className="text-textSecondary font-poppins-regular text-xs text-center">No scans yet. Start by scanning your first crop!</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* AI Assistant Banner */}
        <TouchableOpacity 
          onPress={() => router.push('/ai-assistant')}
          activeOpacity={0.9}
        >
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 700 }}
            className="mb-10 overflow-hidden rounded-[32px] border border-white/10 shadow-lg"
          >
            <LinearGradient
              colors={['#0B141A', '#121B22']}
              className="p-8 flex-row items-center"
            >
              <View className="w-16 h-16 rounded-3xl bg-accent items-center justify-center mr-6 shadow-2xl shadow-accent/20">
                <Ionicons name="sparkles" size={32} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-poppins-black text-xl mb-1">Bingwa AI</Text>
                <Text className="text-white/40 font-poppins-regular text-xs">Chat for deep agricultural insights</Text>
              </View>
              <View className="bg-white/5 p-3 rounded-2xl">
                <Ionicons name="chevron-forward" size={20} color="white" />
              </View>
            </LinearGradient>
          </MotiView>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
