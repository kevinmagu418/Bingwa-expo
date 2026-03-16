import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BingwaLoader } from '../../components/Loader';
import { initiatePayment } from '../../services/payment';
import { useProfile } from '../../hooks/useProfile';
import Button from '../../components/Button';
import * as Haptics from 'expo-haptics';

export default function PaymentRequiredModal() {
  const router = useRouter();
  const { profile, refreshProfile } = useProfile();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Number', 'Please enter a valid M-Pesa phone number (e.g., 0712345678)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await initiatePayment(phoneNumber, 40);
      
      if (response.success) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'STK Push Sent',
          'Please enter your M-Pesa PIN on your phone to complete the payment of 40 KSH.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Poll or wait
                setTimeout(async () => {
                  await refreshProfile();
                  if (profile?.scan_credits && profile.scan_credits > 0) {
                    router.back();
                  }
                }, 5000);
              } 
            }
          ]
        );
      } else {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Payment Error', response.message || 'Could not initiate STK push. Please check your connection and try again.');
      }
    } catch (error: any) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('System Error', 'We encountered a problem connecting to the payment service. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white dark:bg-darkBackground"
    >
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6" keyboardShouldPersistTaps="handled">
          <View className="items-center mt-10">
            <MotiView
              from={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-accent/10 rounded-full items-center justify-center mb-6"
            >
              <Ionicons name="card-outline" size={48} color="#25D366" />
            </MotiView>
            
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-2xl text-center">
              Scan Credits Depleted
            </Text>
            
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-center mt-3 text-base leading-6">
              You've used all your free scans. Buy a single scan credit for only 40 KSH to continue diagnosing your crops.
            </Text>
          </View>

          <View className="mt-10 space-y-6">
            <View className="bg-gray-50 dark:bg-darkSurface p-6 rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm">
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg mb-4">
                M-Pesa Payment
              </Text>
              
              <View className="space-y-4">
                <View>
                  <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-medium text-xs uppercase tracking-widest mb-2 ml-2">
                    M-Pesa Number
                  </Text>
                  <View className="flex-row items-center bg-white dark:bg-black/20 rounded-[20px] px-4 h-14 border border-black/10 dark:border-white/10">
                    <Ionicons name="call-outline" size={20} color="#25D366" style={{ marginLeft: 12 }} />
                    <TextInput
                      className="flex-1 ml-3 text-textPrimary dark:text-darkTextPrimary font-poppins-medium"
                      placeholder="07xxxxxxxx"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      maxLength={10}
                    />
                  </View>
                </View>

                <View className="bg-accent/5 p-4 rounded-2xl flex-row items-center border border-accent/10">
                  <Ionicons name="information-circle" size={20} color="#25D366" />
                  <Text className="text-accent font-poppins-medium text-[10px] ml-3 flex-1">
                    Enter the phone number that will receive the M-Pesa prompt.
                  </Text>
                </View>
              </View>
            </View>

            <Button 
                title="Pay 40 KSH Now"
                onPress={handlePayment}
                loading={isLoading}
                icon="arrow-forward"
            />

            <TouchableOpacity 
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              className="py-4 items-center"
            >
              <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-sm uppercase tracking-widest">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
