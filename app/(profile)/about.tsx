import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import * as Haptics from 'expo-haptics';

export default function AboutScreen() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSupport = (type: 'ai' | 'ticket') => {
    if (type === 'ai') {
      router.push('/(tabs)/scan');
    } else {
      setIsModalVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const submitTicket = async () => {
    if (!ticketMessage.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('support_tickets')
        .insert([
          { 
            user_id: user?.id, 
            message: ticketMessage,
            status: 'open',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Your support ticket has been submitted. We will get back to you soon!");
      setIsModalVisible(false);
      setTicketMessage('');
    } catch (error: any) {
      Alert.alert("Error", "Could not submit ticket. Please check your internet connection.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
                <Ionicons name="sparkles" size={40} color="#25D366" />
            </MotiView>
            
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl text-center">Bingwa Shambani</Text>
            <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-[4px] mb-6">Expert AI Assistance</Text>
            
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm text-center leading-6 opacity-70">
                Need help? Our AI Assistant is available 24/7 in the Scan and Learn tabs to answer your questions. For account issues, you can submit a support ticket below.
            </Text>
        </View>

        {/* Support Options */}
        <View className="px-8 mt-12 pb-20">
            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xs uppercase tracking-[3px] mb-6">Support Channels</Text>
            
            <View className="space-y-4">
                <TouchableOpacity 
                    onPress={() => handleContactSupport('ai')}
                    className="flex-row items-center bg-accent/10 p-5 rounded-[28px] border border-accent/20"
                >
                    <View className="bg-accent w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-lg shadow-accent/20">
                        <Ionicons name="chatbubbles" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-accent font-poppins-black text-sm">Ask Bingwa AI</Text>
                        <Text className="text-accent/60 font-poppins-regular text-[10px]">Instant help with scans and app usage</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#25D366" />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleContactSupport('ticket')}
                    className="flex-row items-center bg-orange-500/10 p-5 rounded-[28px] border border-orange-500/20"
                >
                    <View className="bg-orange-500 w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-lg shadow-orange-500/20">
                        <Ionicons name="mail" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-orange-600 font-poppins-black text-sm">Submit Support Ticket</Text>
                        <Text className="text-orange-600/60 font-poppins-regular text-[10px]">Account, payment, and technical help</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>

      {/* Support Ticket Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <MotiView 
            from={{ translateY: 300 }}
            animate={{ translateY: 0 }}
            className="bg-white dark:bg-darkSurface rounded-t-[40px] p-8 pb-12 shadow-2xl"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Support Ticket</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                <Ionicons name="close" size={24} color="#8696A0" />
              </TouchableOpacity>
            </View>

            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs mb-4">
              Describe your issue below. Our technical team will review it and update your account.
            </Text>

            <TextInput
              multiline
              numberOfLines={6}
              className="bg-gray-50 dark:bg-black/20 p-5 rounded-[24px] text-textPrimary dark:text-darkTextPrimary font-poppins-regular text-sm border border-black/5 mb-6"
              placeholder="E.g. I topped up 5 credits but they are not reflecting..."
              placeholderTextColor="#8696A0"
              value={ticketMessage}
              onChangeText={setTicketMessage}
              textAlignVertical="top"
              style={{ height: 150 }}
            />

            <TouchableOpacity 
              onPress={submitTicket}
              disabled={isSubmitting || !ticketMessage.trim()}
              className={`h-16 rounded-[24px] items-center justify-center shadow-xl ${ticketMessage.trim() ? 'bg-orange-500 shadow-orange-500/30' : 'bg-gray-300 opacity-50'}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">Submit Ticket</Text>
              )}
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
