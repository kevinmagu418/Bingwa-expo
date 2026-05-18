import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, AudioModule, RecordingPresets, useAudioRecorderState } from 'expo-audio';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../hooks/useProfile';
import { BingwaAvatar } from '../components/BingwaAvatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Refined Palette for Light Mode
const LIGHT_PALETTE = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  primary: '#1B4332',    // Deep Forest Green
  secondary: '#74C69D',  // Soft Action Green
  chipBg: '#EAF4F0',
  textMain: '#111B21',   // Deep Charcoal
  textBody: '#4A4A4A',   // Stone gray for body
};

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
  const { isDark } = useTheme();
  
  const { currentDiseaseId, initialMessage, imageUri, crop, disease, severity } = params;

  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // New expo-audio recorder
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 100);

  const formatDuration = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
  }, [initialMessage]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
    if ((Platform.OS as string) !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSend = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    if ((Platform.OS as string) !== 'web') Haptics.selectionAsync();

    const updatedMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const langInstruction = language === 'en'
        ? '\n\n[IMPORTANT: Respond strictly in English only.]'
        : '\n\n[MUHIMU: Jibu kwa Kiswahili tu. Do not use English.]';

      const messagesWithLangHint = updatedMessages.map((m, i) =>
        i === updatedMessages.length - 1 && m.role === 'user'
          ? { ...m, content: m.content + langInstruction }
          : m
      );

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages: messagesWithLangHint,
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
      if ((Platform.OS as string) !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const toggleRecording = async () => {
    try {
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
        
        const now = Date.now();
        const duration = recordingStartTime ? now - recordingStartTime : 0;
        setRecordingStartTime(null);

        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const uri = audioRecorder.uri;
        if (!uri) return;

        if (duration < 1000) {
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return;
        }

        setIsTranscribing(true);
        
        const fileExt = Platform.OS === 'web' ? 'webm' : (uri.split(/[?#]/)[0].split('.').pop()?.toLowerCase() || 'wav');
        const fileName = `audio/${Date.now()}.${fileExt}`;
        const mimeType = Platform.OS === 'web' ? 'audio/webm' : `audio/${fileExt === 'm4a' ? 'mpeg' : 'wav'}`;

        let uploadBody: any;

        if (Platform.OS !== 'web') {
          const formData = new FormData();
          formData.append('file', {
            uri: uri,
            name: fileName,
            type: mimeType,
          } as any);
          uploadBody = formData;
        } else {
          const response = await fetch(uri);
          uploadBody = await response.blob();
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('scans')
          .upload(fileName, uploadBody, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data, error } = await supabase.functions.invoke('transcribe', {
          body: {
            storagePath: fileName,
            language: language
          },
        });

        if (error) throw error;

        if (data && data.text) {
          handleSend(data.text);
        }
        setIsTranscribing(false);
      } else {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (status.granted) {
          await audioRecorder.prepareToRecordAsync();
          setRecordingStartTime(Date.now());
          audioRecorder.record();
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    } catch (err) {
      console.error('Recording error:', err);
      setIsTranscribing(false);
      setRecordingStartTime(null);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages]);

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#0B141A' : LIGHT_PALETTE.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient 
        colors={isDark ? ['#0B141A', '#121B22'] : [LIGHT_PALETTE.background, LIGHT_PALETTE.background]} 
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className={`px-6 py-4 flex-row items-center justify-between border-b ${
            isDark ? 'border-white/5' : 'border-black/5'
          }`}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              className={`w-10 h-10 rounded-xl items-center justify-center ${
                isDark ? 'bg-white/5' : 'bg-black/5'
              }`}
            >
              <Ionicons name="chevron-back" size={24} color={isDark ? "white" : LIGHT_PALETTE.primary} />
            </TouchableOpacity>
            
            <View className="items-center">
              <Text className={`font-poppins-black text-lg ${
                isDark ? 'text-white' : LIGHT_PALETTE.textMain
              }`}>Knowledge Hub</Text>
              <View className="flex-row items-center">
                <View className={`w-1.5 h-1.5 rounded-full mr-2 ${isDark ? 'bg-accent' : 'bg-[#1B4332]'}`} />
                <Text className={`font-poppins-black text-[10px] uppercase tracking-widest ${
                  isDark ? 'text-accent' : 'text-[#1B4332]'
                }`}>Powered by Bingwa AI</Text>
              </View>
            </View>

            <View className="flex-row items-center">
                <TouchableOpacity 
                    onPress={toggleLanguage}
                    className={`px-3 h-10 rounded-xl items-center justify-center flex-row border ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'
                    } mr-3`}
                >
                    <Ionicons name="language" size={16} color={isDark ? "white" : LIGHT_PALETTE.primary} className="mr-2" />
                    <Text className={`font-poppins-bold text-[10px] uppercase ${
                      isDark ? 'text-white' : LIGHT_PALETTE.textMain
                    }`}>
                        {language === 'en' ? 'EN' : 'SW'}
                    </Text>
                </TouchableOpacity>

                <BingwaAvatar size={40} borderWidth={2} />
            </View>
          </View>

          {/* Chat Content, Quick chips, and Footer Input wrapped to handle keyboard */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <ScrollView 
              ref={scrollViewRef} 
              className="flex-1 px-6" 
              contentContainerStyle={{ paddingVertical: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Image Context awareness */}
              {imageUri && (
                <MotiView 
                  from={{ opacity: 0, translateY: -10 }} 
                  animate={{ opacity: 1, translateY: 0 }} 
                  className="mb-8 bg-black/5 dark:bg-white/5 p-4 rounded-3xl border border-black/5 dark:border-white/10 flex-row items-center"
                >
                  <Image source={{ uri: imageUri as string }} className="w-12 h-12 rounded-xl mr-4" />
                  <View className="flex-1">
                    <Text className="text-accent font-poppins-black text-[9px] uppercase tracking-widest mb-0.5">
                      {language === 'en' ? 'Studying' : 'Kusoma'}
                    </Text>
                    <Text className="text-textPrimary dark:text-white font-poppins-bold text-sm">{crop} - {disease}</Text>
                  </View>
                  <View className="bg-accent/10 p-2 rounded-full">
                    <Ionicons name="book-outline" size={16} color="#25D366" />
                  </View>
                </MotiView>
              )}

              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <MotiView 
                    key={index} 
                    from={{ opacity: 0, scale: 0.9, translateX: isUser ? 20 : -20 }}
                    animate={{ opacity: 1, scale: 1, translateX: 0 }}
                    className={`mb-6 max-w-[88%] ${isUser ? 'self-end' : 'self-start'}`}
                  >
                    <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <View className="mr-2 self-end mb-4">
                          <View className={`w-8 h-8 rounded-full items-center justify-center shadow-sm ${
                            isDark ? 'bg-white/10' : 'bg-[#EAF4F0]'
                          }`}>
                            <Ionicons name="sparkles" size={14} color={isDark ? "#25D366" : LIGHT_PALETTE.primary} />
                          </View>
                        </View>
                      )}
                      
                      <View 
                        className={`p-4 rounded-3xl ${
                          isUser 
                            ? (isDark ? 'bg-accent rounded-tr-none' : 'bg-[#1B4332] rounded-tr-none') 
                            : (isDark ? 'bg-white/10 rounded-tl-none' : 'bg-white rounded-tl-none')
                        }`}
                        style={!isDark && !isUser ? {
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.05,
                          shadowRadius: 10,
                          elevation: 2,
                        } : {}}
                      >
                        {!isUser && (
                          <View className="flex-row items-center mb-1.5">
                            <Text className={`font-poppins-bold text-[10px] uppercase tracking-wider ${
                              isDark ? 'text-accent' : LIGHT_PALETTE.primary
                            }`}>
                              {language === 'en' ? 'Bingwa Expert Advice' : 'Ushauri wa Bingwa'}
                            </Text>
                          </View>
                        )}
                        <Text className={`font-poppins-regular text-[14px] leading-[22px] ${
                          isUser 
                            ? 'text-white' 
                            : isDark ? 'text-white/90' : LIGHT_PALETTE.textBody
                        }`}>
                          {msg.content}
                        </Text>
                      </View>
                    </View>
                    <Text className={`text-[9px] mt-2 font-poppins-regular ${
                      isUser ? 'text-right' : 'text-left ml-10'
                    } ${isDark ? 'text-white/20' : 'text-textSecondary opacity-40'}`}>
                      {isUser 
                        ? (language === 'en' ? 'Farmer' : 'Mkulima') 
                        : (language === 'en' ? 'Expert System' : 'Mfumo wa Kitaalamu')}
                    </Text>
                  </MotiView>
                );
              })}

              {(isLoading || isTranscribing) && (
                <View className={`self-start flex-row items-center p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white shadow-sm border border-black/5'}`}>
                  <ActivityIndicator size="small" color="#25D366" />
                  <Text className={`text-xs font-poppins-regular ml-3 ${isDark ? 'text-white/40' : 'text-textSecondary opacity-60'}`}>
                    {isTranscribing 
                      ? (language === 'en' ? 'Transcribing your voice...' : 'Kunukuu sauti yako...')
                      : (language === 'en' ? 'Synthesising expert knowledge...' : 'Kukusanya maarifa ya kitaalamu...')}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Quick chips */}
            <View className="pb-4">
              <View className="px-6 mb-2">
                  <Text className={`font-poppins-black text-[10px] uppercase tracking-widest ${
                    isDark ? 'text-white/30' : 'text-textSecondary opacity-40'
                  }`}>
                    {language === 'en' ? 'Recommended Topics' : 'Mada Zinazopendekezwa'}
                  </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
                {QUICK_CHIPS[language].map((chip, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    onPress={() => handleSend(chip.value)} 
                    className={`mr-3 px-5 py-3 rounded-2xl border ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-[#EAF4F0] border-transparent'
                    }`}
                    style={!isDark ? {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 5,
                      elevation: 1,
                    } : {}}
                  >
                    <Text className={`font-poppins-bold text-[10px] uppercase tracking-widest ${
                      isDark ? 'text-white/60' : LIGHT_PALETTE.primary
                    }`}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Footer Input */}
            <View className={`p-6 border-t ${
              isDark ? 'bg-[#0B141A] border-white/5' : 'bg-white border-black/5'
            } flex-row items-center`}>
              <View className={`flex-1 flex-row items-end rounded-[28px] px-2 py-1 border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-black/5'
              }`}>
                <TextInput
                  className={`flex-1 px-4 py-3.5 font-poppins-regular text-[14px] max-h-32 ${
                    isDark ? 'text-white' : LIGHT_PALETTE.textMain
                  }`}
                  placeholder={language === 'en' ? "Ask for more learning details..." : "Uliza maelezo zaidi ya kujifunza..."}
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                  value={input}
                  onChangeText={setInput}
                  multiline
                />
                {!input.trim() && (
                  <TouchableOpacity 
                    onPress={toggleRecording} 
                    className={`w-12 h-12 rounded-full items-center justify-center mb-1 mr-1 ${audioRecorder.isRecording ? 'bg-red-500' : 'bg-accent/10'}`}
                  >
                    <Ionicons name={audioRecorder.isRecording ? "stop" : "mic-outline"} size={22} color={audioRecorder.isRecording ? "white" : "#25D366"} />
                  </TouchableOpacity>
                )}
              </View>
              
              {input.trim() ? (
                <TouchableOpacity 
                  onPress={() => handleSend()} 
                  className={`ml-4 w-14 h-14 rounded-full items-center justify-center shadow-lg ${
                    isDark ? 'bg-accent shadow-accent/20' : 'bg-[#74C69D] shadow-[#74C69D]/20'
                  }`}
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
            className={`absolute inset-0 items-center justify-center z-[999] ${
              isDark ? 'bg-[#0B141A]/98' : 'bg-white/98'
            }`}
          >
             <StatusBar style={isDark ? "light" : "dark"} />
             
             {/* Dynamic Waveform Simulation */}
             <View className="flex-row items-center justify-center h-20 mb-12">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <MotiView
                    key={i}
                    from={{ height: 10, opacity: 0.3 }}
                    animate={{ 
                      height: 10 + (Math.random() * 50), 
                      opacity: 1 
                    }}
                    transition={{
                      type: 'timing',
                      duration: 150,
                      loop: true,
                      delay: i * 50
                    }}
                    className="w-1.5 bg-accent mx-1 rounded-full"
                  />
                ))}
             </View>

             <View className="items-center mb-16">
                <Text className={`font-poppins-black text-4xl mb-2 tracking-tighter ${
                  isDark ? 'text-white' : LIGHT_PALETTE.textMain
                }`}>
                  {formatDuration(recorderState.durationMillis)}
                </Text>
                <View className={`flex-row items-center px-4 py-1.5 rounded-full border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'
                }`}>
                   <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                   <Text className={`font-poppins-bold text-[10px] uppercase tracking-widest ${
                     isDark ? 'text-white/60' : 'text-textSecondary'
                   }`}>
                     {language === 'en' ? 'Live Audio' : 'Sauti ya Moja kwa Moja'}
                   </Text>
                </View>
             </View>

             <TouchableOpacity 
               onPress={toggleRecording}
               activeOpacity={0.8}
               className="w-28 h-28 rounded-full bg-red-500/10 items-center justify-center border-2 border-red-500/20"
             >
               <MotiView 
                  from={{ scale: 1, opacity: 0.5 }} 
                  animate={{ scale: 1.4, opacity: 0 }} 
                  transition={{ loop: true, duration: 1500, type: 'timing' }} 
                  className="w-full h-full rounded-full bg-red-500 absolute" 
               />
               <View className="w-16 h-16 bg-red-500 rounded-2xl items-center justify-center shadow-2xl shadow-red-500/50">
                 <Ionicons name="stop" size={32} color="white" />
               </View>
             </TouchableOpacity>

             <View className="absolute bottom-20 items-center">
                <Text className={`font-poppins-regular text-xs mb-6 px-12 text-center leading-5 ${
                  isDark ? 'text-white/40' : 'text-textSecondary opacity-60'
                }`}>
                  {language === 'en' 
                    ? 'Bingwa AI is listening to your agricultural query. Speak clearly for best results.' 
                    : 'Bingwa AI inasikiliza swali lako la kilimo. Ongea wazi kwa matokeo bora.'}
                </Text>
                <TouchableOpacity 
                  onPress={toggleRecording}
                  className={`px-8 py-4 rounded-3xl border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'
                  }`}
                >
                  <Text className={`font-poppins-bold text-xs uppercase tracking-widest ${
                    isDark ? 'text-white' : LIGHT_PALETTE.textMain
                  }`}>
                    {language === 'en' ? 'Finish Speaking' : 'Maliza Kuongea'}
                  </Text>
                </TouchableOpacity>
             </View>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}
