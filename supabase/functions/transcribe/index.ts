import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")

    if (!GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY")
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // 1. AUTHENTICATION
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Missing Authorization header")
    const token = authHeader.replace(/Bearer /i, "").trim()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error("Unauthorized")

    // 2. REQUEST BODY
    const { storagePath, language = "en" } = await req.json()
    if (!storagePath) throw new Error("No storagePath provided")

    console.log(`Transcribing audio for user ${user.id}, path: ${storagePath}, language: ${language}`);

    // 3. DOWNLOAD FROM STORAGE
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("scans")
      .download(storagePath);

    if (downloadError || !audioData) {
      console.error("Storage download failed:", downloadError?.message);
      throw new Error("Failed to retrieve recording from storage");
    }

    // 4. FORWARD TO GROQ WHISPER
    const fileExt = storagePath.split('.').pop()?.toLowerCase() || 'wav';
    const formData = new FormData()
    formData.append("file", audioData, `recording.${fileExt}`)
    formData.append("model", "whisper-large-v3")
    if (language) formData.append("language", language)

    const groqResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    })

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json()
      console.error("Groq Whisper Error:", errorData)
      throw new Error(errorData.error?.message || "Transcription failed")
    }

    const result = await groqResponse.json()
    console.log("Transcription successful:", result.text);

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error: any) {
    console.error("Transcription Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
