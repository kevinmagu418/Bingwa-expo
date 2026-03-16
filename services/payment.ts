import { supabase } from '../lib/supabase';

export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  reference?: string;
  error?: string;
}

export const initiatePayment = async (phoneNumber: string, amount: number): Promise<PaymentInitiationResponse> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('payhero-stk-push', {
      body: {
        phoneNumber: phoneNumber.startsWith('0') ? `254${phoneNumber.substring(1)}` : phoneNumber,
        amount: amount,
      },
    });

    if (error) throw error;

    return {
      success: data.success,
      message: data.message,
      reference: data.reference,
    };
  } catch (err: any) {
    console.error('Payment initiation error:', err);
    return {
      success: false,
      message: 'Failed to initiate payment',
      error: err.message,
    };
  }
};

export const checkPaymentStatus = async (reference: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('status')
      .eq('reference', reference)
      .single();

    if (error) throw error;
    return data.status;
  } catch (err) {
    console.error('Check payment status error:', err);
    return 'pending';
  }
};
