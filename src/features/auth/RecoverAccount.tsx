import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { supabase } from '../../lib/supabase'
import './Auth.css'

export default function RecoverAccount() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [canReset, setCanReset] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setCanReset(true)
    })
    if (new URLSearchParams(window.location.search).get('mode') === 'reset') {
      supabase.auth.getSession().then(({ data }) => setCanReset(Boolean(data.session)))
    }
    return () => subscription.unsubscribe()
  }, [])

  const requestReset = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    const origin = Capacitor.isNativePlatform() ? import.meta.env.VITE_RECOVERY_WEB_ORIGIN : window.location.origin
    if (!origin || !String(origin).startsWith('https://')) {
      setMessage('La recuperación necesita un sitio web HTTPS configurado para este entorno.')
      setBusy(false)
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/recover?mode=reset`,
    })
    setMessage(error ? 'No pudimos enviar el enlace. Inténtalo de nuevo.' : 'Si la cuenta existe, recibirás un enlace de recuperación. Revisa también spam.')
    setBusy(false)
  }

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setMessage(error ? 'El enlace expiró o la contraseña no pudo actualizarse. Solicita otro enlace.' : 'Contraseña actualizada. Ya puedes iniciar sesión.')
    if (!error) setPassword('')
    setBusy(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-strong">
        <div className="auth-card__header"><h1>Recupera tu cuenta</h1><p>Te ayudamos a volver a LovIA.</p></div>
        {message && <p role="status">{message}</p>}
        {canReset ? (
          <form className="auth-card__form" onSubmit={updatePassword}>
            <div className="auth-card__field"><label htmlFor="new-password">Nueva contraseña</label>
              <div className="auth-card__input-wrap"><input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} /></div>
            </div>
            <button className="auth-card__submit" disabled={busy}>Guardar contraseña</button>
          </form>
        ) : (
          <form className="auth-card__form" onSubmit={requestReset}>
            <div className="auth-card__field"><label htmlFor="recovery-email">Correo electrónico</label>
              <div className="auth-card__input-wrap"><input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></div>
            </div>
            <button className="auth-card__submit" disabled={busy}>Enviar enlace</button>
          </form>
        )}
        <p className="auth-card__footer"><Link to="/login">Volver a iniciar sesión</Link></p>
      </div>
    </div>
  )
}
