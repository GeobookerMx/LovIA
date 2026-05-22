import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Capacitor } from '@capacitor/core'

// ── Observabilidad en Release ─────────────────────────────────────────────────
// Captura errores JS no manejados para ayudar a diagnosticar rechazos de App Review.
// En producción estos van a consola nativa (visible con Xcode → Devices & Simulators).
window.addEventListener('unhandledrejection', (event) => {
  console.error('[LovIA] Unhandled Promise Rejection:', event.reason)
})

// ── Deep Link Handler para OAuth Nativo ──────────────────────────────────────
// CRÍTICO: Sin este listener, el token de Google/Apple nunca llega a Supabase
// después de que SFSafariViewController cierra y redirige a lovia://auth/callback.
//
// Flujo:
//   1. signInWithGoogle/Apple abre SFSafariViewController con skipBrowserRedirect:true
//   2. El proveedor redirige a lovia://auth/callback#access_token=...&refresh_token=...
//   3. iOS dispara el evento appUrlOpen → este listener lo captura
//   4. Supabase procesa el token y dispara onAuthStateChange → authStore actualiza
if (Capacitor.isNativePlatform()) {
  import('@capacitor/app').then(({ App: CapApp }) => {
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      console.log('[LovIA] appUrlOpen recibido:', url)

      try {
        const { supabase } = await import('./lib/supabase')
        const { Browser }  = await import('@capacitor/browser')

        const urlObj = new URL(url)

        // ── FLUJO 1: PKCE (Supabase v2 por defecto en iOS nativo) ──────────
        // El proveedor redirige a: lovia://auth/callback?code=XXXX
        const code = urlObj.searchParams.get('code')
        if (code) {
          console.log('[LovIA] Código PKCE recibido — intercambiando por sesión...')
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          // Pequeño delay para evitar race condition con el WebContent
          await new Promise(resolve => setTimeout(resolve, 300))
          await Browser.close()
          if (error) {
            console.error('[LovIA] exchangeCodeForSession error:', error.message)
          } else {
            console.log('[LovIA] Sesión PKCE establecida correctamente ✅')
          }
          return
        }

        // ── FLUJO 2: Implicit / Legacy (#access_token=X&refresh_token=Y) ───
        const fragmentIndex = url.indexOf('#')
        const queryIndex    = url.indexOf('?')
        const rawParams     = fragmentIndex !== -1
          ? url.slice(fragmentIndex + 1)
          : queryIndex !== -1
            ? url.slice(queryIndex + 1)
            : ''

        if (!rawParams) {
          console.warn('[LovIA] appUrlOpen: URL sin tokens ni código, ignorando.')
          await Browser.close()
          return
        }

        const params        = new URLSearchParams(rawParams)
        const access_token  = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        if (access_token && refresh_token) {
          console.log('[LovIA] Tokens recibidos — iniciando sesión con setSession...')
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          await new Promise(resolve => setTimeout(resolve, 300))
          await Browser.close()
          if (error) {
            console.error('[LovIA] setSession error:', error.message)
          } else {
            console.log('[LovIA] Sesión (implicit) establecida correctamente ✅')
          }
        } else {
          const errorDesc = params.get('error_description') || params.get('error')
          if (errorDesc) {
            console.warn('[LovIA] OAuth regresó con error:', errorDesc)
          }
          await Browser.close()
        }
      } catch (err) {
        console.error('[LovIA] Error en appUrlOpen handler:', err)
      }
    })
    console.log('[LovIA] appUrlOpen listener registrado ✅')
  }).catch((err) => {
    console.error('[LovIA] No se pudo cargar @capacitor/app:', err)
  })
}


createRoot(document.getElementById('root')!).render(
  <App />
)
