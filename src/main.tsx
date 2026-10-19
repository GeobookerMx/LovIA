import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Capacitor } from '@capacitor/core'

// ── Observabilidad en Release ─────────────────────────────────────────────────
// Captura errores JS no manejados para ayudar a diagnosticar rechazos de App Review.
// En producción estos van a consola nativa (visible con Xcode → Devices & Simulators).
window.addEventListener('unhandledrejection', () => {
  console.error('[LovIA] Ocurrió un error no controlado.')
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
    let processingUrl: string | null = null
    const handleDeepLink = async (url: string) => {
      if (processingUrl === url) return
      let parsed: URL
      try { parsed = new URL(url) } catch { return }
      if (parsed.protocol !== 'lovia:' || parsed.hostname !== 'auth' || parsed.pathname !== '/callback' || parsed.username || parsed.password || parsed.port) {
        console.warn('[LovIA] [DeepLink] Destino no permitido.')
        return
      }
      processingUrl = url
      console.log('[LovIA] [DeepLink] Callback recibido.')
 
      try {
        const { supabase } = await import('./lib/supabase')
        const { Browser }  = await import('@capacitor/browser')
 
        console.log('[LovIA] [DeepLink] Parseando URL...')
        const urlObj = parsed
 
        // ── Helper: navegar a /home de forma segura con HashRouter ──────
        const navigateToHome = () => {
          setTimeout(() => {
            const hash = window.location.hash
            console.log('[LovIA] [DeepLink] Verificando navegación tras autenticación.')
            const isAuthPage = !hash || hash === '#/' || hash.startsWith('#/login')
            if (isAuthPage) {
              console.log('[LovIA] [DeepLink] Redirigiendo a #/home...')
              window.location.hash = '#/home'
            } else {
              console.log('[LovIA] [DeepLink] Navegación actual conservada.')
            }
          }, 800) // Esperar a que onAuthStateChange actualice el store
        }
 
        // ── FLUJO 1: PKCE (iOS — SFSafariViewController) ──────────────
        const code = urlObj.searchParams.get('code')
        if (code) {
          console.log('[LovIA] [DeepLink] Código PKCE detectado.')
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          console.log('[LovIA] [DeepLink] Intentando cerrar Browser...')
          await Browser.close().catch(() => console.warn('[LovIA] No se pudo cerrar el navegador.'))
          if (error) {
            console.error('[LovIA] [DeepLink] Falló el intercambio PKCE.')
          } else {
            console.log('[LovIA] [DeepLink] Sesión PKCE establecida con éxito ✅')
            navigateToHome()
          }
          return
        }
 
        // ── FLUJO 2: Implicit / Legacy (#access_token=X&refresh_token=Y) ─
        const fragmentIndex = url.indexOf('#')
        const queryIndex    = url.indexOf('?')
        const rawParams     = fragmentIndex !== -1
          ? url.slice(fragmentIndex + 1)
          : queryIndex !== -1
            ? url.slice(queryIndex + 1)
            : ''
 
        if (!rawParams) {
          console.warn('[LovIA] [DeepLink] URL no contiene parámetros legibles. Ignorando.')
          await Browser.close().catch(() => console.warn('[LovIA] No se pudo cerrar el navegador.'))
          return
        }
 
        const params        = new URLSearchParams(rawParams)
        const access_token  = params.get('access_token')
        const refresh_token = params.get('refresh_token')
 
        if (access_token && refresh_token) {
          console.log('[LovIA] [DeepLink] Tokens OAuth detectados. setSession iniciando...')
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          await Browser.close().catch(() => console.warn('[LovIA] No se pudo cerrar el navegador.'))
          if (error) {
            console.error('[LovIA] [DeepLink] Falló la sesión OAuth.')
          } else {
            console.log('[LovIA] [DeepLink] Sesión OAuth establecida con éxito ✅')
            navigateToHome()
          }
        } else {
          const errorDesc = params.get('error_description') || params.get('error')
          if (errorDesc) {
            console.warn('[LovIA] [DeepLink] OAuth regresó con error del proveedor.')
          }
          await Browser.close().catch(() => console.warn('[LovIA] No se pudo cerrar el navegador.'))
        }
      } catch {
        console.error('[LovIA] [DeepLink] No se pudo procesar el callback.')
      } finally {
        processingUrl = null
      }
    }
    void CapApp.addListener('appUrlOpen', ({ url }) => { void handleDeepLink(url) })
    void CapApp.getLaunchUrl().then(result => { if (result?.url) void handleDeepLink(result.url) })
    console.log('[LovIA] appUrlOpen listener registrado con logs enriquecidos ✅')
  }).catch(() => {
    console.error('[LovIA] No se pudo cargar el controlador de enlaces.')
  })
}


createRoot(document.getElementById('root')!).render(
  <App />
)
