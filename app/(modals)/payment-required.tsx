import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { BingwaLoader } from '../../components/Loader';
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
  { id: '3', name: 'FARM MASTER', credits: 5, amount: 100, icon: 'sparkles', color: '#F4A261' },
];

export default function PaymentRequiredModal() {
  const router = useRouter();
  const { profile, refreshProfile } = useProfile();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage>(PACKAGES[1]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus input on mount to ensure user doesn't miss it
    const timer = setTimeout(() => {
        inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePayment = async () => {
    console.log('--- Payment Flow Started ---');
    console.log('Current Phone State:', phoneNumber);
    console.log('Current Package:', selectedPackage.name, 'Amount:', selectedPackage.amount);
    
    if (Platform.OS !== 'web') Alert.alert('Debug', 'Button Pressed!');
    
    let cleanPhone = phoneNumber.trim().replace(/[^0-9]/g, '');
    console.log('Cleaned Phone:', cleanPhone, 'Length:', cleanPhone.length);

    if (!cleanPhone || (cleanPhone.length < 9 || cleanPhone.length > 13)) {
      console.log('Validation Failed: Invalid phone length');
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Number', 'Please enter a valid M-Pesa phone number (e.g., 0712345678)');
      return;
    }

    // Ensure phone number starts with 0, 7, 1 or 254
    if (!cleanPhone.startsWith('0') && !cleanPhone.startsWith('7') && !cleanPhone.startsWith('1') && !cleanPhone.startsWith('254')) {
        console.log('Validation Failed: Invalid Kenyan format');
        Alert.alert('Invalid Format', 'Please use a standard Kenyan phone number (e.g., 0712... or 712...)');
        return;
    }

    console.log('Validation Passed. Setting Loading...');
    setIsLoading(true);

    try {
      console.log('Haptics trigger...');
      if (Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (e) {
          console.log('Haptics failed (ignoring):', e);
        }
      }
      
      console.log('Invoking initiatePayment service...');
      const response = await initiatePayment(cleanPhone, selectedPackage.amount);
      console.log('Service Response Received:', response);
      
      if (response.success) {
        console.log('Payment success path');
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.alert(
          'STK Push Sent 🚀',
          `Please check your phone for the M-Pesa PIN prompt.`,
          [{ 
            text: 'I have paid', 
            onPress: () => {
                refreshProfile();
                router.back();
            } 
          }]
        );
      } else {
        console.error('Payment failure path. Message:', response.message);
        throw new Error(response.message || 'STK Push failed');
      }
    } catch (error: any) {
      console.error('Final Catch Block:', error);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Payment Error', error.message || 'Could not initiate payment.');
    } finally {
      console.log('Setting Loading to False');
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-darkBackground">
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
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} 
                className="px-8" 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
              {/* Header Navigation */}
              <View className="flex-row items-center justify-between mt-6 mb-10">
                <TouchableOpacity 
                  onPress={() => router.back()}
                  className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10 shadow-sm"
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <MotiView 
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-accent/20 px-4 py-2 rounded-2xl border border-accent/30"
                >
                    <Text className="text-accent font-poppins-black text-[10px] uppercase tracking-widest">Premium Access</Text>
                </MotiView>
              </View>

              {/* Title Section */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: 100 }}
              >
                <Text className="text-white font-poppins-black text-4xl leading-tight">
                  Unlock Full{"\n"}<Text className="text-accent">Potentials.</Text>
                </Text>
                <Text className="text-white/50 font-poppins-regular text-base mt-4 leading-relaxed">
                  Support Bingwa AI development and get instant disease diagnostics for your farm.
                </Text>
              </MotiView>

              {/* Package Selection */}
              <View className="mt-10 mb-8">
                <Text className="text-white/30 font-poppins-bold text-[10px] uppercase tracking-[4px] mb-6">Select Scan Bundle</Text>
                
                <View className="space-y-4">
                  {PACKAGES.map((pkg, index) => (
                    <Pressable 
                      key={pkg.id} 
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedPackage(pkg);
                      }}
                    >
                      <MotiView
                        animate={{ 
                          scale: selectedPackage.id === pkg.id ? 1.02 : 1,
                          backgroundColor: selectedPackage.id === pkg.id ? 'rgba(37, 211, 102, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          borderColor: selectedPackage.id === pkg.id ? '#25D366' : 'rgba(255, 255, 255, 0.05)',
                        }}
                        className="p-5 rounded-[28px] border-2 flex-row items-center justify-between overflow-hidden relative"
                      >
                        {pkg.popular && (
                            <View className="absolute -right-10 top-3 rotate-45 bg-accent px-10 py-1 shadow-lg">
                                <Text className="text-white font-poppins-black text-[6px] uppercase tracking-widest">Popular</Text>
                            </View>
                        )}

                        <View className="flex-row items-center">
                          <View 
                            className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${selectedPackage.id === pkg.id ? 'bg-accent' : 'bg-white/5'}`}
                          >
                            <Ionicons name={pkg.icon} size={22} color={selectedPackage.id === pkg.id ? 'white' : '#25D366'} />
                          </View>
                          <View>
                            <Text className="text-white font-poppins-black text-lg">
                              {pkg.credits} {pkg.credits === 1 ? 'Scan' : 'Scans'}
                            </Text>
                            <Text className="text-white/40 font-poppins-bold text-[8px] uppercase tracking-widest">
                              {pkg.name}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="bg-white/5 px-4 py-2 rounded-xl">
                          <Text className={`font-poppins-black text-lg ${selectedPackage.id === pkg.id ? 'text-accent' : 'text-white/60'}`}>
                            KSH {pkg.amount}
                          </Text>
                        </View>
                      </MotiView>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* M-Pesa Input Section */}
              <MotiView 
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: 400 }}
                className="bg-white/5 p-8 rounded-[40px] border border-white/10"
              >
                <View className="flex-row items-center mb-8">
                    <View className="bg-accent/20 p-3 rounded-2xl mr-4">
                        <Ionicons name="phone-portrait" size={24} color="#25D366" />
                    </View>
                    <View>
                        <Text className="text-white font-poppins-black text-lg">M-Pesa Express</Text>
                        <Text className="text-white/40 font-poppins-regular text-[9px] uppercase tracking-widest">Safaricom Secure Payment</Text>
                    </View>
                </View>

                <View className="mb-8">
                  <View className="flex-row items-center bg-black/20 rounded-[24px] px-6 h-18 border-2 border-white/5">
                    <View className="bg-accent/10 p-2 rounded-xl mr-3">
                        <Ionicons name="call-outline" size={18} color="#25D366" />
                    </View>
                    <TextInput
                      ref={inputRef}
                      className="flex-1 text-white font-poppins-bold text-base h-full"
                      placeholder="0712 345 678"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      maxLength={10}
                    />
                  </View>
                </View>

                <Pressable 
                  onPress={handlePayment}
                  disabled={isLoading}
                >
                  {({ pressed }) => (
                    <MotiView 
                      animate={{ scale: pressed ? 0.98 : 1 }}
                      className={`h-18 rounded-[24px] overflow-hidden ${isLoading ? 'opacity-70' : ''}`}
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
                            <Text className="text-white font-poppins-black text-sm uppercase tracking-[4px] mr-2">Confirm Payment</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                          </>
                        )}
                      </LinearGradient>
                    </MotiView>
                  )}
                </Pressable>

                <View className="mt-6 flex-row items-center justify-center opacity-20">
                    <Ionicons name="shield-checkmark" size={12} color="white" />
                    <Text className="text-white font-poppins-bold text-[8px] uppercase tracking-[2px] ml-2">
                        Secured by Safaricom & Bingwa
                    </Text>
                </View>
              </MotiView>

              <TouchableOpacity 
                onPress={() => router.back()}
                className="mt-10 py-4 items-center"
              >
                <Text className="text-white/20 font-poppins-bold text-[10px] uppercase tracking-[4px]">
                    Cancel Transaction
                </Text>
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

