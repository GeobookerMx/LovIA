// Compatibility endpoint: initiates a tracked deletion request; never claims deletion.
// The app calls the same RPC directly, so this function is not a deploy prerequisite.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.97.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status: number) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
  const authorization = req.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'authentication_required' }, 401)
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_ANON_KEY')
  if (!url || !key) return json({ error: 'service_unavailable' }, 503)
  try {
    const client = createClient(url, key, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user) return json({ error: 'authentication_required' }, 401)
    let body: { confirmation?: unknown }
    try { body = await req.json() } catch { return json({ error: 'invalid_confirmation' }, 422) }
    if (body?.confirmation !== 'ELIMINAR') return json({ error: 'invalid_confirmation' }, 422)
    const { data, error } = await client.rpc('request_account_deletion', { p_confirmation: 'ELIMINAR' })
    if (error || !data || !['pending', 'processing'].includes(data.status)) return json({ error: 'request_not_confirmed' }, 503)
    return json({ ...data, deleted: false }, 202)
  } catch {
    return json({ error: 'request_not_confirmed' }, 503)
  }
})
