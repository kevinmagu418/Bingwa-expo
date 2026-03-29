import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, Image } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { supabase } from '../lib/supabase';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FloatingAssistantProps {
  currentDiseaseId?: string;
  initialMessage?: string;
  imageContext?: {
    uri: string;
    crop: string;
    disease: string;
    severity: string;
  };
}

const QUICK_CHIPS = [
  { label: "Dawa gani nioze?", value: "Ni dawa gani naweza kutumia kuzuia huu ugonjwa?" },
  { label: "Is it contagious?", value: "Huu ugonjwa unaweza kuenea kwa mimea mingine?" },
  { label: "Organic ways?", value: "Nipe mbinu za kiasili (organic) za kuzuia ugonjwa huu." },
  { label: "Prevension tips", value: "Nitazuiaje ugonjwa huu usirudi msimu ujao?" },
];

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ currentDiseaseId, initialMessage, imageContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        role: 'assistant', 
        content: initialMessage || "Hello! Jambo! I'm Bingwa AI. How can I help with your crops today?" 
      }]);
    }
  }, [initialMessage]);

  const toggleOpen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOpen(prev => !prev);
  }, []);

  const handleSend = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    Haptics.selectionAsync();

    const updatedMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          messages: updatedMessages,
          currentDiseaseId,
          imageContext
        },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting. Jaribu tena baada ya muda." 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, currentDiseaseId, imageContext]);

  // Voice Recording Logic
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setIsRecording(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setRecording(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Simulate speech to text
    handleSend("Nisaidie na huu ugonjwa mzee..."); 
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages, isOpen]);

  return (
    <View className="absolute bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 50 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: 50 }}
            className="bg-white dark:bg-darkSurface mb-6 overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl"
            style={{ width: SCREEN_WIDTH * 0.9, maxHeight: SCREEN_HEIGHT * 0.65, borderRadius: 32 }}
          >
            {/* Header */}
            <LinearGradient colors={['#25D366', '#128C7E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="p-5 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center mr-3 border border-white/20">
                  <Ionicons name="sparkles" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white font-poppins-bold text-sm">Bingwa AI</Text>
                  <Text className="text-white/70 font-poppins-regular text-[10px]">Swahili & English Support</Text>
                </View>
              </View>
              <TouchableOpacity onPress={toggleOpen} className="p-2 bg-black/10 rounded-full">
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Content */}
            <ScrollView ref={scrollViewRef} className="flex-1 p-5" showsVerticalScrollIndicator={false}>
              
              {/* Image Thumbnail Awareness */}
              {imageContext && (
                <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 flex-row items-center">
                  <Image source={{ uri: imageContext.uri }} className="w-14 h-14 rounded-xl mr-3" />
                  <View className="flex-1">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-[10px] uppercase opacity-60">Scanning this leaf...</Text>
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xs">{imageContext.crop} - {imageContext.disease}</Text>
                  </View>
                  <View className="bg-accent/10 p-2 rounded-full">
                    <Ionicons name="eye" size={16} color="#25D366" />
                  </View>
                </MotiView>
              )}

              {messages.map((msg, index) => (
                <View key={index} className={`mb-4 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                  <View className={`p-4 rounded-[24px] ${msg.role === 'user' ? 'bg-accent rounded-tr-none' : 'bg-[#F0F2F5] dark:bg-white/5 rounded-tl-none'}`}>
                    <Text className={`font-poppins-regular text-[13px] leading-[20px] ${msg.role === 'user' ? 'text-white' : 'text-textPrimary dark:text-darkTextPrimary'}`}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ))}

              {isLoading && (
                <View className="self-start bg-[#F0F2F5] dark:bg-white/5 p-4 rounded-[24px] rounded-tl-none flex-row items-center">
                  <ActivityIndicator size="small" color="#25D366" />
                  <Text className="text-textSecondary text-[11px] font-poppins-regular ml-3">Bingwa is typing...</Text>
                </View>
              )}
            </ScrollView>

            {/* Contextual Chips */}
            {!isLoading && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-3" contentContainerStyle={{ paddingRight: 40 }}>
                {QUICK_CHIPS.map((chip, idx) => (
                  <TouchableOpacity key={idx} onPress={() => handleSend(chip.value)} className="mr-2 bg-gray-100 dark:bg-white/10 px-4 py-2.5 rounded-full border border-black/5">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-[10px] uppercase opacity-70">{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Footer Input & Voice */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
              <View className="p-4 bg-white dark:bg-darkSurface border-t border-black/5 flex-row items-center">
                <View className="flex-1 flex-row items-end bg-[#F0F2F5] dark:bg-white/5 rounded-[22px] px-2 py-1">
                  <TextInput
                    className="flex-1 px-3 py-2.5 font-poppins-regular text-[13px] text-textPrimary dark:text-darkTextPrimary max-h-32"
                    placeholder="Ask Bingwa..."
                    placeholderTextColor="#8696A0"
                    value={input}
                    onChangeText={setInput}
                    multiline
                  />
                  {!input.trim() && (
                    <TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording} className={`w-10 h-10 rounded-full items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-accent/10'}`}>
                      <Ionicons name={isRecording ? "mic" : "mic-outline"} size={20} color={isRecording ? "white" : "#25D366"} />
                    </TouchableOpacity>
                  )}
                </View>
                
                {input.trim() ? (
                  <TouchableOpacity onPress={() => handleSend()} className="ml-3 w-12 h-12 bg-accent rounded-[18px] items-center justify-center shadow-lg shadow-accent/40">
                    <Ionicons name="send" size={20} color="white" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </KeyboardAvoidingView>
            
            {/* Recording Pulse Overlay */}
            <AnimatePresence>
              {isRecording && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-accent/90 items-center justify-center">
                   <MotiView from={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2, opacity: 0 }} transition={{ loop: true, duration: 1000 }} className="w-20 h-20 rounded-full bg-white absolute" />
                   <MotiView from={{ scale: 1, opacity: 0.5 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ loop: true, duration: 1500 }} className="w-20 h-20 rounded-full bg-white absolute" />
                   <Ionicons name="mic" size={40} color="white" />
                   <Text className="text-white font-poppins-black mt-6 uppercase tracking-widest text-xs">Listening to your voice...</Text>
                   <Text className="text-white/70 font-poppins-regular mt-2 text-[10px]">Release to send message</Text>
                </MotiView>
              )}
            </AnimatePresence>
          </MotiView>
        )}
      </AnimatePresence>

      <TouchableOpacity activeOpacity={0.9} onPress={toggleOpen} className="shadow-2xl shadow-accent/40">
        <MotiView animate={{ scale: isOpen ? 0.9 : 1, rotate: isOpen ? '90deg' : '0deg' }} className="w-16 h-16 rounded-[24px] bg-accent items-center justify-center border-4 border-white dark:border-darkBackground">
          <LinearGradient colors={['#25D366', '#128C7E']} className="absolute inset-0" />
          <Ionicons name={isOpen ? "close" : "sparkles"} size={28} color="white" />
          {!isOpen && <MotiView from={{ scale: 1, opacity: 0.5 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ loop: true, duration: 2000 }} className="absolute w-16 h-16 rounded-full border-2 border-accent" />}
        </MotiView>
      </TouchableOpacity>
    </View>
  );
};
