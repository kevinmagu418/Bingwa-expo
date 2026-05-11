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

const FILTERS = ["All", "Healthy", "Diseased"];

export default function HistoryTab() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
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
      // Safely extract recommendations whether it's an array or an object
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
              {isSelectionMode ? `${selectedIds.length} Selected` : 'Vault Records'}
            </Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">
              {isSelectionMode ? 'Receipt-ify' : 'History'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity 
                onPress={isSelectionMode ? cancelSelection : () => setIsSelectionMode(true)}
                className={`mr-4 px-4 py-2 rounded-2xl border ${isSelectionMode ? 'bg-red-50 border-red-100' : 'bg-white dark:bg-darkSurface border-black/5'}`}
            >
                <Text className={`font-poppins-bold text-xs uppercase tracking-wider ${isSelectionMode ? 'text-red-500' : 'text-textPrimary dark:text-darkTextPrimary'}`}>
                {isSelectionMode ? 'Cancel' : 'Select'}
                </Text>
            </TouchableOpacity>

            <BingwaAvatar size={48} borderWidth={2} />
          </View>
        </View>

        <View className="items-center px-6">
          <View style={{ width: contentWidth }}>
            
            {/* Stats Summary - More Breathing Room & Alive */}
            {!isSelectionMode && (
              <View className="flex-row space-x-4 mb-10">
                <StatCard label="Records" value={stats.total} icon="document-text" color="#3A86FF" delay={200} />
                <StatCard label="Healthy" value={stats.healthy} icon="heart" color="#25D366" delay={300} />
                <StatCard label="Issues" value={stats.diseased} icon="bug" color="#D64545" delay={400} />
              </View>
            )}

            {/* Receiptify Discoverability */}
            {!isSelectionMode && stats.total > 0 && (
                <ReceiptifyTeaser onPress={() => setIsSelectionMode(true)} />
            )}

            {/* Filter Header & Sort */}
            <View className="flex-row justify-between items-center mb-8 px-1">
                <View className="flex-row">
                    {FILTERS.map((filter) => (
                        <TouchableOpacity 
                            key={filter} 
                            onPress={() => setActiveFilter(filter)}
                            className="mr-6"
                        >
                            <Text className={`font-poppins-bold text-sm ${activeFilter === filter ? 'text-accent' : 'text-textSecondary opacity-30'}`}>
                                {filter}
                            </Text>
                            {activeFilter === filter && (
                                <MotiView 
                                    transition={{ type: 'spring' }}
                                    className="h-1.5 w-4 bg-accent rounded-full mt-1.5" 
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity 
                    onPress={() => {
                        // Simple toggle for now, could be a modal/dropdown
                        if (selectedCrop) setSelectedCrop(null);
                        else if (availableCrops.length > 0) setSelectedCrop(availableCrops[0] as string);
                    }}
                    className={`px-4 py-2.5 rounded-2xl border flex-row items-center ${selectedCrop ? 'bg-accent border-accent' : 'bg-white dark:bg-darkSurface border-black/5'}`}
                >
                    <Ionicons name="filter" size={14} color={selectedCrop ? "white" : "#25D366"} className="mr-2" />
                    <Text className={`font-poppins-bold text-[10px] uppercase tracking-wider ${selectedCrop ? 'text-white' : 'text-textPrimary dark:text-darkTextPrimary'}`}>
                        {selectedCrop || 'All Crops'}
                    </Text>
                </TouchableOpacity>
            </View>

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
