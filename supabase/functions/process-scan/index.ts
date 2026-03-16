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

    // Check scan credits
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('scan_credits')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    if (!profile || profile.scan_credits <= 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Insufficient scan credits. Please top up to continue.',
        code: 'INSUFFICIENT_CREDITS'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 402, // Payment Required
      })
    }

    const { imageUrl, cropType } = await req.json()

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'Image URL is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Call Railway API for prediction
    // The user provided: https://fastapiserver-production-087d.up.railway.app/api/predict
    const railwayUrl = 'https://fastapiserver-production-087d.up.railway.app/api/predict'
    
    console.log(`Calling Railway API: ${railwayUrl} for image: ${imageUrl}`)

    const predictResponse = await fetch(railwayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        crop: cropType || 'Maize' // Use 'crop' as required by API
      })
    })

    if (!predictResponse.ok) {
      const errorText = await predictResponse.text()
      console.error('Railway API error:', errorText)
      throw new Error(`Railway API failed: ${predictResponse.statusText}`)
    }

    const predictionData = await predictResponse.json()
    console.log('Prediction data:', predictionData)

    // Expecting predictionData to have: disease_name, confidence, severity, recommendations, etc.
    const { disease_name, confidence, severity, recommendations } = predictionData

    // 1. Find or create disease in database
    let diseaseId;
    const { data: diseaseData, error: diseaseError } = await supabaseClient
      .from('diseases')
      .select('id')
      .eq('name', disease_name)
      .single()

    if (diseaseError || !diseaseData) {
      // If disease not found, we might want to insert it or just use a default
      // For now, let's try to find a generic one or insert
      const { data: newDisease, error: insertError } = await supabaseClient
        .from('diseases')
        .insert({
          name: disease_name,
          crop: cropType || 'Unknown',
          severity: severity || 'medium',
          description: recommendations ? recommendations.join('\n') : 'No description available'
        })
        .select('id')
        .single()
      
      if (insertError) {
        console.error('Error inserting disease:', insertError)
        // Fallback to a default ID if possible, or handle error
      } else {
        diseaseId = newDisease.id
      }
    } else {
      diseaseId = diseaseData.id
    }

    // 2. Create scan record
    const { data: scanData, error: scanError } = await supabaseClient
      .from('scans')
      .insert({
        user_id: user.id,
        disease_id: diseaseId,
        image_url: imageUrl,
        confidence_score: confidence || 0,
        severity: severity || 'medium',
        recommendations: recommendations || []
      })
      .select()
      .single()

    if (scanError) throw scanError

    // 3. Deduct scan credit
    const { error: deductError } = await supabaseClient
      .from('profiles')
      .update({ scan_credits: profile.scan_credits - 1 })
      .eq('id', user.id)

    if (deductError) console.error('Error deducting credit:', deductError)

    return new Response(JSON.stringify({ 
      success: true, 
      scanId: scanData.id,
      diagnosis: disease_name,
      confidence: confidence,
      severity: severity,
      recommendations: recommendations,
      remainingCredits: profile.scan_credits - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
