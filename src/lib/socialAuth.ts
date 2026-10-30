/**
 * socialAuth.ts — OAuth social login
 *
 * ESTRATEGIA:
 * ─ Web (lovia.com.mx): Supabase redirige a lovia.com.mx/auth/callback normalmente.
 * ─ iOS/Android nativo: usamos skipBrowserRedirect + @capacitor/browser para abrir
 *   el URL de OAuth en un SFSafariViewController (iOS) o Chrome Custom Tab (Android).
 *   Esto es lo que Apple exige: el flujo se siente DENTRO de la app, no abre Safari
 *   externo como aplicación separada.
 *
 * El deep link lovia://auth/callback recoge el token y lo pasa a supabase.auth.
 *
 * REQUISITOS NATIVOS:
 * - npm install @capacitor/browser
 * - npx cap sync
 * - Deep link `lovia://auth/callback` configurado en Xcode (Info.plist) y Android (AndroidManifest)
 */
import { supabase } from './supabase'
import { isIOS, isNative } from './platform'

// ── URL Helpers ──────────────────────────────────────────────────────────────

const getWebRedirectUrl = (path = '/auth/callback') => {
  // PKCE stores its verifier on the starting origin. Keep the callback on that origin.
  // Both apex and www must be present in Supabase Auth's allowed redirect URLs.
  return `${window.location.origin}${path}`
}

// Deep link para app nativa (se configura en Xcode y AndroidManifest)
const NATIVE_REDIRECT = 'lovia://auth/callback'

// ── Browser nativo (solo se importa en entorno Capacitor) ────────────────────

async function openBrowserNative(url: string): Promise<void> {
  const { Browser } = await import('@capacitor/browser')
  // ✅ Sin windowName — en iOS usa SFSafariViewController (modal dentro de la app)
  // Apple Guideline 4.5.4: el flujo OAuth debe sentirse DENTRO de la app
  await Browser.open({ url })
}


// ── Google Login ─────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  if (isNative()) {
    // Modo nativo: Supabase genera URL pero NO redirige automáticamente.
    // Nosotros abrimos el URL en SFSafariViewController (integrado en la app).
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: NATIVE_REDIRECT,
        skipBrowserRedirect: true, // ← clave: evita que abra Safari externo
      },
    })
    if (error) throw error
    if (data?.url) {
      await openBrowserNative(data.url)
    }
  } else {
    // Modo web: flujo normal
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getWebRedirectUrl('/auth/callback') },
    })
    if (error) throw error
  }
}

// ── Apple Login ──────────────────────────────────────────────────────────────

export async function signInWithApple(): Promise<void> {
  if (isIOS()) {
    try {
      const { AppleSignIn, SignInScope } = await import('@capawesome/capacitor-apple-sign-in')
      
      // 1. Generar un nonce aleatorio seguro
      const rawNonce = Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('')
      
      // 2. Generar el hash SHA-256 del nonce (requerido para verificación de Apple y Supabase)
      const msgBuffer = new TextEncoder().encode(rawNonce)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashedNonce = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')


      console.log('[Apple Sign In] Iniciando flujo nativo...')
      const result = await AppleSignIn.signIn({
        scopes: [SignInScope.Email, SignInScope.FullName],
        nonce: hashedNonce,
      })
      
      if (!result.idToken) {
        throw new Error('No se recibió identityToken del proveedor de Apple')
      }

      console.log('[Apple Sign In] Intercambiando idToken con Supabase...')
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.idToken,
        nonce: rawNonce, // Enviamos el nonce original (sin hashear) a Supabase
      })

      if (error) throw error
      console.log('[Apple Sign In] Sesión nativa establecida.')
    } catch (err: unknown) {
      console.error('[Apple Sign In] Error en el flujo nativo.')
      throw err
    }
  } else if (isNative()) {
    // El plugin necesita un Service ID y initialize() en Android. El flujo
    // OAuth ya configurado en Supabase usa el mismo retorno nativo que Google.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
    })
    if (error) throw error
    if (!data?.url) throw new Error('No se recibió la URL de acceso con Apple.')
    await openBrowserNative(data.url)
  } else {
    // Modo web: flujo normal
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: getWebRedirectUrl('/auth/callback') },
    })
    if (error) throw error
  }
}

