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

const SEVERITY_COLORS = {
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600', border: 'border-green-200' },
  medium: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600', border: 'border-orange-200' },
  high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600', border: 'border-red-200' },
};

export default function DiseaseInfoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { profile, refreshProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<'treatment' | 'prevention'>('treatment');
  const { width } = useWindowDimensions();

  const [disease, setDisease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Refresh profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

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

          <MotiView 
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="absolute top-6 left-6 right-6 flex-row justify-between items-center z-10"
          >
            <TouchableOpacity 
                onPress={() => router.back()}
                className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl items-center justify-center border border-white/10 shadow-lg"
            >
                <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <BingwaAvatar size={48} borderWidth={2} borderColor="rgba(255,255,255,0.3)" />
          </MotiView>
        </View>

        <View className="px-8 pt-8 pb-32">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl mb-2">{disease.name}</Text>
            <View className="h-1 bg-accent w-12 rounded-full mb-8" />

            <View className="mb-8">
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm leading-relaxed">
                    {disease.description}
                </Text>
            </View>

            <View className="flex-row mb-8 bg-gray-100 dark:bg-darkSurface p-1.5 rounded-[24px]">
                <TouchableOpacity 
                    onPress={() => setActiveTab('treatment')}
                    className={`flex-1 py-4 rounded-[20px] items-center ${activeTab === 'treatment' ? 'bg-white dark:bg-accent shadow-sm' : ''}`}
                >
                    <Text className={`font-poppins-bold text-xs uppercase tracking-widest ${activeTab === 'treatment' ? 'text-accent dark:text-white' : 'text-textSecondary'}`}>Treatment</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setActiveTab('prevention')}
                    className={`flex-1 py-4 rounded-[20px] items-center ${activeTab === 'prevention' ? 'bg-white dark:bg-accent shadow-sm' : ''}`}
                >
                    <Text className={`font-poppins-bold text-xs uppercase tracking-widest ${activeTab === 'prevention' ? 'text-accent dark:text-white' : 'text-textSecondary'}`}>Prevention</Text>
                </TouchableOpacity>
            </View>

            <AnimatePresence exitBeforeEnter>
                <MotiView
                    key={activeTab}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 300 }}
                >
                    {activeTab === 'treatment' ? (
                        <View>
                            <View className="mb-6">
                                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg mb-4">Organic Remedies</Text>
                                {disease.organic_remedies?.map((item: string, index: number) => (
                                    <View key={index} className="flex-row mb-3 items-start">
                                        <View className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg mr-3 mt-0.5">
                                            <Ionicons name="leaf" size={14} color="#25D366" />
                                        </View>
                                        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm flex-1">{item}</Text>
                                    </View>
                                ))}
                            </View>

                            <View className="mb-6">
                                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg mb-4">Chemical Options</Text>
                                {disease.chemical_remedies?.map((item: string, index: number) => (
                                    <View key={index} className="flex-row mb-3 items-start">
                                        <View className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg mr-3 mt-0.5">
                                            <Ionicons name="flask" size={14} color="#3A86FF" />
                                        </View>
                                        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm flex-1">{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View className="mb-6">
                            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg mb-4">Expert Tips</Text>
                            {disease.prevention_tips?.map((item: string, index: number) => (
                                <View key={index} className="flex-row mb-3 items-start">
                                    <View className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg mr-3 mt-0.5">
                                        <Ionicons name="shield-checkmark" size={14} color="#8B5CF6" />
                                    </View>
                                    <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm flex-1">{item}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View className="mt-4 p-6 bg-accent/5 rounded-[32px] border border-accent/10">
                        <View className="flex-row items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                            <Ionicons name="alert-circle-outline" size={18} color="#8696A0" />
                            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[11px] ml-2 flex-1">
                                Recommendations are based on general agricultural practices.
                            </Text>
                        </View>
                    </View>
                </MotiView>
            </AnimatePresence>

            {/* AI Consultation Card */}
            <MotiView 
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 500 }}
                className="mt-8 mb-2"
            >
                <TouchableOpacity 
                    onPress={() => router.push({
                        pathname: '/ai-assistant',
                        params: { 
                            currentDiseaseId: disease.id,
                            imageUri: disease.image_url,
                            crop: disease.crop,
                            disease: disease.name,
                            severity: disease.severity || 'low',
                            initialMessage: `I see you're learning about ${disease.name} in ${disease.crop}. How can I help you manage or prevent this condition?`
                        }
                    })}
                    activeOpacity={0.9}
                    className="overflow-hidden rounded-[40px] border border-white/10 shadow-2xl shadow-accent/20"
                >
                    <LinearGradient
                        colors={['#0B141A', '#121B22']}
                        className="p-8 flex-row items-center"
                    >
                        <View className="w-16 h-16 rounded-[24px] bg-accent items-center justify-center mr-5 shadow-xl shadow-accent/30">
                            <Ionicons name="sparkles" size={32} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-poppins-black text-xl mb-1">Deep Analysis</Text>
                            <Text className="text-white/50 font-poppins-regular text-xs leading-relaxed">Chat with Bingwa AI for personalized treatment steps & farm advice.</Text>
                        </View>
                        <View className="bg-accent/10 p-3 rounded-full border border-accent/20 ml-2">
                            <Ionicons name="chatbubbles" size={20} color="#25D366" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </MotiView>

            <TouchableOpacity 
                onPress={() => router.push('/(tabs)/scan')}
                activeOpacity={0.8}
                className="mt-6 h-20 rounded-[32px] overflow-hidden shadow-2xl shadow-accent/20"
            >
                <LinearGradient
                    colors={['#25D366', '#128C7E']}
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 0 }}
                    className="flex-1 items-center justify-center"
                >
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
