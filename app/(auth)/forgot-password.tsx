import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { supabase } from '../../lib/supabase';
import AuthInput from '../../components/AuthInput';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function resetPassword() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'bingwa-shambani://reset-password',
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
      router.back();
    }
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground">
      <View className="px-6 pt-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white dark:bg-darkSurface rounded-full items-center justify-center shadow-sm border border-black/5 dark:border-white/5"
        >
          <Ionicons name="arrow-back" size={20} color="#25D366" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-8" 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="items-center mb-10"
          >
            <View className="bg-orange-500/10 w-20 h-20 rounded-[28px] items-center justify-center border border-orange-500/20 mb-6">
              <Ionicons name="key-outline" size={40} color="#F59E0B" />
            </View>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl text-center">
              Forgot Password?
            </Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center mt-2 opacity-60">
              No worries, we'll send you reset instructions.
            </Text>
          </MotiView>

          <AuthInput
            label="Email Address"
            icon="mail-outline"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity 
            onPress={resetPassword}
            disabled={loading}
            className={`mt-4 h-16 rounded-[24px] overflow-hidden shadow-xl shadow-accent/30 ${loading ? 'opacity-70' : ''}`}
          >
            <LinearGradient
              colors={['#25D366', '#128C7E']}
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }}
              className="flex-1 items-center justify-center"
            >
              <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-10">
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm">
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-accent font-poppins-bold text-sm">Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
