import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../hooks/useProfile';

import { BingwaLoader } from '../../components/Loader';

export default function ProfileTab() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  if (loading) {
    return <BingwaLoader label="Preparing Profile..." />;
  }

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        router.replace('/(auth)/login');
      } catch (error: any) {
        Alert.alert("Error", error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to log out?")) {
        performLogout();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: performLogout }
        ]
      );
    }
  };

  const menuItems = [
    { 
      id: 1, 
      label: 'Personal Information', 
      icon: 'person-outline', 
      color: '#3A86FF', 
      onPress: () => router.push('/(profile)/profile') 
    },
    { 
      id: 2, 
      label: 'Payment Methods', 
      icon: 'card-outline', 
      color: '#25D366', 
      onPress: () => router.push('/(profile)/payment') 
    },
    { 
      id: 3, 
      label: 'Help & Support', 
      icon: 'help-buoy-outline', 
      color: '#FFBE0B', 
      onPress: () => router.push('/(profile)/about') 
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View className="items-center pt-8 pb-10 px-6">
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <View className="w-32 h-32 rounded-[40px] bg-accent/10 items-center justify-center border-4 border-white dark:border-darkSurface shadow-2xl overflow-hidden">
               {profile?.avatar_url ? (
                 <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
               ) : (
                 <Ionicons name="person" size={50} color="#25D366" />
               )}
            </View>
            <TouchableOpacity 
              className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-2xl items-center justify-center border-4 border-white dark:border-darkSurface shadow-lg"
              onPress={() => router.push('/(profile)/profile')}
            >
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </MotiView>

          <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl mt-6">
            {profile?.full_name || 'Bingwa Farmer'}
          </Text>
          <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm opacity-60">
            {profile?.email || 'farmer@bingwa.com'}
          </Text>

          <TouchableOpacity 
            className="mt-6 px-10 h-14 rounded-[24px] overflow-hidden shadow-2xl shadow-accent/30"
            onPress={() => router.push('/(modals)/payment-required')}
          >
            <LinearGradient
              colors={['#25D366', '#128C7E']}
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }}
              className="flex-1 items-center justify-center flex-row px-8"
            >
              <Ionicons name="flash" size={18} color="white" className="mr-3" />
              <View>
                <Text className="text-white font-poppins-black text-xs uppercase tracking-widest">Top Up Credits</Text>
                <Text className="text-white/70 font-poppins-bold text-[8px] uppercase tracking-tighter">Current: {profile?.scan_credits || 0} Scans</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <View className="flex-1 bg-white dark:bg-darkSurface rounded-t-[40px] px-8 pt-10 pb-20 shadow-2xl shadow-black/5 border-t border-black/5 dark:border-white/5">
           
           <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg mb-6">Account Settings</Text>
           
           <View className="space-y-4">
              {menuItems.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  onPress={item.onPress}
                  className="flex-row items-center bg-[#F8F9FA] dark:bg-white/5 p-4 rounded-[24px] border border-black/5 dark:border-white/5"
                >
                  <View style={{ backgroundColor: `${item.color}15` }} className="w-10 h-10 rounded-xl items-center justify-center mr-4">
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text className="flex-1 text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#8696A0" />
                </TouchableOpacity>
              ))}
           </View>

           <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg mt-10 mb-6">Preferences</Text>

           <View className="space-y-4">
              <View className="flex-row items-center bg-[#F8F9FA] dark:bg-white/5 p-4 rounded-[24px] border border-black/5 dark:border-white/5">
                <View className="bg-purple-500/10 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="notifications-outline" size={20} color="#8B5CF6" />
                </View>
                <Text className="flex-1 text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">Notifications</Text>
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications} 
                  trackColor={{ false: '#D1D5DB', true: '#25D366' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View className="flex-row items-center bg-[#F8F9FA] dark:bg-white/5 p-4 rounded-[24px] border border-black/5 dark:border-white/5">
                <View className="bg-blue-500/10 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="moon-outline" size={20} color="#3B82F6" />
                </View>
                <Text className="flex-1 text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">Dark Mode</Text>
                <Switch 
                  value={darkMode} 
                  onValueChange={setDarkMode} 
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
           </View>

           {/* Logout Button */}
           <TouchableOpacity 
             onPress={handleLogout}
             className="mt-12 h-16 rounded-[24px] border border-red-500/20 items-center justify-center flex-row active:bg-red-50"
           >
             <Ionicons name="log-out-outline" size={20} color="#D64545" className="mr-2" />
             <Text className="text-[#D64545] font-poppins-black text-sm uppercase tracking-widest">Logout</Text>
           </TouchableOpacity>

           <Text className="text-center text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px] mt-8 opacity-40 uppercase tracking-[4px]">
             Bingwa Shambani v1.0.0
           </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
