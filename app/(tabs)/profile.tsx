import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform, Dimensions } from 'react-native';
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
import { BingwaAvatar } from '../../components/BingwaAvatar';
import { BingwaLoader } from '../../components/Loader';
import { TabFooter } from '../../components/TabFooter';
import { useFeedback } from '../../context/FeedbackContext';

export default function ProfileTab() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { scans } = useScans();
  const { theme, isDark, setTheme } = useTheme();
  const { showError, showAlert } = useFeedback();
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
        showError("Error", error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to log out?")) {
        performLogout();
      }
    } else {
      showAlert({
        type: 'warning',
        title: "Logout",
        message: "Are you sure you want to log out?",
        buttons: [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: performLogout }
        ]
      });
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
        
        <View className="items-center pt-10 pb-12 px-8">
          {/* Main Profile Header */}
          <MotiView 
            from={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative items-center mb-8"
          >
            <View className="relative">
               <BingwaAvatar size={120} borderWidth={4} />
               <TouchableOpacity 
                 onPress={() => router.push('/(profile)/profile')}
                 className="absolute bottom-0 right-0 w-12 h-12 bg-accent rounded-3xl items-center justify-center border-4 border-white dark:border-darkBackground shadow-xl active:scale-90"
               >
                 <Ionicons name="camera" size={20} color="white" />
               </TouchableOpacity>
            </View>
            
            <View className="items-center mt-6">
              <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl tracking-tight">
                {profile?.full_name?.split(' ')[0] || 'Farmer'} 
                <Text className="text-accent"> {profile?.full_name?.split(' ')[1] || 'Bingwa'}</Text>
              </Text>
              <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-medium text-xs opacity-50 mt-1">
                {profile?.email || 'farmer@bingwa.com'}
              </Text>
            </View>
          </MotiView>

          {/* Farm Intelligence Card - Forced Dark Theme Persistence */}
          <View className="w-full mb-8" style={{ backgroundColor: '#121B22', borderRadius: 48, overflow: 'hidden' }}>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
            >
              <LinearGradient
                colors={['rgba(244, 162, 97, 0.2)', 'transparent']}
                className="absolute inset-0"
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              
              <View className="p-8">
                <View className="flex-row items-center justify-between mb-8">
                  <View>
                    <Text style={{ color: '#F4A261', fontFamily: 'Poppins_900Black', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' }}>Farm Intelligence</Text>
                    <Text style={{ color: '#FFFFFF', fontFamily: 'Poppins_900Black', fontSize: 20, marginTop: 4 }}>Status Overview</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.2)' }}>
                    <Text style={{ color: '#F4A261', fontFamily: 'Poppins_900Black', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>Premium Log</Text>
                  </View>
                </View>

                {/* Creative Acreage Display */}
                <View className="flex-row items-center justify-between mb-8">
                  <View className="flex-1 flex-row items-center">
                    <View style={{ width: 80, height: 80, backgroundColor: '#F4A261', borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                       <Ionicons name="map" size={32} color="white" />
                    </View>
                    <View className="ml-5">
                      <Text style={{ color: '#FFFFFF', fontFamily: 'Poppins_900Black', fontSize: 36, lineHeight: 36 }}>{profile?.farm_size?.split(' ')[0] || '0'}</Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 2, marginTop: 8 }}>Total Acres</Text>
                    </View>
                  </View>
                  
                  <View style={{ width: 1, height: 48, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginHorizontal: 16 }} />

                  <View className="flex-1 items-end">
                    <Text style={{ color: '#F4A261', fontFamily: 'Poppins_900Black', fontSize: 36, lineHeight: 36 }}>{profile?.primary_crops?.length || 0}</Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 2, marginTop: 8 }}>Varieties</Text>
                  </View>
                </View>

                {/* Scale of Operation */}
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
                   <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 3, marginBottom: 4 }}>SCALE OF OPERATION</Text>
                   <Text style={{ color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 14 }}>{profile?.farm_size || 'Not Specified'}</Text>
                </View>

                {/* Crop Tags */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
                  {profile?.primary_crops?.map((crop, idx) => (
                    <View key={idx} style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 }}>
                      <Text style={{ color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>{crop}</Text>
                    </View>
                  )) || (
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'Poppins_500Medium', fontSize: 12, fontStyle: 'italic' }}>No crops registered yet.</Text>
                  )}
                </View>

                {/* Location */}
                <View style={{ marginTop: 8, paddingTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 3, marginBottom: 4 }}>PRIMARY LOCATION</Text>
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 14 }}>
                    {profile?.location ? `${profile.location}, ${profile.county || ''}` : 'Location Not Set'}
                  </Text>
                </View>
              </View>
            </MotiView>
          </View>

          {/* Refined AI Performance Dashboard */}
          {stats && (
            <View className="w-full mb-10">
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 200 }}
                className="bg-white dark:bg-darkSurface p-8 rounded-[48px] border border-black/5 dark:border-white/5 shadow-xl"
              >
                <View className="flex-row items-center justify-between mb-8">
                    <View>
                        <Text className="text-accent font-poppins-black text-[10px] uppercase tracking-[4px]">Data Analytics</Text>
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl mt-1">AI Performance</Text>
                    </View>
                    <View className="bg-accent/10 px-4 py-1.5 rounded-full border border-accent/10">
                        <Text className="text-accent font-poppins-black text-[9px] uppercase tracking-widest">Live</Text>
                    </View>
                </View>

                {/* Custom Severity Bar - More Modern */}
                <View className="mb-8">
                    <View className="h-4 w-full rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex-row">
                        <View style={{ flex: stats.counts.low || 1, backgroundColor: '#25D366' }} />
                        <View style={{ flex: stats.counts.medium || 1, backgroundColor: '#F4A261' }} />
                        <View style={{ flex: stats.counts.high || 1, backgroundColor: '#EF4444' }} />
                    </View>
                    <View className="flex-row justify-between mt-4">
                        {[
                            { label: 'Stable', color: '#25D366', val: stats.counts.low },
                            { label: 'Warning', color: '#F4A261', val: stats.counts.medium },
                            { label: 'Critical', color: '#EF4444', val: stats.counts.high }
                        ].map((item) => (
                            <View key={item.label} className="items-center">
                                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg">{item.val}</Text>
                                <View className="flex-row items-center">
                                    <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                                    <Text className="text-textSecondary text-[8px] uppercase font-poppins-bold tracking-widest opacity-40">{item.label}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="pt-8 border-t border-black/5 dark:border-white/5 flex-row items-center justify-between">
                    <View>
                        <Text className="text-textSecondary dark:text-darkTextSecondary text-[9px] font-poppins-black mb-1 uppercase tracking-[3px] opacity-40">Precision Index</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-4xl">{(stats.avgConfidence * 100).toFixed(0)}</Text>
                            <Text className="text-accent font-poppins-black text-xl ml-1">%</Text>
                        </View>
                    </View>
                    <View className="bg-accent w-16 h-16 rounded-3xl items-center justify-center shadow-lg shadow-accent/30">
                        <Ionicons name="stats-chart" size={28} color="white" />
                    </View>
                </View>
              </MotiView>
            </View>
          )}
        </View>

        <View className="px-8 pb-12">
           <View className="mb-10">
             <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl mb-6 ml-2">Core Settings</Text>
             <View className="bg-white dark:bg-darkSurface rounded-[40px] border border-black/5 dark:border-white/5 shadow-xl overflow-hidden">
                {menuItems.map((item, index) => (
                  <TouchableOpacity key={item.id} onPress={item.onPress} className={`flex-row items-center p-6 ${index !== menuItems.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''} active:bg-black/5 dark:active:bg-white/5`}>
                    <View style={{ backgroundColor: `${item.color}15` }} className="w-12 h-12 rounded-2xl items-center justify-center mr-5">
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    <Text className="flex-1 text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm tracking-tight">{item.label}</Text>
                    <View className="bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                      <Ionicons name="chevron-forward" size={16} color={isDark ? "#8696A0" : "#D1D5DB"} />
                    </View>
                  </TouchableOpacity>
                ))}
             </View>
           </View>

           <View className="mb-10">
             <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl mb-6 ml-2">App Experience</Text>
             <View className="bg-white dark:bg-darkSurface rounded-[40px] border border-black/5 dark:border-white/5 shadow-xl overflow-hidden">
                <View className="flex-row items-center p-6 border-b border-black/5 dark:border-white/5">
                  <View className="bg-purple-500/10 w-12 h-12 rounded-2xl items-center justify-center mr-5">
                    <Ionicons name="notifications" size={22} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">Notifications</Text>
                    <Text className="text-textSecondary dark:text-darkTextSecondary text-[10px] font-poppins-medium opacity-40">System alerts & scan updates</Text>
                  </View>
                  <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#E5E7EB', true: '#25D366' }} thumbColor="#FFFFFF" ios_backgroundColor="#E5E7EB" />
                </View>

                <View className="p-6">
                  <View className="flex-row items-center mb-6">
                    <View className="bg-orange-500/10 w-12 h-12 rounded-2xl items-center justify-center mr-5">
                      <Ionicons name={isDark ? "moon" : "sunny"} size={22} color="#F59E0B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-sm">Theme Mode</Text>
                      <Text className="text-textSecondary dark:text-darkTextSecondary text-[10px] font-poppins-medium opacity-40">Currently: {theme.charAt(0).toUpperCase() + theme.slice(1)}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row bg-gray-50 dark:bg-black/20 p-2 rounded-[28px] border border-black/5 dark:border-white/5">
                     <TouchableOpacity onPress={() => setTheme('light')} className={`flex-1 h-12 rounded-[20px] items-center justify-center flex-row ${theme === 'light' ? 'bg-white shadow-md shadow-black/5' : ''}`}>
                        <Ionicons name="sunny" size={16} color={theme === 'light' ? "#F59E0B" : "#8696A0"} />
                        {theme === 'light' && <Text className="ml-2 font-poppins-bold text-[10px] text-orange-500">Light</Text>}
                     </TouchableOpacity>
                     <TouchableOpacity onPress={() => setTheme('dark')} className={`flex-1 h-12 rounded-[20px] items-center justify-center flex-row ${theme === 'dark' ? 'bg-darkSurface shadow-md shadow-white/5' : ''}`}>
                        <Ionicons name="moon" size={16} color={theme === 'dark' ? "#3A86FF" : "#8696A0"} />
                        {theme === 'dark' && <Text className="ml-2 font-poppins-bold text-[10px] text-blue-400">Dark</Text>}
                     </TouchableOpacity>
                     <TouchableOpacity onPress={() => setTheme('system')} className={`flex-1 h-12 rounded-[20px] items-center justify-center flex-row ${theme === 'system' ? (isDark ? 'bg-darkSurface shadow-md' : 'bg-white shadow-md') : ''}`}>
                        <Ionicons name="settings-outline" size={16} color="#8696A0" />
                        {theme === 'system' && <Text className="ml-2 font-poppins-bold text-[10px] text-gray-500">Auto</Text>}
                     </TouchableOpacity>
                  </View>
                </View>
             </View>
           </View>

           <TouchableOpacity 
             onPress={handleLogout} 
             className="h-16 rounded-[28px] bg-red-500/10 items-center justify-center flex-row active:bg-red-500/20 border border-red-500/10"
           >
             <Ionicons name="log-out" size={22} color="#EF4444" className="mr-3" />
             <Text className="text-red-500 font-poppins-black text-xs uppercase tracking-[3px]">Secure Sign Out</Text>
           </TouchableOpacity>
        </View>
        <TabFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
