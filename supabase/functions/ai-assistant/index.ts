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

  console.log("AI-Assistant function invoked");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("CRITICAL: Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error", details: "Missing Supabase keys" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    if (!GROQ_API_KEY) {
      console.error("CRITICAL: Missing GROQ_API_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "AI Service Unavailable", details: "The AI assistant is not configured (Missing GROQ_API_KEY)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. AUTHENTICATION
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing Authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      )
    }

    const token = authHeader.replace(/Bearer /i, "").trim()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "User not found");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or expired token", details: authError?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      )
    }

    console.log(`Authenticated user: ${user.id}`);

    // 2. REQUEST BODY
    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    const { messages, currentDiseaseId, imageContext, language } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required and must not be empty" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    const preferredLanguage = language === 'sw' ? 'Swahili (Kiswahili)' : 'English';
    const lastMessage = messages[messages.length - 1].content

    // 3. RAG RETRIEVAL & IMAGE CONTEXT
    let context = ""
    if (imageContext) {
      context += `[IMAGE CONTEXT]: The user is currently looking at a photo of ${imageContext.crop} with ${imageContext.disease} (${imageContext.severity} severity).\n`
    }
    
    if (currentDiseaseId) {
      const { data: disease } = await supabase
        .from("diseases")
        .select("*")
        .eq("id", currentDiseaseId)
        .single()
      
      if (disease) {
        context += `KNOWLEDGE BASE FOR ${disease.name}:\n` +
          `- Description: ${disease.description}\n` +
          `- Organic Treatment: ${disease.organic_remedies?.join(', ')}\n` +
          `- Chemical Treatment: ${disease.chemical_remedies?.join(', ')}\n` +
          `- Prevention: ${disease.prevention_tips?.join(', ')}`
      }
    }

    // 4. GROQ API CALL
    const systemPrompt = `You are "Bingwa AI", a world-class agricultural consultant for Kenyan farmers. 

    ABILITIES:
    1. LANGUAGE: Respond ONLY in ${preferredLanguage}.
    2. CONTEXTUAL: You are aware of the image the user is looking at and their current location in the app.
    3. EXPERTISE: Use the provided RELEVANT KNOWLEDGE to give precise, actionable advice on organic and chemical treatments.
    4. PROACTIVE: Always suggest next steps or ask follow-up questions to help the farmer.

    TONE:
    - Professional, detailed, and empathetic.
    - Be thorough in your explanations.
    - Provide structured advice with clear steps.
    
    If responding in Swahili, use standard Kiswahili that is easy for a Kenyan farmer to understand.`

    console.log(`Calling Groq API in ${preferredLanguage}...`);
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-5, -1),
          { role: "user", content: `CONTEXT:\n${context}\n\nUSER QUERY:\n${lastMessage}` }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    })

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}));
      console.error("Groq API Error:", groqResponse.status, errorData);
      return new Response(
        JSON.stringify({ 
          error: "Bingwa AI is having trouble thinking right now", 
          details: errorData.error?.message || "Groq API returned an error" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: groqResponse.status === 401 ? 500 : groqResponse.status }
      )
    }

    const groqData = await groqResponse.json()
    if (!groqData.choices || !groqData.choices[0]) {
      console.error("Unexpected Groq response format:", groqData);
      throw new Error("Invalid response from AI model");
    }
    
    const aiMessage = groqData.choices[0].message.content
    console.log("Groq API call successful");

    return new Response(
      JSON.stringify({ content: aiMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error: any) {
    console.error("Catch Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
