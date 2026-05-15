import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Alert, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../hooks/useProfile';
import { useScans } from '../../hooks/useScans';
import { useTheme } from '../../context/ThemeContext';
import { BingwaLoader } from '../../components/Loader';

export default function ProfileTab() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { scans } = useScans();
  const { theme, isDark, setTheme } = useTheme();
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
    { id: 1, label: 'Personal Information', icon: 'person-outline', color: '#3A86FF', onPress: () => router.push('/(profile)/profile') },
    { id: 2, label: 'Payment Methods', icon: 'card-outline', color: '#25D366', onPress: () => router.push('/(profile)/payment') },
    { id: 3, label: 'Help & Support', icon: 'help-buoy-outline', color: '#FFBE0B', onPress: () => router.push('/(profile)/about') },
  ];

  const computeStats = () => {
    if (!scans || scans.length === 0) return null;
    const totalConfidence = scans.reduce((sum, s) => sum + (s.confidence_score || 0), 0);
    const avgConfidence = totalConfidence / scans.length;
    const counts = scans.reduce((acc, s) => {
        acc[s.severity || 'low']++;
        return acc;
    }, { low: 0, medium: 0, high: 0 });
    return { avgConfidence, counts };
  };

  const stats = computeStats();
  const chartConfig = {
    backgroundGradientFrom: isDark ? '#121B22' : '#FFFFFF',
    backgroundGradientTo: isDark ? '#121B22' : '#FFFFFF',
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
  };

  const pieData = stats ? [
    { name: 'Low', population: stats.counts.low, color: '#25D366', legendFontColor: isDark ? '#FFF' : '#000', legendFontSize: 12 },
    { name: 'Medium', population: stats.counts.medium, color: '#F59E0B', legendFontColor: isDark ? '#FFF' : '#000', legendFontSize: 12 },
    { name: 'High', population: stats.counts.high, color: '#EF4444', legendFontColor: isDark ? '#FFF' : '#000', legendFontSize: 12 },
  ] : [];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-darkBackground" edges={['top']} pointerEvents="box-none">
      <ScrollView className="flex-1" pointerEvents="auto" showsVerticalScrollIndicator={false}>
        
        <View className="items-center pt-8 pb-10 px-6">
          <MotiView from={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <View className="w-32 h-32 rounded-[40px] bg-accent/10 items-center justify-center border-4 border-white dark:border-darkSurface shadow-2xl overflow-hidden">
               {profile?.avatar_url ? <Image source={{ uri: profile.avatar_url }} className="w-full h-full" /> : <Ionicons name="person" size={50} color="#25D366" />}
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-2xl items-center justify-center border-4 border-white dark:border-darkSurface shadow-lg" onPress={() => router.push('/(profile)/profile')}>
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </MotiView>

          <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-2xl mt-6">{profile?.full_name || 'Bingwa Farmer'}</Text>
          <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm opacity-60">{profile?.email || 'farmer@bingwa.com'}</Text>
          
          <View className="flex-row items-center mt-2 opacity-60">
            <Ionicons name="location-sharp" size={14} color={isDark ? "#8696A0" : "#54656F"} className="mr-1" />
            <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-xs">
              {profile?.location ? `${profile.location}${profile.county ? `, ${profile.county}` : ''}` : 'Location not set'}
            </Text>
          </View>

          {/* Modernized Analytics Dashboard */}
          {stats && (
            <View className="w-full mt-8 px-6">
              <View className="bg-white dark:bg-darkSurface p-8 rounded-[40px] border border-black/5 dark:border-white/5 shadow-2xl">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg">AI Performance</Text>
                    <View className="bg-accent/10 px-4 py-1.5 rounded-full">
                        <Text className="text-accent font-poppins-bold text-[10px] uppercase tracking-wider">Live Metrics</Text>
                    </View>
                </View>

                {/* Custom Severity Bar */}
                <View className="h-6 w-full rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex-row">
                    <View style={{ flex: stats.counts.low, backgroundColor: '#25D366' }} />
                    <View style={{ flex: stats.counts.medium, backgroundColor: '#F59E0B' }} />
                    <View style={{ flex: stats.counts.high, backgroundColor: '#EF4444' }} />
                </View>

                <View className="flex-row justify-between mt-4">
                    {[
                        { label: 'Low', color: '#25D366', val: stats.counts.low },
                        { label: 'Medium', color: '#F59E0B', val: stats.counts.medium },
                        { label: 'High', color: '#EF4444', val: stats.counts.high }
                    ].map((item) => (
                        <View key={item.label} className="items-center">
                            <View className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">{item.val}</Text>
                            <Text className="text-textSecondary text-[9px] uppercase font-poppins-regular">{item.label}</Text>
                        </View>
                    ))}
                </View>

                <View className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex-row items-end justify-between">
                    <View>
                        <Text className="text-textSecondary text-[11px] font-poppins-regular mb-1 uppercase tracking-widest">Confidence Score</Text>
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">{(stats.avgConfidence * 100).toFixed(1)}%</Text>
                    </View>
                    <View className="bg-accent/10 p-4 rounded-2xl">
                        <Ionicons name="trending-up" size={24} color="#25D366" />
                    </View>
                </View>
              </View>
            </View>
          )}

          {/* Modern Profile Stats Grid */}
          <View className="flex-row justify-between w-full mt-6 px-6">
            <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 mr-2 p-6 rounded-[32px] items-center shadow-lg"
            >
                <Text className="text-white font-poppins-black text-2xl">{profile?.farm_size || '0'}</Text>
                <Text className="text-white/80 text-[10px] uppercase font-poppins-bold tracking-wider mt-1">Total Acres</Text>
            </LinearGradient>
            
            <LinearGradient
                colors={isDark ? ['#1B4332', '#0B141A'] : ['#ffffff', '#f8f9fa']}
                className="flex-1 ml-2 p-6 rounded-[32px] items-center shadow-sm border border-black/5 dark:border-white/10"
            >
                <Text className="text-accent font-poppins-black text-2xl">{profile?.primary_crops?.length || 0}</Text>
                <Text className="text-textSecondary dark:text-darkTextSecondary text-[10px] uppercase font-poppins-bold tracking-wider mt-1">Crops Managed</Text>
            </LinearGradient>
          </View>

          {/* Elegant Account Details List */}
          <View className="w-full mt-6 px-6">
             <View className="bg-white dark:bg-darkSurface p-8 rounded-[40px] border border-black/5 dark:border-white/5 shadow-2xl">
                <View className="flex-row items-center justify-between mb-8">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg">Account Profile</Text>
                    <Ionicons name="shield-checkmark" size={20} color="#25D366" />
                </View>
                
                {[
                    { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at as any).getFullYear() : '2026' },
                    { label: 'Primary Crops', value: profile?.primary_crops?.join(', ') || 'Not specified' },
                    { label: 'Account Status', value: (profile?.scan_credits ?? 0) > 0 ? 'Active Farmer' : 'Limited' }
                ].map((row, i) => (
                    <View key={i} className="flex-row items-center justify-between py-4 border-b border-black/5 dark:border-white/5 last:border-0 last:pb-0">
                        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-sm">{row.label}</Text>
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm max-w-[50%] text-right">{row.value}</Text>
                    </View>
                ))}
             </View>
          </View>
        </View>

        <View className="flex-1 bg-[#F8F9FA] dark:bg-darkMuted rounded-t-[40px] px-8 pt-10 pb-20 shadow-2xl shadow-black/5 border-t border-black/5 dark:border-white/5">
           <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg mb-6">Account Settings</Text>
           <View className="space-y-4">
              {menuItems.map((item) => (
                <TouchableOpacity key={item.id} onPress={item.onPress} className="flex-row items-center bg-white dark:bg-darkSurface p-4 rounded-[24px] border border-black/5 dark:border-white/5">
                  <View style={{ backgroundColor: `${item.color}15` }} className="w-10 h-10 rounded-xl items-center justify-center mr-4"><Ionicons name={item.icon as any} size={20} color={item.color} /></View>
                  <Text className="flex-1 text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={isDark ? "#8696A0" : "#54656F"} />
                </TouchableOpacity>
              ))}
           </View>

           <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-lg mt-10 mb-6">Preferences</Text>
           <View className="space-y-4">
              <View className="flex-row items-center bg-white dark:bg-darkSurface p-4 rounded-[24px] border border-black/5 dark:border-white/5">
                <View className="bg-purple-500/10 w-10 h-10 rounded-xl items-center justify-center mr-4"><Ionicons name="notifications-outline" size={20} color="#8B5CF6" /></View>
                <Text className="flex-1 text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">Notifications</Text>
                <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#D1D5DB', true: '#25D366' }} thumbColor="#FFFFFF" />
              </View>
              <View className="flex-row items-center bg-white dark:bg-darkSurface p-4 rounded-[24px] border border-black/5 dark:border-white/5">
                <View className="bg-orange-500/10 w-10 h-10 rounded-xl items-center justify-center mr-4"><Ionicons name={isDark ? "moon" : "sunny"} size={20} color="#F59E0B" /></View>
                <View className="flex-1">
                  <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">Appearance</Text>
                  <Text className="text-textSecondary dark:text-darkTextSecondary text-[10px] font-poppins-regular opacity-60">Currently: {theme.charAt(0).toUpperCase() + theme.slice(1)}</Text>
                </View>
                <View className="flex-row bg-[#F8F9FA] dark:bg-darkBackground p-1 rounded-2xl border border-black/5 dark:border-white/5">
                   <TouchableOpacity onPress={() => setTheme('light')} className={`w-10 h-10 rounded-xl items-center justify-center ${theme === 'light' ? 'bg-white shadow-sm' : ''}`}><Ionicons name="sunny-outline" size={18} color={theme === 'light' ? "#F59E0B" : "#8696A0"} /></TouchableOpacity>
                   <TouchableOpacity onPress={() => setTheme('dark')} className={`w-10 h-10 rounded-xl items-center justify-center ${theme === 'dark' ? 'bg-darkSurface shadow-sm' : ''}`}><Ionicons name="moon-outline" size={18} color={theme === 'dark' ? "#3A86FF" : "#8696A0"} /></TouchableOpacity>
                   <TouchableOpacity onPress={() => setTheme('system')} className={`w-10 h-10 rounded-xl items-center justify-center ${theme === 'system' ? (isDark ? 'bg-darkSurface shadow-sm' : 'bg-white shadow-sm') : ''}`}><Ionicons name="settings-outline" size={18} color="#8696A0" /></TouchableOpacity>
                </View>
              </View>
           </View>
           <TouchableOpacity onPress={handleLogout} className="mt-12 h-16 rounded-[24px] border border-red-500/20 items-center justify-center flex-row active:bg-red-50">
             <Ionicons name="log-out-outline" size={20} color="#D64545" className="mr-2" />
             <Text className="text-[#D64545] font-poppins-black text-sm uppercase tracking-widest">Logout</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
