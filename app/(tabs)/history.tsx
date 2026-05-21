import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HistoryCard, HistoryEmptyState, ReceiptifyTeaser } from '../../components/HistoryComponents';
import { useScans } from '../../hooks/useScans';
import { useProfile } from '../../hooks/useProfile';
import { ReceiptPreview } from '../../components/ReceiptPreview';
import { HistoryCardSkeleton } from '../../components/Loader';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../../context/ThemeContext';

const FILTERS = ["Healthy", "Diseased"];

export default function HistoryTab() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("Healthy");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);

  const { scans, loading, refreshScans } = useScans();
  const { profile, refreshProfile } = useProfile();
  const [refreshing, setRefreshing] = useState(false);

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

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const filteredData = scans.filter(item => {
    const diseaseName = item.diseases?.name?.toLowerCase() || '';
    const severity = item.severity?.toLowerCase() || 'low';
    const isHealthy = severity === 'low' || diseaseName.includes('healthy');
    return activeFilter === "Healthy" ? isHealthy : !isHealthy;
  });

  const selectedScansData = scans
    .filter(s => selectedIds.includes(s.id))
    .map(s => {
      // Helper to format remedies which might be arrays or objects
      const formatRemedy = (remedy: any) => {
        if (!remedy) return null;
        if (Array.isArray(remedy)) return remedy.join(', ');
        if (typeof remedy === 'object') return JSON.stringify(remedy);
        return String(remedy);
      };

      return {
        id: s.id,
        crop: s.diseases?.crop || 'Crop',
        result: s.diseases?.name || 'Diagnosis',
        severity: s.severity || 'low',
        date: new Date(s.created_at).toLocaleDateString(),
        organic_advice: s.recommendations?.organic_advice || formatRemedy(s.diseases?.organic_remedies) || 'No organic advice available',
        chemical_advice: s.recommendations?.chemical_advice || formatRemedy(s.diseases?.chemical_remedies) || 'No chemical advice available',
        prevention: s.recommendations?.prevention || formatRemedy(s.diseases?.prevention_tips) || 'No prevention tips available'
      };
    });

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F5] dark:bg-darkBackground" edges={['top']}>
      {/* Header matching Result Theme */}
      <View className="px-8 pt-10 pb-6 bg-white dark:bg-darkSurface rounded-b-[40px] shadow-sm">
        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">History</Text>
        <TouchableOpacity 
            onPress={() => setIsSelectionMode(!isSelectionMode)}
            className="mt-4 flex-row items-center"
        >
            <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${isSelectionMode ? 'bg-red-500/20' : 'bg-orange-100'}`}>
                <Ionicons name={isSelectionMode ? "close" : "list-outline"} size={20} color={isSelectionMode ? "#EF4444" : "#F4A261"} />
            </View>
            <Text className="text-orange-500 font-poppins-bold text-xs uppercase tracking-widest">
                {isSelectionMode ? "Cancel Export" : "Select Scans for Report"}
            </Text>
        </TouchableOpacity>
      </View>

      <View className="px-8 my-6">
        <View className="flex-row bg-orange-50 dark:bg-darkSurface p-1 rounded-2xl border border-orange-100/50">
            {FILTERS.map((filter) => (
                <TouchableOpacity 
                    key={filter} 
                    onPress={() => setActiveFilter(filter)}
                    className={`flex-1 px-4 py-3 rounded-xl items-center ${activeFilter === filter ? 'bg-white dark:bg-orange-500 shadow-sm' : ''}`}
                >
                    <Text className={`font-poppins-bold text-xs ${activeFilter === filter ? 'text-orange-500 dark:text-white' : 'text-textSecondary opacity-40'}`}>
                        {filter}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-8" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F4A261" />}
      >
        <View className="pb-32">
            {!isSelectionMode && filteredData.length > 0 && (
                <ReceiptifyTeaser onPress={() => setIsSelectionMode(true)} />
            )}

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
                        onSelectToggle={() => toggleSelection(item.id)}
                        item={{
                            ...item,
                            crop: item.diseases?.crop || 'Crop',
                            result: item.diseases?.name || 'Diagnosis',
                            date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                            image: (item.image_url && typeof item.image_url === 'string' && item.image_url.startsWith('http')) 
                                ? { uri: item.image_url } 
                                : require('../../assets/farmer.jpg')
                        }} 
                        onPress={() => {
                            if (isSelectionMode) toggleSelection(item.id);
                            else router.push({ pathname: '/(scan)/result', params: { scanId: item.id } });
                        }} 
                    />
                ))
            ) : (
                <HistoryEmptyState onScan={() => router.push('/(tabs)/scan')} />
            )}
        </View>
      </ScrollView>

      {/* Sticky Export Footer */}
      <AnimatePresence>
        {isSelectionMode && (
          <MotiView 
            from={{ translateY: 100, opacity: 0 }} 
            animate={{ translateY: 0, opacity: 1 }} 
            exit={{ translateY: 100, opacity: 0 }} 
            className="absolute bottom-0 w-full p-6 bg-white dark:bg-darkSurface border-t border-black/5 flex-row items-center justify-between shadow-2xl"
          >
              <TouchableOpacity onPress={cancelSelection}>
                  <Text className="text-textSecondary font-poppins-bold uppercase text-[10px] tracking-widest">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  onPress={() => setShowReceipt(true)}
                  disabled={selectedIds.length === 0}
                  className={`h-16 px-8 rounded-2xl flex-row items-center justify-center shadow-lg ${selectedIds.length === 0 ? 'bg-gray-300' : 'bg-orange-500 shadow-orange-500/30'}`}
              >
                  <Ionicons name="document-text" size={20} color="white" />
                  <Text className="text-white font-poppins-black ml-2 uppercase tracking-widest">
                    Export Report ({selectedIds.length})
                  </Text>
              </TouchableOpacity>
          </MotiView>
        )}
      </AnimatePresence>
      
      <ReceiptPreview 
        visible={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        selectedScans={selectedScansData as any} 
        profile={profile}
      />
    </SafeAreaView>
  );
}
