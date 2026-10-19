import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Zap, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { trackEvent } from '../../lib/analytics'
import './ProfilePages.css'

interface StrengthItem {
    title: string
    desc: string
    icon: string
    color: string
}

interface ImprovementItem {
    title: string
    desc: string
    actionText: string
    route: string
    icon: string
}

export default function ImprovementPage() {
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()
    
    const [evaluations, setEvaluations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        async function fetchEvaluations() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('evaluations')
                    .select('test_type, score, passed')
                    .eq('user_id', user!.id)

                if (!error && data) {
                    setEvaluations(data)
                }
            } catch (err) {
                console.error('[ImprovementPage] Error fetching evaluations:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchEvaluations()
        trackEvent('improvement_plan_opened')
    }, [user])

    if (loading) {
        return (
            <div className="profile-sub flex-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin text-tertiary" size={32} />
            </div>
        )
    }

    // Datos del perfil
    const assessmentsDone = profile?.assessments_done || []
    const readiness = profile?.readiness_score ?? 0

    // Determinar Fortalezas y Áreas de Mejora dinámicas
    const strengths: StrengthItem[] = []
    const improvements: ImprovementItem[] = []

    // 1. Diagnóstico de Apego
    if (assessmentsDone.includes('attachment')) {
        const style = (profile as any)?.attachment_style || 'secure'
        if (style === 'secure') {
            strengths.push({
                title: 'Apego Seguro 💚',
                desc: 'Muestras comodidad con la intimidad y la independencia relacional.',
                icon: '🤝',
                color: 'var(--success)'
            })
        } else {
            improvements.push({
                title: 'Ajuste de Patrón de Apego',
                desc: `Tu estilo es ${style === 'anxious' ? 'Ansioso' : style === 'avoidant' ? 'Evitativo' : 'Desorganizado'}. Desarrollar seguridad afectiva te ayudará a comunicarte mejor.`,
                actionText: 'Estudiar Estilos de Apego',
                route: '/modules',
                icon: '💞'
            })
        }
    } else {
        improvements.push({
            title: 'Descubrir Estilo de Apego',
            desc: 'Conoce tu forma de vincularte y cómo afecta tus relaciones.',
            actionText: 'Tomar Test de Apego',
            route: '/assessment/attachment',
            icon: '💞'
        })
    }

    // 2. Personalidad OCEAN (Big Five)
    if (assessmentsDone.includes('bigfive')) {
        strengths.push({
            title: 'Personalidad OCEAN Mapeada 🧬',
            desc: 'Has identificado tus rasgos de personalidad y estabilidad emocional.',
            icon: '📊',
            color: 'var(--line-love)'
        })
    } else {
        improvements.push({
            title: 'Evaluar Personalidad OCEAN',
            desc: 'Mide tus 5 rasgos principales para cruzar afinidad con otros.',
            actionText: 'Tomar Cuestionario BFI-10',
            route: '/assessment/bigfive',
            icon: '🔮'
        })
    }

    // 3. Valores Relacionales
    if (assessmentsDone.includes('values')) {
        strengths.push({
            title: 'Valores Relacionales Claros 🌟',
            desc: 'Has seleccionado tus prioridades relacionales (metas, familia, valores).',
            icon: '🎯',
            color: 'var(--love-warm)'
        })
    } else {
        improvements.push({
            title: 'Elegir Valores Esenciales',
            desc: 'Define tus 3 prioridades indispensables en pareja.',
            actionText: 'Seleccionar Valores',
            route: '/assessment/values',
            icon: '⭐'
        })
    }

    // 4. Pruebas Cognitivas
    const stroopTest = evaluations.find(e => e.test_type === 'stroop')
    const digitTest = evaluations.find(e => e.test_type === 'digit_span')
    const frustrationTest = evaluations.find(e => e.test_type === 'frustration_tolerance')

    if (stroopTest?.passed) {
        strengths.push({
            title: 'Control Inhibitorio Excelente 🧠',
            desc: 'Posees buena flexibilidad cognitiva y capacidad para pausar impulsos.',
            icon: '💡',
            color: 'var(--line-realization)'
        })
    } else {
        improvements.push({
            title: 'Ejercitar Control Stroop',
            desc: 'Mejora tu foco y control de impulsos relacionales con el juego Stroop.',
            actionText: 'Jugar Prueba Stroop',
            route: '/evaluations/stroop',
            icon: '🧠'
        })
    }

    if (digitTest?.passed) {
        strengths.push({
            title: 'Memoria de Trabajo Sólida 🧠',
            desc: 'Muestras buena retención de datos lógicos bajo presión.',
            icon: '🔢',
            color: 'var(--line-realization)'
        })
    }

    if (frustrationTest && Number(frustrationTest.score) >= 50) {
        strengths.push({
            title: 'Tolerancia al Estrés Relacional 🛡️',
            desc: 'Demuestras buena resiliencia y adaptabilidad emocional ante la frustración.',
            icon: '🧘',
            color: 'var(--success)'
        })
    } else if (frustrationTest) {
        improvements.push({
            title: 'Flexibilidad ante la Frustración',
            desc: 'Desarrolla resiliencia cognitiva frente a las expectativas no cumplidas.',
            actionText: 'Jugar Tolerancia',
            route: '/evaluations/frustration',
            icon: '🧘'
        })
    }

    // Diagnóstico Clínico Dinámico
    let diagnosisTitle = 'Autoconocimiento Inicial'
    let diagnosisDesc = 'Estás comenzando tu mapa de autoconocimiento. Te recomendamos completar tus cuestionarios de personalidad y apego para obtener un diagnóstico profundo.'
    let bandColor = 'var(--freq-low)'

    if (readiness >= 75) {
        diagnosisTitle = 'Preparación Óptima Relacional'
        diagnosisDesc = 'Posees un excelente nivel de introspección, autoconocimiento y estabilidad. Estás listo/a para entablar diálogos profundos y estables.'
        bandColor = 'var(--success)'
    } else if (readiness >= 60) {
        diagnosisTitle = 'Preparación Avanzada'
        diagnosisDesc = 'Tienes buena conciencia emocional y logística relacional. Tu sintonía es estable y el descubrimiento del radar está totalmente desbloqueado.'
        bandColor = 'var(--freq-high)'
    } else if (readiness >= 40) {
        diagnosisTitle = 'Preparación en Crecimiento'
        diagnosisDesc = 'Has desbloqueado la vista previa del radar. Aún posees áreas de oportunidad comunicativas o emocionales en las que puedes trabajar.'
        bandColor = 'var(--love-warm)'
    }

    // Siguiente Acción Prioritaria
    const nextAction = improvements[0] || null

    // Proyecciones dinámicas basadas en readiness
    const currentPool = Math.round(readiness * 1.5 + 10)
    const projectedPool = Math.round(100 * 1.5 + 10)
    const poolDiff = projectedPool - currentPool

    return (
        <div className="profile-sub">
            {/* Header */}
            <header className="profile-sub__header">
                <button className="profile-sub__back" onClick={() => navigate('/profile')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Plan de Mejora</h2>
            </header>

            <div className="profile-content__body animate-fade-in-up">
                
                {/* 1. Diagnóstico General */}
                <div className="settings-item glass-strong" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Sparkles size={20} color={bandColor} />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: bandColor }}>{diagnosisTitle}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {diagnosisDesc}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Puntaje de Preparación (Readiness):</span>
                        <strong style={{ color: bandColor, fontSize: '1.1rem' }}>{readiness}/100</strong>
                    </div>
                </div>

                {/* 2. Siguiente Acción Concreta */}
                {nextAction && (
                    <div className="settings-item glass-strong" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '20px', marginTop: '16px', border: '1px solid rgba(255, 77, 109, 0.25)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--love-rose)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                            🚀 Siguiente Acción Prioritaria
                        </span>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <span style={{ fontSize: '2rem' }}>{nextAction.icon}</span>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem' }}>{nextAction.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{nextAction.desc}</p>
                            </div>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate(nextAction.route)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px' }}
                        >
                            {nextAction.actionText} <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {/* 3. Fortalezas (Solo si existen) */}
                {strengths.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingLeft: '4px' }}>
                            💪 Tus Fortalezas Relacionales
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {strengths.map((str, idx) => (
                                <div key={idx} className="settings-item glass-strong" style={{ gap: '12px', padding: '16px', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.5rem', marginTop: '-2px' }}>{str.icon}</span>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: str.color }}>{str.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{str.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Áreas de Mejora */}
                {improvements.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingLeft: '4px' }}>
                            🌱 Áreas de Oportunidad
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {improvements.map((imp, idx) => (
                                <div 
                                    key={idx} 
                                    className="settings-item glass-strong" 
                                    style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                    onClick={() => navigate(imp.route)}
                                >
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                                        <span style={{ fontSize: '1.5rem' }}>{imp.icon}</span>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem' }}>{imp.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{imp.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} color="var(--text-tertiary)" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Proyección de Sintonía */}
                <div className="settings-item glass-strong" style={{ flexDirection: 'column', padding: '20px', marginTop: '24px', textAlign: 'center' }}>
                    <TrendingUp size={24} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        Ampliación de Compatibilidad
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', margin: '12px 0' }}>
                        <div>
                            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                ~{currentPool}
                            </span>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Afinidad actual</p>
                        </div>
                        <Zap size={20} style={{ color: 'var(--success)' }} />
                        <div>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
                                ~{projectedPool}
                            </span>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Afinidad máxima</p>
                        </div>
                    </div>
                    {poolDiff > 0 ? (
                        <p style={{ fontSize: '0.78rem', color: 'var(--success)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                            📈 Trabajar en tus áreas pendientes te permitirá conectar con hasta <strong>+{poolDiff} compatibilidades adicionales</strong>.
                        </p>
                    ) : (
                        <p style={{ fontSize: '0.78rem', color: 'var(--success)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                            🏆 Has alcanzado tu compatibilidad máxima potencial. ¡Sigue interactuando!
                        </p>
                    )}
                </div>

            </div>
        </div>
    )
}
