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
  // Importación dinámica para no incluir @capacitor/app en el bundle web
  import('@capacitor/app').then(({ App: CapApp }) => {
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      console.log('[LovIA] appUrlOpen recibido:', url)

      try {
        const { supabase } = await import('./lib/supabase')
        const { Browser }  = await import('@capacitor/browser')

        // El callback puede venir como fragment (#) o query string (?)
        // Supabase OAuth usa fragment: lovia://auth/callback#access_token=X&refresh_token=Y
        const fragmentIndex = url.indexOf('#')
        const queryIndex   = url.indexOf('?')
        const rawParams    = fragmentIndex !== -1
          ? url.slice(fragmentIndex + 1)
          : queryIndex !== -1
            ? url.slice(queryIndex + 1)
            : ''

        if (!rawParams) {
          console.warn('[LovIA] appUrlOpen: URL sin tokens, ignorando.')
          await Browser.close()
          return
        }

        const params        = new URLSearchParams(rawParams)
        const access_token  = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        if (access_token && refresh_token) {
          console.log('[LovIA] Tokens recibidos — iniciando sesión con setSession...')
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          // Cerrar SFSafariViewController — el user vuelve a la app
          await Browser.close()
          if (error) {
            console.error('[LovIA] setSession error:', error.message)
          } else {
            console.log('[LovIA] Sesión establecida correctamente vía deep link ✅')
            // onAuthStateChange actualizará el store → Login.tsx useEffect navega a /home
          }
        } else {
          // Puede venir un error de OAuth (ej: usuario canceló)
          const errorDesc = params.get('error_description') || params.get('error')
          if (errorDesc) {
            console.warn('[LovIA] OAuth deep link regresó con error:', errorDesc)
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
