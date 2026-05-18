import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, useWindowDimensions, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatCard, HistoryCard, HistoryEmptyState, ReceiptifyTeaser } from '../../components/HistoryComponents';
import { CategoryChip } from '../../components/LearnComponents';
import { useScans } from '../../hooks/useScans';
import { useReports } from '../../hooks/useReports';
import { useProfile } from '../../hooks/useProfile';
import { BingwaAvatar } from '../../components/BingwaAvatar';
import { ReceiptPreview } from '../../components/ReceiptPreview';
import { cleanArrayString } from '../../utils/formatters';
import { MotiView, AnimatePresence } from 'moti';
import { LinearTransition } from 'react-native-reanimated';
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
  const { scans, loading: scansLoading, refreshScans } = useScans();
  const { reports, loading: reportsLoading, refreshReports } = useReports();
  const loading = scansLoading || reportsLoading;
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
    await Promise.all([refreshScans(), refreshReports(), refreshProfile()]);
    setRefreshing(false);
  }, [refreshScans, refreshReports, refreshProfile]);

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
  const contentWidth = isWeb ? Math.min(width - 40, 550) : '100%';

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
    <SafeAreaView className="flex-1 bg-white dark:bg-darkBackground" edges={['top']} pointerEvents="box-none">
      <ScrollView 
        className="flex-1" 
        pointerEvents="auto"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#25D366" />
        }
      >
        
        {/* Dynamic Vibrant Header */}
        <View className="bg-[#121B22] dark:bg-darkSurface rounded-b-[60px] px-8 pt-10 pb-16 shadow-2xl relative overflow-hidden">
            <LinearGradient
                colors={['rgba(37, 211, 102, 0.15)', 'transparent']}
                className="absolute inset-0"
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            
            <View className="flex-row justify-between items-center mb-10">
                <View>
                    <Text className="text-accent font-poppins-black text-[10px] uppercase tracking-[4px]">Agricultural Archive</Text>
                    <Text className="text-white font-poppins-black text-3xl mt-1">Digital Vault</Text>
                </View>
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        onPress={isSelectionMode ? cancelSelection : () => setIsSelectionMode(true)}
                        className={`mr-4 w-10 h-10 rounded-2xl items-center justify-center border ${isSelectionMode ? 'bg-red-500/20 border-red-500/40' : 'bg-white/5 border-white/10'}`}
                    >
                        <Ionicons name={isSelectionMode ? "close" : "share-outline"} size={20} color={isSelectionMode ? "#EF4444" : "white"} />
                    </TouchableOpacity>
                    <BingwaAvatar size={48} borderWidth={2} />
                </View>
            </View>

            {/* High-Impact Stats Dashboard */}
            <View className="flex-row justify-between">
                <StatCard label="Total Scans" value={stats.total} icon="scan" color="#25D366" delay={100} />
                <StatCard label="Health Index" value={`${Math.round((stats.healthy / (stats.total || 1)) * 100)}%`} icon="leaf" color="#F4A261" delay={200} />
                <StatCard label="Reports" value={reports.length} icon="receipt" color="#3B82F6" delay={300} />
            </View>
        </View>

        <View className="px-8 mt-10">
            {/* Contextual Action Bar */}
            <AnimatePresence>
                {isSelectionMode && (
                    <MotiView 
                        from={{ opacity: 0, translateY: -20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        exit={{ opacity: 0, translateY: -20 }}
                        className="bg-accent p-6 rounded-[32px] mb-8 flex-row items-center justify-between shadow-xl shadow-accent/30"
                    >
                        <View>
                            <Text className="text-white font-poppins-black text-lg">{selectedIds.length} Selected</Text>
                            <Text className="text-white/70 font-poppins-medium text-[10px] uppercase tracking-widest">Ready for Receipt-ify</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => setShowReceipt(true)}
                            disabled={selectedIds.length === 0}
                            className={`px-6 py-3 rounded-2xl bg-white ${selectedIds.length === 0 ? 'opacity-50' : 'opacity-100 shadow-lg'}`}
                        >
                            <Text className="text-accent font-poppins-black text-xs uppercase tracking-widest">Generate</Text>
                        </TouchableOpacity>
                    </MotiView>
                )}
            </AnimatePresence>

            {!isSelectionMode && <ReceiptifyTeaser onPress={() => setIsSelectionMode(true)} />}

            {/* Activity Log - Filterable Section */}
            <View className="mb-8">
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                        <View className="w-1.5 h-6 bg-orange-400 rounded-full mr-3" />
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Activity Log</Text>
                    </View>
                    
                    <View className="flex-row bg-gray-100 dark:bg-darkSurface p-1 rounded-2xl">
                        {FILTERS.map((filter) => (
                            <TouchableOpacity 
                                key={filter} 
                                onPress={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-xl ${activeFilter === filter ? 'bg-white dark:bg-accent shadow-sm' : ''}`}
                            >
                                <Text className={`font-poppins-bold text-[9px] uppercase tracking-wider ${activeFilter === filter ? 'text-accent dark:text-white' : 'text-textSecondary opacity-40'}`}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Main Content List */}
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
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedIds.includes(item.id)}
                        onLongPress={() => handleLongPress(item.id)}
                        item={{
                          ...item,
                          crop: item.diseases?.name || 'Processing...',
                          result: item.diseases?.crop || 'Crop Type',
                          status: (item.severity === null || item.diseases?.name?.toLowerCase().includes('healthy')) ? 'Healthy' : 'Diseased',
                          date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
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
      
      {/* Receiptify Modal */}
      <ReceiptPreview
        visible={showReceipt}
        onClose={() => setShowReceipt(false)}
        selectedScans={selectedScansData as any}
      />
    </SafeAreaView>
  );
}
