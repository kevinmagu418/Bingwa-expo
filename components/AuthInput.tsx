import React from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: string;
}

export default function AuthInput({ 
  label, 
  icon, 
  rightIcon, 
  onRightIconPress, 
  error, 
  ...props 
}: AuthInputProps) {
  return (
    <View className="mb-5">
      <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[10px] uppercase tracking-widest mb-2 ml-1">
        {label}
      </Text>
      <View className={`flex-row items-center bg-white dark:bg-darkSurface border ${error ? 'border-red-500' : 'border-black/5 dark:border-white/5'} rounded-[20px] px-4 h-14 shadow-sm`}>
        <Ionicons name={icon} size={20} color="#25D366" style={{ marginRight: 12, opacity: 0.6 }} />
        <TextInput
          className="flex-1 text-textPrimary dark:text-darkTextPrimary font-poppins-regular text-sm"
          placeholderTextColor="#8696A0"
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={20} color="#8696A0" />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 font-poppins-regular text-[10px] mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
