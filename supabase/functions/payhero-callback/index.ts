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

    // Payhero sends success as a boolean and status as a string
    const { success, status, external_reference, amount, reference } = data

    if (success && status === 'Success') {
      // 1. Update payment status to success
      const { data: paymentData, error: updateError } = await supabaseClient
        .from('payments')
        .update({ status: 'success', reference: reference })
        .eq('reference', external_reference)
        .select('user_id')
        .single()

      if (updateError) {
        console.error('Update payment error:', updateError)
        throw updateError
      }

      // 2. Map amount to scan credits based on your business model
      // 30 KSH -> 1 Scan
      // 50 KSH -> 2 Scans
      // 80 KSH -> 3 Scans
      let creditsToAdd = 0
      const paidAmount = parseFloat(amount)
      
      if (paidAmount >= 80) creditsToAdd = 3
      else if (paidAmount >= 50) creditsToAdd = 2
      else if (paidAmount >= 30) creditsToAdd = 1
      else creditsToAdd = 0 // Should not happen with your UI

      if (creditsToAdd > 0) {
        // Increment scan credits for the user
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('scan_credits')
          .eq('id', paymentData.user_id)
          .single()
        
        const newTotal = (profile?.scan_credits || 0) + creditsToAdd
        
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({ scan_credits: newTotal })
          .eq('id', paymentData.user_id)

        if (profileError) {
          console.error('Profile update error:', profileError)
          throw profileError
        }
      }

      return new Response(JSON.stringify({ message: 'Payment processed and credits updated', creditsAdded: creditsToAdd }), {
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
