import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { BingwaLoader } from '../../components/Loader';
import { useProfile } from '../../hooks/useProfile';
import { BingwaAvatar } from '../../components/BingwaAvatar';

const ORANGE = "#F4A261";
const GREEN = "#25D366";

const SEVERITY_THEME = {
  low: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500', icon: 'checkmark-circle' },
  medium: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400', icon: 'alert-circle' },
  high: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', icon: 'warning' },
};

export default function ResultScreen() {
  const router = useRouter();
  const { scanId, imageUri } = useLocalSearchParams();
  const { profile, refreshProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<'organic' | 'chemical' | 'prevention'>('organic');
  const { width } = useWindowDimensions();

  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Refresh profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!scanId) return;

        const { data, error } = await supabase
          .from('scans')
          .select(`
            *,
            diseases (*),
            recommendations (*)
          `)
          .eq('id', scanId)
          .single();

        if (error) throw error;
        setScanResult(data);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [scanId]);

  const handleDone = () => {
    router.replace('/(tabs)/scan');
  };

  if (loading) return <BingwaLoader label="Accessing Knowledge Vault..." />;

  if (!scanResult) {
      return (
          <View className="flex-1 items-center justify-center bg-[#FFF9F5] dark:bg-darkBackground">
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold">Diagnosis not found.</Text>
              <TouchableOpacity onPress={handleDone} className="mt-4 px-8 py-3 bg-orange-500 rounded-2xl">
                  <Text className="text-white font-poppins-bold">Go Back</Text>
              </TouchableOpacity>
          </View>
      );
  }

  const disease = scanResult.diseases?.name || "Unknown Condition";
  const confidence = Math.round(scanResult.confidence_score * 100);
  const severity = (scanResult.severity || "low") as keyof typeof SEVERITY_THEME;
  const description = scanResult.diseases?.description || "No description available.";
  const recommendations = scanResult.recommendations?.[0] || {};
  
  const getTabContent = () => {
    switch (activeTab) {
      case 'chemical': return recommendations.chemical_advice || "No chemical remedies recommended.";
      case 'organic': return recommendations.organic_advice || "No organic remedies recommended.";
      case 'prevention': return recommendations.prevention || "No prevention tips available.";
      default: return "";
    }
  };

  const theme = SEVERITY_THEME[severity];

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F5] dark:bg-darkBackground" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Modern Header Image */}
        <View className="h-[45vh] w-full relative">
          <Image 
            source={{ uri: imageUri as string || scanResult.image_url }} 
            className="w-full h-full" 
            resizeMode="cover" 
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
            className="absolute inset-0 justify-end p-8"
          >
            <MotiView 
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              className="flex-row items-end justify-between"
            >
               <View className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20">
                 <Text className="text-white/60 font-poppins-bold text-[9px] uppercase tracking-[2px] mb-1">AI Precision</Text>
                 <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={16} color={ORANGE} className="mr-2" />
                    <Text className="text-white font-poppins-black text-2xl">{confidence}%</Text>
                 </View>
               </View>

               <View className={`px-5 py-3 rounded-full border border-white/20 backdrop-blur-md ${theme.bg.replace('bg-', 'bg-')}`}>
                 <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full ${theme.dot} mr-2`} />
                    <Text className={`font-poppins-bold text-[10px] uppercase tracking-widest ${theme.text}`}>{severity} Risk</Text>
                 </View>
               </View>
            </MotiView>
          </LinearGradient>
          
          <MotiView 
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="absolute top-6 left-6 right-6 flex-row justify-between items-center z-10"
          >
            <TouchableOpacity 
                onPress={handleDone}
                className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl items-center justify-center border border-white/10 shadow-lg"
            >
                <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <BingwaAvatar size={48} borderWidth={2} borderColor="rgba(255,255,255,0.3)" />
          </MotiView>
        </View>

        {/* Vault Style Body */}
        <View className="flex-1 -mt-12 bg-[#FFF9F5] dark:bg-darkBackground rounded-t-[50px] px-8 pt-12 pb-32 shadow-2xl">
            
            {/* Title & Badge */}
            <View className="mb-10">
                <View className="flex-row items-center mb-3">
                    <View className="bg-orange-100 p-2 rounded-xl mr-3">
                        <Ionicons name="leaf" size={16} color={ORANGE} />
                    </View>
                    <Text className="text-orange-400 font-poppins-black text-[10px] uppercase tracking-[4px]">Diagnosis Secured</Text>
                </View>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-4xl leading-tight">{disease}</Text>
                <View className="h-1.5 w-20 bg-orange-400 rounded-full mt-6" />
            </View>

            {/* Condition Insights Card */}
            <MotiView 
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-darkSurface p-6 rounded-[40px] border border-orange-100 dark:border-white/5 shadow-sm mb-8"
            >
                <View className="flex-row items-center mb-4">
                    <Ionicons name="book-outline" size={20} color={ORANGE} className="mr-3" />
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">Condition Analysis</Text>
                </View>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm leading-relaxed opacity-70">
                    {description}
                </Text>
            </MotiView>

            {/* Strategy Hub */}
            <View className="mb-6">
                <View className="flex-row justify-between items-center mb-6 px-2">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Strategy Hub</Text>
                    <Ionicons name="shield-checkmark" size={20} color={ORANGE} />
                </View>
                
                <View className="flex-row bg-orange-50/50 dark:bg-darkSurface/50 rounded-[24px] p-1.5 mb-6 border border-orange-100/50">
                    {(['organic', 'chemical', 'prevention'] as const).map((tab) => (
                        <TouchableOpacity 
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`flex-1 py-4 rounded-[20px] items-center justify-center ${activeTab === tab ? 'bg-white dark:bg-accent shadow-lg shadow-orange-900/5' : ''}`}
                        >
                            <Text className={`font-poppins-bold text-[10px] uppercase tracking-wide ${activeTab === tab ? 'text-orange-500' : 'text-textSecondary opacity-40'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <AnimatePresence exitBeforeEnter>
                    <MotiView
                        key={activeTab}
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 300 }}
                        className="bg-white dark:bg-darkSurface p-8 rounded-[48px] border border-orange-100 dark:border-white/5 shadow-xl relative overflow-hidden"
                    >
                        <View className="flex-row justify-between items-center mb-8">
                            <View className="bg-orange-50 dark:bg-orange-900/10 px-5 py-2 rounded-full border border-orange-100">
                                <Text className="text-orange-500 font-poppins-bold text-[10px] uppercase tracking-widest">{activeTab} Plan</Text>
                            </View>
                            <View className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/40">
                                <Ionicons 
                                    name={activeTab === 'prevention' ? "shield-checkmark" : activeTab === 'organic' ? "leaf" : "flask"} 
                                    size={20} 
                                    color="white" 
                                />
                            </View>
                        </View>
                        
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-regular text-base leading-[26px] mb-8">
                            {getTabContent()}
                        </Text>

                        <View className="flex-row items-center bg-[#FFF9F5] dark:bg-white/5 p-5 rounded-3xl border border-orange-50">
                            <Ionicons name="information-circle" size={20} color={ORANGE} />
                            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-medium text-[11px] ml-3 flex-1 leading-tight">
                                This recommendation is synthesized by Bingwa AI for educational purposes.
                            </Text>
                        </View>
                    </MotiView>
                </AnimatePresence>
            </View>

            {/* Vault AI Banner */}
            <TouchableOpacity 
                onPress={() => router.push({
                    pathname: '/ai-assistant',
                    params: { 
                        currentDiseaseId: scanResult.diseases?.id,
                        imageUri: imageUri as string || scanResult.image_url,
                        crop: scanResult.diseases?.crop,
                        disease: disease,
                        severity: severity,
                        initialMessage: `I've analyzed your ${scanResult.diseases?.crop} scan and detected ${disease}. How can I help you manage this?`
                    }
                })}
                activeOpacity={0.9}
                className="mt-8 mb-6"
            >
                <MotiView 
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    className="overflow-hidden rounded-[40px] border border-orange-100 dark:border-white/10 shadow-2xl shadow-orange-900/5"
                >
                    <LinearGradient
                        colors={[ORANGE, '#E76F51']}
                        className="p-10 flex-row items-center"
                    >
                        <View className="w-16 h-16 rounded-[24px] bg-white/20 items-center justify-center mr-6 border border-white/20">
                            <Ionicons name="chatbubbles" size={32} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-poppins-black text-2xl mb-1">Deep Learning</Text>
                            <Text className="text-white/70 font-poppins-regular text-xs leading-relaxed">Consult Bingwa AI for personalized next steps and treatment guidance.</Text>
                        </View>
                    </LinearGradient>
                </MotiView>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={handleDone}
                className="mt-4 h-20 rounded-[32px] overflow-hidden shadow-2xl shadow-orange-900/10 active:scale-[0.98]"
            >
                <LinearGradient
                    colors={['#111B21', '#121B22']}
                    className="flex-1 items-center justify-center flex-row"
                >
                    <Ionicons name="checkmark-done" size={24} color={ORANGE} className="mr-3" />
                    <Text className="text-white font-poppins-black text-sm uppercase tracking-[4px]">
                        Save to Vault
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
