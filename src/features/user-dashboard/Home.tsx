import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Zap, Target, ChevronRight, BookOpen, Shield, Share2 } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useEvaluationStore } from '../../stores/evaluationStore'
import { supabase } from '../../lib/supabase'
import ShareCard from '../../components/shared/ShareCard'
import './Home.css'

function getDynamicGreeting() {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12)  return 'Buenos días ☀️'
    if (hour >= 12 && hour < 19) return 'Buenas tardes 🌤️'
    return 'Buenas noches 🌙'
}

function calculateProgress(evalStore: ReturnType<typeof useEvaluationStore.getState>) {
    const tests = [evalStore.stroop, evalStore.digitSpan, evalStore.frustrationTolerance, evalStore.emotionalRegulation]
    const passed = tests.filter(t => t?.passed).length
    return Math.round((passed / tests.length) * 100)
}

interface TodaySpark {
    question: string
    category: string
}

export default function Home() {
    const navigate = useNavigate()
    const profile = useAuthStore(s => s.profile)
    const evalStore = useEvaluationStore()
    const [spark, setSpark] = useState<TodaySpark | null>(null)

    const profileAny = profile as unknown as Record<string, unknown> | null
    const frequency = (profileAny?.frequency as number) ?? 0
    const level = (profileAny?.frequency_level as string) ?? 'Despertar'
    const progress = calculateProgress(evalStore)

    const getFrequencyColor = (f: number) => {
        if (f >= 75) return 'var(--freq-high)'
        if (f >= 50) return 'var(--freq-mid)'
        if (f >= 40) return 'var(--freq-dev)'
        return 'var(--freq-low)'
    }

    const [showShare, setShowShare] = useState(false)

    // Load today's spark from Supabase
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        supabase
            .from('sparks')
            .select('question, category')
            .eq('active_date', today)
            .maybeSingle()
            .then(({ data }) => {
                if (data) setSpark(data)
            })
    }, [])

    const name = profile?.alias || 'tú'
    const greeting = getDynamicGreeting()

    return (
        <div className="home">
            {/* Header */}
            <header className="home__header">
                <div>
                    <p className="home__greeting">{greeting}</p>
                    <h1 className="home__name">{name} 👋</h1>
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
                            frequency > 0 ? '🟠 Fundación — hay trabajo por hacer' :
                                '⚪ Completa tu perfil y evaluaciones para calcular tu frecuencia'}
                </p>
            </div>

            {/* Progress */}
            <div className="home__progress glass animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="home__progress-header">
                    <h3>Progreso de Evaluaciones</h3>
                    <span className="home__progress-pct">{progress}%</span>
                </div>
                <div className="home__progress-bar">
                    <div className="home__progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="home__progress-label">
                    {progress === 100
                        ? '✅ Todas las evaluaciones completadas'
                        : progress > 0
                            ? `${progress}% completado — continúa tus evaluaciones`
                            : 'Completa tus evaluaciones para avanzar'}
                </p>
            </div>

            {/* Daily Spark Preview */}
            <div className="home__spark glass animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="home__spark-header">
                    <Zap size={18} color="var(--love-warm)" />
                    <span>La Chispa del Día</span>
                    {spark && <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: 'auto' }}>{spark.category}</span>}
                </div>
                <p className="home__spark-question">
                    "{spark?.question ?? 'Cargando pregunta del día...'}"
                </p>
                <button className="home__spark-cta" onClick={() => navigate('/spark')}>
                    Responder <ChevronRight size={16} />
                </button>
            </div>

            {/* Quick Access */}
            <section className="home__recommendations stagger-children" style={{ animationDelay: '300ms' }}>
                <h3 className="home__section-title">Acceso rápido</h3>
                <div className="home__rec-card glass" onClick={() => navigate('/modules')} style={{ cursor: 'pointer' }}>
                    <div className="home__rec-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                        <BookOpen size={20} color="var(--love-rose)" />
                    </div>
                    <div>
                        <h4>Mis Módulos</h4>
                        <p>{progress === 100 ? 'Todos completados ✅' : 'Continúa tu aprendizaje'}</p>
                    </div>
                    <ChevronRight size={18} color="var(--text-tertiary)" />
                </div>
                <div className="home__rec-card glass" onClick={() => navigate('/verification')} style={{ cursor: 'pointer' }}>
                    <div className="home__rec-icon" style={{ background: 'rgba(34, 211, 238, 0.15)' }}>
                        <Shield size={20} color="var(--freq-mid)" />
                    </div>
                    <div>
                        <h4>Verificación</h4>
                        <p>Aumenta tu nivel de confianza</p>
                    </div>
                    <ChevronRight size={18} color="var(--text-tertiary)" />
                </div>
            </section>

            {/* Free period banner */}
            <div className="home__free-banner">
                🎉 <strong>Acceso GRATIS por 4 meses</strong> — Sin tarjeta requerida
            </div>

            {/* Compartir */}
            <button className="home__share-btn" onClick={() => setShowShare(true)} id="home-share-btn">
                <Share2 size={16} />
                Invitar amigos a LovIA!
            </button>

            {showShare && <ShareCard onClose={() => setShowShare(false)} />}
        </div>
    )
}
