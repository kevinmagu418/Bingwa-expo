import React, { useState, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, RefreshControl, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useScans, Scan } from '../../hooks/useScans';
import { useProfile } from '../../hooks/useProfile';
import { useTrends, Trend } from '../../hooks/useTrends';
import { BingwaAvatar } from '../../components/BingwaAvatar';
import { BingwaLoader } from '../../components/Loader';

const ORANGE = "#F4A261";
const GREEN = "#25D366";

// Static data for Knowledge Hub
const FUN_FACTS = [
  { id: '1', icon: 'sunny', title: 'Solar Power', text: 'Plants use only 1% of the sunlight they receive for photosynthesis.', color: '#FFB703' },
  { id: '2', icon: 'water', title: 'Water Usage', text: 'Drip irrigation can save up to 80% more water than traditional methods.', color: '#219EBC' },
  { id: '3', icon: 'bug', title: 'Ladybugs', text: 'Ladybugs can eat up to 5,000 aphids during their lifetime.', color: '#E63946' },
];

const InsightCard = memo(({ item, index }: { item: any, index: number }) => (
    <MotiView
        from={{ opacity: 0, scale: 0.9, translateX: 50 }}
        animate={{ opacity: 1, scale: 1, translateX: 0 }}
        transition={{ delay: 200 + (index * 100), type: 'spring' }}
        className="mr-4 w-64 bg-white dark:bg-darkSurface rounded-[32px] p-6 border border-black/5 shadow-xl shadow-black/5"
    >
        <View className="w-12 h-12 rounded-2xl items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: `${item.color}15` }}>
            <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-sm mb-2">{item.title}</Text>
        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[11px] leading-[18px] opacity-60">
            {item.text}
        </Text>
    </MotiView>
));

const TrendCard = memo(({ item }: { item: Trend }) => (
    <Pressable className="mb-4 active:scale-[0.98]">
        <MotiView className="bg-white dark:bg-darkSurface rounded-[32px] overflow-hidden border border-black/5 shadow-sm flex-row p-4">
            <Image 
                source={{ uri: item.image || 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=200' }} 
                className="w-20 h-20 rounded-2xl" 
                resizeMode="cover" 
            />
            <View className="flex-1 ml-4 justify-center">
                <View className="flex-row items-center mb-1">
                    <View className="bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full mr-2">
                        <Text className="text-orange-500 font-poppins-bold text-[8px] uppercase tracking-widest">{item.category}</Text>
                    </View>
                    <Text className="text-textSecondary dark:text-darkTextSecondary text-[9px] font-poppins-medium opacity-40">{item.date}</Text>
                </View>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm leading-tight" numberOfLines={2}>
                    {item.title}
                </Text>
            </View>
            <View className="justify-center ml-2">
                <View className="w-10 h-10 bg-orange-50 dark:bg-darkBackground rounded-xl items-center justify-center border border-orange-100/50">
                    <Ionicons name="arrow-forward" size={16} color={ORANGE} />
                </View>
            </View>
        </MotiView>
    </Pressable>
));

const ScanHistoryCard = memo(({ scan, onPress }: { scan: Scan, onPress: (scan: Scan) => void }) => (
  <Pressable 
    onPress={() => onPress(scan)}
    className="mb-4 active:scale-[0.98]"
  >
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="bg-white dark:bg-darkSurface p-5 rounded-[32px] border border-orange-100 dark:border-white/5 shadow-sm flex-row items-center"
    >
      <View className="relative">
        <Image 
          source={{ uri: scan.image_url }} 
          className="w-16 h-16 rounded-2xl" 
          resizeMode="cover" 
        />
        <View className="absolute -bottom-1 -right-1 bg-white dark:bg-darkBackground p-1 rounded-full shadow-sm">
           <View className={`w-4 h-4 rounded-full ${scan.severity === 'high' ? 'bg-red-500' : scan.severity === 'medium' ? 'bg-orange-400' : 'bg-green-500'}`} />
        </View>
      </View>

      <View className="flex-1 ml-5">
        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm leading-tight">
          {scan.diseases?.crop} / {scan.diseases?.name}
        </Text>
        <Text className="text-textSecondary dark:text-darkTextSecondary text-[10px] font-poppins-regular opacity-60 mt-1 uppercase tracking-widest">
          {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <View className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-2xl border border-orange-100 dark:border-orange-900/20">
        <Ionicons name="sparkles" size={18} color={ORANGE} />
      </View>
    </MotiView>
  </Pressable>
));

export default function LearnTab() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const contentWidth = isWeb ? Math.min(width - 40, 550) : width;

  const { profile, refreshProfile } = useProfile();
  const { scans, loading: scansLoading, refreshScans } = useScans(20);
  const { trends, loading: trendsLoading, refreshTrends } = useTrends();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh profile when tab is focused
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      refreshTrends();
    }, [refreshProfile, refreshTrends])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshScans(), refreshProfile(), refreshTrends()]);
    setRefreshing(false);
  }, [refreshScans, refreshProfile, refreshTrends]);

  const handleScanPress = (scan: Scan) => {
    router.push({
      pathname: '/ai-assistant',
      params: { 
        currentDiseaseId: scan.disease_id,
        imageUri: scan.image_url,
        crop: scan.diseases?.crop,
        disease: scan.diseases?.name,
        severity: scan.severity,
        initialMessage: `I've retrieved your scan of ${scan.diseases?.crop} which showed signs of ${scan.diseases?.name}. How can I help you manage this condition today?`
      }
    });
  };

  const loading = scansLoading || trendsLoading;

  if (loading && !refreshing) {
    return <BingwaLoader label="Accessing Knowledge Vault..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F5] dark:bg-darkBackground" edges={['top']}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />
        }
      >
        
        {/* Modern Header */}
        <View className="px-8 py-8 flex-row justify-between items-center">
            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                    <Ionicons name="sparkles" size={14} color={ORANGE} className="mr-2" />
                    <Text className="text-orange-500 font-poppins-bold text-[10px] uppercase tracking-[3px]">Knowledge Hub</Text>
                </View>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">
                    Bingwa <Text style={{ color: ORANGE }}>Brain</Text>
                </Text>
            </View>

            <BingwaAvatar size={56} borderWidth={2} borderColor={ORANGE} />
        </View>

        <View className="items-center px-6">
          <View style={{ width: contentWidth }}>
            
            {/* AI Assistant Direct Access - Interactive Design */}
            <TouchableOpacity 
              onPress={() => router.push('/ai-assistant')}
              activeOpacity={0.9}
              className="mb-10"
            >
              <MotiView 
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-[48px] border border-orange-200 dark:border-white/5 shadow-2xl shadow-orange-900/10"
              >
                <LinearGradient
                  colors={[ORANGE, '#E76F51']}
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }}
                  className="p-10"
                >
                  <View className="flex-row items-center mb-6">
                    <View className="w-16 h-16 rounded-[24px] bg-white items-center justify-center mr-6 shadow-xl shadow-orange-900/20">
                        <MotiView
                            animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: ['0deg', '10deg', '-10deg', '0deg']
                            }}
                            transition={{
                                loop: true,
                                duration: 4000,
                                type: 'timing'
                            }}
                        >
                            <Ionicons name="chatbubbles" size={32} color={ORANGE} />
                        </MotiView>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white/70 font-poppins-bold text-[10px] uppercase tracking-[4px] mb-1">AI Consultation</Text>
                        <Text className="text-white font-poppins-black text-2xl">Ask Anything</Text>
                    </View>
                  </View>

                  <View className="bg-white/20 backdrop-blur-md p-5 rounded-3xl border border-white/20">
                    <Text className="text-white font-poppins-medium text-xs leading-relaxed italic">
                      "Bingwa, what are the early signs of Maize Rust and how do I prevent it organically?"
                    </Text>
                  </View>

                  <View className="absolute bottom-6 right-10 flex-row items-center">
                    <Text className="text-white font-poppins-black text-[10px] uppercase tracking-widest mr-2">Start Chat</Text>
                    <Ionicons name="arrow-forward-circle" size={24} color="white" />
                  </View>
                </LinearGradient>
              </MotiView>
            </TouchableOpacity>

            {/* Quick Insights Section */}
            <View className="mb-12">
                <View className="flex-row justify-between items-center mb-6 px-2">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Quick Insights</Text>
                    <TouchableOpacity>
                        <Text className="text-orange-500 font-poppins-bold text-[10px] uppercase tracking-widest">See All</Text>
                    </TouchableOpacity>
                </View>
                
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="overflow-visible"
                    contentContainerStyle={{ paddingRight: 20 }}
                >
                    {FUN_FACTS.map((item, index) => (
                        <InsightCard key={item.id} item={item} index={index} />
                    ))}
                </ScrollView>
            </View>

            {/* Trending Section */}
            <View className="mb-12">
                <View className="flex-row justify-between items-center mb-6 px-2">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Global Trends</Text>
                    <Ionicons name="trending-up" size={18} color={ORANGE} />
                </View>

                {trends.length > 0 ? (
                  trends.map((item) => (
                      <TrendCard key={item.id} item={item} />
                  ))
                ) : (
                  <View className="p-8 items-center justify-center bg-white dark:bg-darkSurface rounded-[32px] border border-dashed border-orange-100">
                    <Text className="text-textSecondary opacity-40 font-poppins-medium text-xs">No active global trends found.</Text>
                  </View>
                )}
            </View>

            {/* Recent Diagnoses Section */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-6 px-2">
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Vault History</Text>
                <View className="bg-orange-50 dark:bg-orange-950/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/20">
                   <Text style={{ color: ORANGE }} className="text-[10px] font-poppins-bold uppercase tracking-widest">{scans.length} Scans</Text>
                </View>
              </View>

              {scans.length > 0 ? (
                scans.map((scan) => (
                  <ScanHistoryCard 
                    key={scan.id} 
                    scan={scan} 
                    onPress={handleScanPress} 
                  />
                ))
              ) : (
                <MotiView 
                   from={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   className="py-16 items-center justify-center bg-white dark:bg-darkSurface rounded-[40px] border border-dashed border-orange-200 dark:border-white/10"
                >
                  <Ionicons name="camera-outline" size={48} color={ORANGE} style={{ opacity: 0.3 }} />
                  <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-sm mt-4 opacity-40">No scans to learn from yet.</Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/scan')}
                    className="mt-6 px-8 py-3 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/20"
                  >
                    <Text style={{ color: ORANGE }} className="font-poppins-black text-xs uppercase tracking-widest">Start Scanning</Text>
                  </TouchableOpacity>
                </MotiView>
              )}
            </View>

            {/* Privacy Disclaimer */}
            <View className="mb-20 mt-4 flex-row items-center justify-center opacity-40">
                <Ionicons name="shield-checkmark" size={14} color={ORANGE} />
                <Text style={{ color: ORANGE }} className="text-[10px] font-poppins-bold ml-2 uppercase tracking-widest">
                  Secure AI Knowledge Vault
                </Text>
            </View>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
