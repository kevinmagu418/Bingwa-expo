import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, useColorScheme } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import AuthInput from '../../components/AuthInput';
import PasswordStrength from '../../components/PasswordStrength';

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSocialSignup = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      const redirectTo = Linking.createURL('/(onboarding)/complete-profile');
      
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
      Alert.alert('Auth Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName) newErrors.fullName = 'Full name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Minimum 8 characters';
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function signUpWithEmail() {
    if (!validate()) {
       if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       return;
    }

    setLoading(true);
    try {
      const { 
        data: { session },
        error 
      } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (!session) {
        Alert.alert('Success', 'Welcome to Bingwa! Please check your email for the confirmation link.');
        router.replace('/(auth)/login');
      } else {
         router.replace('/(onboarding)/complete-profile');
      }
    } catch (error: any) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-8" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="items-center mt-12 mb-10"
          >
            <View className="relative">
                <View className="bg-accent/10 w-24 h-24 rounded-[32px] items-center justify-center border border-accent/20 shadow-2xl shadow-accent/20">
                    <Ionicons name="leaf" size={44} color="#25D366" />
                </View>
                <MotiView 
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 500 }}
                    className="absolute -right-2 -bottom-2 bg-white dark:bg-darkSurface p-2 rounded-2xl shadow-lg"
                >
                    <Ionicons name="add" size={20} color="#25D366" />
                </MotiView>
            </View>
            
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-4xl text-center mt-6">
              Create Account
            </Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center mt-2 opacity-60">
                Join our community of smart farmers
            </Text>
          </MotiView>

          {/* Form */}
          <View>
            <AuthInput
              label="Full Name"
              icon="person-outline"
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
              isValid={fullName.length > 2}
              error={errors.fullName}
            />

            <AuthInput
              label="Email Address"
              icon="mail-outline"
              placeholder="farmer@bingwa.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              isValid={/\S+@\S+\.\S+/.test(email)}
              error={errors.email}
            />
            
            <AuthInput
              label="Password"
              icon="lock-closed-outline"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              isValid={password.length >= 8}
              error={errors.password}
            />

            <PasswordStrength password={password} />

            <AuthInput
              label="Confirm Password"
              icon="shield-checkmark-outline"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              isValid={confirmPassword.length > 0 && confirmPassword === password}
              error={errors.confirmPassword}
            />

            <TouchableOpacity 
              onPress={signUpWithEmail}
              disabled={loading}
              className={`h-16 rounded-[28px] overflow-hidden shadow-2xl shadow-accent/40 mt-4 ${loading ? 'opacity-70' : ''}`}
            >
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }}
                className="flex-1 items-center justify-center flex-row"
              >
                {loading ? (
                    <MotiView
                        from={{ rotate: '0deg' }}
                        animate={{ rotate: '360deg' }}
                        transition={{ loop: true, type: 'timing', duration: 1000 }}
                    >
                        <Ionicons name="reload" size={20} color="white" />
                    </MotiView>
                ) : (
                    <>
                        <Text className="text-white font-poppins-black text-sm uppercase tracking-[3px] mr-2">
                            Secure Sign Up
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="white" />
                    </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-10">
                <View className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10" />
                <Text className="mx-4 text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[10px] uppercase tracking-widest opacity-40">
                    Or continue with
                </Text>
                <View className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10" />
            </View>

            {/* Social Logins */}
            <View className="flex-row space-x-4 mb-10">
                <TouchableOpacity 
                    onPress={() => handleSocialSignup('google')}
                    className="flex-1 h-16 bg-white dark:bg-darkSurface rounded-[24px] flex-row items-center justify-center border border-black/5 dark:border-white/5 shadow-sm active:scale-95 transition-all"
                >
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-xs ml-3">Google</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleSocialSignup('github')}
                    className="flex-1 h-16 bg-white dark:bg-darkSurface rounded-[24px] flex-row items-center justify-center border border-black/5 dark:border-white/5 shadow-sm active:scale-95 transition-all"
                >
                    <Ionicons name="logo-github" size={24} color={isDarkMode ? 'white' : 'black'} />
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-xs ml-3">GitHub</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center">
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm">
                Already have an account?{' '}
                </Text>
                <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                    <Text className="text-accent font-poppins-black text-sm">Log In</Text>
                </TouchableOpacity>
                </Link>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
