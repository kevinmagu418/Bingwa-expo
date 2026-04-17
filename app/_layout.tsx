import "react-native-url-polyfill/auto";
import "../global.css";
import * as WebBrowser from 'expo-web-browser';
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import * as Linking from "expo-linking";
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
    // Handle deep links for password recovery manually
    const handleDeepLink = async (url: string) => {
      console.log("Processing deep link:", url);
      if (url.includes('access_token=') && (url.includes('type=recovery') || url.includes('reset-password'))) {
        const hash = url.split('#')[1] || url.split('?')[1];
        if (hash) {
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            if (!error) {
              console.log("Recovery session set successfully");
              router.replace('/(auth)/reset-password');
            }
          }
        }
      }
    };

    // Check for initial URL
    WebBrowser.maybeCompleteAuthSession();
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for new URLs
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

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
        // Delay slightly to ensure session is fully set
        setTimeout(() => router.replace('/(auth)/reset-password'), 100);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!initialized || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const isCompleteProfile = segments[1] === "complete-profile";
    const isResetPassword = segments[1] === "reset-password";

    if (session) {
      // If we are in a recovery session, DO NOT redirect to tabs
      if (isResetPassword) return;

      // If logged in and in auth group, or on welcome screen, go to scan
      // But allow them to stay on complete-profile
      if (inAuthGroup || (inOnboardingGroup && !isCompleteProfile) || segments.length < 1 || segments[0] === "index") {
        router.replace("/(tabs)/scan");
      }
    } else if (!session && inTabsGroup) {
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
