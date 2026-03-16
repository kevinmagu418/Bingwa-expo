import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const data = await req.json()
    console.log('Received Payhero callback:', data)

    const { success, status, external_reference, amount, reference } = data

    if (success && status === 'Success') {
      // 1. Update payment status to success
      const { data: paymentData, error: updateError } = await supabaseClient
        .from('payments')
        .update({ status: 'success', reference: reference })
        .eq('reference', external_reference)
        .select('user_id')
        .single()

      if (updateError) throw updateError

      // 2. Increment scan credits for the user
      // 40 KSH = 1 Scan Credit
      const creditsToAdd = Math.floor(amount / 40)
      
      const { error: profileError } = await supabaseClient.rpc('increment_scan_credits', {
        user_id_param: paymentData.user_id,
        credits_param: creditsToAdd
      })

      if (profileError) {
        console.error('RPC Error:', profileError)
        // Fallback: try to increment directly if RPC is missing
        // This is less safe but ensures credits are at least attempted
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('scan_credits')
          .eq('id', paymentData.user_id)
          .single()
        
        await supabaseClient
          .from('profiles')
          .update({ scan_credits: (profile?.scan_credits || 0) + creditsToAdd })
          .eq('id', paymentData.user_id)
      }

      return new Response(JSON.stringify({ message: 'Payment processed and credits updated' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      // Update payment status to failed
      await supabaseClient
        .from('payments')
        .update({ status: 'failed' })
        .eq('reference', external_reference)

      return new Response(JSON.stringify({ message: 'Payment failed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200, // Still return 200 to Payhero to acknowledge receipt
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
