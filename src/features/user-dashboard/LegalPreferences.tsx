import { useEffect, useState } from 'react'
import { loadLegalAcceptance, recordLegalAcceptance, revokeSensitiveConsent } from '../../lib/legalConsent'
import { LEGAL_VERSION, type LegalAcceptance } from '../../lib/legalConsentPolicy'
import { useAuthStore } from '../../stores/authStore'
import LegalModal from '../../components/ui/LegalModal'

export default function LegalPreferences({ userId }: { userId: string }) {
  const [acceptance, setAcceptance] = useState<LegalAcceptance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showLegal, setShowLegal] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    void loadLegalAcceptance(userId).then(result => {
      if (!active) return
      setAcceptance(result)
      setLoading(false)
      useAuthStore.getState().setSensitiveConsent(userId, result?.sensitive_data_consent ?? false)
    }).catch(() => { if (active) { setError('No pudimos consultar tus preferencias.'); setLoading(false) } })
    return () => { active = false }
  }, [userId, attempt])
  const save = async (sensitiveData: boolean, revokeOnly = false) => {
    if (saving) return
    setShowLegal(false)
    setSaving(true)
    setError('')
    try {
      const result = await (revokeOnly ? revokeSensitiveConsent() : recordLegalAcceptance(sensitiveData))
      setAcceptance(result)
      useAuthStore.getState().setSensitiveConsent(userId, result.sensitive_data_consent)
    } catch { setError('No pudimos confirmar el cambio. Reintenta; no se ha confirmado una preferencia nueva.') }
    finally { setSaving(false) }
  }
  return <section className="glass-strong" style={{ padding: '1rem', margin: '1rem 0', borderRadius: '1rem', lineHeight: 1.7 }} aria-labelledby="consent-preferences-title">
    <h3 id="consent-preferences-title">Tus consentimientos</h3>
    {loading ? <p role="status">Consultando tus elecciones…</p> : <>
      <p>{acceptance ? `Versión registrada: ${acceptance.legal_version}. Último registro: ${new Date(acceptance.recorded_at).toLocaleString('es-MX')}.` : `No hay una aceptación registrada de la versión ${LEGAL_VERSION}. No la asumimos por tu inicio de sesión.`}</p>
      {acceptance && <p role="status">Datos sensibles opcionales: <strong>{acceptance.sensitive_data_consent ? 'autorizados' : 'no autorizados'}</strong>.</p>}
      <p>Puedes desactivar el guardado de nuevas reflexiones y evaluaciones. Esto no borra lo anterior; para eliminar datos puedes utilizar las opciones del recorrido o solicitar la baja de tu cuenta.</p>
      <p>La elección se aplica a los recorridos de esta versión. Si utilizas LovIA en otros dispositivos, actualízalos también antes de continuar.</p>
      <div style={{ display: 'flex', gap: '.7rem', flexWrap: 'wrap' }}><button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setShowLegal(true)}>Revisar aviso y preferencias</button>
        {acceptance?.sensitive_data_consent && <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => void save(false, true)}>{saving ? 'Registrando…' : 'Desactivar datos sensibles'}</button>}
      </div>
    </>}
    {error && <div role="alert"><p>{error}</p><button type="button" className="btn btn-secondary" disabled={saving || loading} onClick={() => { setError(''); setLoading(true); setAttempt(value => value + 1) }}>Reintentar consulta</button></div>}
    {showLegal && <LegalModal initialSensitiveData={acceptance?.sensitive_data_consent ?? false} onClose={() => setShowLegal(false)} onAccept={value => void save(value)} />}
  </section>
}
