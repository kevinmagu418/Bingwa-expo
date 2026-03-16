import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { supabase } from '../../lib/supabase';
import AuthInput from '../../components/AuthInput';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleResetPassword() {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      Alert.alert('Update Failed', error.message);
    } else {
      Alert.alert('Success', 'Your password has been updated!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/scan') }
      ]);
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
            transition={{ type: 'spring', duration: 1000 }}
            className="items-center mb-10"
          >
            <View className="bg-accent/10 w-20 h-20 rounded-[28px] items-center justify-center border border-accent/20 mb-6 shadow-2xl shadow-accent/20">
              <Ionicons name="shield-checkmark-outline" size={40} color="#25D366" />
            </View>
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl text-center">
              New Password
            </Text>
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center mt-2 opacity-60">
              Enter a secure new password for your account
            </Text>
          </MotiView>

          <View className="mb-4">
            <AuthInput
              label="New Password"
              icon="lock-closed-outline"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              placeholder="Enter new password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            <AuthInput
              label="Confirm New Password"
              icon="lock-closed-outline"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity 
              onPress={handleResetPassword}
              disabled={loading}
              className={`h-16 rounded-[24px] overflow-hidden shadow-xl shadow-accent/30 mt-6 ${loading ? 'opacity-70' : ''}`}
            >
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }}
                className="flex-1 items-center justify-center"
              >
                <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">
                  {loading ? 'Updating...' : 'Update Password'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
