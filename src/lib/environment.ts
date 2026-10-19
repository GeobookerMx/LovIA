// Project identifiers are public. Credentials must never be added here.
export const PRODUCTION_SUPABASE_REF = 'nbpidjpkanwynlhdxowx'

export type AppEnvironment = 'development' | 'staging' | 'production'

export interface PublicEnvironmentInput {
  mode: string
  appEnvironment?: string
  supabaseUrl?: string
  expectedRef?: string
  publishableKey?: string
  anonKey?: string
  devBypass?: string
  netlifyContext?: string
}

function projectRef(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port || parsed.pathname !== '/' || parsed.search || parsed.hash) return null
    const match = /^([a-z0-9]{20})\.supabase\.co$/.exec(parsed.hostname)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

function legacyKeyClaims(key: string): { role?: string; ref?: string } | null {
  const payload = key.split('.')[1]
  if (!payload || key.split('.').length !== 3) return null
  try {
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function validatePublicEnvironment(input: PublicEnvironmentInput) {
  const environment = input.appEnvironment?.trim() as AppEnvironment | undefined
  if (!environment || !['development', 'staging', 'production'].includes(environment)) {
    throw new Error('Falta VITE_APP_ENV: development, staging o production.')
  }
  if (environment !== input.mode) {
    throw new Error('VITE_APP_ENV no coincide con el modo de Vite. Usa un modo de build explícito.')
  }
  if (input.devBypass === 'true') {
    throw new Error('VITE_DEV_BYPASS=true no está permitido en builds de LovIA.')
  }
  if (input.netlifyContext && input.netlifyContext !== 'production' && environment === 'production') {
    throw new Error('Un contexto Netlify de pruebas no puede usar el entorno de producción.')
  }
  if (!input.supabaseUrl) throw new Error('Falta VITE_SUPABASE_URL.')
  if (!input.expectedRef) throw new Error('Falta VITE_SUPABASE_EXPECTED_REF.')
  const ref = projectRef(input.supabaseUrl)
  if (!ref) throw new Error('VITE_SUPABASE_URL debe ser una URL HTTPS de un proyecto Supabase.')
  if (ref !== input.expectedRef) throw new Error('VITE_SUPABASE_URL no corresponde a VITE_SUPABASE_EXPECTED_REF.')
  if (environment === 'production' && ref !== PRODUCTION_SUPABASE_REF) {
    throw new Error('El build de producción no apunta al proyecto reservado de LovIA.')
  }
  if (environment !== 'production' && ref === PRODUCTION_SUPABASE_REF) {
    throw new Error('Un build de pruebas apunta al proyecto reservado de producción.')
  }
  const key = input.publishableKey || input.anonKey
  if (!key) throw new Error('Falta VITE_SUPABASE_PUBLISHABLE_KEY o VITE_SUPABASE_ANON_KEY.')
  const claims = legacyKeyClaims(key)
  if (key.startsWith('sb_secret_') || claims?.role === 'service_role') {
    throw new Error('Una clave privilegiada no puede exponerse en VITE_.')
  }
  if (!(key.startsWith('sb_publishable_') && key.length >= 30) &&
      !(claims?.role === 'anon' && claims.ref === ref)) {
    throw new Error('La clave de VITE_ debe ser publicable o anon y corresponder al proyecto.')
  }
  return { environment, supabaseUrl: input.supabaseUrl, supabaseKey: key, projectRef: ref }
}
