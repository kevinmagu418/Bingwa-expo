import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

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
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log("Fetching agricultural news...")

    // 1. Fetch from NewsAPI (Agriculture/Farming/AgriTech)
    // Using a broad query for agricultural breakthroughs and global trends
    const newsResponse = await fetch(
      `https://newsapi.org/v2/everything?q=agriculture+farming+breakthrough+agritech&language=en&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
    )

    const newsData = await newsResponse.json()

    if (newsData.status !== 'ok') {
      throw new Error(`NewsAPI Error: ${newsData.message}`)
    }

    const articles = newsData.articles || []
    
    // 2. Format and Sync to Database
    const trendsToInsert = articles.map((article: any) => ({
      title: article.title,
      category: 'Global News', // Default category
      date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      image: article.urlToImage || 'https://images.unsplash.com/photo-1560493676-04071c5f467b',
      link: article.url
    }))

    if (trendsToInsert.length > 0) {
      // Clear old trends and insert fresh ones
      // This keeps the knowledge hub "fresh" and limited to the most recent trends
      const { error: deleteError } = await supabase
        .from('trends')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Deletes all

      if (deleteError) console.error("Warning: Could not clear old trends:", deleteError)

      const { error: insertError } = await supabase
        .from('trends')
        .insert(trendsToInsert)

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({ success: true, count: trendsToInsert.length, message: "Trends synced successfully" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error("Sync failed:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
