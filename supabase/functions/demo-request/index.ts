import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts"

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Zod Validation Schema
const demoRequestSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255),
  phone: z.string().regex(/^[0-9+\-\s()]+$/).min(10).max(15),
  company: z.string().min(2).max(100),
  message: z.string().max(1000).optional(),
})

serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 204 })
  }

  try {
    // 2. Parse and Validate body
    const body = await req.json()
    console.log('📬 Incoming Demo Request:', body)
    
    const validatedData = demoRequestSchema.safeParse(body)
    if (!validatedData.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validatedData.error.format() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 3. Initialize Supabase Client (Service Role)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Insert into Database
    const { data, error } = await supabaseClient
      .from('demo_requests')
      .insert([validatedData.data])
      .select()
      .single()

    if (error) {
      console.error('❌ Database Error:', error)
      throw error
    }

    // 5. Success Response
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('🔥 Server Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
