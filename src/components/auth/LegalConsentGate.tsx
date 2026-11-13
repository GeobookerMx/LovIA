import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { loadLegalAcceptance, recordLegalAcceptance } from '../../lib/legalConsent'
import { LEGAL_VERSION, type LegalAcceptance } from '../../lib/legalConsentPolicy'
import LegalModal from '../ui/LegalModal'
import { useAuthStore } from '../../stores/authStore'

export default function LegalConsentGate({ userId, children }: { userId: string; children: ReactNode }) {
  const { pathname } = useLocation()
  const [state, setState] = useState<'loading' | 'ready' | 'required' | 'error'>('loading')
  const [acceptance, setAcceptance] = useState<LegalAcceptance | null>(null)
  const [showLegal, setShowLegal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    void loadLegalAcceptance(userId).then(result => {
      if (!active) return
      setAcceptance(result)
      useAuthStore.getState().setSensitiveConsent(userId, result?.sensitive_data_consent ?? false)
      setState(result ? 'ready' : 'required')
    }).catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [userId, attempt, pathname])

  // Privacidad y baja permanecen accesibles sin obligar a aceptar una versión nueva.
  if (pathname === '/profile/settings' || pathname === '/profile/legal') return children
  if (state === 'ready' && acceptance) {
    const needsSensitiveConsent = /^\/(assessment|evaluations)(\/|$)/.test(pathname) || pathname === '/modules/finance'
    if (acceptance.sensitive_data_consent || !needsSensitiveConsent) return children
    return <main className="profile-sub" style={{ padding: '1.5rem', lineHeight: 1.7 }}><h1>Tú decides qué compartir</h1><p>Este recorrido puede guardar respuestas personales. No has autorizado el tratamiento opcional de datos sensibles. Puedes revisar esa elección en Configuración o explorar las demás herramientas de la Guía.</p><Link to="/profile/settings">Revisar mis preferencias</Link><Link to="/modules">Volver a la Guía</Link></main>
  }

  const accept = async (sensitiveData: boolean) => {
    if (saving) return
    setShowLegal(false)
    setSaving(true)
    setError('')
    try {
      const result = await recordLegalAcceptance(sensitiveData)
      setAcceptance(result)
      useAuthStore.getState().setSensitiveConsent(userId, result.sensitive_data_consent)
      setState('ready')
    } catch { setError('No pudimos registrar tus elecciones. Conservamos tu cuenta; revisa la conexión y vuelve a intentarlo.') }
    finally { setSaving(false) }
  }

  return <main className="profile-sub" style={{ maxWidth: 680, margin: 'auto', padding: '1.5rem', lineHeight: 1.7 }}>
    <h1>{state === 'loading' ? 'Preparando tu cuenta' : 'Tus decisiones de privacidad'}</h1>
    {state === 'loading' ? <p role="status"><Loader2 size={20} className="animate-spin" /> Comprobando tus preferencias…</p> : <>
      <p>Antes de continuar, revisa el aviso y los términos de LovIA (versión {LEGAL_VERSION}) y confirma que tienes 18 años o más. Registra tus decisiones para esta cuenta; no asumimos tu aceptación por haber iniciado sesión con Google, Apple o correo.</p>
      <p>La autorización de datos sensibles es opcional. Puedes decidirla por separado y consultar tus preferencias en Configuración.</p>
      {state === 'error' && <p role="alert">No pudimos consultar tu aceptación anterior. No necesitas crear otra cuenta.</p>}
      {error && <p role="alert">{error}</p>}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '1rem 0' }}>
        {state === 'error' ? <button type="button" style={{ minHeight: 44, padding: '.7rem' }} onClick={() => { setState('loading'); setAttempt(value => value + 1) }}>Reintentar consulta</button> : <button type="button" disabled={saving} style={{ minHeight: 44, padding: '.7rem' }} onClick={() => setShowLegal(true)}>{saving ? 'Registrando…' : 'Revisar y decidir'}</button>}
        <Link to="/profile/settings">Privacidad y eliminación de cuenta</Link>
      </div>
    </>}
    {showLegal && <LegalModal onClose={() => setShowLegal(false)} onAccept={sensitiveData => void accept(sensitiveData)} />}
  </main>
}
