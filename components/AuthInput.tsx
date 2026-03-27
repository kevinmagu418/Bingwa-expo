import React from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: string;
  isValid?: boolean;
}

export default function AuthInput({ 
  label, 
  icon, 
  rightIcon, 
  onRightIconPress, 
  error, 
  isValid,
  ...props 
}: AuthInputProps) {
  return (
    <MotiView 
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="mb-6"
    >
      <View className="flex-row justify-between items-center mb-2 px-1">
        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[10px] uppercase tracking-[2px] opacity-60">
            {label}
        </Text>
        {isValid && !error && (
            <MotiView from={{ scale: 0 }} animate={{ scale: 1 }}>
                <Ionicons name="checkmark-circle" size={16} color="#25D366" />
            </MotiView>
        )}
      </View>

      <View className={`flex-row items-center bg-white dark:bg-darkSurface border-2 ${error ? 'border-red-500/50' : isValid ? 'border-accent/30' : 'border-black/5 dark:border-white/5'} rounded-[24px] px-5 h-16 shadow-xl shadow-black/5`}>
        <View className={`p-2 rounded-xl mr-3 ${isValid ? 'bg-accent/10' : 'bg-gray-100 dark:bg-white/5'}`}>
            <Ionicons name={icon} size={20} color={isValid ? "#25D366" : "#8696A0"} style={{ opacity: 0.8 }} />
        </View>
        <TextInput
          className="flex-1 text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm h-full"
          placeholderTextColor="#8696A0"
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            className="p-2 ml-2"
          >
            <Ionicons name={rightIcon} size={22} color="#8696A0" />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <MotiView 
            from={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="flex-row items-center mt-2 ml-2"
        >
            <Ionicons name="alert-circle" size={14} color="#EF4444" className="mr-1" />
            <Text className="text-red-500 font-poppins-regular text-[10px]">{error}</Text>
        </MotiView>
      )}
    </MotiView>
  );
}
