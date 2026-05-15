import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const TabFooter = () => {
    const { isDark } = useTheme();
    const currentYear = new Date().getFullYear();
    
    // Graphite / Pencil Black
    const pencilColor = isDark ? "#A3A3A3" : "#333333";
    
    return (
        <View className="py-8 items-center justify-center">
            {/* Leaf Divider */}
            <View className="flex-row items-center justify-center mb-4">
                <View style={{ backgroundColor: pencilColor, height: 1.5 }} className="w-8 rounded-full" />
                <Ionicons name="leaf" size={14} color="#25D366" style={{ marginHorizontal: 10 }} />
                <View style={{ backgroundColor: pencilColor, height: 1.5 }} className="w-8 rounded-full" />
            </View>

            <View className="items-center">
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-semibold text-[11px] mb-2">
                    support@bingwa.com
                </Text>
                <Text style={{ color: pencilColor }} className="font-poppins-black text-[10px] uppercase tracking-widest">
                    © {currentYear} BINGWA SHAMBANI
                </Text>
            </View>
        </View>
    );
};
