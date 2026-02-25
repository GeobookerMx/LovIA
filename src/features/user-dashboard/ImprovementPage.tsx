import { ArrowLeft, TrendingUp, Clock, BookOpen, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../components/matching/Matching.css'

interface WeakArea {
    name: string
    factor_key: string
    current: number
    target: number
    module: string
    color: string
}

const mockAreas: WeakArea[] = [
    { name: 'Inteligencia Emocional', factor_key: 'ie', current: 1.8, target: 3.0, module: 'Módulo IE: Reconocimiento emocional', color: 'var(--line-love)' },
    { name: 'Comunicación', factor_key: 'comm', current: 2.2, target: 3.5, module: 'Módulo: Comunicación sin juicio (Gottman)', color: 'var(--line-sex)' },
    { name: 'Tolerancia', factor_key: 'tolerance', current: 2.0, target: 3.0, module: 'Módulo: Resiliencia y adaptabilidad', color: 'var(--line-realization)' },
]

const mockProjection = {
    current_pool: 120,
    projected_pool: 340,
    message: 'Trabajar en IE y Comunicación te abre +220 matches potenciales',
}

const mockCooldown = {
    active: true,
    remaining_days: 12,
    reason: 'Post-encuentro: período de reflexión y crecimiento',
}

export default function ImprovementPage() {
    const navigate = useNavigate()

    return (
        <div className="improvement">
            {/* Header */}
            <div className="meeting-plan__header">
                <button className="meeting-plan__back" onClick={() => navigate('/profile')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Plan de Mejora</h2>
            </div>

            {/* Tagline */}
            <div className="meeting-plan__card glass-strong animate-fade-in-up">
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, textAlign: 'center' }}>
                    <em>Mejora tú → mejora tu match.</em><br />
                    Cada área que trabajas incrementa tu Frecuencia y amplía tu pool de compatibilidad.
                </p>
            </div>

            {/* Weak areas */}
            {mockAreas.map((area, i) => (
                <div
                    key={area.factor_key}
                    className="improvement__area glass-strong animate-fade-in-up"
                    style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                >
                    <div className="improvement__area-header">
                        <div>
                            <strong>{area.name}</strong>
                            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                                {area.current.toFixed(1)} → {area.target.toFixed(1)}
                            </p>
                        </div>
                        <span style={{
                            fontFamily: 'var(--font-accent)',
                            fontSize: 'var(--fs-xl)',
                            fontWeight: 'var(--fw-bold)',
                            color: area.color,
                        }}>
                            {Math.round((area.current / 4) * 100)}%
                        </span>
                    </div>

                    <div className="improvement__score-bar">
                        <div
                            className="improvement__score-fill"
                            style={{ width: `${(area.current / 4) * 100}%`, background: area.color }}
                        />
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)',
                    }}>
                        <BookOpen size={12} />
                        {area.module}
                    </div>
                </div>
            ))}

            {/* Projection */}
            <div className="improvement__projection glass-strong animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <TrendingUp size={24} style={{ color: 'var(--success)', margin: '0 auto var(--space-3)' }} />
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                    Pool de matches potenciales
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)' }}>
                    <div>
                        <span style={{ fontFamily: 'var(--font-accent)', fontSize: 'var(--fs-xl)', color: 'var(--text-secondary)' }}>
                            ~{mockProjection.current_pool}
                        </span>
                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>Actual</p>
                    </div>
                    <Zap size={20} style={{ color: 'var(--success)' }} />
                    <div>
                        <span className="improvement__projection-number">
                            ~{mockProjection.projected_pool}
                        </span>
                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>Proyectado</p>
                    </div>
                </div>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--success)', marginTop: 'var(--space-3)' }}>
                    {mockProjection.message}
                </p>
            </div>

            {/* Cooldown */}
            {mockCooldown.active && (
                <div className="improvement__cooldown glass animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <Clock size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                    <div>
                        <strong style={{ fontSize: 'var(--fs-sm)' }}>
                            Cooldown: {mockCooldown.remaining_days} días restantes
                        </strong>
                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {mockCooldown.reason}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
