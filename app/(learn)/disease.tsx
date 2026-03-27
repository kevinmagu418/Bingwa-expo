import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { BingwaLoader } from '../../components/Loader';

const SEVERITY_COLORS = {
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600', border: 'border-green-200' },
  medium: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600', border: 'border-orange-200' },
  high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600', border: 'border-red-200' },
};

export default function DiseaseInfoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'treatment' | 'prevention'>('treatment');
  const { width } = useWindowDimensions();

  const [disease, setDisease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisease = async () => {
      try {
        if (!id) return;

        const { data, error } = await supabase
          .from('diseases')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setDisease(data);
      } catch (err) {
        console.error("Error fetching disease:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisease();
  }, [id]);

  if (loading) return <BingwaLoader label="Consulting Library..." />;

  if (!disease) {
      return (
          <View className="flex-1 items-center justify-center bg-[#F8F9FA] dark:bg-darkBackground">
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold">Information not found.</Text>
              <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-2 bg-accent rounded-full">
                  <Text className="text-white">Go Back</Text>
              </TouchableOpacity>
          </View>
      );
  }

  const severityStyle = SEVERITY_COLORS[disease.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.low;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Header Image */}
        <View className="h-80 w-full relative">
          {disease.image_url ? (
            <Image 
              source={{ uri: disease.image_url }} 
              className="w-full h-full" 
              resizeMode="cover" 
            />
          ) : (
            <View className="w-full h-full bg-accent/10 items-center justify-center">
                <Ionicons name="leaf-outline" size={80} color="#25D366" opacity={0.2} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            className="absolute inset-0 justify-end p-6"
          >
            <View className="flex-row items-end justify-between">
               <MotiView 
                 from={{ opacity: 0, translateX: -20 }}
                 animate={{ opacity: 1, translateX: 0 }}
                 className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20"
               >
                 <Text className="text-white font-poppins-black text-xs uppercase tracking-widest">{disease.crop}</Text>
               </MotiView>

               <MotiView
                 from={{ opacity: 0, translateX: 20 }}
                 animate={{ opacity: 1, translateX: 0 }}
                 className={`px-4 py-2 rounded-2xl border ${severityStyle.bg} ${severityStyle.border} backdrop-blur-md`}
               >
                 <Text className={`font-poppins-bold text-[10px] uppercase tracking-wider ${severityStyle.text}`}>{disease.severity} Risk</Text>
               </MotiView>
            </View>
          </LinearGradient>
          
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl items-center justify-center border border-white/10"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Info Body */}
        <View className="flex-1 -mt-10 bg-[#F8F9FA] dark:bg-darkBackground rounded-t-[40px] px-6 pt-10 pb-24 shadow-2xl">
            
            {/* Title */}
            <View className="mb-8">
                <Text className="text-accent font-poppins-black text-xs uppercase tracking-[4px] mb-2">Plant Pathology</Text>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-4xl leading-tight">{disease.name}</Text>
                <View className="h-1.5 w-16 bg-accent rounded-full mt-4" />
            </View>

            <View className="bg-white dark:bg-darkSurface p-6 rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm mb-8">
                <View className="flex-row items-center mb-4">
                    <View className="bg-accent/10 p-2 rounded-xl mr-3">
                        <Ionicons name="information-circle" size={20} color="#25D366" />
                    </View>
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-base">Description</Text>
                </View>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm leading-relaxed opacity-80">
                    {disease.summary || "No summary available for this condition."}
                </Text>
            </View>

            {/* Content Tabs */}
            <View className="flex-row bg-gray-200/50 dark:bg-darkSurface/50 rounded-[20px] p-1.5 mb-6">
                {(['treatment', 'prevention'] as const).map((tab) => (
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
                    <View className="bg-white dark:bg-darkSurface p-6 rounded-[32px] border border-black/5 dark:border-white/5 shadow-lg">
                        <View className="flex-row justify-between items-center mb-6">
                            <View className="bg-accent/10 dark:bg-accent/20 px-4 py-1.5 rounded-full">
                                <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-wider">Expert Guide</Text>
                            </View>
                            <View className="bg-accent p-2.5 rounded-2xl">
                                <Ionicons 
                                    name={activeTab === 'prevention' ? "shield-checkmark" : "medical"} 
                                    size={20} 
                                    color="white" 
                                />
                            </View>
                        </View>
                        
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-regular text-base leading-relaxed mb-6">
                            {activeTab === 'treatment' ? disease.description : (disease.prevention_tips || "Practice crop rotation and maintain field hygiene to prevent outbreaks.")}
                        </Text>

                        <View className="flex-row items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                            <Ionicons name="alert-circle-outline" size={18} color="#8696A0" />
                            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[11px] ml-2 flex-1">
                                Recommendations are based on general agricultural practices.
                            </Text>
                        </View>
                    </View>
                </MotiView>
            </AnimatePresence>

            <TouchableOpacity 
                onPress={() => router.push('/(tabs)/scan')}
                className="mt-10 h-16 rounded-[24px] overflow-hidden shadow-2xl shadow-accent/40 active:scale-[0.98]"
            >
                <LinearGradient
                    colors={['#25D366', '#128C7E']}
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 0 }}
                    className="flex-1 items-center justify-center flex-row"
                >
                    <Ionicons name="camera" size={24} color="white" className="mr-2" />
                    <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">
                        Scan your crop
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
