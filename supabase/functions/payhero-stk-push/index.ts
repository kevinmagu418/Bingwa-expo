import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from session
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { phoneNumber, amount } = await req.json()

    if (!phoneNumber || !amount) {
      return new Response(JSON.stringify({ error: 'Phone number and amount are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const externalReference = `PAY-${Date.now()}-${user.id.substring(0, 8)}`

    // Log the payment in pending state
    const { error: dbError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        amount: amount,
        phone_number: phoneNumber,
        reference: externalReference,
        status: 'pending'
      })

    if (dbError) throw dbError

    // Call Payhero STK Push
    const payheroToken = Deno.env.get('PAYHERO_API_TOKEN') 
    const channelId = Deno.env.get('PAYHERO_CHANNEL_ID')
    const callbackUrl = Deno.env.get('PAYHERO_CALLBACK_URL')

    // Use the provided token directly
    const auth = payheroToken || `Basic ${btoa(`${Deno.env.get('PAYHERO_API_USERNAME')}:${Deno.env.get('PAYHERO_API_PASSWORD')}`)}`

    const payheroResponse = await fetch('https://backend.payhero.co.ke/api/v2/payments/stk-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify({
        amount: amount,
        phone_number: phoneNumber,
        channel_id: parseInt(channelId || '6045'), // Default to your channel ID
        provider: 'm-pesa',
        external_reference: externalReference,
        callback_url: callbackUrl
      })
    })

    const payheroData = await payheroResponse.json()

    if (payheroResponse.ok && payheroData.success) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'STK push initiated',
        reference: externalReference 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      console.error('Payhero error:', payheroData)
      return new Response(JSON.stringify({ 
        success: false, 
        message: payheroData.message || 'Payhero STK push failed',
        error: payheroData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
