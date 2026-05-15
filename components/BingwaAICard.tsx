import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export const BingwaAICard = () => {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/ai-assistant')}
      className="mb-4"
    >
      {({ pressed }) => (
        <MotiView
          animate={{ scale: pressed ? 0.98 : 1 }}
          className="rounded-[32px] overflow-hidden border border-black/5 dark:border-white/10"
        >
          <LinearGradient
            colors={isDark ? ['#1F2C34', '#121B22'] : ['#FFFFFF', '#F8F9FA']}
            className="p-6"
          >
            {/* Background decorative blob */}
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl" />
            
            {/* Header Badge */}
            <View className="flex-row items-center mb-3">
              <View className="bg-accent/10 px-3 py-1 rounded-full flex-row items-center border border-accent/20">
                <Ionicons name="sparkles" size={12} color="#25D366" />
                <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-widest ml-1.5">
                  AI Assistant
                </Text>
              </View>
            </View>

            {/* Content */}
            <View className="flex-row justify-between items-end">
              <View className="flex-1 mr-4">
                <Text className="text-textPrimary dark:text-white font-poppins-black text-xl mb-1">
                  Need expert crop advice?
                </Text>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs leading-5">
                  Get instant insights, treatment plans, and prevention tips.
                </Text>
              </View>

              {/* Action Button */}
              <View className="w-12 h-12 bg-accent rounded-2xl items-center justify-center shadow-lg shadow-accent/40">
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </View>

            {/* Micro-Chips */}
            <View className="flex-row mt-5">
              <View className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-lg mr-2">
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[9px] uppercase">
                  Instant Answers
                </Text>
              </View>
              <View className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-lg">
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[9px] uppercase">
                  Disease Help
                </Text>
              </View>
            </View>
          </LinearGradient>
        </MotiView>
      )}
    </Pressable>
  );
};
