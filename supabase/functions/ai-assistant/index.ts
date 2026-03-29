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
    const { messages, currentDiseaseId, imageContext } = await req.json()
    if (!messages || !Array.isArray(messages)) throw new Error("messages array is required")

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
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")
    const systemPrompt = `You are "Bingwa AI", a world-class agricultural consultant for Kenyan farmers. 

    ABILITIES:
    1. MULTILINGUAL: You support English, Swahili (Kiswahili), and Sheng. Automatically detect the user's language and respond in the SAME language.
    2. CONTEXTUAL: You are aware of the image the user is looking at.
    3. EXPERTISE: Use the provided RELEVANT KNOWLEDGE to give precise, actionable advice on organic and chemical treatments.

    TONE:
    - Professional yet empathetic.
    - Use common Kenyan agricultural terms (e.g., "dawa", "mbolea", "wadudu").
    - Be concise.

    If the user speaks Swahili/Sheng, ensure your response is culturally relevant and easy to understand.`

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

    const groqData = await groqResponse.json()
    const aiMessage = groqData.choices[0].message.content

    return new Response(
      JSON.stringify({ content: aiMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
