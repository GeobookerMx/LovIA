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
import { isNative } from './platform'

// ── URL Helpers ──────────────────────────────────────────────────────────────

const getWebRedirectUrl = (path = '/auth/callback') => {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return `${window.location.origin}${path}`
  }
  // Siempre www para evitar que el 301 redirect destruya el token OAuth
  return `https://www.lovia.com.mx${path}`
}

// Deep link para app nativa (se configura en Xcode y AndroidManifest)
const NATIVE_REDIRECT = 'lovia://auth/callback'

// ── Browser nativo (solo se importa en entorno Capacitor) ────────────────────

async function openBrowserNative(url: string): Promise<void> {
  // Carga dinámica para no romper el bundle web donde @capacitor/browser no existe
  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url, windowName: '_self' })
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
  if (isNative()) {
    // Mismo patrón: URL interno en SFSafariViewController.
    // Para Fase 2 se puede migrar a @capacitor-community/apple-sign-in
    // para un flujo completamente nativo (sin browser), pero Supabase OAuth
    // ya cumple los requisitos de Apple App Review.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: NATIVE_REDIRECT,
        skipBrowserRedirect: true,
      },
    })
    if (error) throw error
    if (data?.url) {
      await openBrowserNative(data.url)
    }
  } else {
    // Modo web: flujo normal
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: getWebRedirectUrl('/auth/callback') },
    })
    if (error) throw error
  }
}
