/**
 * LovIA! — Edge Function: create-mp-preference
 * Crea una preferencia de pago en Mercado Pago y devuelve
 * la URL de checkout al frontend.
 * 
 * Deploy: supabase functions deploy create-mp-preference
 * 
 * Variables de entorno requeridas (Supabase → Settings → Edge Functions → Secrets):
 *   MP_ACCESS_TOKEN  = APP_USR-...  (tu Access Token de Mercado Pago)
 *   SUPABASE_URL     = (automático)
 *   SUPABASE_ANON_KEY = (automático)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Mapa de planes LovIA → Mercado Pago ──
const PLANES: Record<string, { titulo: string; precio: number; descripcion: string }> = {
  arquitecto: {
    titulo: 'LovIA Arquitecto 🔵',
    precio: 99,
    descripcion: 'Matching 3/mes, Cuestionario Nivel 2, Historial emocional'
  },
  ingeniero: {
    titulo: 'LovIA Ingeniero 🟣',
    precio: 249,
    descripcion: 'Videollamadas, AI Coach, INE incluida, Matching 10/mes'
  },
  diamante: {
    titulo: 'LovIA Diamante 💎',
    precio: 399,
    descripcion: 'Matching ilimitado, Módulos Perel/Johnson, Badge Diamante'
  },
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validar autenticación del usuario
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // 2. Leer el cuerpo de la petición
    const { tier, returnUrl } = await req.json()

    if (!tier || !PLANES[tier]) {
      return new Response(
        JSON.stringify({ error: `Plan inválido: ${tier}. Opciones: arquitecto, ingeniero, diamante` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const plan = PLANES[tier]
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')

    if (!mpAccessToken) {
      console.error('MP_ACCESS_TOKEN no configurado en los secrets de la Edge Function')
      return new Response(
        JSON.stringify({ error: 'Pasarela de pago no configurada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 3. Crear preferencia en Mercado Pago
    const baseUrl = returnUrl || 'https://lovia.app'

    const preference = {
      items: [
        {
          id: `lovia_${tier}`,
          title: plan.titulo,
          description: plan.descripcion,
          quantity: 1,
          currency_id: 'MXN',
          unit_price: plan.precio,
        }
      ],
      payer: {
        email: user.email,
      },
      // external_reference = user_id para identificarlo en el webhook
      external_reference: user.id,
      // Metadata para saber qué tier activar
      metadata: {
        user_id: user.id,
        tier: tier,
        lovia_plan: true,
      },
      back_urls: {
        success: `${baseUrl}/pricing?success=true&tier=${tier}`,
        failure: `${baseUrl}/pricing?error=pago_fallido`,
        pending: `${baseUrl}/pricing?pending=true`,
      },
      auto_return: 'approved',
      // Suscripción recurrente — el usuario elige cada mes
      // Para suscripciones automáticas usa la API de Suscripciones de MP
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12, // Hasta 12 meses sin intereses
      },
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
    }

    // 4. Llamar a la API de Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `lovia_${user.id}_${tier}_${Date.now()}`,
      },
      body: JSON.stringify(preference),
    })

    if (!mpResponse.ok) {
      const mpError = await mpResponse.json()
      console.error('Error MP API:', mpError)
      throw new Error(`Mercado Pago error: ${JSON.stringify(mpError)}`)
    }

    const mpData = await mpResponse.json()

    console.log(`✅ Preferencia creada para ${user.email} — Plan: ${tier} — ID: ${mpData.id}`)

    return new Response(
      JSON.stringify({
        // URL de producción
        url: mpData.init_point,
        // URL de sandbox para testing
        sandbox_url: mpData.sandbox_init_point,
        preference_id: mpData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('create-mp-preference error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
