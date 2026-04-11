import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { useFeedback } from '../../context/FeedbackContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { initiatePayment } from '../../services/payment';
import { useProfile } from '../../hooks/useProfile';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface PaymentPackage {
  id: string;
  name: string;
  credits: number;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
  popular?: boolean;
  color: string;
}

const PACKAGES: PaymentPackage[] = [
  { id: '1', name: 'QUICK SCAN', credits: 1, amount: 30, icon: 'leaf', color: '#25D366' },
  { id: '2', name: 'SAVER BUNDLE', credits: 2, amount: 50, icon: 'flash', popular: true, color: '#3A86FF' },
  { id: '3', name: 'FARM MASTER', credits: 3, amount: 80, icon: 'sparkles', color: '#F4A261' },
];

export default function PaymentRequiredModal() {
  const router = useRouter();
  const { showError } = useFeedback();
  const { profile, refreshProfile } = useProfile();
  // Params passed from processing.tsx when a scan was already analyzed but credits ran out
  const { pendingScanId, pendingImageUri } = useLocalSearchParams<{ pendingScanId?: string; pendingImageUri?: string }>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage>(PACKAGES[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const initialCredits = useRef(profile?.scan_credits || 0);
  const inputRef = useRef<TextInput>(null);

  // Redirect after success is confirmed
  useEffect(() => {
    if (isSuccess) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const timer = setTimeout(() => {
        console.log('🚀 Redirecting after successful payment...');
        // If a pending scan exists (came from processing.tsx), go directly to the result
        if (pendingScanId) {
          router.replace({
            pathname: '/(scan)/result',
            params: { scanId: pendingScanId, imageUri: pendingImageUri || '' },
          });
        } else if (router.canGoBack()) {
          router.back();
        } else {
          // Fallback: web or modal opened as root screen — go to the scan tab
          router.replace('/(tabs)/scan');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Automatic Success Detection & Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isWaiting && !isSuccess) {
      // Polling fallback every 5 seconds
      interval = setInterval(() => {
        console.log('Polling for payment status...');
        refreshProfile();
      }, 5000);

      if (profile) {
        console.log('Payment Wait Status:', {
          isWaiting,
          currentCredits: profile.scan_credits,
          initialCredits: initialCredits.current
        });

        if (profile.scan_credits > initialCredits.current) {
          console.log('✅ Payment detected! Transitioning to success...');
          setIsSuccess(true);
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [profile?.scan_credits, isWaiting, isSuccess]);

  useEffect(() => {
    const timer = setTimeout(() => {
        inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePayment = async () => {
    let cleanPhone = phoneNumber.trim().replace(/[^0-9]/g, '');

    if (!cleanPhone || (cleanPhone.length < 9 || cleanPhone.length > 13)) {
      showError('Invalid Number', 'Please enter a valid M-Pesa phone number.');
      return;
    }

    setIsLoading(true);
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const response = await initiatePayment(cleanPhone, selectedPackage.amount);
      
      if (response.success) {
        initialCredits.current = profile?.scan_credits || 0;
        setIsWaiting(true);
      } else {
        throw new Error(response.message || 'STK Push failed');
      }
    } catch (error: any) {
      showError('Payment Error', error.message || 'Could not initiate payment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0B141A]">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0B141A', '#121B22']}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1"
          >
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }} 
                className="flex-1" 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
              <View className="flex-1 max-w-md w-full self-center px-6 py-6">
                
                {/* Header Navigation */}
                <View className="flex-row items-center justify-between mb-8">
                  <TouchableOpacity 
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10 shadow-sm"
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>

                  <View className="flex-row items-center bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <Ionicons name="wallet-outline" size={14} color="#25D366" />
                    <Text className="text-white font-poppins-bold text-xs ml-2">{profile?.scan_credits || 0} Credits</Text>
                  </View>
                </View>

                {/* Title Section */}
                <MotiView
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  className="mb-8"
                >
                  <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-[3px] mb-2">Refill Credits</Text>
                  <Text className="text-white font-poppins-black text-3xl leading-tight">
                    Keep your crops{"\n"}<Text className="text-accent">Healthy.</Text>
                  </Text>
                  <Text className="text-white/40 font-poppins-regular text-sm mt-3 leading-relaxed">
                    Choose a bundle below and pay securely via M-Pesa Express.
                  </Text>
                </MotiView>

                {/* Package Selection */}
                <View className="gap-y-4 mb-10">
                  {PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id;
                    return (
                      <Pressable 
                        key={pkg.id} 
                        onPress={() => {
                          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedPackage(pkg);
                        }}
                      >
                        <MotiView
                          animate={{ 
                            scale: isSelected ? 1.02 : 1,
                            backgroundColor: isSelected ? 'rgba(37, 211, 102, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                            borderColor: isSelected ? '#25D366' : 'rgba(255, 255, 255, 0.05)',
                          }}
                          className={`p-5 rounded-2xl border-2 flex-row items-center justify-between overflow-hidden ${isSelected ? 'shadow-lg' : ''}`}
                          style={isSelected ? { shadowColor: '#25D366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 } : {}}
                        >
                          <View className="flex-row items-center flex-1">
                            <View 
                              className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${isSelected ? 'bg-accent' : 'bg-white/5'}`}
                            >
                              <Ionicons name={pkg.icon as any} size={24} color={isSelected ? 'white' : '#25D366'} />
                            </View>
                            <View>
                              <View className="flex-row items-center">
                                <Text className="text-white font-poppins-black text-lg">
                                  {pkg.credits} {pkg.credits === 1 ? 'Scan' : 'Scans'}
                                </Text>
                                {pkg.popular && (
                                  <View className="ml-2 bg-accent/20 px-2 py-0.5 rounded-md">
                                    <Text className="text-accent font-poppins-bold text-[8px] uppercase">Best Value</Text>
                                  </View>
                                )}
                              </View>
                              <Text className="text-white/40 font-poppins-medium text-[10px] uppercase tracking-widest">
                                {pkg.name}
                              </Text>
                            </View>
                          </View>
                          
                          <View className="items-end">
                            <Text className={`font-poppins-black text-lg ${isSelected ? 'text-accent' : 'text-white/60'}`}>
                              KSH {pkg.amount}
                            </Text>
                          </View>
                        </MotiView>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Input & Action Group */}
                <MotiView 
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 300 }}
                  className="gap-y-6"
                >
                  <View>
                    <Text className="text-white/30 font-poppins-bold text-[10px] uppercase tracking-[2px] mb-3 ml-1">M-Pesa Phone Number</Text>
                    <View className="flex-row items-center bg-white/5 rounded-xl px-4 py-3.5 border border-white/10">
                      <View className="mr-3">
                        <Ionicons name="call" size={18} color="#25D366" />
                      </View>
                      <TextInput
                        ref={inputRef}
                        className="flex-1 text-white font-poppins-bold text-base ml-1"
                        placeholder="0712 345 678"
                        placeholderTextColor="rgba(255,255,255,0.15)"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        maxLength={10}
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={handlePayment}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    className={`h-16 rounded-xl overflow-hidden shadow-xl ${isLoading ? 'opacity-70' : ''}`}
                    style={{ shadowColor: '#25D366', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}
                  >
                    <LinearGradient
                      colors={['#25D366', '#128C7E']}
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 0 }}
                      className="flex-1 items-center justify-center flex-row"
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Text className="text-white font-poppins-black text-sm uppercase tracking-[3px] mr-2">Confirm Payment</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View className="flex-row items-center justify-center opacity-30 mt-2">
                    <Ionicons name="shield-checkmark" size={12} color="#25D366" />
                    <Text className="text-white font-poppins-medium text-[9px] ml-2 uppercase tracking-[2px]">
                        Secure Safaricom Checkout
                    </Text>
                  </View>
                </MotiView>

                {/* Footer Section */}
                <View className="mt-auto pt-12 pb-6">
                  <TouchableOpacity 
                    onPress={() => router.back()}
                    className="py-4 items-center"
                  >
                    <Text className="text-white/20 font-poppins-bold text-[10px] uppercase tracking-[4px]">
                        Maybe Later
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* PREMIUM PROCESSING OVERLAY */}
        <AnimatePresence>
          {isWaiting && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#0B141A] items-center justify-center px-10"
            >
              <View className="items-center justify-center">
                {/* Radar Pulse Effect */}
                <MotiView
                  from={{ scale: 0.6, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ loop: true, duration: 2000, type: 'timing' }}
                  style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#25D366' }}
                />
                <MotiView
                  from={{ scale: 0.6, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ loop: true, duration: 2000, delay: 1000, type: 'timing' }}
                  style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#25D366' }}
                />
                
                <View className="w-24 h-24 bg-accent rounded-full items-center justify-center shadow-2xl shadow-accent/50">
                  <AnimatePresence exitBeforeEnter>
                    {isSuccess ? (
                      <MotiView
                        key="success"
                        from={{ scale: 0, rotate: '-180deg' }}
                        animate={{ scale: 1, rotate: '0deg' }}
                        transition={{ type: 'spring' }}
                      >
                        <Ionicons name="checkmark" size={50} color="white" />
                      </MotiView>
                    ) : (
                      <MotiView
                        key="waiting"
                        animate={{ rotate: '360deg' }}
                        transition={{ loop: true, duration: 2000, type: 'timing' }}
                      >
                        <Ionicons name="sync" size={40} color="white" />
                      </MotiView>
                    )}
                  </AnimatePresence>
                </View>
              </View>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 300 }}
                className="items-center mt-12"
              >
                <Text className="text-white font-poppins-black text-2xl text-center mb-2">
                  {isSuccess ? 'Payment Confirmed! 🌽' : 'Awaiting Payment...'}
                </Text>
                <Text className="text-white/40 font-poppins-regular text-center leading-6">
                  {isSuccess 
                    ? 'Your credits have been recharged. Redirecting you to your scan...' 
                    : 'Please enter your M-Pesa PIN on the prompt sent to your phone.'}
                </Text>
              </MotiView>

              {!isSuccess && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 5000 }} // Show after 5 seconds
                  className="mt-12 bg-white/5 p-6 rounded-3xl border border-white/5 w-full"
                >
                  <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-[2px] mb-2 text-center">Farmer Tip</Text>
                  <Text className="text-white/60 font-poppins-regular text-xs text-center leading-5">
                    Didn't get the prompt? Dial <Text className="text-white font-poppins-bold">*334#</Text> or open your M-Pesa App to complete the transaction manually.
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={async () => {
                        const newProfile = await refreshProfile();
                        // If they manually click it, we check again
                        if (newProfile && newProfile.scan_credits > initialCredits.current) {
                            setIsSuccess(true);
                        } else {
                            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            // Maybe add a temporary visual feedback that it's still pending
                        }
                    }}
                    className="mt-6 py-3 border-t border-white/5"
                  >
                    <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-[3px] text-center">I've already paid</Text>
                  </TouchableOpacity>
                </MotiView>
              )}
              
              <TouchableOpacity 
                onPress={() => setIsWaiting(false)}
                className="mt-8"
              >
                <Text className="text-white/20 font-poppins-bold text-[10px] uppercase tracking-[4px]">
                    Cancel
                </Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>

      </LinearGradient>
    </View>
  );
}
