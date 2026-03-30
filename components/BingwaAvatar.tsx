import React from 'react';
import { View, Image, Text, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { useProfile } from '../hooks/useProfile';

interface BingwaAvatarProps {
  size?: number;
  borderWidth?: number;
  borderColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  colors?: [string, string, ...string[]];
}

export const BingwaAvatar: React.FC<BingwaAvatarProps> = ({ 
  size = 40, 
  borderWidth = 2, 
  borderColor = '#FFFFFF',
  onPress,
  style,
  colors = ['#25D366', '#128C7E']
}) => {
  const router = useRouter();
  const { profile } = useProfile();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  const borderRadius = size * 0.4; // Thematic rounded square look

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.8}
      style={style}
    >
      <MotiView
        from={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: borderRadius,
          borderWidth: borderWidth,
          borderColor: borderColor,
          backgroundColor: '#F0F0F0',
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
      >
        {profile?.avatar_url ? (
          <Image 
            source={{ uri: profile.avatar_url }} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={colors}
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ 
              color: 'white', 
              fontSize: size * 0.4, 
              fontFamily: 'Poppins_900Black' 
            }}>
              {profile?.full_name?.charAt(0) || 'B'}
            </Text>
          </LinearGradient>
        )}
      </MotiView>
    </TouchableOpacity>
  );
};
