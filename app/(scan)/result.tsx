import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

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

import { BingwaLoader } from '../../components/Loader';
import { supabase } from '../../lib/supabase';

export default function ResultScreen() {
  const router = useRouter();
  const { scanId, imageUri } = useLocalSearchParams();
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
  const recommendations = scanResult.recommendations?.[0] || {};

  const severityStyle = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Header Image */}
        <View className="h-72 w-full relative">
          <Image 
            source={{ uri: imageUri as string || scanResult.image_url }} 
            className="w-full h-full" 
            resizeMode="cover" 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            className="absolute inset-0 justify-end p-6"
          >
            <View className="flex-row items-end justify-between">
               <MotiView 
                 from={{ opacity: 0, translateY: 20 }}
                 animate={{ opacity: 1, translateY: 0 }}
                 className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20"
               >
                 <Text className="text-white font-poppins-bold text-xs uppercase tracking-widest mb-1">Confidence</Text>
                 <Text className="text-white font-poppins-black text-2xl">{confidence}%</Text>
               </MotiView>
            </View>
          </LinearGradient>
          
          <TouchableOpacity 
            onPress={handleDone}
            className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Diagnosis Body */}
        <View className="flex-1 -mt-8 bg-[#F8F9FA] dark:bg-darkBackground rounded-t-[32px] px-6 pt-8 pb-24">
            
            {/* Title & Severity */}
            <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1 mr-4">
                    <Text className="text-textSecondary dark:text-darkTextSecondary text-xs font-poppins-bold uppercase tracking-widest mb-1">Diagnosis</Text>
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl leading-tight">{disease}</Text>
                </View>
                <View className={`px-3 py-1.5 rounded-full border ${severityStyle.bg} ${severityStyle.border}`}>
                    <Text className={`font-poppins-bold text-[10px] uppercase ${severityStyle.text}`}>{severity} Severity</Text>
                </View>
            </View>

            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm leading-relaxed mb-8 opacity-80">
                {description}
            </Text>

            {/* Treatment Tabs */}
            <View className="flex-row bg-gray-200 dark:bg-darkSurface rounded-[20px] p-1 mb-6">
                {(['chemical', 'organic', 'prevention'] as const).map((tab) => (
                    <TouchableOpacity 
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className={`flex-1 py-3 rounded-[16px] items-center justify-center ${activeTab === tab ? 'bg-white dark:bg-white/10 shadow-sm' : ''}`}
                    >
                        <Text className={`font-poppins-bold text-[10px] uppercase tracking-wide ${activeTab === tab ? 'text-accent' : 'text-textSecondary opacity-50'}`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <AnimatePresence exitBeforeEnter>
                <MotiView
                    key={activeTab}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 300 }}
                >
                    <View className="bg-white dark:bg-darkSurface p-5 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm">
                        <View className="flex-row justify-between items-start mb-4">
                            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg capitalize">{activeTab} Advice</Text>
                            <View className="bg-accent/10 p-2 rounded-xl">
                                <Ionicons name={activeTab === 'chemical' ? "flask" : activeTab === 'organic' ? "leaf" : "shield-checkmark"} size={18} color="#25D366" />
                            </View>
                        </View>
                        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm leading-relaxed">
                            {activeTab === 'chemical' ? recommendations.chemical_advice : 
                             activeTab === 'organic' ? recommendations.organic_advice : 
                             recommendations.prevention}
                        </Text>
                    </View>
                </MotiView>
            </AnimatePresence>

            <TouchableOpacity 
                onPress={handleDone}
                className="mt-10 h-16 rounded-[24px] overflow-hidden shadow-xl shadow-accent/30 active:scale-[0.98]"
            >
                <LinearGradient
                    colors={['#25D366', '#128C7E']}
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 0 }}
                    className="flex-1 items-center justify-center flex-row"
                >
                    <Ionicons name="checkmark-done" size={20} color="white" className="mr-2" />
                    <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">
                        Done
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
