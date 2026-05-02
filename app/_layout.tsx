import "react-native-url-polyfill/auto";
import "../global.css";
import * as WebBrowser from 'expo-web-browser';
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState, useMemo } from "react";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { useNetwork } from "../hooks/useNetwork";
import { OfflineMessage, OfflineBanner } from "../components/OfflineUI";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

WebBrowser.maybeCompleteAuthSession();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { isOnline } = useNetwork();
  const segments = useSegments() as string[];
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

    // Quick initial session check
    const initAuth = async () => {
      try {
        // getSession() will prioritize local storage
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth initialization error:", error.message);
          // If we are offline, don't sign out, just use what we have (or don't have)
          if (isOnline) supabase.auth.signOut();
        }
        setSession(session);
      } catch (err) {
        console.error("Unexpected auth error:", err);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();

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
      if (inAuthGroup || (inOnboardingGroup && !isCompleteProfile) || segments.length < 1 || segments[0] === "index") {
        router.replace("/(tabs)/scan");
      }
    } else if (!session && inTabsGroup) {
      router.replace("/(onboarding)/welcome");
    }

    if (fontsLoaded || fontError) {
      // Small delay to ensure navigation has started if needed
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 100);
    }
  }, [session, initialized, segments, fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // If not initialized, keep showing nothing (splash will be on top)
  if (!initialized) {
    return null;
  }

  // Offline handling: Not logged in AND offline = Full screen message
  if (!session && !isOnline) {
    return <OfflineMessage onRetry={() => NetInfo.refresh()} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FeedbackProvider>
          {!isOnline && session && <OfflineBanner />}
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
    </QueryClientProvider>
  );
}

export default RootLayout;
