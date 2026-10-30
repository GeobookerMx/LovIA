/**
 * FinanceSharePanel.tsx
 * Panel de «Conversaciones compartidas con consentimiento» para el módulo de finanzas.
 * Aparece como sección colapsable al final del FinanceJourney.
 */
import { useEffect, useState } from 'react'
import {
  CheckCircle2, ClipboardCopy, Eye, EyeOff, HandshakeIcon,
  Loader2, Lock, Share2, ShieldCheck, Trash2, Unlink, UserCheck, Users, XCircle,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { allFinanceQuestions } from './financeQuestions'
import type { FinanceAnswer } from './financeStorage'
import {
  acceptShareInvite, createShareInvite, getMyShareLink, loadMyShareConsents,
  loadPartnerAnswers, revokeShareLink, setShareConsent, type ShareLink,
} from './financeShare'

interface Props {
  /** Respuestas propias actuales (para mostrar qué eligió la persona). */
  myAnswers: Record<string, FinanceAnswer>
}

type Panel = 'closed' | 'main' | 'invite' | 'accept' | 'consents' | 'partner'
type Status = 'idle' | 'loading' | 'saving' | 'error' | 'success'

const SHAREABLE_QUESTION_KEYS = allFinanceQuestions
  .filter((q) => q.type !== 'text') // textos libres son siempre privados
  .map((q) => q.key)

export default function FinanceSharePanel({ myAnswers }: Props) {
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const [panel, setPanel] = useState<Panel>('closed')
  const [link, setLink] = useState<ShareLink | null>(null)
  const [consents, setConsents] = useState<Record<string, boolean>>({})
  const [partnerAnswers, setPartnerAnswers] = useState<Record<string, FinanceAnswer>>({})
  const [codeInput, setCodeInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Cargar enlace actual y consentimientos al abrir
  useEffect(() => {
    if (panel === 'closed' || !userId) return
    void loadState()
  }, [panel, userId])

  async function loadState() {
    setStatus('loading')
    try {
      const [myLink, myConsents] = await Promise.all([
        getMyShareLink(),
        loadMyShareConsents(),
      ])
      setLink(myLink)
      setConsents(myConsents)
      if (myLink?.status === 'active') {
        const partner = await loadPartnerAnswers()
        setPartnerAnswers(partner)
      }
    } catch {
      setErrorMsg('Error al cargar el estado del enlace.')
    } finally {
      setStatus('idle')
    }
  }

  async function handleCreate() {
    if (!userId) return
    setStatus('saving')
    try {
      const newLink = await createShareInvite()
      setLink(newLink)
      setPanel('invite')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'No se pudo crear la invitación.')
      setStatus('error')
      return
    }
    setStatus('idle')
  }

  async function handleAccept() {
    if (!codeInput.trim()) return
    setStatus('saving')
    setErrorMsg('')
    try {
      await acceptShareInvite(codeInput)
      await loadState()
      setStatus('success')
      setPanel('main')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Código no válido o expirado.')
      setStatus('error')
    }
  }

  async function handleRevoke() {
    if (!link) return
    setStatus('saving')
    try {
      await revokeShareLink(link.id)
      setLink(null)
      setPartnerAnswers({})
      setStatus('idle')
      setPanel('main')
    } catch {
      setErrorMsg('No se pudo revocar el acceso.')
      setStatus('error')
    }
  }

  async function handleConsentToggle(key: string) {
    if (!userId) return
    const next = !consents[key]
    setConsents((c) => ({ ...c, [key]: next }))
    try {
      await setShareConsent(userId, key, next)
    } catch {
      // Revertir en caso de error
      setConsents((c) => ({ ...c, [key]: !next }))
    }
  }

  function copyCode() {
    if (!link) return
    void navigator.clipboard.writeText(link.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const isActive = link?.status === 'active'
  const isPending = link?.status === 'pending'
  const expiresIn = link
    ? Math.max(0, Math.ceil((new Date(link.expires_at).getTime() - Date.now()) / 86_400_000))
    : 0

  if (panel === 'closed') {
    return (
      <section className="finance-page__panel" aria-labelledby="share-panel-title">
        <span className="finance-page__eyebrow"><Share2 size={16} aria-hidden /> Conversaciones</span>
        <h2 id="share-panel-title">Comparte con tu pareja (opcional)</h2>
        <p>
          Si ambas personas quieren comparar algunas de sus respuestas, pueden conectarse con un código de invitación.
          Tú decides qué preguntas compartir. Siempre puedes revocar el acceso.
        </p>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div className="finance-page__hero-note" style={{ background: 'rgba(255,255,255,.06)', borderRadius: '.7rem', padding: '.75rem 1rem', flex: 1, minWidth: 220 }}>
            <ShieldCheck size={18} aria-hidden style={{ flexShrink: 0, color: '#c969df' }} />
            <span style={{ fontSize: '.88rem' }}>Solo las respuestas que tú elijas compartir son visibles para la otra persona. Los textos libres nunca se comparten.</span>
          </div>
        </div>
        <button
          id="finance-share-open-btn"
          type="button"
          className="finance-page__primary"
          style={{ marginTop: '1rem' }}
          onClick={() => { if (userId) setPanel('main') }}
          disabled={!userId}
        >
          <Users size={17} aria-hidden /> Ver opciones de compartir
        </button>
      </section>
    )
  }

  return (
    <section className="finance-page__panel finance-share" aria-labelledby="share-panel-open-title">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem', marginBottom: '1rem' }}>
        <span className="finance-page__eyebrow"><Share2 size={16} /> Conversaciones compartidas</span>
        <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '.8rem' }} onClick={() => setPanel('closed')}>Cerrar</button>
      </div>

      {/* ── ESTADO DEL ENLACE ── */}
      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--love-rose)' }} />
        </div>
      )}

      {status !== 'loading' && (
        <>
          {/* Badge de estado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.2rem', padding: '.7rem 1rem', borderRadius: '.75rem', background: isActive ? 'rgba(16,185,129,.1)' : 'rgba(255,255,255,.05)', border: `1px solid ${isActive ? 'rgba(16,185,129,.3)' : 'var(--border-default)'}` }}>
            {isActive
              ? <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
              : isPending
                ? <Loader2 size={18} style={{ color: '#c969df', flexShrink: 0 }} />
                : <Lock size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
            <span style={{ fontSize: '.88rem', fontWeight: 700 }}>
              {isActive ? 'Conectadas · el acceso es mutuo y activo'
                : isPending ? `Esperando que la otra persona acepte · expira en ${expiresIn} día${expiresIn !== 1 ? 's' : ''}`
                  : 'Sin conexión · las respuestas son privadas'}
            </span>
          </div>

          {/* Error */}
          {status === 'error' && (
            <p role="alert" style={{ display: 'flex', gap: '.4rem', alignItems: 'center', color: 'var(--danger)', marginBottom: '1rem', fontSize: '.88rem' }}>
              <XCircle size={15} /> {errorMsg}
            </p>
          )}

          {/* ── PANEL PRINCIPAL ── */}
          {panel === 'main' && (
            <div style={{ display: 'grid', gap: '.75rem' }}>
              {!link && (
                <>
                  <button id="finance-create-invite-btn" type="button" className="finance-page__primary" onClick={() => void handleCreate()} disabled={status === 'saving'}>
                    {status === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                    Crear invitación para mi pareja
                  </button>
                  <button id="finance-accept-invite-btn" type="button" className="finance-page__primary" style={{ background: 'transparent', border: '1px solid #bf6ad2', color: '#f5b5f4' }} onClick={() => setPanel('accept')}>
                    <UserCheck size={16} /> Tengo un código de invitación
                  </button>
                </>
              )}
              {isPending && (
                <>
                  <button type="button" className="finance-page__primary" onClick={() => setPanel('invite')}>
                    <ClipboardCopy size={16} /> Ver código para compartir
                  </button>
                  <button type="button" style={{ background: 'none', border: '1px solid var(--border-default)', borderRadius: '.75rem', padding: '.6rem 1rem', color: 'var(--danger)', fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: '.4rem' }} onClick={() => void handleRevoke()}>
                    <Trash2 size={15} /> Cancelar invitación
                  </button>
                </>
              )}
              {isActive && (
                <>
                  <button type="button" className="finance-page__primary" onClick={() => setPanel('consents')}>
                    <Eye size={16} /> Elegir qué comparto
                  </button>
                  <button type="button" className="finance-page__primary" style={{ background: 'rgba(34,211,238,.1)', border: '1px solid rgba(34,211,238,.3)', color: '#67e8f9' }} onClick={() => setPanel('partner')}>
                    <HandshakeIcon size={16} /> Ver lo que compartió mi pareja
                  </button>
                  <button type="button" style={{ background: 'none', border: '1px solid var(--border-default)', borderRadius: '.75rem', padding: '.6rem 1rem', color: 'var(--danger)', fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: '.4rem' }} onClick={() => void handleRevoke()} disabled={status === 'saving'}>
                    {status === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={15} />} Revocar acceso compartido
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── CÓDIGO DE INVITACIÓN ── */}
          {panel === 'invite' && link && (
            <div>
              <h3 style={{ marginBottom: '.5rem' }}>Código de invitación</h3>
              <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Comparte este código con tu pareja por WhatsApp o como prefieras. Expira en {expiresIn} día{expiresIn !== 1 ? 's' : ''}.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '1rem', background: 'rgba(255,255,255,.06)', borderRadius: '.9rem', border: '1px solid #bf6ad2', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900, letterSpacing: '.25em', flex: 1 }}>{link.invite_code}</span>
                <button id="finance-copy-code-btn" type="button" className="finance-page__primary" style={{ flexShrink: 0 }} onClick={copyCode}>
                  {copied ? <CheckCircle2 size={16} /> : <ClipboardCopy size={16} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p style={{ fontSize: '.82rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                <ShieldCheck size={13} style={{ verticalAlign: 'middle' }} /> El código solo conecta a dos personas. Nadie más puede usarlo una vez aceptado.
              </p>
              <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '.88rem', textDecoration: 'underline' }} onClick={() => setPanel('main')}>← Volver</button>
            </div>
          )}

          {/* ── ACEPTAR INVITACIÓN ── */}
          {panel === 'accept' && (
            <div>
              <h3 style={{ marginBottom: '.5rem' }}>Ingresa el código de tu pareja</h3>
              <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Pídele a tu pareja el código de 8 caracteres que generó en LovIA.
              </p>
              <input
                id="finance-code-input"
                type="text"
                maxLength={8}
                placeholder="XXXXXXXX"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '.8rem', fontFamily: 'monospace', fontSize: '1.6rem', letterSpacing: '.2em', fontWeight: 900, border: '1px solid #9c89b4', borderRadius: '.75rem', background: 'rgba(255,255,255,.05)', color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}
              />
              <div style={{ display: 'flex', gap: '.6rem' }}>
                <button id="finance-accept-code-btn" type="button" className="finance-page__primary" onClick={() => void handleAccept()} disabled={status === 'saving' || codeInput.length !== 8}>
                  {status === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  Aceptar invitación
                </button>
                <button type="button" style={{ background: 'none', border: '1px solid var(--border-default)', borderRadius: '.75rem', padding: '.6rem 1rem', color: 'var(--text-secondary)' }} onClick={() => setPanel('main')}>Cancelar</button>
              </div>
            </div>
          )}

          {/* ── MIS CONSENTIMIENTOS ── */}
          {panel === 'consents' && (
            <div>
              <h3 style={{ marginBottom: '.4rem' }}>Elige qué comparto</h3>
              <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Activa las respuestas que quieres que tu pareja pueda ver. Los textos libres nunca se comparten.
              </p>
              <div style={{ display: 'grid', gap: '.5rem' }}>
                {allFinanceQuestions.filter((q) => SHAREABLE_QUESTION_KEYS.includes(q.key)).map((q) => {
                  const hasAnswer = !!myAnswers[q.key]
                  const shared = consents[q.key] ?? false
                  return (
                    <label key={q.key} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.7rem', borderRadius: '.7rem', background: shared ? 'rgba(214,119,234,.13)' : 'rgba(255,255,255,.04)', border: `1px solid ${shared ? '#bf6ad2' : 'var(--border-default)'}`, cursor: hasAnswer ? 'pointer' : 'not-allowed', opacity: hasAnswer ? 1 : .45 }}>
                      <input
                        type="checkbox"
                        checked={shared}
                        disabled={!hasAnswer}
                        onChange={() => void handleConsentToggle(q.key)}
                        style={{ width: 18, height: 18, accentColor: '#c969df', flexShrink: 0 }}
                      />
                      {shared ? <Eye size={15} style={{ color: '#c969df', flexShrink: 0 }} /> : <EyeOff size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
                      <span style={{ fontSize: '.88rem', lineHeight: 1.4 }}>{q.text}</span>
                    </label>
                  )
                })}
              </div>
              <button type="button" style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '.88rem', textDecoration: 'underline' }} onClick={() => setPanel('main')}>← Volver</button>
            </div>
          )}

          {/* ── RESPUESTAS DE MI PAREJA ── */}
          {panel === 'partner' && (
            <div>
              <h3 style={{ marginBottom: '.4rem' }}>Lo que compartió tu pareja</h3>
              <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Estas son las respuestas que tu pareja eligió compartir contigo. Solo las selecciones — nunca textos libres.
              </p>
              {Object.keys(partnerAnswers).length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <EyeOff size={28} style={{ margin: '0 auto .5rem', display: 'block' }} />
                  <p style={{ margin: 0 }}>Tu pareja aún no ha elegido compartir respuestas.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '.6rem' }}>
                  {allFinanceQuestions
                    .filter((q) => partnerAnswers[q.key])
                    .map((q) => {
                      const a = partnerAnswers[q.key]
                      return (
                        <div key={q.key} style={{ padding: '.8rem', borderRadius: '.75rem', background: 'rgba(34,211,238,.07)', border: '1px solid rgba(34,211,238,.2)' }}>
                          <p style={{ margin: '0 0 .3rem', fontSize: '.82rem', color: 'var(--text-tertiary)' }}>{q.text}</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '.9rem' }}>
                            {a.values.join(' · ') || '—'}
                          </p>
                        </div>
                      )
                    })}
                </div>
              )}
              <button type="button" style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '.88rem', textDecoration: 'underline' }} onClick={() => setPanel('main')}>← Volver</button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
