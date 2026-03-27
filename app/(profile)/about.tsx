import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutScreen() {
  const router = useRouter();

  const handleContactSupport = (type: 'whatsapp' | 'call' | 'email') => {
    switch (type) {
      case 'whatsapp':
        Linking.openURL('whatsapp://send?phone=254712345678&text=Hello Bingwa Support, I need help with my crops.');
        break;
      case 'call':
        Linking.openURL('tel:+254712345678');
        break;
      case 'email':
        Linking.openURL('mailto:support@bingwa-shambani.co.ke?subject=Support Request');
        break;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="px-6 pt-4 flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-white dark:bg-darkSurface rounded-2xl items-center justify-center border border-black/5 shadow-sm"
            >
              <Ionicons name="arrow-back" size={20} color="#128C7E" />
            </TouchableOpacity>
            <Text className="ml-4 text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Help & Support</Text>
        </View>

        <View className="items-center mt-10 px-8">
            <MotiView
              from={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-accent/10 rounded-[32px] items-center justify-center border border-accent/20 mb-6"
            >
                <Image source={require("../../assets/bingwalogo.png")} style={{ width: 60, height: 20 }} resizeMode="contain" />
            </MotiView>
            
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl text-center">Bingwa Shambani</Text>
            <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-[4px] mb-6">Empowering Kenya's Farmers</Text>
            
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center leading-6 opacity-70">
                Bingwa is an AI-powered crop health assistant designed specifically for Kenyan small-holder farmers. We use advanced neural networks to identify diseases instantly and provide localized treatment plans.
            </Text>
        </View>

        {/* Contact Support Section */}
        <View className="px-8 mt-12 pb-20">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xs uppercase tracking-[3px] mb-6">Contact an Expert</Text>
            
            <View className="space-y-4">
                <TouchableOpacity 
                    onPress={() => handleContactSupport('whatsapp')}
                    className="flex-row items-center bg-[#25D366]/10 p-5 rounded-[28px] border border-[#25D366]/20"
                >
                    <View className="bg-[#25D366] w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-lg shadow-[#25D366]/20">
                        <Ionicons name="logo-whatsapp" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#128C7E] font-poppins-black text-sm">WhatsApp Expert</Text>
                        <Text className="text-[#128C7E]/60 font-poppins-regular text-[10px]">Send photos & chat with a pathologist</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#128C7E" />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleContactSupport('call')}
                    className="flex-row items-center bg-blue-500/10 p-5 rounded-[28px] border border-blue-500/20"
                >
                    <View className="bg-blue-500 w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-lg shadow-blue-500/20">
                        <Ionicons name="call" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-blue-600 font-poppins-black text-sm">Call Agriculture Helpline</Text>
                        <Text className="text-blue-600/60 font-poppins-regular text-[10px]">Direct line to agricultural support</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#3B82F6" />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleContactSupport('email')}
                    className="flex-row items-center bg-orange-500/10 p-5 rounded-[28px] border border-orange-500/20"
                >
                    <View className="bg-orange-500 w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-lg shadow-orange-500/20">
                        <Ionicons name="mail" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-orange-600 font-poppins-black text-sm">Email Support</Text>
                        <Text className="text-orange-600/60 font-poppins-regular text-[10px]">Detailed reports & technical help</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
                </TouchableOpacity>
            </View>

            <View className="mt-12 bg-white dark:bg-darkSurface p-6 rounded-[32px] border border-black/5 shadow-sm">
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-sm mb-4">Frequently Asked Questions</Text>
                
                {[
                    { q: "How do I take a good photo?", a: "Ensure the leaf is in bright light and centered in the frame." },
                    { q: "Are the treatment plans safe?", a: "Yes, all organic and chemical plans follow KENAS guidelines." },
                    { q: "How do I pay for scans?", a: "You can top up credits via M-Pesa in the Payment section." }
                ].map((faq, i) => (
                    <View key={i} className="mb-4 pb-4 border-b border-black/5">
                        <Text className="text-accent font-poppins-bold text-[10px] uppercase mb-1">{faq.q}</Text>
                        <Text className="text-textSecondary font-poppins-regular text-xs leading-5 opacity-70">{faq.a}</Text>
                    </View>
                ))}
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
