import { supabase } from '../lib/supabase';

export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  reference?: string;
  error?: string;
}

export const initiatePayment = async (phoneNumber: string, amount: number): Promise<PaymentInitiationResponse> => {
  try {
    console.log('Initiating payment for:', phoneNumber, 'Amount:', amount);
    
    // Ensure phone number is in 254... format
    let formattedPhone = phoneNumber.trim().replace(/[^0-9]/g, '');
    
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.substring(1)}`;
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      if (formattedPhone.length === 9) {
        formattedPhone = `254${formattedPhone}`;
      }
    } else if (formattedPhone.startsWith('254') && formattedPhone.length === 12) {
      // Already correct
    }

    console.log('Formatted Phone for Payhero:', formattedPhone);

    const { data, error } = await supabase.functions.invoke('payhero-stk-push', {
      body: {
        phoneNumber: formattedPhone,
        amount: amount,
      },
    });

    if (error) {
      console.error('Supabase function invocation error:', error);
      // In Supabase FunctionsHttpError, the context might contain the body
      let errorMessage = error.message;
      try {
        if (error.context && typeof error.context.json === 'function') {
           const details = await error.context.json();
           errorMessage = details.details || details.error || details.message || error.message;
        }
      } catch (e) {
        console.log('Could not parse error details:', e);
      }
      throw new Error(errorMessage);
    }

    console.log('Response from edge function:', data);

    return {
      success: data.success,
      message: data.message || 'STK Push initiated successfully',
      reference: data.reference,
    };
  } catch (err: any) {
    console.error('Full payment initiation error:', err);
    return {
      success: false,
      message: err.message || 'Failed to initiate payment',
      error: err.toString(),
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
