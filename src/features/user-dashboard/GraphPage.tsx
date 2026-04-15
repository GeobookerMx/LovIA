/**
 * LovIA! — Gráfica de Relación
 *
 * Shows the user's 3 relationship lines over time.
 * Based on Sternberg's Triangular Theory of Love (1986).
 */

import { ArrowLeft, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import RelationshipGraph from '../../components/charts/RelationshipGraph'
import { getAmorNarrative, getSexualNarrative, getRealizacionNarrative } from '../../lib/narrativeEngine'
import './ProfilePages.css'

export default function GraphPage() {
    const navigate = useNavigate()
    const { profile } = useAuthStore()

    // Calculate dynamic scores based on DB assessments
    let amor = 72, sexual = 60, real = 75
    if ((profile as any)?.assessments_raw) {
        const raw = (profile as any).assessments_raw
        amor = Math.round((raw.attachment?.secure || 60) * 1.2) // Boost secure attachment to 100-scale approx
        sexual = Math.round(raw.libido?.score || 60)
        real = Math.round(raw.frustration?.score || 75)
    }

    const amorNarrative = getAmorNarrative(Math.min(amor, 100))
    const sexualNarrative = getSexualNarrative(Math.min(sexual, 100))
    const realNarrative = getRealizacionNarrative(Math.min(real, 100))

    const lineData = [
        { emoji: '❤️', name: 'Línea del Amor', score: Math.min(amor, 100), color: '#FF6B8A', source: 'Sternberg — Intimidad', narrative: amorNarrative },
        { emoji: '🔥', name: 'Línea Sexual', score: Math.min(sexual, 100), color: '#A855F7', source: 'Perel — Pasión y Deseo', narrative: sexualNarrative },
        { emoji: '⭐', name: 'Línea de Realización', score: Math.min(real, 100), color: '#22D3EE', source: 'Maslow — Autorrealización', narrative: realNarrative },
    ]

    return (
        <div className="profile-sub">
            <div className="profile-sub__header">
                <button className="profile-sub__back" onClick={() => navigate('/profile')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Gráfica de Relación</h2>
            </div>

            <p className="profile-sub__subtitle">
                Tu evolución en las 3 dimensiones fundamentales del amor, basadas en la
                <strong> Teoría Triangular de Sternberg (1986)</strong>.
            </p>

            {/* Chart */}
            <div className="chart-card glass-strong animate-fade-in-up">
                <h3>Evolución Mensual</h3>
                <RelationshipGraph />
            </div>

            {/* Line Summaries */}
            <div className="line-summaries stagger-children">
                {lineData.map((line) => (
                    <div key={line.name} className="line-summary glass" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '12px' }}>
                            <div className="line-summary__icon">{line.emoji}</div>
                            <div className="line-summary__info" style={{ flex: 1 }}>
                                <div className="line-summary__name">{line.name}</div>
                                <div className="line-summary__bar">
                                    <div
                                        className="line-summary__fill"
                                        style={{ width: `${line.score}%`, background: line.color }}
                                    />
                                </div>
                                <span className="source-badge" style={{ marginTop: '6px' }}>
                                    <BookOpen size={10} />
                                    {line.source}
                                </span>
                            </div>
                        </div>
                        <div style={{ padding: '0 8px', width: '100%' }}>
                            <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: line.narrative.color, marginBottom: '2px' }}>
                                Etapa: {line.narrative.title}
                            </div>
                            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                                {line.narrative.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* How it works */}
            <div className="info-box animate-fade-in-up">
                <strong>¿Cómo se calcula?</strong><br />
                Cada línea se evalúa a partir de tus respuestas en los cuestionarios y los factores asociados.
                La <strong>Línea del Amor</strong> (40%) mide intimidad emocional (Sternberg, 1986).
                La <strong>Línea Sexual</strong> (25%) evalúa deseo y compatibilidad física (Perel, 2006).
                La <strong>Línea de Realización</strong> (35%) refleja tu estabilidad personal y metas (Maslow, 1943; Deci & Ryan, 1985).
            </div>
        </div>
    )
}
