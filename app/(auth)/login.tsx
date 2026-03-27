import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import AuthInput from '../../components/AuthInput';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signInWithOAuth(provider: 'google' | 'github') {
    try {
      setLoading(true);
      const redirectTo = Linking.createURL('/(tabs)/scan');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        
        if (result.type === 'success' && result.url) {
          const { queryParams } = Linking.parse(result.url);
          if (queryParams?.access_token) {
            await supabase.auth.setSession({
              access_token: queryParams.access_token as string,
              refresh_token: queryParams.refresh_token as string,
            });
          }
        }
      }
    } catch (error: any) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithEmail() {
    if (!email || !password) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-8" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 1000 }}
            className="items-center mb-10"
          >
            <View className="bg-accent/10 w-20 h-20 rounded-[28px] items-center justify-center border border-accent/20 mb-6 shadow-2xl shadow-accent/20">
              <Ionicons name="leaf" size={40} color="#25D366" />
            </View>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl text-center">
              Welcome Back
            </Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center mt-2 opacity-60">
              Log in to continue your farm diagnosis
            </Text>
          </MotiView>

          <View className="mb-4">
            <AuthInput
              label="Email Address"
              icon="mail-outline"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <AuthInput
              label="Password"
              icon="lock-closed-outline"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity className="self-end -mt-2 mb-8">
                <Text className="text-accent font-poppins-bold text-xs uppercase tracking-widest">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity 
              onPress={signInWithEmail}
              disabled={loading}
              className={`h-16 rounded-[24px] overflow-hidden shadow-xl shadow-accent/30 ${loading ? 'opacity-70' : ''}`}
            >
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }}
                className="flex-1 items-center justify-center"
              >
                <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">
                  {loading ? 'Logging in...' : 'Log In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-black/5 dark:bg-white/5" />
            <Text className="mx-4 text-textSecondary font-poppins-bold text-[10px] uppercase tracking-widest opacity-40">Or continue with</Text>
            <View className="flex-1 h-[1px] bg-black/5 dark:bg-white/5" />
          </View>

          <View className="flex-row space-x-4">
            <TouchableOpacity 
              onPress={() => signInWithOAuth('google')}
              className="flex-1 flex-row h-14 bg-white dark:bg-darkSurface rounded-[20px] items-center justify-center border border-black/5 dark:border-white/5 shadow-sm"
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text className="ml-3 text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-xs uppercase tracking-widest">Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => signInWithOAuth('github')}
              className="flex-1 flex-row h-14 bg-white dark:bg-darkSurface rounded-[20px] items-center justify-center border border-black/5 dark:border-white/5 shadow-sm"
            >
              <Ionicons name="logo-github" size={20} color="#000000" />
              <Text className="ml-3 text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-xs uppercase tracking-widest">GitHub</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-10">
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm">
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-accent font-poppins-bold text-sm">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
