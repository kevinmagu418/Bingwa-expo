import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

interface StrengthRule {
  label: string;
  met: boolean;
}

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const rules: StrengthRule[] = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase & Lowercase', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const strengthCount = rules.filter(r => r.met).length;
  
  const getStrengthColor = () => {
    if (strengthCount <= 1) return '#FF3B30'; // Red
    if (strengthCount <= 3) return '#FFCC00'; // Yellow
    return '#25D366'; // Green
  };

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (strengthCount <= 1) return 'Weak';
    if (strengthCount <= 3) return 'Moderate';
    return 'Strong';
  };

  return (
    <View className="mb-6 px-1">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[10px] uppercase tracking-wider">
          Security Strength
        </Text>
        <Text 
          className="font-poppins-bold text-[10px] uppercase"
          style={{ color: getStrengthColor() }}
        >
          {getStrengthLabel()}
        </Text>
      </View>
      
      <View className="flex-row space-x-1 mb-3">
        {[1, 2, 3, 4].map((i) => (
          <View 
            key={i}
            className="h-1 flex-1 rounded-full bg-gray-200 dark:bg-white/10"
          >
            <MotiView
              animate={{ 
                width: i <= strengthCount ? '100%' : '0%',
                backgroundColor: getStrengthColor()
              }}
              transition={{ type: 'timing', duration: 300 }}
              className="h-full rounded-full"
            />
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {rules.map((rule, index) => (
          <View key={index} className="flex-row items-center mr-4 mb-1">
            <Ionicons 
              name={rule.met ? "checkmark-circle" : "ellipse-outline"} 
              size={12} 
              color={rule.met ? "#25D366" : "#8696A0"} 
              style={{ opacity: rule.met ? 1 : 0.4 }}
            />
            <Text className={`text-[10px] font-poppins-regular ml-1 ${rule.met ? 'text-textPrimary dark:text-darkTextPrimary' : 'text-textSecondary opacity-40'}`}>
              {rule.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
