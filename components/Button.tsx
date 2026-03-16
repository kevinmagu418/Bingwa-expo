import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

export default function Button({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false, 
  variant = 'primary',
  icon,
  className 
}: ButtonProps) {
  
  const handlePress = () => {
    if (!loading && !disabled) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity 
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        className={`h-16 rounded-[24px] overflow-hidden shadow-lg ${disabled ? 'opacity-50' : 'shadow-green-900/20'} ${className}`}
      >
        <LinearGradient
          colors={['#25D366', '#128C7E']}
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 0 }}
          className="flex-1 items-center justify-center flex-row px-6"
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text className="text-white font-poppins-black text-sm uppercase tracking-widest mr-2">
                {title}
              </Text>
              {icon && <Ionicons name={icon} size={18} color="white" />}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity 
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        className={`h-16 rounded-[24px] items-center justify-center flex-row border-2 border-accent px-6 ${disabled ? 'opacity-40' : ''} ${className}`}
      >
        {loading ? (
          <ActivityIndicator color="#25D366" size="small" />
        ) : (
          <>
            <Text className="text-accent font-poppins-black text-sm uppercase tracking-widest mr-2">
              {title}
            </Text>
            {icon && <Ionicons name={icon} size={18} color="#25D366" />}
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={`h-16 rounded-[24px] bg-gray-100 dark:bg-darkSurface items-center justify-center flex-row px-6 ${disabled ? 'opacity-40' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#8696A0" size="small" />
      ) : (
        <>
          <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-sm uppercase tracking-widest mr-2">
            {title}
          </Text>
          {icon && <Ionicons name={icon} size={18} color="#8696A0" />}
        </>
      )}
    </TouchableOpacity>
  );
}

import { Platform } from 'react-native';
