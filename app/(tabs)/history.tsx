import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatCard, HistoryCard, HistoryEmptyState } from '../../components/HistoryComponents';
import { CategoryChip } from '../../components/LearnComponents';
import { useScans } from '../../hooks/useScans';
import { useProfile } from '../../hooks/useProfile';
import { BingwaAvatar } from '../../components/BingwaAvatar';
import { ReceiptPreview } from '../../components/ReceiptPreview';
import { MotiView, AnimatePresence } from 'moti';
import { HistoryCardSkeleton } from '../../components/Loader';
import { LinearGradient } from 'expo-linear-gradient';

const FILTERS = ["All", "Healthy", "Diseased", "Maize", "Tomatoes"];

export default function HistoryTab() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);

  const { width } = useWindowDimensions();
  const { scans, loading, refreshScans } = useScans();
  const { profile, refreshProfile } = useProfile();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh profile when tab is focused
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshScans(), refreshProfile()]);
    setRefreshing(false);
  }, [refreshScans, refreshProfile]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePress = (item: any) => {
    if (isSelectionMode) {
      toggleSelection(item.id);
    } else {
      router.push({ 
        pathname: '/(scan)/result', 
        params: { scanId: item.id, imageUri: item.image_url } 
      });
    }
  };

  const handleLongPress = (id: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds([id]);
    }
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const isWeb = Platform.OS === 'web';
  const contentWidth = isWeb ? Math.min(width - 40, 550) : width;

  const filteredData = scans.filter(item => {
    const isHealthy = item.severity === null || item.diseases?.name?.toLowerCase().includes('healthy');
    if (activeFilter === "All") return true;
    if (activeFilter === "Healthy") return isHealthy;
    if (activeFilter === "Diseased") return !isHealthy;
    return item.diseases?.crop === activeFilter;
  });

  const selectedScansData = scans
    .filter(s => selectedIds.includes(s.id))
    .map(s => ({
      id: s.id,
      crop: s.diseases?.crop || 'Crop',
      result: s.diseases?.name || 'Diagnosis',
      severity: s.severity || 'low',
      date: new Date(s.created_at).toLocaleDateString(),
      organic_advice: s.recommendations?.[0]?.organic_advice,
      chemical_advice: s.recommendations?.[0]?.chemical_advice,
      prevention: s.recommendations?.[0]?.prevention,
    }));

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
          <View className="flex-1">
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs uppercase tracking-widest">
              {isSelectionMode ? `${selectedIds.length} Selected` : 'Scan Records'}
            </Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">
              {isSelectionMode ? 'Receipt-ify' : 'History'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity 
                onPress={isSelectionMode ? cancelSelection : () => setIsSelectionMode(true)}
                className={`mr-4 px-4 py-2 rounded-2xl border ${isSelectionMode ? 'bg-red-50 border-red-100' : 'bg-accent/10 border-accent/20'}`}
            >
                <Text className={`font-poppins-bold text-xs uppercase tracking-wider ${isSelectionMode ? 'text-red-500' : 'text-accent'}`}>
                {isSelectionMode ? 'Cancel' : 'Select'}
                </Text>
            </TouchableOpacity>

            <BingwaAvatar size={48} borderWidth={2} />
          </View>
        </View>

        <View className="items-center px-6">
          <View style={{ width: contentWidth }}>
            
            {/* Selection Prompt */}
            {isSelectionMode && selectedIds.length === 0 && (
              <MotiView 
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-accent/5 p-6 rounded-[32px] border border-accent/10 mb-8 items-center"
              >
                <View className="w-12 h-12 bg-accent/20 rounded-2xl items-center justify-center mb-3">
                  <Ionicons name="checkmark-circle" size={24} color="#25D366" />
                </View>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm text-center">
                  Select scans to Receipt-ify
                </Text>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px] text-center opacity-60 mt-1">
                  Tap your scan cards to include them in your report
                </Text>
              </MotiView>
            )}

            {/* Stats Summary */}
            {!isSelectionMode && (
              <View className="flex-row space-x-3 mb-8">
                <StatCard label="Total Scans" value={stats.total} icon="scan" color="#3A86FF" delay={200} />
                <StatCard label="Healthy" value={stats.healthy} icon="heart" color="#25D366" delay={300} />
                <StatCard label="Diseases" value={stats.diseased} icon="alert-circle" color="#D64545" delay={400} />
              </View>
            )}

            {/* Filters - Improved Spacing and Visibility */}
            <View className="mb-10">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="overflow-visible"
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {FILTERS.map((filter) => (
                  <View key={filter} className="mr-3">
                    <CategoryChip 
                      label={filter} 
                      active={activeFilter === filter} 
                      onPress={() => setActiveFilter(filter)} 
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Scan History List */}
            <View className="mb-24">
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
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.includes(item.id)}
                    onLongPress={() => handleLongPress(item.id)}
                    item={{
                      ...item,
                      crop: item.diseases?.crop || 'Crop',
                      result: item.diseases?.name || 'Processing...',
                      status: (item.severity === null || item.diseases?.name?.toLowerCase().includes('healthy')) ? 'Healthy' : 'Diseased',
                      date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      image: item.image_url
                    }} 
                    onPress={() => handlePress(item)} 
                  />
                ))
              ) : (
                <HistoryEmptyState onScan={() => router.push('/(tabs)/scan')} />
              )}
            </View>

          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button for Receiptify */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.5, translateY: 50 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.5, translateY: 50 }}
            className="absolute bottom-10 left-6 right-6"
          >
            <TouchableOpacity 
              onPress={() => setShowReceipt(true)}
              className="h-16 rounded-[24px] overflow-hidden shadow-2xl shadow-accent/40"
            >
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-1 flex-row items-center justify-center"
              >
                <Ionicons name="receipt" size={24} color="white" className="mr-3" />
                <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">
                  Receipt-ify ({selectedIds.length})
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        )}
      </AnimatePresence>

      <ReceiptPreview 
        visible={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        selectedScans={selectedScansData} 
      />
    </SafeAreaView>
  );
}
