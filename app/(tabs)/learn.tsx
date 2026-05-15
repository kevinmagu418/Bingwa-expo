import React, { useState, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, useWindowDimensions, RefreshControl, Pressable, Linking } from 'react-native';
import { Image } from 'expo-image';
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
import { InteractiveVault } from '../../components/InteractiveVault';

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
            className="bg-white dark:bg-darkSurface rounded-[32px] p-6 shadow-xl border border-black/5 dark:border-white/5"
        >
            <View className="w-12 h-12 rounded-2xl items-center justify-center mb-5" style={{ backgroundColor: `${item.color}15` }}>
                <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-sm mb-2">{item.title}</Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[11px] leading-5 opacity-70">
                {item.text}
            </Text>
        </MotiView>
    </Pressable>
));

const COMMUNITY_WISDOM = [
    {
        id: '1',
        title: 'Natural Pest Management',
        description: 'Discover how using neem oil and companion planting can naturally keep aphids away from your cabbage crops without chemical intervention.',
        category: 'Organic Farming',
        image_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600&auto=format&fit=crop',
        tips: ['Use neem oil every 2 weeks', 'Interplant with marigolds', 'Attract ladybugs'],
        points: 150,
        color: '#4ADE80',
        icon: 'leaf'
    },
    {
        id: '2',
        title: 'Optimal Soil Health',
        description: 'Understand the power of composting and crop rotation to maintain soil pH levels, ensuring your maize yield remains consistently high each harvest.',
        category: 'Soil Science',
        image_url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=600&auto=format&fit=crop',
        tips: ['Rotate crops annually', 'Test soil pH levels', 'Add compost before planting'],
        points: 200,
        color: '#FACC15',
        icon: 'earth'
    },
    {
        id: '3',
        title: 'Water-Wise Irrigation',
        description: 'Learn simple techniques to optimize your water usage during dry spells, focusing on root-depth irrigation rather than broad surface watering.',
        category: 'Water Management',
        image_url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=600&auto=format&fit=crop',
        tips: ['Water early in the morning', 'Use drip pipes', 'Mulch around the base'],
        points: 175,
        color: '#38BDF8',
        icon: 'water'
    }
];

const CommunityWisdomCard = memo(({ entry, index, onMaster }: { entry: typeof COMMUNITY_WISDOM[0], index: number, onMaster: (entry: typeof COMMUNITY_WISDOM[0]) => void }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <MotiView 
            from={{ opacity: 0, translateY: 50, scale: 0.9 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ delay: 300 + (index * 150), type: 'spring', damping: 15 }}
            className="mb-8"
        >
            <Pressable 
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                className="active:scale-[0.97]"
            >
                <MotiView
                    animate={{ 
                        scale: isPressed ? 0.98 : 1,
                        shadowOpacity: isPressed ? 0.1 : 0.2
                    }}
                    className="bg-white dark:bg-darkSurface rounded-[40px] overflow-hidden shadow-2xl border border-black/5 dark:border-white/5"
                >
                    {/* Visual Header with Gradient Overlay */}
                    <View className="h-56 w-full relative">
                        <Image source={{ uri: entry.image_url }} className="w-full h-full" contentFit="cover" />
                        <LinearGradient 
                            colors={['transparent', 'rgba(0,0,0,0.7)']} 
                            className="absolute inset-0"
                        />
                        
                        {/* Gamified Floating Badge */}
                        <MotiView 
                            from={{ scale: 0, rotate: '-20deg' }}
                            animate={{ scale: 1, rotate: '0deg' }}
                            transition={{ delay: 600 + (index * 150), type: 'spring' }}
                            className="absolute top-6 right-6 bg-white/90 dark:bg-darkSurface/90 backdrop-blur-md px-4 py-2 rounded-2xl flex-row items-center shadow-lg border border-white/20"
                        >
                            <Ionicons name="sparkles" size={14} color="#F59E0B" />
                            <Text className="ml-2 text-textPrimary dark:text-darkTextPrimary font-poppins-black text-[10px] tracking-wider">+{entry.points} XP</Text>
                        </MotiView>

                        {/* Category Tag */}
                        <View className="absolute bottom-6 left-8 px-4 py-1.5 rounded-xl bg-accent/90 backdrop-blur-md">
                            <Text className="text-white font-poppins-bold text-[9px] uppercase tracking-[2px]">{entry.category}</Text>
                        </View>
                    </View>

                    {/* Content Section */}
                    <View className="p-7">
                        <View className="flex-row items-start justify-between mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl leading-tight tracking-tight">
                                    {entry.title}
                                </Text>
                            </View>
                            <View className="w-12 h-12 rounded-2xl items-center justify-center shadow-inner" style={{ backgroundColor: `${entry.color}20` }}>
                                <Ionicons name={entry.icon as any} size={24} color={entry.color} />
                            </View>
                        </View>
                        
                        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-medium text-xs leading-5 mb-6 opacity-80">
                            {entry.description}
                        </Text>
                        
                        {/* Interactive Tips Progress */}
                        <View className="bg-slate-50 dark:bg-black/20 p-5 rounded-[32px] border border-black/5 dark:border-white/5">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-[10px] uppercase tracking-[1px] opacity-40">Growth Path</Text>
                                <View className="flex-row">
                                    {[1, 2, 3].map((s) => (
                                        <View key={s} className="w-1.5 h-1.5 rounded-full bg-accent/20 mx-0.5" />
                                    ))}
                                </View>
                            </View>
                            
                            {entry.tips.map((tip, i) => (
                                <View key={i} className="flex-row items-center mb-3 last:mb-0">
                                    <View 
                                        className="w-7 h-7 rounded-xl items-center justify-center mr-4"
                                        style={{ backgroundColor: entry.color }}
                                    >
                                        <Ionicons name="checkmark-circle" size={16} color="white" />
                                    </View>
                                    <Text className="flex-1 text-textPrimary dark:text-darkTextPrimary font-poppins-semibold text-[11px] leading-4">
                                        {tip}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Footer Action */}
                        <TouchableOpacity 
                            onPress={() => onMaster(entry)}
                            className="mt-6 py-4 flex-row items-center justify-center bg-white dark:bg-darkSurface border border-black/5 dark:border-white/5 rounded-2xl shadow-sm"
                        >
                            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-[10px] uppercase tracking-[2px] mr-2">Master This Insight</Text>
                            <Ionicons name="arrow-forward" size={14} color={entry.color} />
                        </TouchableOpacity>
                    </View>
                </MotiView>
            </Pressable>
        </MotiView>
    );
});

export default function LearnTab() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { scans, loading: scansLoading, refreshScans } = useScans(20);
  const { spotlight, loading: spotlightLoading, refreshSpotlight } = useWeeklySpotlight();
  const [refreshing, setRefreshing] = useState(false);

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

  const handleMasterInsight = (entry: typeof COMMUNITY_WISDOM[0]) => {
    const contextPrompt = `I'm interested in learning more about "${entry.title}" (${entry.category}). \n\nContext: ${entry.description}\n\nKey Tips discussed:\n${entry.tips.map(t => `- ${t}`).join('\n')}\n\nCan you explain how I can implement these in my farm?`;
    
    router.push({
      pathname: '/ai-assistant',
      params: { 
        initialMessage: contextPrompt,
        title: entry.title,
        category: entry.category
      }
    });
  };

  if (scansLoading) return <BingwaLoader label="Accessing Knowledge Vault..." />;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-darkBackground" edges={['top']} pointerEvents="box-none">
      <ScrollView className="flex-1 px-6 pt-4" pointerEvents="auto" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />}>
        
        <View className="flex-row justify-between items-center py-4 mb-6">
            <View>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[10px] uppercase tracking-[3px] opacity-40">Knowledge Hub</Text>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">Bingwa Brain</Text>
            </View>
            <BingwaAvatar size={48} borderWidth={2} borderColor={ORANGE} />
        </View>

        <BingwaAICard />

        <View className="mb-10">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg mb-4 px-1">Quick Insights</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                {FUN_FACTS.map((item, index) => <InsightCard key={item.id} item={item} index={index} />)}
            </ScrollView>
        </View>

        <View className="mb-10">
            <View className="flex-row items-center justify-between mb-4 px-1">
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg">Community Wisdom</Text>
                <View className="flex-row items-center bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                    <Ionicons name="medal" size={12} color="#D97706" />
                    <Text className="ml-1.5 text-amber-700 dark:text-amber-400 font-poppins-bold text-[9px] uppercase">Level 12</Text>
                </View>
            </View>
            {COMMUNITY_WISDOM.map((entry, index) => (
                <CommunityWisdomCard 
                    key={entry.id} 
                    entry={entry} 
                    index={index} 
                    onMaster={handleMasterInsight}
                />
            ))}
        </View>

        <View className="mb-20">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg mb-4 px-1">Interactive Vault</Text>
            <InteractiveVault scans={scans} onSelect={handleScanPress} />
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')} className="mt-2 py-4 items-center">
                <Text className="text-accent font-poppins-bold text-xs uppercase tracking-widest">View Full Archive</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

