import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, Heart, Calendar, Lock } from 'lucide-react'
import '../../components/matching/Matching.css'

export default function DateReadinessCheck() {
    const { id: matchId } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [emotionalState, setEmotionalState] = useState<'calm' | 'neutral' | 'stressed' | 'sad' | null>(null)
    const [hasTime, setHasTime] = useState<boolean | null>(null)
    const [agreesProtocol, setAgreesProtocol] = useState(false)

    const isBlocked = emotionalState === 'stressed' || emotionalState === 'sad' || hasTime === false
    const canProceed = emotionalState && hasTime !== null && agreesProtocol && !isBlocked

    const handleContinue = () => {
        if (canProceed) {
            // Pasó el Gate, ir al plan de encuentro
            navigate(`/matches/${matchId}/meeting`)
        }
    }

    return (
        <div style={{ padding: 'var(--space-6)', maxWidth: 'var(--max-content-width)', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <button className="icon-btn" onClick={() => navigate(`/matches/${matchId}`)}>
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ marginLeft: 'var(--space-4)', fontSize: 'var(--fs-xl)' }}>Date Readiness Gate</h2>
            </header>

            <div className="glass-strong animate-fade-in-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', flex: 1 }}>
                
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <ShieldAlert size={48} color="var(--line-realization)" style={{ margin: '0 auto var(--space-4)' }}/>
                    <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-2)' }}>Pausa de Bioseguridad</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
                        Antes de llevar esto al mundo real, LovIA requiere validar tu estado actual. 
                        Este paso es privado y protege tu experiencia de cita.
                    </p>
                </div>

                <div className="stagger-children">
                    {/* Pregunta 1: Emociones */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 'bold' }}>
                            <Heart size={16} color="var(--love-rose)"/> ¿Cómo te sientes emocionalmente hoy?
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button 
                                className={`icon-btn ${emotionalState === 'calm' ? 'active' : ''}`} 
                                style={{ background: emotionalState === 'calm' ? 'rgba(255,107,138,0.2)' : 'var(--bg-card)', border: emotionalState === 'calm' ? '1px solid var(--love-rose)' : '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}
                                onClick={() => setEmotionalState('calm')}
                            >
                                Tranquilo/Feliz
                            </button>
                            <button 
                                className={`icon-btn ${emotionalState === 'neutral' ? 'active' : ''}`} 
                                style={{ background: emotionalState === 'neutral' ? 'rgba(255,107,138,0.2)' : 'var(--bg-card)', border: emotionalState === 'neutral' ? '1px solid var(--love-rose)' : '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}
                                onClick={() => setEmotionalState('neutral')}
                            >
                                Normal/Neutro
                            </button>
                            <button 
                                className={`icon-btn ${emotionalState === 'stressed' ? 'active' : ''}`} 
                                style={{ background: emotionalState === 'stressed' ? 'rgba(255,107,138,0.2)' : 'var(--bg-card)', border: emotionalState === 'stressed' ? '1px solid var(--love-rose)' : '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}
                                onClick={() => setEmotionalState('stressed')}
                            >
                                Estresado/Tenso
                            </button>
                            <button 
                                className={`icon-btn ${emotionalState === 'sad' ? 'active' : ''}`} 
                                style={{ background: emotionalState === 'sad' ? 'rgba(255,107,138,0.2)' : 'var(--bg-card)', border: emotionalState === 'sad' ? '1px solid var(--love-rose)' : '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}
                                onClick={() => setEmotionalState('sad')}
                            >
                                Triste/Desmotivado
                            </button>
                        </div>
                    </div>

                    {/* Pregunta 2: Logística */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 'bold' }}>
                            <Calendar size={16} color="var(--line-sex)"/> ¿Tienes al menos 2 horas libres reales en los próximos 5 días?
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button 
                                className="icon-btn" 
                                style={{ background: hasTime === true ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)', border: hasTime === true ? '1px solid var(--success)' : '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}
                                onClick={() => setHasTime(true)}
                            >
                                Sí
                            </button>
                            <button 
                                className="icon-btn" 
                                style={{ background: hasTime === false ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)', border: hasTime === false ? '1px solid var(--warning)' : '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}
                                onClick={() => setHasTime(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>

                    {/* Pregunta 3: Protocolo */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={agreesProtocol} 
                                onChange={(e) => setAgreesProtocol(e.target.checked)}
                                style={{ marginTop: '4px' }}
                            />
                            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                Me comprometo a asistir a un lugar público, mediar mis expectativas y mantener una conducta respetuosa.
                            </span>
                        </label>
                    </div>

                    {/* Bloqueo Mensaje */}
                    {isBlocked && (
                        <div className="animate-fade-in" style={{ padding: 'var(--space-4)', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--warning)', borderRadius: '4px', marginBottom: 'var(--space-6)' }}>
                            <p style={{ color: 'var(--warning)', fontSize: 'var(--fs-sm)', fontWeight: 'bold' }}>
                                LovIA sugiere aplazar el encuentro.
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: '4px' }}>
                                Tus respuestas indican que hoy podrías no estar en el mejor momento logístico o emocional para iniciar una relación física. Te recomendamos descansar y volver a intentarlo otro día.
                            </p>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)' }}>
                    <button 
                        className="matches-page__cta" 
                        disabled={!canProceed}
                        onClick={handleContinue}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', opacity: canProceed ? 1 : 0.5, cursor: canProceed ? 'pointer' : 'not-allowed' }}
                    >
                        <Lock size={18} />
                        Desbloquear Plan de Encuentro
                    </button>
                </div>

            </div>
        </div>
    )
}
