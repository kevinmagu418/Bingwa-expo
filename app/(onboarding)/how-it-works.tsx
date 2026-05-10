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

import ScanSvg from "../../assets/svgs/scan.svg";
import AnalysisSvg from "../../assets/svgs/analysis.svg";
import SolutionsSvg from "../../assets/svgs/solutions.svg";
import PaymentSvg from "../../assets/svgs/payment.svg";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon?: string;
  Svg?: any;
  isPricing?: boolean;
};

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "camera-outline",
    title: "Snap a Photo",
    subtitle: "STEP 01",
    description: "Point your camera at the affected leaf. Ensure good lighting for the best AI accuracy.",
    color: "#25D366",
    Svg: ScanSvg,
  },
  {
    id: "2",
    icon: "analytics-outline",
    title: "AI Analysis",
    subtitle: "STEP 02",
    description: "Our neural network scans thousands of disease signatures specific to African crops.",
    color: "#3A86FF",
    Svg: AnalysisSvg,
  },
  {
    id: "3",
    icon: "medkit-outline",
    title: "Get Solutions",
    subtitle: "STEP 03",
    description: "Receive immediate treatment plans, from organic remedies to targeted chemical solutions.",
    color: "#F4A261",
    Svg: SolutionsSvg,
  },
  {
    id: "4",
    isPricing: true,
    title: "Pay as you go",
    subtitle: "PRICING",
    description: "Start with 3 free scans. Affordable top-ups via M-Pesa. No monthly commitments.",
    color: "#128C7E",
    Svg: PaymentSvg,
  }
];

const SlideItem = memo(({ item, width, height, isActive }: { item: Slide, width: number, height: number, isActive: boolean }) => {
  const isWeb = Platform.OS === 'web';
  const contentWidth = isWeb ? Math.min(width, 450) : width;
  
  if (item.isPricing) {
    return (
      <View style={{ width }} className="flex-1 items-center justify-center px-6">
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ 
            opacity: isActive ? 1 : 0.3, 
            scale: isActive ? 1 : 0.9,
            translateY: isActive ? 0 : 20 
          }}
          transition={{ type: 'spring', damping: 15 }}
          style={{ width: contentWidth - 40 }}
          className="bg-white dark:bg-darkSurface p-8 rounded-[48px] shadow-2xl shadow-black/5 border border-black/5 dark:border-white/5"
        >
          <MotiView
            animate={{ 
              translateY: [0, -10, 0],
              rotate: ['-2deg', '2deg', '-2deg']
            }}
            transition={{
              type: 'timing',
              duration: 3000,
              loop: true,
              repeat: Infinity
            }}            className="w-40 h-40 self-center mb-6"
          >
            {item.Svg && <item.Svg width="100%" height="100%" />}
          </MotiView>
          
          <Text className="text-accent text-center font-poppins-bold tracking-[3px] text-[10px] mb-2 uppercase opacity-60">
            {item.subtitle}
          </Text>
          <Text className="text-textPrimary dark:text-darkTextPrimary text-3xl font-poppins-black text-center mb-3">
            {item.title}
          </Text>
          <Text className="text-textPrimary/60 dark:text-darkTextPrimary/60 text-center font-poppins-regular text-sm leading-5 mb-8 px-2">
            {item.description}
          </Text>
          
          <View className="space-y-3">
            {[
              { label: "3 Free Scans", icon: "gift-outline", color: "#25D366" },
              { label: "M-Pesa Ready", icon: "phone-portrait-outline", color: "#3A86FF" },
              { label: "No Subscriptions", icon: "infinite-outline", color: "#F4A261" }
            ].map((feat, idx) => (
              <MotiView 
                key={idx}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: isActive ? 1 : 0, translateX: isActive ? 0 : -10 }}
                transition={{ delay: 300 + (idx * 100) }}
                className="flex-row items-center bg-gray-50 dark:bg-darkMuted/30 p-4 rounded-3xl"
              >
                <View style={{ backgroundColor: `${feat.color}20` }} className="w-10 h-10 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name={feat.icon as any} size={18} color={feat.color} />
                </View>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">{feat.label}</Text>
              </MotiView>
            ))}
          </View>
        </MotiView>
      </View>
    );
  }

  return (
    <View style={{ width }} className="flex-1 items-center">
      <View style={{ width: contentWidth }} className="flex-1">
        
        {/* ANIMATED VECTOR AREA */}
        <View className="flex-[1.2] px-8 pt-10 justify-center items-center relative">
          
          {/* Parallax Layer 1: Subtle Deep Glow */}
          <MotiView
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ type: 'timing', duration: 5000, loop: true }}
            style={{
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: 200,
              backgroundColor: item.color,
              filter: 'blur(80px)',
            }}
          />

          {/* Parallax Layer 2: Main Pulse */}
          <MotiView
            animate={{ 
              scale: [0.8, 1, 0.8],
              rotate: ['0deg', '45deg', '0deg']
            }}
            transition={{ type: 'timing', duration: 8000, loop: true }}
            style={{
              position: 'absolute',
              width: 260,
              height: 260,
              borderRadius: 80,
              backgroundColor: `${item.color}15`,
              borderWidth: 2,
              borderColor: `${item.color}10`,
            }}
          />

          {/* Main Character SVG */}
          <MotiView
            animate={{ 
              translateY: isActive ? [0, -15, 0] : 0,
              scale: isActive ? [1, 1.05, 1] : 0.9,
              opacity: isActive ? 1 : 0
            }}
            transition={{
              type: 'timing',
              duration: 3000,
              loop: true,
              repeat: Infinity
            }}            className="w-full h-full items-center justify-center z-10"
          >
            {item.Svg && <item.Svg width="90%" height="90%" />}
          </MotiView>

          {/* Floating Detail Badge */}
          <MotiView
            animate={{ 
              translateY: isActive ? [20, -20, 20] : 0,
              rotate: isActive ? ['-15deg', '15deg', '-15deg'] : '0deg'
            }}
            transition={{ 
              type: 'timing', 
              duration: 4000, 
              loop: true,
              repeat: Infinity 
            }}
            style={{ position: 'absolute', top: '20%', right: '10%' }}
            className="bg-white dark:bg-darkSurface p-5 rounded-[32px] shadow-2xl shadow-black/10 border border-black/5 dark:border-white/5 z-20"
          >
            <Ionicons name={item.icon as any} size={32} color={item.color} />
          </MotiView>
        </View>

        {/* CONTENT AREA: Staggered Entry */}
        <View className="px-10 pb-16 pt-6">
          <MotiView 
            from={{ opacity: 0, translateY: 20 }} 
            animate={{ 
              opacity: isActive ? 1 : 0, 
              translateY: isActive ? 0 : 20 
            }}
            transition={{ delay: 200, type: 'spring' }}
          >
            <Text style={{ color: item.color }} className="font-poppins-bold tracking-[4px] text-[10px] mb-3 uppercase text-center opacity-80">
              {item.subtitle}
            </Text>
          </MotiView>

          <MotiView 
            from={{ opacity: 0, translateY: 20 }} 
            animate={{ 
              opacity: isActive ? 1 : 0, 
              translateY: isActive ? 0 : 20 
            }}
            transition={{ delay: 350, type: 'spring' }}
          >
            <Text className="text-textPrimary dark:text-darkTextPrimary text-4xl font-poppins-black mb-4 text-center leading-[48px]">
              {item.title}
            </Text>
          </MotiView>

          <MotiView 
            from={{ opacity: 0, translateY: 20 }} 
            animate={{ 
              opacity: isActive ? 1 : 0, 
              translateY: isActive ? 0 : 20 
            }}
            transition={{ delay: 500, type: 'spring' }}
          >
            <Text className="text-textPrimary/50 dark:text-darkTextPrimary/50 text-center font-poppins-regular text-base leading-7 px-2">
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
  const { width: windowWidth, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const isWeb = Platform.OS === 'web';
  
  // Constrain width on web to a mobile-like frame (max 480px)
  const width = isWeb ? Math.min(windowWidth, 480) : windowWidth;
  
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
    }, 5000); 
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
    <View className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground items-center" style={{ paddingTop: insets.top }}>
      <View style={{ width, flex: 1 }}>
        
        {/* Dynamic Header */}
        <View className="px-8 pt-4 flex-row justify-between items-center z-10">
          <MotiView 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3000, loop: true }}
          >
             <Image source={require("../../assets/bingwalogo.png")} style={{ width: 90, height: 28 }} resizeMode="contain" />
          </MotiView>
          <Pressable 
            onPress={() => router.push("/permissions")} 
            className="bg-white/80 dark:bg-darkSurface/80 px-6 py-2.5 rounded-2xl border border-black/5"
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
          renderItem={({ item, index }) => <SlideItem item={item} width={width} height={height} isActive={index === currentIndex} />}
          onScrollBeginDrag={stopAutoPlay}
          onScrollEndDrag={startAutoPlay}
          windowSize={3}
        />

        {/* Footer Navigation: Liquid Pagination */}
        <View className="items-center pb-12 pt-4 px-8">
          <View style={{ width: '100%' }}>
            
            <View className="flex-row justify-center mb-10 items-center space-x-3">
              {SLIDES.map((_, i) => (
                <MotiView
                  key={i}
                  animate={{
                    width: i === currentIndex ? 32 : 10,
                    height: 10,
                    opacity: i === currentIndex ? 1 : 0.2,
                    backgroundColor: i === currentIndex ? SLIDES[currentIndex].color : "#8696A0",
                    borderRadius: 5,
                  }}
                  transition={{ type: "spring", damping: 12 }}
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
                      className="h-16 w-full bg-white dark:bg-darkSurface border border-black/5 dark:border-white/5 rounded-[24px] items-center justify-center active:scale-95"
                    >
                      <Ionicons name="chevron-back" size={24} color={SLIDES[currentIndex].color} />
                    </Pressable>
                  </MotiView>
                )}
              </AnimatePresence>

              <Pressable 
                onPress={handleContinue} 
                className="flex-1 h-16 rounded-[24px] items-center justify-center shadow-xl overflow-hidden active:scale-[0.97]"
                style={{ backgroundColor: SLIDES[currentIndex].color }}
              >
                <LinearGradient 
                  colors={[SLIDES[currentIndex].color, `${SLIDES[currentIndex].color}CC`]} 
                  className="absolute inset-0" 
                />
                <View className="flex-row items-center">
                  <Text className="text-white font-poppins-black text-sm mr-3 uppercase tracking-[3px]">
                    {currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
