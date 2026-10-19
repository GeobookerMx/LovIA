import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { validatePublicEnvironment } from './environment'

const { supabaseUrl, supabaseKey } = validatePublicEnvironment({
  mode: import.meta.env.MODE,
  appEnvironment: import.meta.env.VITE_APP_ENV,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  expectedRef: import.meta.env.VITE_SUPABASE_EXPECTED_REF,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  devBypass: import.meta.env.VITE_DEV_BYPASS,
})
// En Capacitor iOS, detectSessionInUrl puede colgar la inicialización
// porque el scheme capacitor:// no soporta hash fragments de OAuth.
const isNative  = Capacitor.isNativePlatform()
const isAndroid = Capacitor.getPlatform() === 'android'
const isIOS     = Capacitor.getPlatform() === 'ios'

// ⚠️ CRÍTICO — flowType por plataforma:
// • Android: 'implicit' — Chrome Custom Tab corre en proceso SEPARADO al WebView.
//   El code_verifier de PKCE se guarda en localStorage del WebView pero cuando
//   el deep link regresa, ese storage ya no es accesible → PKCE falla con 401.
// • iOS: 'pkce' — SFSafariViewController comparte proceso con el WebView → PKCE funciona.
// • Web: 'implicit' — flujo estándar de Supabase en navegador.
const flowType = isAndroid ? 'implicit' : (isIOS ? 'pkce' : 'implicit')

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // false en Capacitor: evita que Supabase intente leer el token del URL
    // (capacitor:// no soporta hash fragments de OAuth)
    detectSessionInUrl: !isNative,
    flowType,
  },
})
