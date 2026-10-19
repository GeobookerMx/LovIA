import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.17.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { corsHeaders } from "https://deno.land/x/edge_cors@1.0.0/mod.ts"

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const mexicoDay = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date())
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    if (mexicoDay <= '2027-01-31' || Deno.env.get('LOVIA_ENABLE_PAID_CHECKOUT') !== 'true') {
        return new Response(JSON.stringify({ error: 'Los pagos aún no están disponibles' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403,
        })
    }

    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
        if (!stripeKey) throw new Error('Pasarela no configurada')
        const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() })
        const { priceId } = await req.json()
        const returnUrl = Deno.env.get('LOVIA_PUBLIC_SITE_ORIGIN')

        if (!priceId || !returnUrl || !/^https:\/\/[^/?#]+$/.test(returnUrl)) {
            return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
                status: 400 
            })
        }
        const allowedPrices = new Set((Deno.env.get('LOVIA_ALLOWED_STRIPE_PRICE_IDS') || '')
            .split(',').map((value: string) => value.trim()).filter(Boolean))
        if (!allowedPrices.has(priceId)) {
            return new Response(JSON.stringify({ error: 'Plan no disponible' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
            })
        }

        // Validate JWT to get the user ID
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
            })
        }
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
