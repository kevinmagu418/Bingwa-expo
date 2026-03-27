import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
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
    return <BingwaLoader label="Fetching transactions..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] dark:bg-darkBackground" edges={['top']}>
      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#25D366" />
        }
      >
        <View className="py-6">
          <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-xs uppercase tracking-widest">
            Transaction History
          </Text>
          <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-black text-3xl">
            Payments
          </Text>
        </View>

        {payments.length > 0 ? (
          payments.map((payment, index) => (
            <MotiView
              key={payment.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
              className="bg-white dark:bg-darkSurface p-5 rounded-[28px] mb-4 border border-black/5 dark:border-white/5 shadow-sm"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    payment.status === 'success' ? 'bg-accent/10' : 
                    payment.status === 'failed' ? 'bg-red-500/10' : 'bg-orange-500/10'
                  }`}>
                    <Ionicons 
                      name={payment.status === 'success' ? "checkmark-circle" : payment.status === 'failed' ? "close-circle" : "time"} 
                      size={24} 
                      color={payment.status === 'success' ? "#25D366" : payment.status === 'failed' ? "#D64545" : "#F4A261"} 
                    />
                  </View>
                  <View className="ml-4">
                    <Text className="text-textPrimary dark:text-darkTextPrimary font-poppins-bold text-base">
                      {payment.amount} KSH
                    </Text>
                    <Text className="text-textSecondary dark:text-darkTextSecondary font-poppins-regular text-[10px] opacity-60">
                      {new Date(payment.created_at).toLocaleDateString()} • {payment.phone_number}
                    </Text>
                  </View>
                </View>

                <View className={`px-3 py-1 rounded-full ${
                  payment.status === 'success' ? 'bg-accent/10 border border-accent/20' : 
                  payment.status === 'failed' ? 'bg-red-500/10 border border-red-500/20' : 'bg-orange-500/10 border border-orange-500/20'
                }`}>
                  <Text className={`font-poppins-black text-[8px] uppercase ${
                    payment.status === 'success' ? 'text-accent' : 
                    payment.status === 'failed' ? 'text-red-500' : 'text-orange-500'
                  }`}>
                    {payment.status}
                  </Text>
                </View>
              </View>
              
              {payment.reference && (
                 <Text className="text-[9px] font-poppins-medium text-textSecondary opacity-40 mt-3 text-right">
                    Ref: {payment.reference}
                 </Text>
              )}
            </MotiView>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="receipt-outline" size={64} color="#8696A0" opacity={0.3} />
            <Text className="text-textSecondary font-poppins-medium text-sm mt-4">No transactions found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
