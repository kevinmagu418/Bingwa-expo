import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, Image, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/useProfile';
import { BingwaAvatar } from '../components/BingwaAvatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_CHIPS = {
  en: [
    { label: "Recommended medicine?", value: "What medicine can I use to treat this disease?" },
    { label: "Is it contagious?", value: "Can this disease spread to other plants?" },
    { label: "Organic ways?", value: "Give me organic methods to prevent this disease." },
    { label: "Prevention tips", value: "How can I prevent this disease from returning next season?" },
  ],
  sw: [
    { label: "Dawa inayopendekezwa?", value: "Ni dawa gani naweza kutumia kutibu ugonjwa huu?" },
    { label: "Inaambukiza?", value: "Je, ugonjwa huu unaweza kuenea kwa mimea mingine?" },
    { label: "Njia za kiasili?", value: "Nipe mbinu za kiasili za kuzuia ugonjwa huu." },
    { label: "Vidokezo vya kuzuia", value: "Ninawezaje kuzuia ugonjwa huu usirudi msimu ujao?" },
  ]
};

export default function AIAssistantScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentDiseaseId, initialMessage, imageUri, crop, disease, severity } = params;

  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const scrollViewRef = useRef<ScrollView>(null);

  // New expo-audio recorder
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = language === 'en' 
        ? "Hello! I'm Bingwa AI. I've combined my expert knowledge library with interactive chat to help you grow better. How can I assist you today?"
        : "Jambo! Mimi ni Bingwa AI. Nimeunganisha maktaba yangu ya maarifa ya kitaalamu na mazungumzo ili kukusaidia kukuza mazao yako vyema. Nawezaje kukusaidia leo?";

      setMessages([{ 
        role: 'assistant', 
        content: (initialMessage as string) || welcomeMessage
      }]);
    }
  }, [initialMessage, language]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSend = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    if (Platform.OS !== 'web') Haptics.selectionAsync();

    const updatedMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          messages: updatedMessages,
          currentDiseaseId,
          language,
          imageContext: imageUri ? {
            uri: imageUri,
            crop,
            disease,
            severity
          } : undefined
        },
      });

      if (error) {
        console.error('Functions Error:', error);
        throw error;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = language === 'en' 
        ? "I'm having trouble connecting. Please try again in a moment."
        : "Nina tatizo la kuunganisha. Tafadhali jaribu tena baada ya muda.";

      if (error.context?.json?.error) {
        errorMessage = error.context.json.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, currentDiseaseId, imageUri, crop, disease, severity, language]);

  const startRecording = async () => {
    if (Platform.OS === 'web') return;
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (status.granted) {
        audioRecorder.record();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (Platform.OS === 'web') return;
    try {
      await audioRecorder.stop();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const queryMsg = language === 'en' ? "Help me with this crop condition..." : "Nisaidie na hali hii ya zao...";
      handleSend(queryMsg);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages]);

  return (
    <View className="flex-1 bg-darkBackground">
      <StatusBar style="light" />
      <LinearGradient colors={['#0B141A', '#121B22']} className="flex-1">
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/5">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/5 rounded-xl items-center justify-center">
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View className="items-center">
              <Text className="text-white font-poppins-bold text-lg">Knowledge Hub</Text>
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />
                <Text className="text-accent font-poppins-black text-[10px] uppercase tracking-widest">Powered by Bingwa AI</Text>
              </View>
            </View>

            <View className="flex-row items-center">
                <TouchableOpacity 
                    onPress={toggleLanguage}
                    className="px-3 h-10 bg-white/5 rounded-xl items-center justify-center flex-row border border-white/10 mr-3"
                >
                    <Ionicons name="language" size={16} color="white" className="mr-2" />
                    <Text className="text-white font-poppins-bold text-[10px] uppercase">
                        {language === 'en' ? 'EN' : 'SW'}
                    </Text>
                </TouchableOpacity>

                <BingwaAvatar size={40} borderWidth={1} borderColor="rgba(255,255,255,0.2)" />
            </View>
          </View>

          {/* Chat Content */}
          <ScrollView 
            ref={scrollViewRef} 
            className="flex-1 px-6" 
            contentContainerStyle={{ paddingVertical: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Context awareness */}
            {imageUri && (
              <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} className="mb-8 bg-white/5 p-4 rounded-3xl border border-white/10 flex-row items-center">
                <Image source={{ uri: imageUri as string }} className="w-12 h-12 rounded-xl mr-4" />
                <View className="flex-1">
                  <Text className="text-accent font-poppins-black text-[9px] uppercase tracking-widest mb-0.5">
                    {language === 'en' ? 'Studying' : 'Kusoma'}
                  </Text>
                  <Text className="text-white font-poppins-bold text-sm">{crop} - {disease}</Text>
                </View>
                <View className="bg-white/10 p-2 rounded-full">
                  <Ionicons name="book-outline" size={16} color="#25D366" />
                </View>
              </MotiView>
            )}

            {messages.map((msg, index) => (
              <MotiView 
                key={index} 
                from={{ opacity: 0, scale: 0.9, translateX: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, scale: 1, translateX: 0 }}
                className={`mb-6 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
              >
                <View className={`p-5 rounded-3xl ${msg.role === 'user' ? 'bg-accent rounded-tr-none' : 'bg-white/10 rounded-tl-none'}`}>
                   {msg.role === 'assistant' && (
                     <View className="flex-row items-center mb-2 opacity-50">
                        <Ionicons name="sparkles" size={12} color="white" className="mr-1" />
                        <Text className="text-white font-poppins-bold text-[10px] uppercase">
                          {language === 'en' ? 'Bingwa Expert Advice' : 'Ushauri wa Bingwa'}
                        </Text>
                     </View>
                   )}
                  <Text className={`font-poppins-regular text-[14px] leading-[22px] ${msg.role === 'user' ? 'text-white' : 'text-white/90'}`}>
                    {msg.content}
                  </Text>
                </View>
                <Text className="text-white/20 text-[9px] mt-2 font-poppins-regular self-end">
                   {msg.role === 'user' 
                    ? (language === 'en' ? 'Farmer' : 'Mkulima') 
                    : (language === 'en' ? 'Expert System' : 'Mfumo wa Kitaalamu')}
                </Text>
              </MotiView>
            ))}

            {isLoading && (
              <View className="self-start flex-row items-center bg-white/5 p-4 rounded-2xl">
                <ActivityIndicator size="small" color="#25D366" />
                <Text className="text-white/40 text-xs font-poppins-regular ml-3">
                  {language === 'en' ? 'Synthesizing expert knowledge...' : 'Kukusanya maarifa ya kitaalamu...'}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Quick chips */}
          <View className="pb-4">
             <View className="px-6 mb-2">
                <Text className="text-white/30 font-poppins-bold text-[9px] uppercase tracking-widest">
                  {language === 'en' ? 'Recommended Topics' : 'Mada Zinazopendekezwa'}
                </Text>
             </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
              {QUICK_CHIPS[language].map((chip, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => handleSend(chip.value)} 
                  className="mr-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10"
                >
                  <Text className="text-white/60 font-poppins-bold text-[10px] uppercase tracking-widest">{chip.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Footer Input */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <View className="p-6 bg-[#0B141A] border-t border-white/5 flex-row items-center">
              <View className="flex-1 flex-row items-end bg-white/5 rounded-[28px] px-2 py-1 border border-white/10">
                <TextInput
                  className="flex-1 px-4 py-3.5 font-poppins-regular text-white text-[14px] max-h-32"
                  placeholder={language === 'en' ? "Ask for more learning details..." : "Uliza maelezo zaidi ya kujifunza..."}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={input}
                  onChangeText={setInput}
                  multiline
                />
                {!input.trim() && (
                  <TouchableOpacity 
                    onPressIn={startRecording} 
                    onPressOut={stopRecording} 
                    className={`w-12 h-12 rounded-full items-center justify-center mb-1 mr-1 ${audioRecorder.isRecording ? 'bg-red-500' : 'bg-accent/10'}`}
                  >
                    <Ionicons name={audioRecorder.isRecording ? "mic" : "mic-outline"} size={22} color={audioRecorder.isRecording ? "white" : "#25D366"} />
                  </TouchableOpacity>
                )}
              </View>
              
              {input.trim() ? (
                <TouchableOpacity 
                  onPress={() => handleSend()} 
                  className="ml-4 w-14 h-14 bg-accent rounded-full items-center justify-center shadow-lg shadow-accent/20"
                >
                  <Ionicons name="send" size={24} color="white" />
                </TouchableOpacity>
              ) : null}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      {/* Recording Overlay */}
      <AnimatePresence>
        {audioRecorder.isRecording && (
          <MotiView 
            from={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-[#0B141A]/95 items-center justify-center z-[999]"
          >
             <MotiView 
                from={{ scale: 1, opacity: 0.5 }} 
                animate={{ scale: 3, opacity: 0 }} 
                transition={{ loop: true, duration: 2000, type: 'timing' }} 
                className="w-40 h-40 rounded-full bg-accent/20 absolute" 
             />
             <View className="w-32 h-32 rounded-full bg-accent items-center justify-center shadow-2xl shadow-accent/50">
               <Ionicons name="mic" size={50} color="white" />
             </View>
             <Text className="text-white font-poppins-black mt-12 uppercase tracking-[8px] text-sm">
               {language === 'en' ? 'Listening' : 'Sikiliza'}
             </Text>
             <Text className="text-white/40 font-poppins-regular mt-4 text-xs">
               {language === 'en' ? 'Voice query for Bingwa AI' : 'Swali la sauti kwa Bingwa AI'}
             </Text>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}
