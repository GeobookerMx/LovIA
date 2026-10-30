import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Clock, Video, MapPin, MessageCircle,
    ThumbsUp, ThumbsDown, AlertTriangle, Lock, Brain, Loader2, MessageSquare
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useEvaluationStore } from '../../stores/evaluationStore'
import { chooseReportReason, reportAndBlock } from '../../lib/reporting'
import MatchProgress from '../../components/matching/MatchProgress'
import '../../components/matching/Matching.css'

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === 'true'

const levelActions: Record<number, { label: string; icon: React.ReactNode; route?: string }> = {
    1: { label: 'Aceptar Match', icon: <ThumbsUp size={16} /> },
    2: { label: 'Aceptar y revelar perfil', icon: <ThumbsUp size={16} /> },
    3: { label: 'Iniciar videollamada', icon: <Video size={16} />, route: 'call' },
    4: { label: 'Ver plan de encuentro', icon: <MapPin size={16} />, route: 'date-readiness' },
    5: { label: 'Evaluar encuentro', icon: <MessageCircle size={16} />, route: 'review' },
}

const gateRequirements: Record<number, {
    testName: string
    testRoute: string
    description: string
    icon: React.ReactNode
}> = {
    2: {
        testName: 'Test de Stroop',
        testRoute: '/evaluations/stroop',
        description: 'Esta versión pide completar la actividad para avanzar. Su resultado no mide compatibilidad ni determina cómo te relacionas.',
        icon: <Brain size={18} />,
    },
    3: {
        testName: 'Digit Span (Memoria de Trabajo)',
        testRoute: '/evaluations/digit-span',
        description: 'Esta versión pide completar la actividad para avanzar. Su resultado no mide compatibilidad ni determina cómo escuchas a otra persona.',
        icon: <Brain size={18} />,
    },
}

export default function MatchDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const canAccessLevel2 = useEvaluationStore((s) => s.canAccessLevel2)
    const canAccessLevel3 = useEvaluationStore((s) => s.canAccessLevel3)

    const [match, setMatch] = useState<any>(null)
    const [otherUser, setOtherUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Fetch from Supabase
    useEffect(() => {
        async function fetchMatch() {
            if (!user || !id) return
            const [matchResult, cardResult] = await Promise.all([
                supabase.from('matches').select('*').eq('id', id).maybeSingle(),
                supabase.rpc('lovia_match_cards_v1', { p_match_id: id }).maybeSingle(),
            ])

            if (matchResult.error || cardResult.error || !matchResult.data || !cardResult.data) {
                console.error(matchResult.error || cardResult.error)
                setLoading(false)
                return
            }

            setMatch(matchResult.data)
            const card = cardResult.data as { target_user_id: string }
            setOtherUser({ ...card, id: card.target_user_id })
            setLoading(false)
        }
        fetchMatch()
    }, [id, user])

    if (loading) {
        return <div className="match-detail flex-center"><Loader2 className="animate-spin" /></div>
    }

    if (!match || !otherUser) {
        return (
            <div className="match-detail">
                <div className="match-detail__empty glass-strong">
                    <h2>Match no encontrado</h2>
                    <button onClick={() => navigate('/matches')}>Volver a matches</button>
                </div>
            </div>
        )
    }

    const action = levelActions[match.current_level]

    // Check cognitive gates
    const isGated =
        (match.current_level === 2 && !canAccessLevel2()) ||
        (match.current_level === 3 && !canAccessLevel3())

    const gateInfo = gateRequirements[match.current_level]

    // En modo dev, nunca hay gates ni expiración 🚧
    const effectiveGated = DEV_BYPASS ? false : isGated

    const handleAccept = async () => {
        if (effectiveGated) return
        if (action.route) {
            navigate(`/matches/${match.id}/${action.route}`)
        } else {
            // Next Level Logic
            const { data: updated } = await supabase.from('matches').update({
                current_level: match.current_level + 1
            }).eq('id', match.id).select().single()
            // ✅ Actualizar estado local en lugar de window.location.reload() que rompe Capacitor
            if (updated) setMatch(updated)
        }
    }

    const handleDecline = async () => {
        await supabase.from('matches').update({ status: 'declined' }).eq('id', match.id)
        navigate('/matches')
    }

    const handleReport = async () => {
        const reason = chooseReportReason()
        if (!reason || !user) return
        const result = await reportAndBlock(user.id, otherUser.id, match.id, reason)
        if (result.blocked && result.reported && result.hidden) {
            alert('Reporte enviado y conexión bloqueada.')
            navigate('/matches')
        } else if (result.blocked) {
            alert('Se registró el bloqueo, pero no pudimos confirmar todas las acciones. Contacta a soporte.')
            navigate('/matches')
        } else {
            alert('No pudimos confirmar el bloqueo. Inténtalo de nuevo o contacta a soporte.')
        }
    }

    const daysRemaining = DEV_BYPASS
        ? 999
        : Math.max(0, Math.ceil(
            (new Date(match.expires_at || Date.now() + 86400000).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ))

    // UI Photo Logic
    const mode = otherUser.visibility_mode
    const level = match.current_level
    let photoClass = 'match-detail__photo'
    if (mode === 'essence') photoClass += ' match-card__visibility--essence'
    else if (mode === 'gradual' && level < 3) photoClass += ' match-card__visibility--gradual'

    return (
        <div className="match-detail">
            {/* Header */}
            <div className="match-detail__header" style={{ marginBottom: '1rem' }}>
                <button className="match-detail__back" onClick={() => navigate('/matches')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Perfil de {otherUser.alias}</h2>
            </div>

            {/* Photo / Essence Section */}
            <div className="match-detail__photo-container" style={{ position: 'relative', height: 300, borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem'}}>
                {mode === 'essence' && level < 3 && (
                    <div className="match-card__essence-bg" style={{position: 'absolute', inset: 0, zIndex: 10}}>
                        <span className="match-card__badge-essence">🔮</span>
                        <span className="match-card__text-essence">Visibilidad restringida a Nivel 3</span>
                    </div>
                )}
                <img 
                    src={otherUser.avatar_url || '/icons/icon-192.png'}
                    alt="profile" 
                    className={photoClass} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* Progress */}
            <div className="match-detail__progress glass-strong">
                <MatchProgress currentLevel={match.current_level} />
            </div>

            {/* Info cards */}
            <div className="match-detail__info-grid">
                <div className="match-detail__info-card glass">
                    <span className="match-detail__info-label">Nivel actual</span>
                    <span className="match-detail__info-value">{match.current_level}/5</span>
                </div>

                <div className="match-detail__info-card glass">
                    <span className="match-detail__info-label">Estado</span>
                    <span className={`admin-status admin-status--${match.status}`}>
                        {match.status === 'active' ? 'Activo' : 'Completado'}
                    </span>
                </div>

                <div className="match-detail__info-card glass">
                    <span className="match-detail__info-label">Expira en</span>
                    <span className="match-detail__info-value">
                        <Clock size={14} /> {daysRemaining} días
                    </span>
                </div>
            </div>

            {/* El cálculo heredado de readiness no representa afinidad psicológica validada. */}
            <div className="match-detail__premium-insights glass-strong" style={{ padding: '1.5rem', margin: '1.5rem 0' }}>
                <h3>Conoce a esta persona a tu ritmo</h3>
                <p>Las sugerencias de LovIA son un punto de partida. Conversa, comprueba afinidades reales y usa las herramientas de seguridad cuando lo necesites.</p>
            </div>

            {/* Cognitive Gate Warning */}
            {isGated && gateInfo && (
                <div className="match-detail__gate glass-strong animate-fade-in-up" style={{
                    borderLeft: '3px solid var(--warning)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    margin: 'var(--space-4) 0',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <Lock size={18} color="var(--warning)" />
                        <strong style={{ color: 'var(--warning)' }}>Evaluación cognitiva requerida</strong>
                    </div>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                        {gateInfo.description}
                    </p>
                    <button
                        className="match-detail__accept"
                        style={{ background: 'var(--warning)', cursor: 'pointer' }}
                        onClick={() => navigate(gateInfo.testRoute)}
                    >
                        {gateInfo.icon} Realizar {gateInfo.testName}
                    </button>
                </div>
            )}

            {/* Actions */}
            {match.status === 'active' && (
                <div className="match-detail__actions">
                    {/* Optional Chat Button (unlocked at level 2) */}
                    {match.current_level >= 2 && (
                        <button 
                            className="match-detail__accept" 
                            style={{ background: 'var(--love-rose)', marginBottom: '8px' }}
                            onClick={() => navigate(`/matches/${match.id}/chat`)}
                        >
                            <MessageSquare size={16} /> Abrir Chat Seguro
                        </button>
                    )}

                    {!isGated ? (
                        <button className="match-detail__accept" onClick={handleAccept}>
                            {action.icon} {action.label}
                        </button>
                    ) : (
                        <button className="match-detail__accept" disabled style={{ opacity: 0.4 }}>
                            <Lock size={16} /> Completar evaluación
                        </button>
                    )}
                    <button className="match-detail__decline" onClick={handleDecline}>
                        <ThumbsDown size={16} /> Rechazar
                    </button>
                    <button className="match-detail__report" onClick={handleReport}>
                        <AlertTriangle size={14} /> Reportar y Bloquear
                    </button>
                </div>
            )}
        </div>
    )
}
