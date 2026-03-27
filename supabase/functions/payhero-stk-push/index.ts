import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate Environment Variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Critical Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      throw new Error('Server Configuration Error: Missing Supabase secrets.');
    }

    // 2. Validate Auth Header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized: Missing Authorization header' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 3. Initialize Supabase Admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Verify User Token
    const token = authHeader.replace(/bearer /i, '').trim();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth Verification Failed:', authError);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized: Invalid or expired token', 
        details: authError?.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 5. Parse Request Body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid JSON body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { phoneNumber, amount } = body;
    if (!phoneNumber || !amount) {
      return new Response(JSON.stringify({ success: false, message: 'Missing phoneNumber or amount' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const numAmount = parseFloat(amount.toString());
    const externalReference = `PAY-${Date.now()}-${user.id.substring(0, 8)}`;

    // 6. Log Payment Request (Database)
    const { error: dbError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        amount: numAmount,
        phone_number: phoneNumber.toString(),
        reference: externalReference,
        status: 'pending'
      });

    if (dbError) {
      console.error('Database Insert Error:', dbError);
      throw new Error(`Database Error: ${dbError.message}`);
    }

    // 7. Payhero Credentials - Fallback to provided hardcoded values if secrets are missing
    const username = Deno.env.get('PAYHERO_API_USERNAME') || 'sp436JzMIOIg2HXYiq6N';
    const password = Deno.env.get('PAYHERO_API_PASSWORD') || 'tQT9yv3Zqb6TW8juKybDQtXUO3vyH7DNjavu4pX3';
    const channelId = Deno.env.get('PAYHERO_CHANNEL_ID') || '6045';
    
    // Dynamically construct callback URL if not provided
    let callbackUrl = Deno.env.get('PAYHERO_CALLBACK_URL');
    if (!callbackUrl && supabaseUrl) {
       // Format: https://[ref].supabase.co/functions/v1/payhero-callback
       callbackUrl = `${supabaseUrl}/functions/v1/payhero-callback`;
    }

    const basicAuth = `Basic ${btoa(`${username}:${password}`)}`;
    const payheroPayload = {
      amount: numAmount,
      phone_number: phoneNumber.toString(),
      channel_id: parseInt(channelId),
      provider: 'm-pesa',
      external_reference: externalReference,
      callback_url: callbackUrl
    };

    console.log(`Initiating Payhero STK Push to ${phoneNumber} via Channel ${channelId}`);
    console.log(`Callback URL: ${callbackUrl}`);

    // 8. Execute Payhero Request
    const payheroResponse = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth
      },
      body: JSON.stringify(payheroPayload)
    });

    const payheroData = await payheroResponse.json();
    console.log('Payhero Response:', payheroData);

    if (payheroResponse.ok && payheroData.success) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'STK Push Initiated Successfully',
        reference: externalReference,
        payhero_response: payheroData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      console.error('Payhero API Error:', payheroData);
      
      // Update DB to failed
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed' })
        .eq('reference', externalReference);

      return new Response(JSON.stringify({ 
        success: false, 
        message: payheroData.message || 'Payhero declined the STK push request',
        error: payheroData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

  } catch (error: any) {
    console.error('Edge Function Exception:', error.message);
    const status = error.message.includes('Unauthorized') || error.message.includes('JWT') ? 401 : 500;
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message || 'Internal Server Error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status,
    });
  }
});
