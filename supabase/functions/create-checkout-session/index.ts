import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.17.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { corsHeaders } from "https://deno.land/x/edge_cors@1.0.0/mod.ts"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { priceId, returnUrl } = await req.json()

        if (!priceId || !returnUrl) {
            return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
                status: 400 
            })
        }

        // Validate JWT to get the user ID
        const authHeader = req.headers.get('Authorization')!
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        
        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            client_reference_id: user.id, // Very important for the webhook
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${returnUrl}?success=true`,
            cancel_url: `${returnUrl}?canceled=true`,
        })

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
