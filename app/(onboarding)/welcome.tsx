import React, { useEffect, memo } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  ImageBackground,
  useWindowDimensions,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const SafeAreaView = ({ children, className, style }: SafeAreaViewProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View 
      className={className} 
      style={[{ paddingTop: insets.top, paddingBottom: insets.bottom }, style]}
    >
      {children}
    </View>
  );
};

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  desc: string;
}

const FEATURES: Feature[] = [
  { icon: "scan-circle", text: "Instant Diagnosis", desc: "95% accuracy in seconds" },
  { icon: "medkit", text: "Expert Advice", desc: "Organic & chemical plans" },
  { icon: "shield-checkmark", text: "Secure Data", desc: "Privacy first approach" }
];

const FeatureItem = memo(({ item, index }: { item: Feature, index: number }) => (
  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: "spring", delay: 800 + index * 150 }}
    className="flex-row items-center bg-white/10 self-start px-5 py-3 rounded-[24px] border border-white/10 mb-3"
  >
    <View className="bg-accent/20 p-2 rounded-xl mr-4">
      <Ionicons name={item.icon} size={20} color="#25D366" />
    </View>
    <View>
      <Text className="text-white font-poppins-bold text-sm">{item.text}</Text>
      <Text className="text-white/50 font-poppins-regular text-[10px] uppercase tracking-widest">{item.desc}</Text>
    </View>
  </MotiView>
));

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = useSharedValue(1);
  const logoScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(withSpring(1.1), withSpring(1)),
      -1,
      true
    );
  }, [logoScale]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };
  const handlePressOut = () => { scale.value = withSpring(1); };

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    router.push("/how-it-works");
  };

  return (
    <View className="flex-1 bg-darkBackground">
      <StatusBar style="light" />
      
      <ImageBackground
        source={require("../../assets/farmer.jpg")}
        className="flex-1"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(11, 20, 26, 0.2)", "rgba(11, 20, 26, 0.8)", "#0B141A"]}
          className="flex-1"
          locations={[0, 0.2, 0.5, 0.85]}
        >
          <SafeAreaView className="flex-1 px-8 items-center">
            <View className="flex-1 justify-end pb-12 w-full max-w-[500px]">
              
              <MotiView
                from={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 200 }}
                className="mb-8"
              >
                <Animated.View 
                  style={animatedLogoStyle}
                  className="bg-accent/20 w-16 h-16 rounded-[22px] items-center justify-center border border-accent/30 shadow-2xl shadow-accent/50"
                >
                  <Ionicons name="leaf" size={32} color="#25D366" />
                </Animated.View>
              </MotiView>
              
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "spring", damping: 20, delay: 400 }}
              >
                <MotiText className="text-white font-poppins-black leading-tight" style={{ fontSize: width > 400 ? 56 : 48 }}>
                  Grow<Text className="text-accent"> Smarter.</Text>{"\n"}
                  Yield<Text className="text-accent"> Better.</Text>
                </MotiText>
                
                <MotiText className="text-white/60 font-poppins-regular text-lg mt-4 leading-relaxed max-w-[90%]">
                  Empowering Kenyan farmers with world-class AI disease detection.
                </MotiText>
              </MotiView>

              <View className="mt-10">
                {FEATURES.map((item, index) => (
                  <FeatureItem key={index} item={item} index={index} />
                ))}
              </View>

              <MotiView
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", delay: 1400 }}
                className="mt-10"
              >
                <Pressable
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleStart}
                >
                  <Animated.View
                    style={animatedButtonStyle}
                    className="h-16 rounded-[24px] items-center justify-center shadow-2xl shadow-accent/40 overflow-hidden"
                  >
                    <LinearGradient
                      colors={['#25D366', '#128C7E']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="absolute inset-0"
                    />
                    <View className="flex-row items-center">
                      <Text className="text-white font-poppins-black text-lg mr-2 uppercase tracking-widest">
                        Get Started
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color="white" />
                    </View>
                  </Animated.View>
                </Pressable>
                
                <MotiText
                  from={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 1800 }}
                  className="text-white font-poppins-bold text-center mt-6 text-[10px] uppercase tracking-[4px]"
                >
                  Kenya's Leading Agri-AI
                </MotiText>
              </MotiView>

            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
