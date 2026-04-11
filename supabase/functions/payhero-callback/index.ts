import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const data = await req.json()
    console.log('Received Payhero callback:', JSON.stringify(data, null, 2))

    // Check if Payhero nested the data inside a "response" or "Result" object
    const payload = data.response || data.Result || data;

    // Payhero can send keys in either lowercase or TitleCase depending on version/configuration
    // Sometimes success boolean is omitted, so default to true if we process it
    const success = payload.success ?? payload.Success ?? true; 
    const status = payload.status ?? payload.Status ?? payload.ResultDesc;
    const external_reference = payload.external_reference ?? payload.ExternalReference ?? payload.reference ?? payload.Reference;
    const amount = payload.amount ?? payload.Amount ?? 0;
    const reference = payload.reference ?? payload.Reference ?? payload.MpesaReceiptNumber ?? external_reference;

    console.log('Normalized callback data:', { success, status, external_reference, amount, reference });

    if (!external_reference) {
      console.error('Critical Error: external_reference is missing from callback data');
      return new Response(JSON.stringify({ error: 'Missing external_reference' }), { status: 400 });
    }

    // 1. Update payment status to success
    if (success && (status === 'Success' || status === 'Successful')) {
      console.log(`Processing successful payment for reference: ${external_reference}`);

      // Find the payment and user_id first
      const { data: paymentData, error: findError } = await supabaseClient
        .from('payments')
        .select('user_id, amount, status')
        .eq('reference', external_reference)
        .single();

      if (findError || !paymentData) {
        console.error('Could not find payment record:', findError || 'No data');
        // We still return 200 to PayHero so they stop retrying, but we log the error
        return new Response(JSON.stringify({ error: `Payment record ${external_reference} not found` }), { status: 200 });
      }

      // If already processed, just return success
      if (paymentData.status === 'success') {
        console.log('Payment already marked as success, skipping credit update.');
        return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 });
      }

      // Update payment record with PayHero's internal reference if available
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({ 
          status: 'success', 
          reference: external_reference // Keep our reference for lookup, but maybe we should have another col for payhero_ref
        })
        .eq('reference', external_reference);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw updateError;
      }

      // 2. Map amount to scan credits
      let creditsToAdd = 0;
      const paidAmount = parseFloat(amount.toString());
      
      console.log(`Paid Amount: ${paidAmount}, mapping to credits...`);

      if (paidAmount >= 80) creditsToAdd = 3;
      else if (paidAmount >= 50) creditsToAdd = 2;
      else if (paidAmount >= 30) creditsToAdd = 1;
      else if (paidAmount > 0) {
        // Fallback for any other positive amount - at least 1 credit if they paid something
        creditsToAdd = 1;
      }

      console.log(`Credits to add: ${creditsToAdd} for user: ${paymentData.user_id}`);

      if (creditsToAdd > 0) {
        // Use RPC or a direct increment to avoid race conditions
        const { error: profileError } = await supabaseClient.rpc('increment_credits', {
          p_user_id: paymentData.user_id,
          p_amount: creditsToAdd
        });

        // Fallback if RPC doesn't exist yet or uses different parameter names
        if (profileError) {
          console.warn('RPC increment_credits failed, falling back to manual update:', profileError);
          
          // Get current credits
          const { data: currentProfile, error: fetchProfileError } = await supabaseClient
            .from('profiles')
            .select('scan_credits')
            .eq('id', paymentData.user_id)
            .single();

          if (fetchProfileError) {
            console.error('Error fetching profile for manual credit update:', fetchProfileError);
          } else {
            const newTotal = (currentProfile?.scan_credits || 0) + creditsToAdd;
            const { error: manualUpdateError } = await supabaseClient
              .from('profiles')
              .update({ scan_credits: newTotal })
              .eq('id', paymentData.user_id);
            
            if (manualUpdateError) {
              console.error('Manual credit update failed:', manualUpdateError);
            } else {
              console.log(`Successfully updated credits manually to ${newTotal}`);
            }
          }
        } else {
          console.log('Successfully updated credits via RPC');
        }
      }

      return new Response(JSON.stringify({ 
        message: 'Payment processed and credits updated', 
        creditsAdded: creditsToAdd,
        reference: external_reference
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      console.warn(`Payment failed or cancelled for reference: ${external_reference}. Status: ${status}`);
      // Update payment status to failed
      await supabaseClient
        .from('payments')
        .update({ status: 'failed' })
        .eq('reference', external_reference)

      return new Response(JSON.stringify({ message: 'Payment failed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }
  } catch (error) {
    console.error('Callback error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
