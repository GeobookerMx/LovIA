import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Loader2, AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const finish = async () => {
      try {
        console.log('[LovIA] AuthCallbackPage: procesando callback OAuth...')

        // Dar tiempo a Supabase para procesar el hash fragment (OAuth PKCE)
        // antes de llamar getSession — evita race condition en iOS WKWebView.
        await new Promise((r) => setTimeout(r, 300))

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[LovIA] AuthCallback getSession error:', sessionError.message)
          setErrorMsg('Error al verificar la sesión. Por favor intenta de nuevo.')
          return
        }

        if (!session?.user) {
          // Puede pasar si el token expiró o el callback llegó tarde
          console.warn('[LovIA] AuthCallback: sin sesión activa — redirigiendo a /login')
          navigate('/login', { replace: true })
          return
        }

        console.log('[LovIA] AuthCallback: sesión verificada para user:', session.user.id)

        const next = searchParams.get('next')
        if (next === '/onboarding') {
          navigate('/onboarding', { replace: true })
          return
        }

        // Leer perfil para decidir destino
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profileError) {
          // Error de DB — onboarding es el camino más seguro
          console.warn('[LovIA] AuthCallback: error leyendo perfil:', profileError.message)
          navigate('/onboarding', { replace: true })
          return
        }

        const destination = profile?.onboarding_completed ? '/home' : '/onboarding'
        console.log('[LovIA] AuthCallback: navegando a', destination)
        navigate(destination, { replace: true })

      } catch (err: any) {
        console.error('[LovIA] AuthCallback: error inesperado:', err)
        setErrorMsg('Error inesperado. Por favor regresa e intenta de nuevo.')
      }
    }

    finish()
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