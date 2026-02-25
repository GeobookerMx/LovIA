import { TrendingUp, Zap, Target, ChevronRight } from 'lucide-react'
import './Home.css'

export default function Home() {
    // Mock data — will come from Supabase
    const frequency = 67
    const level = 'Constructor'
    const progress = 40

    const getFrequencyColor = (f: number) => {
        if (f >= 75) return 'var(--freq-high)'
        if (f >= 50) return 'var(--freq-mid)'
        if (f >= 40) return 'var(--freq-dev)'
        return 'var(--freq-low)'
    }

    return (
        <div className="home">
            {/* Header */}
            <header className="home__header">
                <div>
                    <p className="home__greeting">Buenos días 👋</p>
                    <h1 className="home__name">Tu Espacio</h1>
                </div>
                <div className="home__header-badge glass">
                    <Target size={14} />
                    <span>{level}</span>
                </div>
            </header>

            {/* Frequency Card */}
            <div className="home__frequency glass animate-fade-in-up">
                <div className="home__frequency-header">
                    <TrendingUp size={18} color={getFrequencyColor(frequency)} />
                    <span className="home__frequency-label">Tu Frecuencia de Relación</span>
                </div>
                <div className="home__frequency-score" style={{ color: getFrequencyColor(frequency) }}>
                    {frequency}
                    <span className="home__frequency-max">/100</span>
                </div>
                <div className="home__frequency-bar">
                    <div
                        className="home__frequency-fill"
                        style={{ width: `${frequency}%`, background: getFrequencyColor(frequency) }}
                    />
                </div>
                <p className="home__frequency-hint">
                    {frequency >= 75 ? '🟢 Excelente — listo para matches de calidad' :
                        frequency >= 50 ? '🟡 En desarrollo — sigue mejorando' :
                            '🟠 Fundación — hay trabajo por hacer'}
                </p>
            </div>

            {/* Progress */}
            <div className="home__progress glass animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="home__progress-header">
                    <h3>Progreso</h3>
                    <span className="home__progress-pct">{progress}%</span>
                </div>
                <div className="home__progress-bar">
                    <div className="home__progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="home__progress-label">Nivel 1 ✓ → Nivel 2: {progress}%</p>
            </div>

            {/* Daily Spark Preview */}
            <div className="home__spark glass animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="home__spark-header">
                    <Zap size={18} color="var(--love-warm)" />
                    <span>La Chispa del Día</span>
                </div>
                <p className="home__spark-question">
                    "¿Qué cualidad admiras más en la persona que amas?"
                </p>
                <button className="home__spark-cta">
                    Responder <ChevronRight size={16} />
                </button>
            </div>

            {/* Recommendations */}
            <section className="home__recommendations stagger-children" style={{ animationDelay: '300ms' }}>
                <h3 className="home__section-title">Recomendado para ti</h3>
                <div className="home__rec-card glass">
                    <div className="home__rec-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>🧠</div>
                    <div>
                        <h4>Inteligencia Emocional</h4>
                        <p>Mejora tu comprensión emocional</p>
                    </div>
                    <ChevronRight size={18} color="var(--text-tertiary)" />
                </div>
                <div className="home__rec-card glass">
                    <div className="home__rec-icon" style={{ background: 'rgba(34, 211, 238, 0.15)' }}>💬</div>
                    <div>
                        <h4>Comunicación sin Juicio</h4>
                        <p>Basado en el método Gottman</p>
                    </div>
                    <ChevronRight size={18} color="var(--text-tertiary)" />
                </div>
            </section>
        </div>
    )
}
