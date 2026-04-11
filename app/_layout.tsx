import "react-native-url-polyfill/auto";
import "../global.css";
import * as WebBrowser from 'expo-web-browser';
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { FeedbackProvider } from "../context/FeedbackContext";
import { BingwaAlert } from "../components/BingwaAlert";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

WebBrowser.maybeCompleteAuthSession();

function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  useEffect(() => {
    // Listen for auth state changes
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Auth initialization error:", error.message);
          supabase.auth.signOut();
        }
        setSession(session);
        setInitialized(true);
      })
      .catch((err) => {
        console.error("Unexpected auth error:", err);
        setInitialized(true);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      setSession(session);
      setInitialized(true);

      if (event === 'SIGNED_OUT') {
        setSession(null);
      }

      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/(auth)/reset-password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (session && (inAuthGroup || inOnboardingGroup || segments.length < 1 || segments[0] === "index")) {
      // Redirect to tabs if logged in and trying to access auth/onboarding/index
      router.replace("/(tabs)/scan");
    } else if (!session && inTabsGroup) {
      // Redirect to onboarding if not logged in and trying to access tabs
      router.replace("/(onboarding)/welcome");
    }

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [session, initialized, segments, fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FeedbackProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(modals)/payment-required" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
          <Stack.Screen name="(modals)/error" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        </Stack>
        <BingwaAlert />
      </FeedbackProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout;
