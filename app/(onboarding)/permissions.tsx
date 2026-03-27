import React, { useEffect, useState, useCallback, memo } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  Linking, 
  Platform, 
  useWindowDimensions, 
  Image 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import * as Haptics from "expo-haptics";
import * as Camera from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate 
} from "react-native-reanimated";

// Safe wrapper for Notifications
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const Notifications = !isExpoGo || Platform.OS === 'ios' 
  ? require("expo-notifications") 
  : {
      getPermissionsAsync: async () => ({ status: 'undetermined' }),
      requestPermissionsAsync: async () => ({ status: 'denied' }),
      PermissionStatus: {
        GRANTED: 'granted',
        UNDETERMINED: 'undetermined',
        DENIED: 'denied',
      }
    };

interface PermissionItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  granted: boolean | undefined;
  request: () => Promise<any>;
}

const ORANGE = "#F4A261";
const GREEN = "#25D366";

const PermissionPill = memo(({ item, onPress }: { item: PermissionItem, onPress: (item: PermissionItem) => void }) => (
  <Pressable 
    onPress={() => onPress(item)}
    className="mb-4"
  >
    <MotiView
      animate={{ 
        backgroundColor: item.granted ? 'rgba(37, 211, 102, 0.08)' : 'rgba(244, 162, 97, 0.05)',
        borderColor: item.granted ? 'rgba(37, 211, 102, 0.2)' : 'rgba(244, 162, 97, 0.1)',
        scale: item.granted ? 1.02 : 1
      }}
      transition={{ type: 'spring', damping: 15 }}
      className="flex-row items-center p-5 rounded-[28px] border"
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-sm ${item.granted ? "bg-accent" : "bg-white dark:bg-darkSurface"}`}>
        <Ionicons 
          name={item.icon} 
          size={22} 
          color={item.granted ? "#FFFFFF" : ORANGE} 
        />
      </View>
      <View className="flex-1">
        <Text className={`font-poppins-bold text-sm ${item.granted ? "text-accent" : "text-textPrimary dark:text-darkTextPrimary"}`}>
          {item.title}
        </Text>
        <Text className="text-textSecondary dark:text-darkTextSecondary text-[11px] font-poppins-regular opacity-60 leading-tight">
          {item.description}
        </Text>
      </View>
      <MotiView
        animate={{ 
          rotate: item.granted ? '0deg' : '-90deg',
          opacity: item.granted ? 1 : 0.6
        }}
      >
        <Ionicons 
          name={item.granted ? "checkmark-circle" : "add-circle-outline"} 
          size={24} 
          color={item.granted ? GREEN : ORANGE} 
        />
      </MotiView>
    </MotiView>
  </Pressable>
));

export default function PermissionsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const contentWidth = isWeb ? Math.min(width - 40, 480) : width - 48;

  const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [notificationStatus, setNotificationStatus] = useState<"granted" | "denied" | "undetermined">("undetermined");

  const shieldFloat = useSharedValue(0);
  useEffect(() => {
    shieldFloat.value = withRepeat(withTiming(1, { duration: 2500 }), -1, true);
    
    const checkNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
    };
    checkNotifications();
  }, [shieldFloat]);

  const shieldAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(shieldFloat.value, [0, 1], [0, -10]) }]
  }));

  const handlePermissionPress = useCallback(async (item: PermissionItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    
    if (item.id === 'notifications') {
      const res = await Notifications.requestPermissionsAsync();
      setNotificationStatus(res.status);
    } else {
      await item.request();
    }
  }, []);

  const handleContinue = useCallback(async () => {
    // If not all granted, try requesting camera as the primary one
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        }
        return;
      }
    }
    
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    router.replace("/(auth)/signup");
  }, [cameraPermission, router, requestCameraPermission]);

  const permissions: PermissionItem[] = [
    {
      id: "camera",
      title: "Camera Access",
      description: "Point & scan crop diseases.",
      icon: "camera",
      granted: cameraPermission?.granted,
      request: requestCameraPermission,
    },
    {
      id: "media",
      title: "Gallery Access",
      description: "Select photos from your farm.",
      icon: "images",
      granted: mediaPermission?.granted,
      request: requestMediaPermission,
    },
    {
      id: "notifications",
      title: "Smart Alerts",
      description: "Stay ahead of local outbreaks.",
      icon: "notifications",
      granted: notificationStatus === "granted",
      request: async () => {
        const res = await Notifications.requestPermissionsAsync();
        setNotificationStatus(res.status);
        return res;
      },
    },
  ];

  const allGranted = permissions.every(p => p.granted);

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F5] dark:bg-darkBackground">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Logo */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="items-center mt-6">
          <Image 
            source={require("../../assets/bingwalogo.png")} 
            style={{ width: 80, height: 24, opacity: 0.3 }} 
            resizeMode="contain" 
          />
        </MotiView>

        <View className="items-center px-6 mt-8">
          <View style={{ width: contentWidth }}>
            
            {/* Header with Orange Pulse */}
            <View className="items-center mb-10">
              <Animated.View style={[shieldAnimatedStyle]} className="mb-6">
                <View className="w-24 h-24 bg-[#F4A261]10 rounded-[32px] items-center justify-center border-2 border-[#F4A261]20" style={{ backgroundColor: 'rgba(244, 162, 97, 0.1)' }}>
                  <Ionicons name="shield-checkmark" size={48} color={ORANGE} />
                  <MotiView
                    from={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ loop: true, duration: 2500, type: 'timing' }}
                    className="absolute inset-0 rounded-[32px]"
                    style={{ backgroundColor: ORANGE }}
                  />
                </View>
              </Animated.View>
              
              <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Text className="text-textPrimary dark:text-darkTextPrimary text-4xl font-poppins-black text-center leading-tight">
                  Your Farm,{"\n"}<Text style={{ color: ORANGE }}>Protected.</Text>
                </Text>
                <Text className="text-textSecondary dark:text-darkTextSecondary text-sm font-poppins-regular text-center mt-3 opacity-60 px-4">
                  We use AI to help you grow, but your privacy is our top priority.
                </Text>
              </MotiView>
            </View>

            {/* Main Security Card */}
            <MotiView 
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 300 }}
              className="bg-white dark:bg-darkSurface rounded-[48px] p-8 shadow-2xl shadow-orange-900/5 border border-orange-100 dark:border-white/5"
            >
              <View className="flex-row items-center justify-between mb-8">
                <View>
                  <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Privacy Vault</Text>
                  <Text style={{ color: ORANGE }} className="font-poppins-bold text-[10px] uppercase tracking-widest mt-1">Ready for setup</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(244, 162, 97, 0.1)' }} className="px-4 py-2 rounded-full border border-orange-100">
                  <Text style={{ color: ORANGE }} className="text-[10px] font-poppins-bold uppercase">Required</Text>
                </View>
              </View>

              {permissions.map((item) => (
                <PermissionPill 
                  key={item.id} 
                  item={item} 
                  onPress={handlePermissionPress} 
                />
              ))}

              <View className="mt-6 pt-6 border-t border-orange-100/50 flex-row items-center justify-center">
                <Ionicons name="lock-closed" size={14} color={ORANGE} />
                <Text style={{ color: ORANGE }} className="text-[11px] font-poppins-bold ml-2">
                  No data shared with 3rd parties.
                </Text>
              </View>
            </MotiView>

          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View className="px-8 pb-10 pt-4 items-center">
        <View style={{ width: contentWidth }}>
          <Pressable 
            onPress={handleContinue}
            className="h-18 rounded-[28px] items-center justify-center shadow-xl overflow-hidden active:scale-[0.98]"
            style={{ shadowColor: allGranted ? GREEN : ORANGE }}
          >
             <LinearGradient 
              colors={allGranted ? [GREEN, '#128C7E'] : [ORANGE, '#E76F51']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }} 
              className="absolute inset-0" 
            />
            <View className="flex-row items-center px-10 py-5">
              <Text className="text-white font-poppins-black text-sm uppercase tracking-widest mr-3">
                {allGranted ? "Enter Shambani" : "Grant Access"}
              </Text>
              <Ionicons name={allGranted ? "sparkles" : "shield-half"} size={20} color="white" />
            </View>
          </Pressable>
          
          <Pressable onPress={() => router.replace("/(auth)/login")} className="mt-6 self-center">
            <Text style={{ color: ORANGE }} className="font-poppins-bold text-[10px] uppercase tracking-[2px] opacity-60">Setup Later</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
