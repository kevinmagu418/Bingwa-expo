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
import { TabFooter } from '../../components/TabFooter';

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
        
        {/* Modern Header with Archive Focus */}
        <View className="px-6 py-6 flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-black text-[10px] uppercase tracking-[4px] opacity-40 mb-1">
              {isSelectionMode ? `${selectedIds.length} Selected` : 'Agricultural Archive'}
            </Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">
              {isSelectionMode ? 'Receipt-ify' : 'Digital Vault'}
            </Text>
          </View>

          <View className="flex-row items-center">
            {isSelectionMode && selectedIds.length > 0 && (
              <TouchableOpacity 
                onPress={() => setShowReceipt(true)}
                className="mr-3 bg-accent px-5 py-2.5 rounded-2xl shadow-lg shadow-accent/30"
              >
                <Text className="text-white font-poppins-black text-[10px] uppercase tracking-[2px]">
                  Create
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
                onPress={isSelectionMode ? cancelSelection : () => setIsSelectionMode(true)}
                className={`mr-4 px-4 py-2.5 rounded-2xl border ${isSelectionMode ? 'bg-red-500/10 border-red-500/20' : 'bg-black/5 dark:bg-white/5 border-transparent'}`}
            >
                <Text className={`font-poppins-bold text-[10px] uppercase tracking-wider ${isSelectionMode ? 'text-red-500' : 'text-textPrimary dark:text-darkTextPrimary'}`}>
                {isSelectionMode ? 'Cancel' : 'Export'}
                </Text>
            </TouchableOpacity>
            <BingwaAvatar size={48} borderWidth={2} borderColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
          </View>
        </View>

        <View className="items-center px-6">
          <View style={{ width: contentWidth }}>
            
            {/* 1. High-Density Stats Dashboard - HCI: Visibility of System Status */}
            {!isSelectionMode && (
              <View className="flex-row justify-between mb-12 px-1">
                {[
                  { label: 'Total Scans', value: stats.total, icon: 'scan', color: '#25D366' },
                  { label: 'Reports', value: Math.floor(stats.total / 2), icon: 'receipt', color: '#3B82F6' },
                  { label: 'Health Index', value: stats.healthy, icon: 'leaf', color: '#D97706' }
                ].map((stat, idx) => (
                  <View key={idx} className="flex-1 items-center">
                    <View 
                      className="w-14 h-14 rounded-[22px] items-center justify-center mb-3 shadow-sm border border-black/5 dark:border-white/5"
                      style={{ backgroundColor: `${stat.color}10` }}
                    >
                        <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                    </View>
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">{stat.value}</Text>
                    <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[7px] uppercase tracking-[2px] opacity-40">{stat.label}</Text>
                  </View>
                ))}
              </View>
            )}

            <View className="h-[1px] w-full bg-black/5 dark:bg-white/5 mb-12" />

            {/* 2. Archive Guide: Master Receipt-ify */}
            {!isSelectionMode && stats.total > 0 && (
              <View className="mb-12">
                <View className="flex-row items-center mb-6 px-1">
                  <View className="w-1.5 h-6 bg-accent rounded-full mr-3" />
                  <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl tracking-tight">Archive Guide</Text>
                </View>
                
                <View className="bg-white dark:bg-darkSurface rounded-[36px] overflow-hidden shadow-2xl shadow-accent/20 border border-accent/10">
                  <LinearGradient
                    colors={['#25D366', '#128C7E']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    className="p-8"
                  >
                    <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                    
                    <View className="flex-row justify-between items-start mb-6">
                      <View className="flex-1">
                        <View className="bg-white/20 self-start px-3 py-1 rounded-full backdrop-blur-md mb-3 border border-white/20">
                          <Text className="text-white font-poppins-black text-[9px] uppercase tracking-[2px]">Premium Feature</Text>
                        </View>
                        <Text className="text-white font-poppins-black text-2xl leading-tight">Master Receipt-ify</Text>
                        <Text className="text-white/80 font-poppins-medium text-xs mt-1">
                          Transform scans into printable ag-reports.
                        </Text>
                      </View>
                      <View className="bg-white/20 w-14 h-14 rounded-2xl items-center justify-center backdrop-blur-md border border-white/30">
                        <Ionicons name="document-text" size={24} color="white" />
                      </View>
                    </View>

                    <TouchableOpacity 
                      onPress={() => setIsSelectionMode(true)}
                      activeOpacity={0.8}
                      className="bg-white rounded-[20px] h-14 items-center justify-center shadow-lg flex-row"
                    >
                      <Text className="text-accent font-poppins-black text-xs uppercase tracking-[2px] mr-2">Generate Report</Text>
                      <Ionicons name="arrow-forward" size={16} color="#25D366" />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
            )}

            {/* 3. Recent Reports Archive */}
            {!isSelectionMode && (scans.length > 0 || reports.length > 0) && (
              <View className="mb-12">
                <View className="flex-row justify-between items-center mb-6 px-1">
                  <View className="flex-row items-center">
                    <View className="w-1.5 h-6 bg-blue-500 rounded-full mr-3" />
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl tracking-tight">
                      {reports.length > 0 ? 'Official Reports' : 'Recent Reports'}
                    </Text>
                  </View>
                  {reports.length > 0 && (
                    <TouchableOpacity>
                      <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-[2px]">Show All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible py-2">
                  {(reports.length > 0 ? reports.slice(0, 5) : scans.slice(0, 5)).map((item: any, i) => {
                    // Logic to handle both Reports and Scans
                    const isReport = 'data' in item;
                    const displayId = isReport ? `RPT-${item.id.slice(0, 6)}` : `TMP-${item.id.slice(0, 6)}`;
                    const displayTitle = isReport ? `${item.data.length} Scans Report` : (item.diseases?.name || 'Processing...');
                    const displayCrop = isReport ? item.data[0]?.crop : item.diseases?.crop;
                    const displayImage = isReport ? item.data[0]?.image_url : item.image_url;
                    const displayDate = new Date(item.created_at).toLocaleDateString();
                    const isHealthy = isReport ? false : displayTitle.toLowerCase().includes('healthy');
                    
                    return (
                      <TouchableOpacity 
                        key={item.id} 
                        onPress={() => isReport ? null : handlePress(item)}
                        activeOpacity={0.9}
                        className="mr-6 bg-white dark:bg-darkSurface rounded-[48px] border border-black/5 dark:border-white/5 shadow-2xl w-64 overflow-hidden"
                      >
                        <View className="h-36 w-full relative">
                          <Image source={{ uri: displayImage }} className="w-full h-full" contentFit="cover" />
                          <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} className="absolute inset-0" />
                          <View className="absolute top-5 left-5 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/20">
                            <Text className="text-white font-poppins-black text-[9px] uppercase tracking-widest">{displayId.toUpperCase()}</Text>
                          </View>
                        </View>

                        <View className="p-6">
                          <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-base mb-1 tracking-tight" numberOfLines={1}>
                            {displayTitle}
                          </Text>
                          <View className="flex-row items-center mb-5 opacity-40">
                             <Ionicons name="calendar-clear" size={10} color={isDark ? 'white' : 'black'} />
                             <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-medium text-[10px] ml-1.5">
                                {displayCrop} • {displayDate}
                             </Text>
                          </View>
                          
                          <View className="flex-row items-center justify-between">
                            <View className={`px-4 py-1.5 rounded-xl ${isHealthy ? 'bg-accent/10' : 'bg-red-500/10'}`}>
                              <Text className={`font-poppins-black text-[9px] uppercase tracking-widest ${isHealthy ? 'text-accent' : 'text-red-500'}`}>
                                {isReport ? 'Certified' : (isHealthy ? 'Certified' : 'Alert')}
                              </Text>
                            </View>
                            <View className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-2xl items-center justify-center border border-black/5">
                              <Ionicons name={isReport ? "eye" : "download"} size={18} color={isDark ? "white" : "#111B21"} />
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View className="h-[1px] w-full bg-black/5 dark:bg-white/5 mb-12" />

            {/* 4. Activity Log - Filterable Archive */}
            <View className="mb-8 px-1">
                <View className="flex-row items-center mb-6">
                    <View className="w-1.5 h-6 bg-amber-500 rounded-full mr-3" />
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl tracking-tight">Activity Log</Text>
                </View>
                
                <View className="flex-row">
                    {FILTERS.map((filter) => (
                        <TouchableOpacity 
                            key={filter} 
                            onPress={() => setActiveFilter(filter)}
                            className={`mr-4 px-6 py-2.5 rounded-2xl border ${activeFilter === filter ? 'bg-accent border-accent shadow-lg shadow-accent/30' : 'bg-black/5 dark:bg-white/5 border-transparent'}`}
                        >
                            <Text className={`font-poppins-bold text-[10px] uppercase tracking-[2px] ${activeFilter === filter ? 'text-white' : 'text-textSecondary dark:text-darkTextSecondary opacity-40'}`}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Scan History List */}
            <View className="mb-8">
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
            <TabFooter />
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
