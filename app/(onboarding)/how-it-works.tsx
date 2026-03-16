import React, { useRef, useState, useCallback, memo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  useWindowDimensions,
  FlatList,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View as MotiView, AnimatePresence } from "moti";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
} from "react-native-reanimated";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon?: string;
  image?: any;
  isPricing?: boolean;
};

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "camera",
    title: "Snap a Photo",
    subtitle: "STEP 01",
    description: "Point your camera at the affected leaf. Ensure good lighting for the best AI accuracy.",
    color: "#25D366",
  },
  {
    id: "2",
    icon: "analytics",
    title: "AI Analysis",
    subtitle: "STEP 02",
    description: "Our neural network scans thousands of disease signatures specific to African crops.",
   
    color: "#3A86FF",
  },
  {
    id: "3",
    icon: "medkit",
    title: "Get Solutions",
    subtitle: "STEP 03",
    description: "Receive immediate treatment plans, from organic remedies to targeted chemical solutions.",
   
    color: "#F4A261",
  },
  {
    id: "4",
    isPricing: true,
    title: "Pay as you go",
    subtitle: "PRICING",
    description: "Start with 2 free scans. Affordable top-ups via M-Pesa. No monthly commitments.",
    color: "#25D366",
  }
];

const SlideItem = memo(({ item, width, height }: { item: Slide, width: number, height: number }) => {
  const isWeb = Platform.OS === 'web';
  const contentWidth = isWeb ? Math.min(width, 450) : width;
  
  const floatValue = useSharedValue(0);
  useEffect(() => {
    floatValue.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatValue.value, [0, 1], [0, -10]) }]
  }));

  if (item.isPricing) {
    return (
      <View style={{ width }} className="flex-1 items-center justify-center px-6">
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: contentWidth - 40 }}
          className="bg-surface dark:bg-darkSurface p-8 rounded-[48px] shadow-2xl shadow-black/5 border border-black/5 dark:border-white/5"
        >
          <View className="w-16 h-16 bg-accent/20 rounded-[20px] items-center justify-center mb-6 self-center">
            <Ionicons name="flash" size={32} color="#25D366" />
          </View>
          
          <Text className="text-accent text-center font-poppins-bold tracking-[3px] text-xs mb-2 uppercase">
            {item.subtitle}
          </Text>
          <Text className="text-textPrimary dark:text-darkTextPrimary text-3xl font-poppins-black text-center mb-3">
            {item.title}
          </Text>
          <Text className="text-textPrimary dark:text-darkTextPrimary text-center font-poppins-regular text-sm leading-5 mb-8">
            {item.description}
          </Text>
          
          <View>
            {[
              { label: "2 Free Scans", icon: "gift" },
              { label: "M-Pesa Ready", icon: "phone-portrait" },
              { label: "No Subscriptions", icon: "infinite" }
            ].map((feat, idx) => (
              <View key={idx} className="flex-row items-center bg-muted dark:bg-darkMuted p-4 rounded-[20px] mb-3">
                <View className="w-10 h-10 bg-accent/10 rounded-xl items-center justify-center mr-4">
                  <Ionicons name={feat.icon as any} size={18} color="#25D366" />
                </View>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">{feat.label}</Text>
              </View>
            ))}
          </View>
        </MotiView>
      </View>
    );
  }

  return (
    <View style={{ width }} className="flex-1 items-center">
      <View style={{ width: contentWidth }} className="flex-1">
        {/* Adjusted Image Height to Flex: 1 to ensure it doesn't take too much vertical space */}
        <View className="flex-1 px-8 pt-6 justify-center">
          <Animated.View style={[animatedImageStyle, { height: '80%', width: '100%' }]}>
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full rounded-[40px] overflow-hidden shadow-xl"
            >
              <Image source={item.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)']} style={StyleSheet.absoluteFill} />
            </MotiView>
          </Animated.View>
        </View>

        {/* Content Section */}
        <View className="px-10 pb-8 pt-4">
          <MotiView from={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Text className="text-accent font-poppins-bold tracking-[3px] text-xs mb-2 uppercase">
              {item.subtitle}
            </Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary text-4xl font-poppins-black mb-3">
              {item.title}
            </Text>
            <Text className="text-textPrimary dark:text-darkTextPrimary text-base font-poppins-regular leading-6">
              {item.description}
            </Text>
          </MotiView>
        </View>
      </View>
    </View>
  );
});

export default function HowItWorksScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();
  const autoPlayTimer = useRef<any>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayTimer.current = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= SLIDES.length) nextIndex = 0;
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000); // 4 seconds interval
  }, [currentIndex, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setCurrentIndex(index);
      if (Platform.OS !== "web") Haptics.selectionAsync();
    }
  }).current;

  const handleContinue = useCallback(() => {
    stopAutoPlay();
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push("/permissions");
    }
  }, [currentIndex, stopAutoPlay]);

  const handleBack = useCallback(() => {
    stopAutoPlay();
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    } else {
      router.back();
    }
  }, [currentIndex, stopAutoPlay]);

  return (
    <View style={{ flex: 1, backgroundColor: '#EDEDED', paddingTop: insets.top }} className="dark:bg-darkBackground">
      {/* Navigation Header */}
      <View className="px-8 pt-4 flex-row justify-between items-center z-10">
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
           <Image source={require("../../assets/bingwalogo.png")} style={{ width: 80, height: 24, opacity: 0.4 }} resizeMode="contain" />
        </MotiView>
        <Pressable 
          onPress={() => router.push("/permissions")} 
          hitSlop={20}
          className="bg-white/50 dark:bg-darkSurface/50 px-5 py-2 rounded-xl"
        >
          <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-[10px] uppercase tracking-[2px]">Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        keyExtractor={(item) => item.id || "pricing"}
        renderItem={({ item }) => <SlideItem item={item} width={width} height={height} />}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        windowSize={3}
      />

      {/* Footer Navigation */}
      <View className="items-center pb-12 pt-4 px-8">
        <View style={{ width: isWeb ? Math.min(width - 40, 450) : '100%' }}>
          {/* Pagination Dots */}
          <View className="flex-row justify-center mb-10 space-x-3">
            {SLIDES.map((_, i) => (
              <MotiView
                key={i}
                animate={{
                  width: i === currentIndex ? 30 : 8,
                  opacity: i === currentIndex ? 1 : 0.2,
                  backgroundColor: i === currentIndex ? "#25D366" : "#8696A0",
                }}
                transition={{ type: "spring", damping: 15 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </View>

          <View className="flex-row space-x-4">
            <AnimatePresence>
              {currentIndex > 0 && (
                <MotiView 
                  from={{ opacity: 0, scale: 0.5, width: 0 }} 
                  animate={{ opacity: 1, scale: 1, width: 80 }} 
                  exit={{ opacity: 0, scale: 0.5, width: 0 }} 
                  className="overflow-hidden"
                >
                  <Pressable 
                    onPress={handleBack} 
                    className="h-14 w-full border-2 border-accent/30 rounded-[20px] items-center justify-center active:opacity-60"
                  >
                    <Ionicons name="chevron-back" size={20} color="#25D366" />
                  </Pressable>
                </MotiView>
              )}
            </AnimatePresence>

            <Pressable 
              onPress={handleContinue} 
              className="flex-1 h-14 bg-accent rounded-[20px] items-center justify-center shadow-lg shadow-accent/30 overflow-hidden active:scale-[0.98]"
            >
              <LinearGradient 
                colors={['#25D366', '#128C7E']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }} 
                className="absolute inset-0" 
              />
              <View className="flex-row items-center">
                <Text className="text-white font-poppins-black text-sm mr-2 uppercase tracking-widest">
                  {currentIndex === SLIDES.length - 1 ? "Start Now" : "Continue"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}