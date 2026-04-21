import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import Stripe from "https://esm.sh/stripe@14.17.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  if (!signature) {
    return new Response('No signature provided', { status: 400 })
  }

  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!endpointSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  let event
  const body = await req.text()

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret, undefined, cryptoProvider)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Admin client to bypass RLS
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Customer ID and Subscription ID from the session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        
        // We need to know who this user is. 
        // We can pass `client_reference_id` when creating the checkout session from the frontend.
        const userId = session.client_reference_id

        if (!userId) {
          throw new Error('No client_reference_id (user ID) found in session')
        }

        // Fetch subscription to get period dates and tier
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        
        // Very basic tier logic based on Product ID or amount (you configure this logic as needed)
        // For now, let's assume valid tiers are 'arquitecto', 'ingeniero', 'diamante'
        // You can use Stripe metadata on the Product to map exactly to these strings.
        const productId = subscription.items.data[0].price.product as string
        const product = await stripe.products.retrieve(productId)
        
        // Let's assume you added metadata { "tier": "diamante" } in your Stripe product.
        const tier = (product.metadata.tier || 'arquitecto').toLowerCase()

        const { error } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          tier: tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { onConflict: 'user_id' })

        if (error) throw error
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Note: we fetch the user by stripe_customer_id since client_reference_id isn't guaranteed here
        const productId = subscription.items.data[0].price.product as string
        const product = await stripe.products.retrieve(productId)
        const tier = (product.metadata.tier || 'free').toLowerCase()
        
        let finalTier = tier
        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          finalTier = 'free'
        }

        const { error } = await supabase
          .from('subscriptions')
          .update({
            tier: finalTier,
            status: subscription.status,
            stripe_subscription_id: subscription.id,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .match({ stripe_customer_id: subscription.customer as string })

        if (error) console.error("Error updating subscription:", error)
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } })

  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`)
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
})
