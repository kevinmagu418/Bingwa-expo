import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, useWindowDimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatCard, HistoryCard, HistoryEmptyState } from '../../components/HistoryComponents';
import { CategoryChip } from '../../components/LearnComponents';
import { useScans } from '../../hooks/useScans';

const FILTERS = ["All", "Healthy", "Diseased", "Maize", "Tomatoes"];

import { HistoryCardSkeleton } from '../../components/Loader';

export default function HistoryTab() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const { width } = useWindowDimensions();
  const { scans, loading, refreshScans } = useScans();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshScans();
    setRefreshing(false);
  }, []);

  const isWeb = Platform.OS === 'web';
  const contentWidth = isWeb ? Math.min(width - 40, 550) : width;

  const filteredData = scans.filter(item => {
    const isHealthy = item.severity === null || item.diseases?.name?.toLowerCase().includes('healthy');
    if (activeFilter === "All") return true;
    if (activeFilter === "Healthy") return isHealthy;
    if (activeFilter === "Diseased") return !isHealthy;
    return item.diseases?.crop === activeFilter;
  });

  const stats = {
    total: scans.length,
    healthy: scans.filter(i => i.severity === null || i.diseases?.name?.toLowerCase().includes('healthy')).length,
    diseased: scans.filter(i => i.severity !== null && !i.diseases?.name?.toLowerCase().includes('healthy')).length
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#25D366" />
        }
      >
        
        {/* Header */}
        <View className="px-6 py-6 flex-row justify-between items-center">
          <View>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs uppercase tracking-widest">
              Scan Records
            </Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">
              History
            </Text>
          </View>
          <View className="bg-accent/10 p-3 rounded-2xl">
            <Ionicons name="time-outline" size={24} color="#25D366" />
          </View>
        </View>

        <View className="items-center px-6">
          <View style={{ width: contentWidth }}>
            
            {/* Stats Summary */}
            <View className="flex-row space-x-3 mb-8">
              <StatCard label="Total Scans" value={stats.total} icon="scan" color="#3A86FF" delay={200} />
              <StatCard label="Healthy" value={stats.healthy} icon="heart" color="#25D366" delay={300} />
              <StatCard label="Diseases" value={stats.diseased} icon="alert-circle" color="#D64545" delay={400} />
            </View>

            {/* Filters */}
            <View className="mb-8">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                {FILTERS.map((filter) => (
                  <CategoryChip 
                    key={filter} 
                    label={filter} 
                    active={activeFilter === filter} 
                    onPress={() => setActiveFilter(filter)} 
                  />
                ))}
              </ScrollView>
            </View>

            {/* Scan History List */}
            <View className="mb-10">
              {loading ? (
                <>
                  <HistoryCardSkeleton />
                  <HistoryCardSkeleton />
                  <HistoryCardSkeleton />
                </>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <HistoryCard 
                    key={item.id} 
                    item={{
                      ...item,
                      crop: item.diseases?.crop || 'Crop',
                      result: item.diseases?.name || 'Processing...',
                      status: (item.severity === null || item.diseases?.name?.toLowerCase().includes('healthy')) ? 'Healthy' : 'Diseased',
                      date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      image: item.image_url
                    }} 
                    onPress={() => router.push({ 
                      pathname: '/(scan)/result', 
                      params: { scanId: item.id, imageUri: item.image_url } 
                    })} 
                  />
                ))
              ) : (
                <HistoryEmptyState onScan={() => router.push('/(tabs)/scan')} />
              )}
            </View>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
