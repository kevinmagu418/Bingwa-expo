import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

export default function ErrorModal() {
  const router = useRouter();
  const { title, message } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-darkBackground items-center justify-center px-8">
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="items-center"
      >
        <View className="w-24 h-24 bg-red-500/10 rounded-full items-center justify-center mb-8 border-4 border-red-500/5">
          <Ionicons name="alert-circle" size={56} color="#D64545" />
        </View>

        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl text-center mb-4">
          {title || "Something went wrong"}
        </Text>

        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-base text-center mb-10 opacity-70">
          {message || "We encountered an unexpected error. Please try again or contact support if the issue persists."}
        </Text>

        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-full h-16 rounded-[24px] overflow-hidden shadow-xl shadow-red-900/20 active:scale-[0.98]"
        >
          <LinearGradient
            colors={['#D64545', '#9B2C2C']}
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }}
            className="flex-1 items-center justify-center"
          >
            <Text className="text-white font-poppins-black text-sm uppercase tracking-widest">
              Dismiss
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)/scan')}
          className="mt-6"
        >
          <Text className="text-textSecondary font-poppins-bold text-xs uppercase tracking-widest opacity-40">
            Return to Dashboard
          </Text>
        </TouchableOpacity>
      </MotiView>
    </SafeAreaView>
  );
}
