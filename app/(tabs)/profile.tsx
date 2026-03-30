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
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View className="items-center pt-8 pb-10 px-6">
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <View className="w-32 h-32 rounded-[40px] bg-accent/10 items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
               {profile?.avatar_url ? (
                 <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
               ) : (
                 <Ionicons name="person" size={50} color="#25D366" />
               )}
            </View>
            <TouchableOpacity 
              className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-2xl items-center justify-center border-4 border-white shadow-lg"
              onPress={() => router.push('/(profile)/profile')}
            >
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </MotiView>

          <Text className="text-textPrimary font-poppins-black text-2xl mt-6">
            {profile?.full_name || 'Bingwa Farmer'}
          </Text>
          <Text className="text-textSecondary font-poppins-regular text-sm opacity-60">
            {profile?.email || 'farmer@bingwa.com'}
          </Text>

          {/* Location Info */}
          <View className="flex-row items-center mt-2 opacity-60">
            <Ionicons name="location-sharp" size={14} color="#8696A0" className="mr-1" />
            <Text className="text-textSecondary font-poppins-bold text-xs">
              {profile?.location ? `${profile.location}${profile.county ? `, ${profile.county}` : ''}` : 'Location not set'}
            </Text>
          </View>

          {/* New Profile Stats */}
          <View className="flex-row justify-around w-full mt-8 bg-white p-6 rounded-[32px] border border-black/5 shadow-sm">
            <View className="items-center flex-1">
                <Text className="text-accent font-poppins-black text-base text-center" numberOfLines={1}>
                  {profile?.farm_size ? profile.farm_size.split(' ')[0] : '-'}
                </Text>
                <Text className="text-textSecondary text-[10px] uppercase font-poppins-bold opacity-60">Size</Text>
            </View>
            <View className="h-10 w-[1px] bg-gray-100" />
            <View className="items-center flex-1">
                <Text className="text-accent font-poppins-black text-base text-center" numberOfLines={1}>
                  {profile?.primary_crops?.length || 0}
                </Text>
                <Text className="text-textSecondary text-[10px] uppercase font-poppins-bold opacity-60">Crops</Text>
            </View>
            <View className="h-10 w-[1px] bg-gray-100" />
            <View className="items-center flex-1">
                <Text className="text-accent font-poppins-black text-base text-center" numberOfLines={1}>
                  {profile?.country || '-'}
                </Text>
                <Text className="text-textSecondary text-[10px] uppercase font-poppins-bold opacity-60">Country</Text>
            </View>
          </View>

          <TouchableOpacity 
            className="mt-8 w-full h-20 bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden flex-row items-center px-6"
            onPress={() => router.push('/(modals)/payment-required')}
          >
            <View className="w-12 h-12 bg-accent/10 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="flash" size={24} color="#25D366" />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-poppins-black text-sm uppercase tracking-widest">Top Up Credits</Text>
              <Text className="text-textSecondary font-poppins-bold text-[10px] opacity-60">
                You have {profile?.scan_credits || 0} scans remaining
              </Text>
            </View>
            <View className="bg-accent px-4 py-2 rounded-xl">
               <Ionicons name="add" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <View className="flex-1 bg-white rounded-t-[40px] px-8 pt-10 pb-20 shadow-2xl shadow-black/5 border-t border-black/5">
           
           <Text className="text-textPrimary font-poppins-bold text-lg mb-6">Account Settings</Text>
           
           <View className="space-y-4">
              {menuItems.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  onPress={item.onPress}
                  className="flex-row items-center bg-[#F8F9FA] p-4 rounded-[24px] border border-black/5"
                >
                  <View style={{ backgroundColor: `${item.color}15` }} className="w-10 h-10 rounded-xl items-center justify-center mr-4">
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text className="flex-1 text-textPrimary font-poppins-bold text-sm">{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#8696A0" />
                </TouchableOpacity>
              ))}
           </View>

           <Text className="text-textPrimary font-poppins-bold text-lg mt-10 mb-6">Preferences</Text>

           <View className="space-y-4">
              <View className="flex-row items-center bg-[#F8F9FA] p-4 rounded-[24px] border border-black/5">
                <View className="bg-purple-500/10 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="notifications-outline" size={20} color="#8B5CF6" />
                </View>
                <Text className="flex-1 text-textPrimary font-poppins-bold text-sm">Notifications</Text>
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications} 
                  trackColor={{ false: '#D1D5DB', true: '#25D366' }}
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

           <Text className="text-center text-textSecondary font-poppins-regular text-[10px] mt-8 opacity-40 uppercase tracking-[4px]">
             Bingwa Shambani v1.0.0
           </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
