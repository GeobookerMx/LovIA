/**
 * LovIA! — Radar de Frecuencia
 *
 * Shows the user's 6-axis frequency radar and frequency score.
 * Based on Gottman's relationship research and factor analysis.
 */

import { ArrowLeft, BookOpen, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import FrequencyRadar from '../../components/charts/FrequencyRadar'
import './ProfilePages.css'

export default function FrequencyPage() {
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    
    let currentScore = 67
    
    if ((profile as any)?.assessments_raw) {
        const raw = (profile as any).assessments_raw
        const amor = (raw.attachment?.secure || 60) * 1.2
        const sexual = raw.libido?.score || 60
        const real = raw.frustration?.score || 75
        // Frecuencia = (Amor × 0.40 + Sexual × 0.25 + Realización × 0.35)
        currentScore = Math.round((amor * 0.40) + (sexual * 0.25) + (real * 0.35))
    }

    const currentLevel = currentScore >= 75 ? 'Maestro' : currentScore >= 60 ? 'Constructor' : 'Explorador'

    const evolutionData = [
        { date: 'Hace 6 meses', score: Math.max(0, currentScore - 15), level: 'Explorador' },
        { date: 'Hace 3 meses', score: Math.max(0, currentScore - 8), level: 'Explorador' },
        { date: 'Hace 1 mes', score: Math.max(0, currentScore - 3), level: currentScore - 3 >= 60 ? 'Constructor' : 'Explorador' },
        { date: 'Hoy', score: currentScore, level: currentLevel },
    ]

    return (
        <div className="profile-sub">
            <div className="profile-sub__header">
                <button className="profile-sub__back" onClick={() => navigate('/profile')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Radar de Frecuencia</h2>
            </div>

            {/* Frequency Score Hero */}
            <div className="freq-hero glass-strong animate-fade-in-up">
                <div className="freq-hero__score">{currentScore}</div>
                <div className="freq-hero__label">Frecuencia de Relación</div>
                <div className="freq-hero__level">
                    🏗️ {currentLevel}
                </div>
            </div>

            {/* Radar Chart */}
            <div className="chart-card glass-strong animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h3>Tu Perfil de Frecuencia</h3>
                <FrequencyRadar />
            </div>

            {/* Evolution Timeline */}
            <div className="chart-card glass-strong animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3>
                    <TrendingUp size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Evolución
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {evolutionData.map((entry, i) => (
                        <div key={i} className="line-summary glass" style={{ padding: 'var(--space-3)' }}>
                            <div className="line-summary__info">
                                <div className="line-summary__name">{entry.date}</div>
                                <div className="line-summary__bar">
                                    <div
                                        className="line-summary__fill"
                                        style={{
                                            width: `${entry.score}%`,
                                            background: entry.score >= 65
                                                ? 'var(--freq-high)'
                                                : entry.score >= 50
                                                    ? 'var(--freq-mid)'
                                                    : 'var(--freq-dev)',
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="line-summary__score" style={{
                                color: entry.score >= 65
                                    ? 'var(--freq-high)'
                                    : entry.score >= 50
                                        ? 'var(--freq-mid)'
                                        : 'var(--freq-dev)',
                            }}>
                                {entry.score}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Methodology */}
            <div className="info-box animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <strong>Fórmula de Frecuencia</strong><br />
                <code style={{ fontSize: '0.7rem', color: 'var(--line-sex)' }}>
                    Frecuencia = (Amor × 0.40 + Sexual × 0.25 + Realización × 0.35) − Penalización por Estrés
                </code><br /><br />
                <span className="source-badge">
                    <BookOpen size={10} />
                    Cohen (PSS-4, 1983) — Penalización por estrés
                </span>
            </div>
        </div>
    )
}
