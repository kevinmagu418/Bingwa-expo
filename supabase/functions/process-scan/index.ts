import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 1. AUTHENTICATION
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Missing Authorization")
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error("Unauthorized")

    // 2. REQUEST BODY
    const { imageUrl, crop } = await req.json()
    if (!imageUrl) throw new Error("imageUrl is required")

    // 3. NORMALIZE CROP
    const allowedCrops = [
      "apple",
      "bean",
      "bellpepper",
      "cassava",
      "cherry",
      "grape",
      "maize",
      "peach",
      "potato",
      "strawberry",
      "tomato"
    ]

    let normalizedCrop = (crop || "maize").toLowerCase().trim()
    if (!allowedCrops.includes(normalizedCrop)) normalizedCrop = "maize"

    // 4. CHECK CREDITS
    const { data: profile } = await supabase
      .from("profiles")
      .select("scan_credits")
      .eq("id", user.id)
      .single()

    if (!profile || profile.scan_credits <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Insufficient credits", code: 'INSUFFICIENT_CREDITS' }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200, // Returning 200 so frontend can handle the business logic error
        }
      )
    }

    // 5. FETCH IMAGE & PREDICT
    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) throw new Error("Failed to fetch image from storage")
    const imageBlob = await imageRes.blob()

    const formData = new FormData()
    formData.append("crop", normalizedCrop)
    formData.append("file", imageBlob, "scan.jpg")

    const railwayUrl =
      "https://fastapiserver-production-087d.up.railway.app/api/predict"

    const predictResponse = await fetch(railwayUrl, {
      method: "POST",
      body: formData,
    })

    if (!predictResponse.ok) {
      const errorDetail = await predictResponse.text();
      console.error("Prediction API failed:", predictResponse.status, errorDetail);
      throw new Error("Prediction API failed");
    }

    const prediction = await predictResponse.json()
    
    // Support both 'display_label'/'disease' and handle missing fields
    const diseaseName = prediction.display_label || prediction.disease || prediction.label || 'Unknown'
    const confidence = prediction.confidence || 0
    const severity = (prediction.severity || "medium").toLowerCase()
    const recommendation = prediction.recommendation || {}

    // 6. FIND / CREATE DISEASE RECORD
    let diseaseId = null

    const { data: existingDisease } = await supabase
      .from("diseases")
      .select("id")
      .eq("name", diseaseName)
      .maybeSingle()

    if (existingDisease) {
      diseaseId = existingDisease.id
    } else {
      const { data: newDisease, error: diseaseError } = await supabase
        .from("diseases")
        .insert({
          name: diseaseName,
          crop: normalizedCrop,
          description: recommendation.disease || diseaseName,
          organic_remedies: recommendation.organic_treatment ? [recommendation.organic_treatment] : [],
          chemical_remedies: recommendation.chemical_treatment ? [recommendation.chemical_treatment] : [],
          prevention_tips: recommendation.prevention ? [recommendation.prevention] : [],
        })
        .select("id")
        .single()

      if (diseaseError) console.error("Disease creation failed:", diseaseError.message)
      diseaseId = newDisease?.id || null
    }

    // 7. SAVE TO 'SCANS' TABLE
    const { data: scanData, error: scanError } = await supabase
      .from("scans")
      .insert({
        user_id: user.id,
        disease_id: diseaseId,
        image_url: imageUrl,
        confidence_score: confidence,
        severity: severity,
      })
      .select()
      .single()

    if (scanError) throw new Error("Scan save failed: " + scanError.message)

    // 8. SAVE TO 'RECOMMENDATIONS' TABLE
    const { error: recError } = await supabase.from("recommendations").insert({
      scan_id: scanData.id,
      treatment_plan: recommendation.disease || diseaseName,
      organic_advice: recommendation.organic_treatment || "No organic remedies recommended.",
      chemical_advice: recommendation.chemical_treatment || "No chemical remedies recommended.",
      prevention: recommendation.prevention || "No prevention tips available.",
    })

    if (recError) console.error("Recommendation link failed:", recError.message)

    // 9. DEDUCT CREDIT
    await supabase
      .from("profiles")
      .update({ scan_credits: profile.scan_credits - 1 })
      .eq("id", user.id)

    // 10. SUCCESS RESPONSE
    return new Response(
      JSON.stringify({
        success: true,
        scanId: scanData.id,
        diagnosis: diseaseName,
        confidence,
        severity,
        recommendation,
        remainingCredits: profile.scan_credits - 1,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Final Error:", error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Returning 200 with success: false for better error handling in mobile
      }
    )
  }
})
