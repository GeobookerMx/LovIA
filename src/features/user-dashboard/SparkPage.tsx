import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ChevronLeft, ChevronRight, Flame, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './SparkPage.css'

interface Spark {
    id: string
    question: string
    category: string
    options: string[]
    active_date: string
}

interface UserPattern {
    category: string
    count: number
}

export default function SparkPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [loading, setLoading] = useState(true)
    const [spark, setSpark] = useState<Spark | null>(null)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [hasRespondedToday, setHasRespondedToday] = useState(false)
    const [streak, setStreak] = useState(0)
    const [topPattern, setTopPattern] = useState<UserPattern | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        if (!user) return
        loadTodayData()
    }, [user])

    const loadTodayData = async () => {
        try {
            setLoading(true)
            const today = new Date().toISOString().split('T')[0]

            // 1. Get today's spark
            const { data: sparkData } = await supabase
                .from('sparks')
                .select('*')
                .eq('active_date', today)
                .maybeSingle()

            if (sparkData) setSpark(sparkData)

            // 2. Check if user already responded today
            if (sparkData && user) {
                const { data: response } = await supabase
                    .from('spark_responses')
                    .select('selected_option')
                    .eq('user_id', user.id)
                    .eq('spark_id', sparkData.id)
                    .maybeSingle()

                if (response) {
                    setHasRespondedToday(true)
                    setSelectedOption(sparkData.options.indexOf(response.selected_option))
                }
            }

            // 3. Get user streak
            if (user) {
                const { data: streakData } = await supabase
                    .from('user_streaks')
                    .select('current_streak')
                    .eq('user_id', user.id)
                    .maybeSingle()

                if (streakData) setStreak(streakData.current_streak)

                // 4. Calculate top pattern from recent responses
                const { data: recentResponses } = await supabase
                    .from('spark_responses')
                    .select('sparks (category)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(10)

                if (recentResponses && recentResponses.length > 0) {
                    const counts: Record<string, number> = {}
                    recentResponses.forEach((r: any) => {
                        const cat = r.sparks?.category
                        if (cat) counts[cat] = (counts[cat] || 0) + 1
                    })
                    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
                    if (top) setTopPattern({ category: top[0], count: top[1] })
                }
            }
        } catch (error) {
            console.error('Error loading spark data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectOption = async (index: number) => {
        if (hasRespondedToday || !user || !spark) return

        setSelectedOption(index)
        setHasRespondedToday(true)
        setStreak(s => s + 1)

        try {
            await supabase.from('spark_responses').insert({
                user_id: user.id,
                spark_id: spark.id,
                selected_option: spark.options[index]
            })
        } catch (error) {
            console.warn('[Spark] Error guardando respuesta:', error)
        }

        // RPC de racha — silenciamos error para no bloquear el flujo
        try { await supabase.rpc('update_user_streak', { p_user_id: user.id }) } catch (_) {}

        // Mostrar pantalla de éxito y navegar al home después de 2.5 seg
        setShowSuccess(true)
        setTimeout(() => navigate('/home'), 2500)
    }

    return (
        <div className="spark-page">
            <header className="spark-page__header">
                <h1>
                    <Zap size={22} color="var(--love-warm)" /> La Chispa
                </h1>
                <div className={`spark-page__streak glass ${hasRespondedToday ? 'animate-scale-in' : ''}`} style={hasRespondedToday ? { borderColor: 'var(--love-coral)', color: 'var(--love-coral)' } : {}}>
                    <Flame size={14} color={streak > 0 ? "var(--love-coral)" : "var(--text-tertiary)"} />
                    <span>{streak} días</span>
                </div>
            </header>

            {/* Pantalla de éxito post-respuesta */}
            {showSuccess && (
                <div className="spark-page__card glass-strong animate-scale-in" style={{ textAlign: 'center', padding: '3rem 2rem', marginTop: '2rem' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
                    <h2 style={{ color: 'var(--success)', marginBottom: 12 }}>¡Chispa registrada!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                        Tu respuesta contribuye a tu perfil de compatibilidad.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>
                        🔥 Racha: <strong style={{ color: 'var(--love-coral)' }}>{streak} días</strong>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Volviendo al inicio...</p>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: 16, padding: '12px 28px', borderRadius: 12 }}
                        onClick={() => navigate('/home')}
                    >
                        Ir al inicio →
                    </button>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <Loader2 size={32} className="animate-spin" color="var(--love-rose)" />
                </div>
            ) : !spark ? (
                <div className="spark-page__card glass-strong animate-scale-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No hay chispa activa para el día de hoy.</p>
                    <button className="button button--secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/home')}>
                        Volver al inicio
                    </button>
                </div>
            ) : (
                <>
                    {/* Card */}
                    <div className="spark-page__card glass-strong animate-scale-in">
                        <p className="spark-page__category">{spark.category}</p>
                        <h2 className="spark-page__question">
                            "{spark.question}"
                        </h2>
                        <div className="spark-page__options">
                            {spark.options.map((opt, i) => (
                                <button
                                    key={i}
                                    className={`spark-page__option glass ${selectedOption === i ? 'spark-page__option--selected' : ''}`}
                                    onClick={() => handleSelectOption(i)}
                                    disabled={hasRespondedToday}
                                    style={selectedOption === i 
                                        ? { background: 'var(--love-rose)', color: 'white', borderColor: 'var(--love-rose)' } 
                                        : hasRespondedToday ? { opacity: 0.5 } : {}
                                    }
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        {hasRespondedToday && (
                            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--success)' }}>
                                ¡Respuesta guardada! ✔️
                            </p>
                        )}
                    </div>

                    <div className="spark-page__nav">
                        <button className="spark-page__nav-btn glass" disabled={true} title="Anterior (próximamente)">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="spark-page__date">Hoy</span>
                        <button className="spark-page__nav-btn glass" disabled={true} title="Siguiente (próximamente)">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Insight */}
                    {hasRespondedToday && topPattern && (
                        <div className="spark-page__insight glass animate-fade-in-up">
                            <h3>💡 Tu patrón</h3>
                            <p>Tus respuestas recientes muestran que valoras profundamente los temas de <strong>{topPattern.category.toLowerCase()}</strong>.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
