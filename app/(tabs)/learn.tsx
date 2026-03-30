import React, { useState, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, RefreshControl, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useScans, Scan } from '../../hooks/useScans';
import { useProfile } from '../../hooks/useProfile';
import { BingwaAvatar } from '../../components/BingwaAvatar';
import { BingwaLoader } from '../../components/Loader';

const ORANGE = "#F4A261";
const GREEN = "#25D366";

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
  const { scans, loading, refreshScans } = useScans(20);
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
        
        {/* Header - Unified with Profile Avatar */}
        <View className="px-8 py-8 flex-row justify-between items-center">
            <View className="flex-1">
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">
                    Knowledge <Text style={{ color: ORANGE }}>Vault</Text>
                </Text>
                <Text className="text-textSecondary dark:text-darkTextSecondary text-[10px] font-poppins-bold uppercase tracking-[4px] mt-1 opacity-50">
                    AI Learning Center
                </Text>
            </View>

            <BingwaAvatar size={56} borderWidth={2} borderColor={ORANGE} />
        </View>

        <View className="items-center px-6">
          <View style={{ width: contentWidth }}>
            
            {/* AI Assistant Direct Access */}
            <TouchableOpacity 
              onPress={() => router.push('/ai-assistant')}
              activeOpacity={0.9}
              className="mb-10"
            >
              <MotiView 
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="overflow-hidden rounded-[40px] border border-orange-100 dark:border-white/5 shadow-2xl shadow-orange-900/5"
              >
                <LinearGradient
                  colors={[ORANGE, '#E76F51']}
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 0 }}
                  className="p-8 flex-row items-center"
                >
                  <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mr-6 border border-white/20">
                    <Ionicons name="chatbubbles" size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-poppins-black text-xl mb-1">Consult Bingwa AI</Text>
                    <Text className="text-white/70 font-poppins-regular text-xs leading-relaxed">Ask anything about your crops, treatments, or organic prevention.</Text>
                  </View>
                </LinearGradient>
              </MotiView>
            </TouchableOpacity>

            {/* Recent Diagnoses Section */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-6 px-2">
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Recent Diagnoses</Text>
                <View className="bg-orange-50 dark:bg-orange-950/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/20">
                   <Text style={{ color: ORANGE }} className="text-[10px] font-poppins-bold uppercase tracking-widest">{scans.length} Total</Text>
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

            {/* Privacy Disclaimer (to match Permission screen feel) */}
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
