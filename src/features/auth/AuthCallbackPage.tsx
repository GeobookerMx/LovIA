import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Loader2, AlertCircle } from 'lucide-react'

function wantsAdmin(next: string | null): boolean {
  let stored = false
  try {
    stored = sessionStorage.getItem('lovia_admin_next') === '1'
    if (stored) sessionStorage.removeItem('lovia_admin_next')
  } catch { /* sin storage */ }
  return next === '/admin' || stored
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let navigated = false

    // Si el proveedor (Google/Apple) devolvió un error, avisar al usuario de inmediato.
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const providerError = searchParams.get('error_description') || hashParams.get('error_description')
      || searchParams.get('error') || hashParams.get('error')
    if (providerError) {
      console.warn('[LovIA] AuthCallback: el proveedor devolvió un error:', providerError)
      setErrorMsg('No pudimos completar el acceso con ese proveedor. Entra con tu correo y contraseña o inténtalo más tarde.')
      return
    }

    // Fallback: listen for auth state change in case the hash is processed AFTER mount
    // (common on Android Chrome WebView where OAuth token arrives asynchronously)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (navigated) return
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        navigated = true
        subscription.unsubscribe()
        console.log('[LovIA] AuthCallback: sesión recibida.')

        if (wantsAdmin(searchParams.get('next'))) {
          navigate('/admin', { replace: true })
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profileError) {
          setErrorMsg('Entraste a tu cuenta, pero no pudimos cargar tu perfil. Vuelve a intentarlo.')
          return
        }
        const destination = profile?.onboarding_completed ? '/home' : '/onboarding'
        navigate(destination, { replace: true })
      }
    })

    const finish = async () => {
      try {
        console.log('[LovIA] AuthCallbackPage: procesando callback OAuth...')

        // Dar tiempo a Supabase para procesar el hash fragment (OAuth PKCE)
        // 800ms en lugar de 300ms para Android WebView que puede ser más lento
        await new Promise((r) => setTimeout(r, 800))

        if (navigated) return // el listener ya lo manejó

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[LovIA] AuthCallback getSession error:', sessionError.message)
          setErrorMsg('Error al verificar la sesión. Por favor intenta de nuevo.')
          subscription.unsubscribe()
          return
        }

        if (!session?.user) {
          // Puede pasar si el token expiró o el callback llegó tarde
          console.warn('[LovIA] AuthCallback: sin sesión activa — redirigiendo a /login')
          // No redirigir inmediatamente — esperar al listener hasta 5 segundos más
          await new Promise((r) => setTimeout(r, 5000))
          if (navigated) return
          subscription.unsubscribe()
          setErrorMsg('No pudimos iniciar tu sesión. Entra con tu correo y contraseña o inténtalo de nuevo.')
          return
        }

        navigated = true
        subscription.unsubscribe()
        console.log('[LovIA] AuthCallback: sesión verificada.')

        if (wantsAdmin(searchParams.get('next'))) {
          navigate('/admin', { replace: true })
          return
        }

        // Leer perfil para decidir destino
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profileError) {
          console.warn('[LovIA] AuthCallback: error leyendo perfil:', profileError.message)
          setErrorMsg('Entraste a tu cuenta, pero no pudimos cargar tu perfil. Vuelve a intentarlo.')
          return
        }

        const destination = profile?.onboarding_completed ? '/home' : '/onboarding'
        console.log('[LovIA] AuthCallback: navegando a', destination)
        navigate(destination, { replace: true })

      } catch {
        console.error('[LovIA] AuthCallback: error inesperado.')
        subscription.unsubscribe()
        setErrorMsg('Error inesperado. Por favor regresa e intenta de nuevo.')
      }
    }

    finish()

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, searchParams])


  if (errorMsg) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100svh',
        gap: '1rem',
        background: 'var(--bg-base, #0E0B2A)',
        color: 'var(--text-primary, #fff)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <AlertCircle size={40} color="var(--love-rose, #FF4D6D)" />
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary, #aaa)' }}>{errorMsg}</p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '999px',
            background: 'var(--love-rose, #FF4D6D)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Volver al login
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100svh',
      gap: '1rem',
      background: 'var(--bg-base, #0E0B2A)',
      color: 'var(--text-primary, #fff)',
    }}>
      <Loader2 size={40} className="animate-spin" color="var(--love-rose, #FF4D6D)" />
      <p style={{ fontSize: '1rem', color: 'var(--text-secondary, #aaa)' }}>
        Iniciando sesión segura...
      </p>
    </div>
  )
}
