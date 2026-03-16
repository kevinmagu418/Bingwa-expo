import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { supabase } from '../../lib/supabase';
import AuthInput from '../../components/AuthInput';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signUpWithEmail() {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
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

    if (error) {
      Alert.alert('Error', error.message);
    } else if (!session) {
      Alert.alert('Success', 'Please check your email for the confirmation link!');
      router.replace('/(auth)/login');
    }
    setLoading(false);
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
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring' }}
            className="items-center mb-10"
          >
            <View className="bg-accent/10 w-20 h-20 rounded-[28px] items-center justify-center border border-accent/20 mb-6 shadow-2xl shadow-accent/20">
              <Ionicons name="person-add-outline" size={36} color="#25D366" />
            </View>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl text-center">
              Join Bingwa
            </Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center mt-2 opacity-60">
              Create an account to start protecting your crops
            </Text>
          </MotiView>

          <View className="mb-4">
            <AuthInput
              label="Full Name"
              icon="person-outline"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />

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
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            <View className="flex-row items-center mb-8 px-1">
              <Ionicons name="information-circle-outline" size={14} color="#8696A0" />
              <Text className="text-[#8696A0] font-poppins-regular text-[10px] ml-2">
                By signing up, you agree to our Terms & Privacy Policy.
              </Text>
            </View>

            <TouchableOpacity 
              onPress={signUpWithEmail}
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
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-10">
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm">
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-accent font-poppins-bold text-sm">Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
