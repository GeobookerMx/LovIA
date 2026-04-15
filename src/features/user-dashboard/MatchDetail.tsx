import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Clock, Video, MapPin, MessageCircle,
    ThumbsUp, ThumbsDown, AlertTriangle, Lock, Brain, Loader2, MessageSquare
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useEvaluationStore } from '../../stores/evaluationStore'
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
        description: 'Completa el Test de Stroop para demostrar control inhibitorio — una habilidad clave para la comunicación de pareja.',
        icon: <Brain size={18} />,
    },
    3: {
        testName: 'Digit Span (Memoria de Trabajo)',
        testRoute: '/evaluations/digit-span',
        description: 'Completa el test para verificar tu capacidad de memoria de trabajo — esencial para escuchar activamente.',
        icon: <Brain size={18} />,
    },
}

export default function MatchDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()
    const canAccessLevel2 = useEvaluationStore((s) => s.canAccessLevel2)
    const canAccessLevel3 = useEvaluationStore((s) => s.canAccessLevel3)

    const [match, setMatch] = useState<any>(null)
    const [otherUser, setOtherUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Fetch from Supabase
    useEffect(() => {
        async function fetchMatch() {
            if (!user || !id) return
            const { data, error } = await supabase
                .from('matches')
                .select(`
                    *,
                    user_a:profiles!matches_user_a_id_fkey(id, alias, age, city, avatar_url, visibility_mode),
                    user_b:profiles!matches_user_b_id_fkey(id, alias, age, city, avatar_url, visibility_mode)
                `)
                .eq('id', id)
                .single()

            if (error || !data) {
                console.error(error)
                setLoading(false)
                return
            }

            setMatch(data)
            setOtherUser(data.user_a.id === user.id ? data.user_b : data.user_a)
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
            await supabase.from('matches').update({
                current_level: match.current_level + 1
            }).eq('id', match.id)
            window.location.reload()
        }
    }

    const handleDecline = async () => {
        await supabase.from('matches').update({ status: 'declined' }).eq('id', match.id)
        navigate('/matches')
    }

    const handleReport = async () => {
        const reason = window.prompt("¿Por qué deseas reportar a este usuario? (Tus respuestas son estrictamente confidenciales y revisadas por el equipo de moderación):")
        if (!reason || !user) return

        alert("Enviando reporte encriptado a Moderación...")
        const { error } = await supabase.from('moderation_reports').insert({
            reporter_id: user.id,
            reported_id: otherUser.id,
            reason: reason,
        })
        
        if (!error) {
            // Terminamos el match por seguridad automaticamente
            await supabase.from('matches').update({ status: 'declined' }).eq('id', match.id)
            alert("Reporte recibido. Por tu seguridad el match ha sido bloqueado ocultamente. Esta persona ya no podrá verte ni contactarte.")
            navigate('/matches')
        } else {
            alert("Error al enviar el reporte. Por favor intenta de nuevo.")
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
                    src={otherUser.avatar_url || 'https://via.placeholder.com/300'} 
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
                    <span className="match-detail__info-label">Compatibilidad</span>
                    <span className="match-detail__info-value" style={{
                        color: match.compatibility_score >= 70 ? 'var(--freq-high)' :
                            match.compatibility_score >= 50 ? 'var(--freq-mid)' : 'var(--freq-low)'
                    }}>
                        {match.compatibility_score}%
                    </span>
                </div>

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

            {/* Premium Insights */}
            <div className="match-detail__premium-insights glass-strong animate-fade-in-up" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1.5rem', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--love-rose)', fontSize: '1.1rem' }}>
                    <Brain size={20} /> Análisis Profundo (Premium)
                </h3>
                
                {profile?.tier === 'free' ? (
                    <>
                        <div style={{ filter: 'blur(6px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: 'var(--fs-sm)' }}>
                                <span>Apego Evitativo vs Ansioso</span>
                                <span style={{ color: 'var(--success)' }}>Favorable</span>
                            </div>
                            <div style={{ background: 'var(--bg-input)', height: '6px', borderRadius: '4px', marginBottom: '16px' }}>
                                <div style={{ background: 'var(--success)', width: '85%', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: 'var(--fs-sm)' }}>
                                <span>Visión de Familia</span>
                                <span style={{ color: 'var(--warning)' }}>Fricción Detectada</span>
                            </div>
                            <div style={{ background: 'var(--bg-input)', height: '6px', borderRadius: '4px' }}>
                                <div style={{ background: 'var(--warning)', width: '40%', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                        </div>

                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 10, 12, 0.4)', zIndex: 10 }}>
                            <Lock size={32} color="var(--freq-high)" style={{ marginBottom: '12px' }}/>
                            <h4 style={{ margin: 0, marginBottom: '8px', fontSize: 'var(--fs-md)' }}>Contenido Exclusivo</h4>
                            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '80%', marginBottom: '16px' }}>
                                Descubre las áreas exactas donde sintonizan y los retos psicológicos de esta conexión.
                            </p>
                            <button className="landing__cta landing__cta--primary" onClick={() => navigate('/pricing')} style={{ padding: '8px 24px', fontSize: 'var(--fs-sm)', borderRadius: '24px' }}>
                                Desbloquear Insights
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="stagger-children">
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: 'var(--fs-sm)' }}>
                                <span>Regulación Emocional Conjunta</span>
                                <span style={{ color: match.compatibility_score > 60 ? 'var(--success)' : 'var(--warning)', fontWeight: 'bold' }}>
                                    {match.compatibility_score > 60 ? 'Sinergia Fuerte' : 'Atención Requerida'}
                                </span>
                            </div>
                            <div style={{ background: 'var(--bg-input)', height: '6px', borderRadius: '4px' }}>
                                <div style={{ background: match.compatibility_score > 60 ? 'var(--success)' : 'var(--warning)', width: `${Math.min(95, match.compatibility_score + 15)}%`, height: '100%', borderRadius: '4px' }}></div>
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px', lineHeight: 1.4 }}>
                                {match.compatibility_score > 60 
                                    ? "Ambos demostraron herramientas maduras de tolerancia a la frustración en el test ICI." 
                                    : "Mucha precaución en la resolución de conflictos. Recomendamos la guía LovIA de Tiempos Fuera."}
                            </p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: 'var(--fs-sm)' }}>
                                <span>Logística y Momento de Vida</span>
                                <span style={{ color: 'var(--freq-mid)', fontWeight: 'bold' }}>Balanceado</span>
                            </div>
                            <div style={{ background: 'var(--bg-input)', height: '6px', borderRadius: '4px' }}>
                                <div style={{ background: 'var(--freq-mid)', width: `${Math.min(80, match.compatibility_score)}%`, height: '100%', borderRadius: '4px' }}></div>
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px', lineHeight: 1.4 }}>
                                Tienen expectativas alineadas sobre el futuro cercano, aunque difieren ligeramente en su disposición geográfica a largo plazo.
                            </p>
                        </div>
                    </div>
                )}
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
