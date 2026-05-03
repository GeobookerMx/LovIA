import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Shield, LogIn, AlertTriangle, Loader } from 'lucide-react'

// ── Correos autorizados como admin ───────────────────────────────────────────
const ADMIN_EMAILS = [
  'juanpablopg0416@gmail.com',
  'juan.pablo.pg@hotmail.com',
]

type State = 'loading' | 'allowed' | 'denied' | 'unauthenticated'

export default function AdminGuard() {
  const [state, setState] = useState<State>('loading')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        setState('unauthenticated')
        return
      }

      setUserEmail(user.email ?? null)

      // Capa 1: email en whitelist
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        setState('allowed')
        return
      }

      // Capa 2: JWT app_metadata
      if (user.app_metadata?.role === 'admin') {
        setState('allowed')
        return
      }

      // Capa 3: tabla user_roles
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      if (data?.some(r => r.role === 'admin')) {
        setState('allowed')
        return
      }

      setState('denied')
    }

    check()
  }, [])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state === 'loading') return (
    <div style={styles.screen}>
      <Loader size={40} color="#FF4D6D" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={styles.subtitle}>Verificando acceso…</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  // ── No autenticado ─────────────────────────────────────────────────────────
  if (state === 'unauthenticated') return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <Shield size={48} color="#FF4D6D" />
        <h1 style={styles.title}>Panel de Administración</h1>
        <p style={styles.subtitle}>Debes iniciar sesión para continuar</p>
        <button
          style={styles.btn}
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/admin` }
            })
          }}
        >
          <LogIn size={18} />
          Continuar con Google
        </button>
      </div>
    </div>
  )

  // ── Acceso denegado ────────────────────────────────────────────────────────
  if (state === 'denied') return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <AlertTriangle size={48} color="#F59E0B" />
        <h1 style={styles.title}>Acceso Denegado</h1>
        <p style={styles.subtitle}>
          La cuenta <strong style={{ color: '#FF4D6D' }}>{userEmail}</strong> no tiene permisos de administrador.
        </p>
        <button
          style={{ ...styles.btn, background: 'rgba(255,255,255,0.08)', color: '#ccc' }}
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/admin'
          }}
        >
          Cambiar cuenta
        </button>
      </div>
    </div>
  )

  // ── Acceso permitido ───────────────────────────────────────────────────────
  return <Outlet />
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0E0B2A 0%, #1a1040 100%)',
    gap: '16px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px',
    padding: '40px 32px',
    maxWidth: '400px',
    width: '90vw',
    textAlign: 'center',
    backdropFilter: 'blur(20px)',
  },
  title: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    margin: 0,
    lineHeight: 1.5,
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #FF4D6D, #C9184A)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
    width: '100%',
    justifyContent: 'center',
  },
}
