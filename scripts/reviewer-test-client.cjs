const { createClient } = require('@supabase/supabase-js')

const PRODUCTION_REF = 'nbpidjpkanwynlhdxowx'

function reviewerClient() {
  if (process.env.LOVIA_ALLOW_TEST_ACCOUNT_WRITE !== '1') {
    throw new Error('Falta LOVIA_ALLOW_TEST_ACCOUNT_WRITE=1 para una cuenta ficticia de pruebas.')
  }
  const url = process.env.LOVIA_TEST_SUPABASE_URL
  const ref = process.env.LOVIA_TEST_SUPABASE_EXPECTED_REF
  const key = process.env.LOVIA_TEST_SUPABASE_PUBLISHABLE_KEY
  const email = process.env.LOVIA_REVIEWER_EMAIL
  const password = process.env.LOVIA_REVIEWER_PASSWORD
  if (!url || !ref || !key || !email || !password) {
    throw new Error('Falta configuración de prueba: URL, referencia, clave pública, email o contraseña.')
  }
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || parsed.hostname !== `${ref}.supabase.co` ||
      parsed.username || parsed.password || parsed.port || parsed.pathname !== '/' ||
      parsed.search || parsed.hash || ref === PRODUCTION_REF) {
    throw new Error('Destino de prueba inválido o reservado para producción.')
  }
  if (!/@(?:example\.(?:com|net|org)|[a-z0-9.-]+\.test)$/i.test(email)) {
    throw new Error('La cuenta de revisión debe usar un dominio ficticio reservado.')
  }
  const payload = key.split('.')[1]
  let claims
  try { claims = payload && JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) } catch { /* invalid format is rejected below */ }
  if (key.startsWith('sb_secret_') || claims?.role === 'service_role') {
    throw new Error('No uses una clave privilegiada.')
  }
  if (!(key.startsWith('sb_publishable_') && key.length >= 30) &&
      !(claims?.role === 'anon' && claims.ref === ref)) {
    throw new Error('La clave de prueba debe ser publicable o anon para ese proyecto.')
  }
  return { client: createClient(url, key), email, password }
}

module.exports = { reviewerClient }
