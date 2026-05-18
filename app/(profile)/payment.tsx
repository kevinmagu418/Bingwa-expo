import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { BingwaLoader } from '../../components/Loader';

interface PaymentRecord {
  id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  reference: string;
  created_at: string;
  phone_number: string;
}

const ORANGE = "#F4A261";

export default function PaymentScreen() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading && !refreshing) {
    return <BingwaLoader label="Accessing Ledger..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F5] dark:bg-darkBackground" edges={['top']}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />
        }
      >
        {/* Vibrant Header Section */}
        <View className="bg-white dark:bg-darkSurface rounded-b-[60px] px-8 pt-10 pb-16 shadow-2xl shadow-orange-900/5 relative overflow-hidden">
            <View className="absolute -right-10 -top-10 w-48 h-48 bg-orange-50 rounded-full" />
            
            <View className="flex-row items-center mb-10">
                <View className="bg-orange-100 p-2.5 rounded-xl mr-3">
                    <Ionicons name="card" size={18} color={ORANGE} />
                </View>
                <Text className="text-orange-400 font-poppins-black text-[10px] uppercase tracking-[4px]">Financial Records</Text>
            </View>

            <View className="flex-row justify-between items-end">
                <View>
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-4xl leading-tight">Payment</Text>
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-4xl leading-tight">History</Text>
                </View>
                <View className="w-20 h-20 bg-orange-400 rounded-3xl items-center justify-center shadow-xl shadow-orange-400/30">
                    <Ionicons name="receipt" size={32} color="white" />
                </View>
            </View>
        </View>

        <View className="px-8 -mt-8">
            {/* Total Spent Summary Card (Mock or calculated) */}
            <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#121B22] p-8 rounded-[40px] shadow-xl mb-10 relative overflow-hidden"
            >
                <LinearGradient
                    colors={['rgba(244, 162, 97, 0.2)', 'transparent']}
                    className="absolute inset-0"
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-white/40 font-poppins-bold text-[9px] uppercase tracking-[3px] mb-2">Total Investment</Text>
                        <Text className="text-white font-poppins-black text-3xl">
                            {payments.filter(p => p.status === 'success').reduce((acc, p) => acc + p.amount, 0).toLocaleString()} <Text className="text-orange-400 text-xl">KSH</Text>
                        </Text>
                    </View>
                    <View className="bg-white/10 p-4 rounded-2xl">
                        <Ionicons name="trending-up" size={24} color="#F4A261" />
                    </View>
                </View>
            </MotiView>

            <View className="flex-row items-center mb-6 px-1">
                <View className="w-1.5 h-6 bg-orange-400 rounded-full mr-3" />
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-xl">Transactions</Text>
            </View>

            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <MotiView
                  key={payment.id}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 200 + index * 100 }}
                  className="bg-white dark:bg-darkSurface p-6 rounded-[36px] mb-5 border border-orange-50 dark:border-white/5 shadow-sm"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-14 h-14 rounded-2xl items-center justify-center ${
                        payment.status === 'success' ? 'bg-green-50' : 
                        payment.status === 'failed' ? 'bg-red-50' : 'bg-orange-50'
                      }`}>
                        <Ionicons 
                          name={payment.status === 'success' ? "checkmark-circle" : payment.status === 'failed' ? "close-circle" : "time"} 
                          size={28} 
                          color={payment.status === 'success' ? "#25D366" : payment.status === 'failed' ? "#EF4444" : "#F4A261"} 
                        />
                      </View>
                      <View className="ml-5 flex-1">
                        <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-lg leading-tight">
                          {payment.amount} <Text className="text-[10px] text-textSecondary uppercase">KSH</Text>
                        </Text>
                        <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-bold text-[9px] uppercase tracking-widest opacity-40 mt-1">
                          {new Date(payment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                        <View className={`px-3 py-1.5 rounded-xl border ${
                            payment.status === 'success' ? 'bg-green-50 border-green-100' : 
                            payment.status === 'failed' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
                        }`}>
                            <Text className={`font-poppins-black text-[8px] uppercase tracking-widest ${
                                payment.status === 'success' ? 'text-green-600' : 
                                payment.status === 'failed' ? 'text-red-600' : 'text-orange-500'
                            }`}>
                                {payment.status}
                            </Text>
                        </View>
                        <Text className="text-[8px] font-poppins-bold text-textSecondary opacity-30 mt-2">
                            {payment.phone_number}
                        </Text>
                    </View>
                  </View>
                  
                  {payment.reference && (
                     <View className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex-row justify-between items-center">
                        <Text className="text-[8px] font-poppins-black text-textSecondary opacity-30 uppercase tracking-[2px]">Ref ID</Text>
                        <Text className="text-[9px] font-poppins-bold text-textSecondary opacity-60">
                            {payment.reference}
                        </Text>
                     </View>
                  )}
                </MotiView>
              ))
            ) : (
              <View className="items-center justify-center py-20 bg-white dark:bg-darkSurface rounded-[40px] border border-orange-50 border-dashed">
                <View className="bg-orange-50 w-20 h-20 rounded-full items-center justify-center mb-6">
                    <Ionicons name="receipt-outline" size={32} color={ORANGE} opacity={0.5} />
                </View>
                <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-sm">No Transactions</Text>
                <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs opacity-40 mt-2 text-center px-10">
                    Your digital ledger is empty. Start your first payment to see it here.
                </Text>
              </View>
            )}
        </View>
        
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
