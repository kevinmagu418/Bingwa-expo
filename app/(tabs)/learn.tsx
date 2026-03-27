import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Platform, useWindowDimensions, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { CategoryChip, FeaturedGuideCard, DiseaseCard, QuickTipCard } from '../../components/LearnComponents';
import { useDiseases } from '../../hooks/useDiseases';
import { BingwaLoader } from '../../components/Loader';

// --- Mock Data ---
const CATEGORIES = ["All", "Maize", "Tomatoes", "Potatoes", "Beans", "Fruits"];

const QUICK_TIPS = [
  "Rotate crops every season to reduce soil disease buildup and improve nutrient balance.",
  "Always remove infected leaves immediately to prevent spreading to healthy plants.",
  "Water crops early in the morning to prevent fungal infections from nighttime moisture."
];

export default function LearnTab() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const contentWidth = isWeb ? Math.min(width - 40, 550) : width;

  const { diseases, featuredDiseases, loading, refreshDiseases } = useDiseases(activeCategory);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshDiseases();
    setRefreshing(false);
  }, []);

  const filteredDiseases = diseases.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return <BingwaLoader label="Consulting Plant Library..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#25D366" />
        }
      >
        
        {/* Header */}
        <View className="px-6 py-6 flex-row justify-between items-center">
          <View>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs uppercase tracking-widest">
              Education Hub
            </Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">
              Learn
            </Text>
          </View>
          <View className="bg-accent/10 p-3 rounded-2xl">
            <Ionicons name="leaf-outline" size={24} color="#25D366" />
          </View>
        </View>

        <View className="items-center px-6">
          <View style={{ width: contentWidth }}>
            
            {/* Search Bar */}
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-darkSurface h-14 rounded-[22px] px-5 flex-row items-center border border-black/5 dark:border-white/5 shadow-sm mb-6"
            >
              <Ionicons name="search" size={20} color="#8696A0" />
              <TextInput
                className="flex-1 ml-3 font-poppins-regular text-sm text-textPrimary dark:text-darkTextPrimary"
                placeholder="Search crops, diseases, treatments..."
                placeholderTextColor="#8696A0"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </MotiView>

            {/* Crop Categories */}
            <View className="mb-8">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                {CATEGORIES.map((cat) => (
                  <CategoryChip 
                    key={cat} 
                    label={cat} 
                    active={activeCategory === cat} 
                    onPress={() => setActiveCategory(cat)} 
                  />
                ))}
              </ScrollView>
            </View>

            {/* Featured Guides (Diseases marked as featured) */}
            {featuredDiseases.length > 0 && (
              <View className="mb-10">
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg">Featured Insights</Text>
                  <TouchableOpacity>
                    <Text className="text-accent font-poppins-bold text-xs uppercase tracking-wider">See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                  {featuredDiseases.map((item) => (
                    <FeaturedGuideCard key={item.id} item={{
                      ...item,
                      title: item.name,
                      description: item.summary,
                      image: item.image_url
                    }} />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Disease Library */}
            <View className="mb-10">
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg mb-5">Disease Library</Text>
              <View>
                {filteredDiseases.length > 0 ? (
                  filteredDiseases.map((item) => (
                    <DiseaseCard 
                      key={item.id} 
                      item={{
                        ...item,
                        image: item.image_url
                      }} 
                      onPress={() => router.push({
                        pathname: '/(learn)/disease',
                        params: { id: item.id }
                      })}
                    />
                  ))
                ) : (
                  <View className="py-10 items-center justify-center bg-white dark:bg-darkSurface rounded-[28px] border border-black/5">
                    <Ionicons name="search-outline" size={32} color="#8696A0" className="opacity-40 mb-2" />
                    <Text className="text-textSecondary font-poppins-regular text-xs">No diseases found matching your search.</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Farming Tips */}
            <View>
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg mb-5">Expert Advice</Text>
              {QUICK_TIPS.map((tip, index) => (
                <QuickTipCard key={index} tip={tip} />
              ))}
            </View>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

