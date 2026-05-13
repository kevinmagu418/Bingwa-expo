import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatCard, HistoryCard, HistoryEmptyState, ReceiptifyTeaser } from '../../components/HistoryComponents';
import { CategoryChip } from '../../components/LearnComponents';
import { useScans } from '../../hooks/useScans';
import { useProfile } from '../../hooks/useProfile';
import { BingwaAvatar } from '../../components/BingwaAvatar';
import { ReceiptPreview } from '../../components/ReceiptPreview';
import { cleanArrayString } from '../../utils/formatters';
import { MotiView, AnimatePresence } from 'moti';
import { HistoryCardSkeleton } from '../../components/Loader';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const FILTERS = ["Healthy", "Diseased"];

export default function HistoryTab() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("Healthy");
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
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
    
    // Status Filter
    let matchesStatus = true;
    if (activeFilter === "Healthy") matchesStatus = isHealthy;
    else if (activeFilter === "Diseased") matchesStatus = !isHealthy;

    // Crop Filter
    let matchesCrop = true;
    if (selectedCrop) matchesCrop = item.diseases?.crop === selectedCrop;

    return matchesStatus && matchesCrop;
  });

  const availableCrops = Array.from(new Set(scans.map(s => s.diseases?.crop).filter(Boolean)));

  const selectedScansData = scans
    .filter(s => selectedIds.includes(s.id))
    .map(s => {
      const rec = Array.isArray(s.recommendations) ? (s.recommendations[0] || {}) : (s.recommendations || {});

      const specificOrg = cleanArrayString(rec.organic_advice);
      const globalOrg = cleanArrayString(s.diseases?.organic_remedies);
      const organic_advice = (specificOrg && !specificOrg.toLowerCase().includes("no ")) 
        ? specificOrg 
        : (globalOrg || specificOrg || 'No organic remedies available');

      const specificChem = cleanArrayString(rec.chemical_advice);
      const globalChem = cleanArrayString(s.diseases?.chemical_remedies);
      const chemical_advice = (specificChem && !specificChem.toLowerCase().includes("no ")) 
        ? specificChem 
        : (globalChem || specificChem || 'Consult agrovet for chemical options');

      const specificPrev = cleanArrayString(rec.prevention);
      const globalPrev = cleanArrayString(s.diseases?.prevention_tips);
      const prevention = (specificPrev && !specificPrev.toLowerCase().includes("no ")) 
        ? specificPrev 
        : (globalPrev || specificPrev || 'No prevention tips available');

      return {
        id: s.id,
        crop: s.diseases?.crop || 'Crop',
        result: s.diseases?.name || 'Diagnosis',
        severity: s.severity || 'low',
        date: new Date(s.created_at).toLocaleDateString(),
        organic_advice,
        chemical_advice,
        prevention,
      };
    });

  const stats = {
    total: scans.length,
    healthy: scans.filter(i => i.severity === null || i.diseases?.name?.toLowerCase().includes('healthy')).length,
    diseased: scans.filter(i => i.severity !== null && !i.diseases?.name?.toLowerCase().includes('healthy')).length
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-darkBackground" edges={['top']}>
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
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs uppercase tracking-widest opacity-60">
              {isSelectionMode ? `${selectedIds.length} Selected` : 'Vault Records'}
            </Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">
              {isSelectionMode ? 'Receipt-ify' : 'History'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity 
                onPress={isSelectionMode ? cancelSelection : () => setIsSelectionMode(true)}
                className={`mr-4 px-4 py-2 rounded-2xl border ${isSelectionMode ? 'bg-red-500/10 border-red-500/20' : 'bg-black/5 dark:bg-white/5 border-transparent'}`}
            >
                <Text className={`font-poppins-bold text-[10px] uppercase tracking-wider ${isSelectionMode ? 'text-red-500' : 'text-textPrimary dark:text-darkTextPrimary'}`}>
                {isSelectionMode ? 'Cancel' : 'Select'}
                </Text>
            </TouchableOpacity>

            <BingwaAvatar size={48} borderWidth={2} borderColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
          </View>
        </View>

        <View className="items-center px-6">
          <View style={{ width: contentWidth }}>
            
            {/* Stats Summary - Compact & Premium */}
            {!isSelectionMode && (
              <View className="flex-row justify-between mb-8">
                <View className="flex-1 bg-black/5 dark:bg-white/5 p-4 rounded-3xl mr-3 items-center border border-black/5 dark:border-white/5">
                    <Text className="text-accent font-poppins-black text-lg mb-0.5">{stats.total}</Text>
                    <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[8px] uppercase tracking-widest">Total</Text>
                </View>
                <View className="flex-1 bg-black/5 dark:bg-white/5 p-4 rounded-3xl mr-3 items-center border border-black/5 dark:border-white/5">
                    <Text className="text-[#25D366] font-poppins-black text-lg mb-0.5">{stats.healthy}</Text>
                    <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[8px] uppercase tracking-widest">Healthy</Text>
                </View>
                <View className="flex-1 bg-black/5 dark:bg-white/5 p-4 rounded-3xl items-center border border-black/5 dark:border-white/5">
                    <Text className="text-[#D64545] font-poppins-black text-lg mb-0.5">{stats.diseased}</Text>
                    <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[8px] uppercase tracking-widest">Issues</Text>
                </View>
              </View>
            )}

            {/* Receiptify Teaser */}
            {!isSelectionMode && stats.total > 0 && (
              <TouchableOpacity onPress={() => setIsSelectionMode(true)} className="mb-8">
                <LinearGradient 
                  colors={isDark ? ['#1F2C34', '#121B22'] : ['#FFFFFF', '#F8F9FA']}
                  className="flex-row items-center p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm"
                >
                  <View className="w-10 h-10 bg-accent/20 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="receipt" size={20} color="#25D366" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">Receipt-ify Records</Text>
                    <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px]">Create professional reports from scans</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={isDark ? "white" : "#111B21"} />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Filter Header */}
            <View className="flex-row justify-between items-center mb-6 px-1">
                <View className="flex-row">
                    {FILTERS.map((filter) => (
                        <TouchableOpacity 
                            key={filter} 
                            onPress={() => setActiveFilter(filter)}
                            className="mr-6"
                        >
                            <Text className={`font-poppins-bold text-xs uppercase tracking-widest ${activeFilter === filter ? 'text-accent' : 'text-textSecondary dark:text-darkTextSecondary opacity-40'}`}>
                                {filter}
                            </Text>
                            {activeFilter === filter && (
                                <View className="h-1 w-full bg-accent rounded-full mt-1.5" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Scan History List */}
            <View className="mb-24">
              {loading ? (
                <>
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
    </SafeAreaView>
  );
}
