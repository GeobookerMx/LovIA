/**
 * LovIA! — Edge Function: mp-webhook
 * Recibe notificaciones de pago desde Mercado Pago y actualiza
 * la tabla subscriptions en Supabase automáticamente.
 * 
 * Deploy: supabase functions deploy mp-webhook
 * 
 * Variables de entorno requeridas:
 *   MP_ACCESS_TOKEN      = APP_USR-...
 *   MP_WEBHOOK_SECRET    = tu-secreto-de-webhook-mp (opcional, para validar firma)
 *   SUPABASE_URL         = (automático)
 *   SUPABASE_SERVICE_ROLE_KEY = (automático)
 * 
 * En Mercado Pago Dashboard → Tu App → Webhooks:
 *   URL: https://[tu-project].supabase.co/functions/v1/mp-webhook
 *   Eventos: payment.created, payment.updated
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

// Mapa de precios → tiers (basado en el monto pagado)
const PRECIO_A_TIER: Record<number, string> = {
  99:  'arquitecto',
  249: 'ingeniero',
  399: 'diamante',
}

// Calcular fecha de expiración (1 mes desde ahora)
function calcularExpiracion(): string {
  const fecha = new Date()
  fecha.setMonth(fecha.getMonth() + 1)
  return fecha.toISOString()
}

Deno.serve(async (req) => {
  try {
    // Mercado Pago envía POST con JSON
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await req.json()
    console.log('📨 MP Webhook recibido:', JSON.stringify(body))

    // MP puede enviar varios tipos de notificación
    const { type, data } = body

    // Solo procesamos pagos
    if (type !== 'payment') {
      console.log(`Evento ignorado: ${type}`)
      return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 })
    }

    const paymentId = data?.id
    if (!paymentId) {
      return new Response('Missing payment ID', { status: 400 })
    }

    // 1. Obtener detalles del pago desde la API de MP
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')!
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { 'Authorization': `Bearer ${mpAccessToken}` }
      }
    )

    if (!paymentResponse.ok) {
      const err = await paymentResponse.text()
      console.error(`Error fetching payment ${paymentId}:`, err)
      throw new Error(`No se pudo obtener el pago: ${err}`)
    }

    const payment = await paymentResponse.json()
    console.log(`💰 Pago ${paymentId}: status=${payment.status}, amount=${payment.transaction_amount}`)

    // 2. Solo procesar pagos APROBADOS
    if (payment.status !== 'approved') {
      console.log(`Pago ${paymentId} no aprobado (status: ${payment.status}), ignorando.`)
      return new Response(JSON.stringify({ ok: true, status: payment.status }), { status: 200 })
    }

    // 3. Extraer user_id de external_reference o metadata
    const userId = payment.external_reference || payment.metadata?.user_id
    if (!userId) {
      console.error('No user_id en el pago', payment)
      throw new Error('No se pudo identificar al usuario en el pago')
    }

    // 4. Determinar qué tier corresponde al monto pagado
    const monto = Math.round(payment.transaction_amount)
    const tier = PRECIO_A_TIER[monto] || payment.metadata?.tier || 'arquitecto'

    console.log(`✅ Activando tier '${tier}' para usuario ${userId}`)

    // 5. Actualizar la tabla subscriptions (bypasando RLS con service role)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        tier: tier,
        status: 'active',
        // Guardamos referencia del pago de MP en lugar de Stripe
        stripe_customer_id: `mp_payer_${payment.payer?.id || 'unknown'}`,
        stripe_subscription_id: `mp_payment_${paymentId}`,
        current_period_start: new Date().toISOString(),
        current_period_end: calcularExpiracion(),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (subError) {
      console.error('Error actualizando subscription:', subError)
      throw subError
    }

    // El trigger sync_tier_to_profile() en Supabase propagará
    // automáticamente el tier a la tabla profiles ✅
    console.log(`🎉 Suscripción ${tier} activada para ${userId}`)

    // 6. Registrar en audit_log para trazabilidad
    await supabase.from('audit_log').insert({
      user_id: userId,
      action: 'subscription_activated',
      details: {
        tier,
        payment_id: paymentId,
        amount: monto,
        currency: payment.currency_id,
        method: 'mercado_pago',
        payment_method_type: payment.payment_method_id,
      },
    })

    return new Response(
      JSON.stringify({ ok: true, tier, userId }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('mp-webhook error:', error.message)
    // Devolver 200 para que MP no reintente indefinidamente
    // (los errores se registran en los logs de la función)
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
