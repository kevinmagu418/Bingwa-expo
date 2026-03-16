import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, Platform, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditsCard, ScanCard, RecentScanItem } from '../../components/ScanDashboardComponents';
import { useCameraPermissions } from 'expo-camera';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../hooks/useProfile';
import { useScans } from '../../hooks/useScans';

import { BingwaLoader } from '../../components/Loader';

export default function ScanDashboard() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const { scans, loading: scansLoading, refreshScans } = useScans(5); // Last 5 scans
  const [refreshing, setRefreshing] = useState(false);

  if (profileLoading || scansLoading) {
    return <BingwaLoader label="Gathering Scan Records..." />;
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshScans()]);
    setRefreshing(false);
  }, []);

  const handleScanPress = async () => {
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
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs uppercase tracking-widest">
              Welcome back,
            </Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl">
              {profile?.full_name?.split(' ')[0] || 'Bingwa Farmer'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <View className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 items-center justify-center overflow-hidden">
               {profile?.avatar_url ? (
                 <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
               ) : (
                 <Ionicons name="person" size={24} color="#25D366" />
               )}
            </View>
          </TouchableOpacity>
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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
            {scans.length > 0 ? (
              scans.map((item, index) => (
                <RecentScanItem 
                  key={item.id} 
                  item={{
                    ...item,
                    disease: item.diseases?.name || 'Processing...',
                    date: new Date(item.created_at).toLocaleDateString(),
                    image: item.image_url ? { uri: item.image_url } : require('../../assets/freshproduce.png')
                  }} 
                  index={index} 
                />
              ))
            ) : (
              <View className="bg-white dark:bg-darkSurface p-6 rounded-[24px] border border-black/5 dark:border-white/5 w-64 items-center justify-center">
                <Ionicons name="leaf-outline" size={32} color="#8696A0" className="mb-2 opacity-50" />
                <Text className="text-textSecondary font-poppins-regular text-xs text-center">No scans yet. Start by scanning your first crop!</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Quick Tips */}
        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 600 }}
          className="bg-accent/5 border border-accent/10 p-5 rounded-[24px] flex-row items-center mb-10"
        >
          <View className="bg-accent/10 p-3 rounded-xl mr-4">
            <Ionicons name="bulb" size={24} color="#25D366" />
          </View>
          <View className="flex-1">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm mb-1">
              Pro Tip
            </Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary text-[11px] font-poppins-regular opacity-70 leading-relaxed">
              Ensure good lighting and hold the camera steady for 95% higher accuracy.
            </Text>
          </View>
        </MotiView>

      </ScrollView>
    </SafeAreaView>
  );
}
