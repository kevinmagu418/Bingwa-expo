import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { BingwaLoader } from '../../components/Loader';
import { FloatingAssistant } from '../../components/FloatingAssistant';

// Mock Result Data
const MOCK_RESULT = {
  disease: "Early Blight",
  confidence: 94,
  severity: "medium", // low, medium, high
  description: "A fungal disease caused by Alternaria solani. It causes target-shaped spots on leaves.",
  remedies: {
    chemical: [
      { id: 1, name: "Mancozeb 80% WP", dose: "2.5g per liter" },
      { id: 2, name: "Chlorothalonil", dose: "2g per liter" },
    ],
    organic: [
      { id: 1, name: "Neem Oil Extract", dose: "5ml per liter" },
      { id: 2, name: "Copper Fungicide", dose: "As per label" },
    ],
    prevention: [
      "Practice crop rotation",
      "Ensure proper spacing",
      "Water at the base of plants"
    ]
  }
};

const SEVERITY_COLORS = {
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600', border: 'border-green-200' },
  medium: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600', border: 'border-orange-200' },
  high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600', border: 'border-red-200' },
};

import { useProfile } from '../../hooks/useProfile';

export default function ResultScreen() {
  const router = useRouter();
  const { scanId, imageUri } = useLocalSearchParams();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'chemical' | 'organic' | 'prevention'>('chemical');
  const { width } = useWindowDimensions();

  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <BingwaLoader label="Finalizing Diagnosis..." />;

  if (!scanResult) {
      return (
          <View className="flex-1 items-center justify-center bg-[#F8F9FA] dark:bg-darkBackground">
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold">No results found.</Text>
              <TouchableOpacity onPress={handleDone} className="mt-4 px-6 py-2 bg-accent rounded-full">
                  <Text className="text-white">Go Back</Text>
              </TouchableOpacity>
          </View>
      );
  }

  const disease = scanResult.diseases?.name || "Unknown Condition";
  const confidence = Math.round(scanResult.confidence_score * 100);
  const severity = scanResult.severity || "low";
  const description = scanResult.diseases?.description || "No description available.";
  
  // Extract recommendations from the related table (one-to-many join returns an array)
  const recommendations = scanResult.recommendations?.[0] || {};
  
  const getTabContent = () => {
    switch (activeTab) {
      case 'chemical':
        return recommendations.chemical_advice || "No chemical remedies recommended.";
      case 'organic':
        return recommendations.organic_advice || "No organic remedies recommended.";
      case 'prevention':
        return recommendations.prevention || "No prevention tips available.";
      default:
        return "No advice available.";
    }
  };

  const severityStyle = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Header Image */}
        <View className="h-80 w-full relative">
          <Image 
            source={{ uri: imageUri as string || scanResult.image_url }} 
            className="w-full h-full" 
            resizeMode="cover" 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            className="absolute inset-0 justify-end p-6"
          >
            <View className="flex-row items-end justify-between">
               <MotiView 
                 from={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white/20 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/20"
               >
                 <Text className="text-white/70 font-poppins-bold text-[10px] uppercase tracking-widest mb-1">AI Confidence</Text>
                 <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={18} color="#25D366" className="mr-2" />
                    <Text className="text-white font-poppins-black text-2xl">{confidence}%</Text>
                 </View>
               </MotiView>

               <MotiView
                 from={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 100 }}
                 className={`px-4 py-2 rounded-2xl border ${severityStyle.bg} ${severityStyle.border} backdrop-blur-md`}
               >
                 <Text className={`font-poppins-bold text-[10px] uppercase tracking-wider ${severityStyle.text}`}>{severity} Severity</Text>
               </MotiView>
            </View>
          </LinearGradient>
          
          <TouchableOpacity 
            onPress={handleDone}
            className="absolute top-4 right-4 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl items-center justify-center border border-white/10"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Diagnosis Body */}
        <View className="flex-1 -mt-10 bg-[#F8F9FA] dark:bg-darkBackground rounded-t-[40px] px-6 pt-10 pb-24 shadow-2xl">
            
            {/* Title */}
            <View className="mb-8">
                <Text className="text-accent font-poppins-black text-xs uppercase tracking-[4px] mb-2">Diagnosis Result</Text>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-4xl leading-tight">{disease}</Text>
                <View className="h-1.5 w-16 bg-accent rounded-full mt-4" />
            </View>

            {/* Profile Completion Nudge */}
            {(!profile?.avatar_url || profile?.full_name === 'Bingwa Farmer') && (
                <MotiView 
                    from={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 bg-white dark:bg-darkSurface p-4 rounded-[20px] border border-accent/20 shadow-sm flex-row items-center justify-between"
                >
                    <View className="flex-1 mr-4">
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-xs mb-1">
                            Help us personalize your experience!
                        </Text>
                        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px] opacity-70">
                            Add your photo and details for better recommendations.
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => router.push('/(onboarding)/complete-profile')}
                        className="bg-accent/10 px-4 py-2 rounded-full"
                    >
                        <Text className="text-accent font-poppins-bold text-[10px] uppercase">Complete Profile</Text>
                    </TouchableOpacity>
                </MotiView>
            )}

            <View className="bg-white dark:bg-darkSurface p-5 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm mb-8">
                <View className="flex-row items-center mb-3">
                    <Ionicons name="information-circle" size={20} color="#8696A0" className="mr-2" />
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">About this condition</Text>
                </View>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm leading-relaxed opacity-80">
                    {description}
                </Text>
            </View>

            {/* Treatment Tabs */}
            <View className="flex-row bg-gray-200/50 dark:bg-darkSurface/50 rounded-[20px] p-1.5 mb-6">
                {(['organic', 'chemical', 'prevention'] as const).map((tab) => (
                    <TouchableOpacity 
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className={`flex-1 py-3.5 rounded-[16px] items-center justify-center ${activeTab === tab ? 'bg-white dark:bg-accent shadow-md' : ''}`}
                    >
                        <Text className={`font-poppins-bold text-[10px] uppercase tracking-wide ${activeTab === tab ? 'text-accent dark:text-white' : 'text-textSecondary opacity-50'}`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <AnimatePresence exitBeforeEnter>
                <MotiView
                    key={activeTab}
                    from={{ opacity: 0, translateY: 15 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400 }}
                >
                    <View className="bg-white dark:bg-darkSurface p-6 rounded-[32px] border border-black/5 dark:border-white/5 shadow-lg relative overflow-hidden">
                        {/* Decorative background icon */}
                        <View className="absolute -right-8 -bottom-8 opacity-[0.03] dark:opacity-[0.05]">
                             <Ionicons 
                                name={activeTab === 'prevention' ? "shield-checkmark" : "medical"} 
                                size={160} 
                                color={activeTab === 'organic' ? "#25D366" : "#25D366"} 
                             />
                        </View>

                        <View className="flex-row justify-between items-center mb-6">
                            <View className="bg-accent/10 dark:bg-accent/20 px-4 py-1.5 rounded-full">
                                <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-wider">{activeTab} Strategy</Text>
                            </View>
                            <View className="bg-accent p-2.5 rounded-2xl shadow-lg shadow-accent/40">
                                <Ionicons 
                                    name={activeTab === 'prevention' ? "shield-checkmark" : activeTab === 'organic' ? "leaf" : "flask"} 
                                    size={20} 
                                    color="white" 
                                />
                            </View>
                        </View>
                        
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-regular text-base leading-relaxed mb-4">
                            {getTabContent()}
                        </Text>

                        <View className="flex-row items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                            <Ionicons name="alert-circle-outline" size={18} color="#8696A0" />
                            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[11px] ml-2 flex-1">
                                Always consult with a local agricultural expert before applying intensive treatments.
                            </Text>
                        </View>
                    </View>
                </MotiView>
            </AnimatePresence>

            <TouchableOpacity 
                onPress={handleDone}
                className="mt-10 h-16 rounded-[24px] overflow-hidden shadow-2xl shadow-accent/40 active:scale-[0.98]"
            >
                <LinearGradient
                    colors={['#25D366', '#128C7E']}
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 0 }}
                    className="flex-1 items-center justify-center flex-row"
                >
                    <Ionicons name="checkmark-done-circle" size={24} color="white" className="mr-2" />
                    <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">
                        Return to Dashboard
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

        </View>
      </ScrollView>
      <FloatingAssistant 
        currentDiseaseId={scanResult.diseases?.id}
        initialMessage={`I see we've detected ${disease}. I've analyzed the results—would you like me to explain the treatment steps or suggest some organic alternatives?`}
      />
    </SafeAreaView>
  );
}
