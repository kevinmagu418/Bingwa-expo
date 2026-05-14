import React, { useState, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, RefreshControl, Pressable, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useScans, Scan } from '../../hooks/useScans';
import { useProfile } from '../../hooks/useProfile';
import { useWeeklySpotlight, WeeklySpotlight } from '../../hooks/useWeeklySpotlight';
import { useTheme } from '../../context/ThemeContext';
import { BingwaAvatar } from '../../components/BingwaAvatar';
import { BingwaLoader } from '../../components/Loader';
import { BingwaAICard } from '../../components/BingwaAICard';

const ORANGE = "#F4A261";
const SAGE = "#2D6A4F";

const FUN_FACTS = [
  { id: '1', icon: 'sunny', title: 'Solar Power', text: 'Plants use only 1% of the sunlight they receive for photosynthesis.', color: '#FFB703' },
  { id: '2', icon: 'water', title: 'Water Usage', text: 'Drip irrigation can save up to 80% more water than traditional methods.', color: '#219EBC' },
  { id: '3', icon: 'bug', title: 'Ladybugs', text: 'Ladybugs can eat up to 5,000 aphids during their lifetime.', color: '#E63946' },
];

const InsightCard = memo(({ item, index }: { item: any, index: number }) => (
    <Pressable className="mr-4 w-56 active:scale-[0.98]">
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 100 + (index * 50), type: 'timing' }}
            className="bg-white dark:bg-darkSurface rounded-3xl p-5 border-2 shadow-sm"
            style={{ borderColor: `${item.color}40` }}
        >
            <View className="w-10 h-10 rounded-xl items-center justify-center mb-4" style={{ backgroundColor: `${item.color}15` }}>
                <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-sm mb-1">{item.title}</Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px] leading-4 opacity-60">
                {item.text}
            </Text>
        </MotiView>
    </Pressable>
));

const WeeklySpotlightCard = memo(({ spotlight }: { spotlight: WeeklySpotlight }) => (
    <MotiView 
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="bg-[#1B4332] rounded-[40px] overflow-hidden shadow-2xl shadow-green-900/20"
    >
        <Image source={{ uri: spotlight.image_url }} className="w-full h-48 opacity-70" resizeMode="cover" />
        <LinearGradient 
            colors={['transparent', 'rgba(27, 67, 50, 0.95)', '#1B4332']} 
            className="absolute inset-0 p-6 justify-end"
        >
            <View className="bg-[#74C69D]/20 self-start px-3 py-1 rounded-full border border-[#74C69D]/30 mb-2">
                <Text className="text-[#74C69D] font-poppins-black text-[8px] uppercase tracking-widest">{spotlight.category}</Text>
            </View>
            <Text className="text-white font-poppins-black text-2xl leading-tight mb-2">{spotlight.title}</Text>
            <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-[#74C69D] items-center justify-center mr-2">
                    <Ionicons name="person" size={12} color="white" />
                </View>
                <Text className="text-white/60 font-poppins-bold text-[10px]">{spotlight.author_name} • {spotlight.author_role}</Text>
            </View>
        </LinearGradient>
        
        <View className="p-6 bg-white dark:bg-darkSurface mx-4 -mt-4 mb-4 rounded-[32px] shadow-lg">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-regular text-xs leading-5 mb-4 opacity-80">
                {spotlight.description}
            </Text>
            <View className="space-y-3">
                {spotlight.tips.map((tip, i) => (
                    <View key={i} className="flex-row items-start">
                        <View className="w-5 h-5 rounded-full bg-[#EAF4F0] items-center justify-center mr-3 mt-0.5">
                            <Ionicons name="checkmark" size={12} color="#1B4332" />
                        </View>
                        <Text className="flex-1 text-textSecondary dark:text-darkTextSecondary font-poppins-medium text-[11px] leading-4">{tip}</Text>
                    </View>
                ))}
            </View>
        </View>
    </MotiView>
));

const ScanHistoryCard = memo(({ scan, onPress }: { scan: Scan, onPress: (scan: Scan) => void }) => (
  <Pressable onPress={() => onPress(scan)} className="mb-3 active:scale-[0.98]">
    <View className="bg-white dark:bg-darkSurface p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm flex-row items-center">
      <Image source={{ uri: scan.image_url }} className="w-14 h-14 rounded-2xl" resizeMode="cover" />
      <View className="flex-1 px-4">
        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">{scan.diseases?.crop}</Text>
        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px] opacity-60">{scan.diseases?.name}</Text>
      </View>
      <View className={`px-2.5 py-1 rounded-full ${scan.severity === 'high' ? 'bg-red-500/10' : scan.severity === 'medium' ? 'bg-orange-500/10' : 'bg-green-500/10'}`}>
        <Text className={`font-poppins-black text-[8px] uppercase ${scan.severity === 'high' ? 'text-red-500' : scan.severity === 'medium' ? 'text-orange-500' : 'text-green-500'}`}>
            {scan.severity || 'Healthy'}
        </Text>
      </View>
    </View>
  </Pressable>
));

export default function LearnTab() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { scans, loading: scansLoading, refreshScans } = useScans(20);
  const { spotlight, loading: spotlightLoading, refreshSpotlight } = useWeeklySpotlight();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
        refreshSpotlight();
    }, [refreshSpotlight])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshScans(), refreshSpotlight()]);
    setRefreshing(false);
  }, [refreshScans, refreshSpotlight]);

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

  if (scansLoading || spotlightLoading) return <BingwaLoader label="Accessing Knowledge Vault..." />;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-darkBackground" edges={['top']} pointerEvents="box-none">
      <ScrollView className="flex-1 px-6 pt-4" pointerEvents="auto" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center py-4 mb-6">
            <View>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[10px] uppercase tracking-[3px] opacity-40">Knowledge Hub</Text>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">Bingwa Brain</Text>
            </View>
            <BingwaAvatar size={48} borderWidth={2} borderColor={ORANGE} />
        </View>

        <BingwaAICard />

        {/* Quick Insights */}
        <View className="mb-10">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg mb-4 px-1">Quick Insights</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                {FUN_FACTS.map((item, index) => <InsightCard key={item.id} item={item} index={index} />)}
            </ScrollView>
        </View>

        {/* Weekly Spotlight */}
        <View className="mb-10">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg mb-4 px-1">Community Wisdom</Text>
            {spotlight && <WeeklySpotlightCard spotlight={spotlight} />}
        </View>

        {/* Vault History */}
        <View className="mb-20">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg mb-4 px-1">Vault History</Text>
            {scans.slice(0, 5).map((scan) => <ScanHistoryCard key={scan.id} scan={scan} onPress={handleScanPress} />)}
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')} className="mt-2 py-4 items-center">
                <Text className="text-accent font-poppins-bold text-xs uppercase tracking-widest">See All Records</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
