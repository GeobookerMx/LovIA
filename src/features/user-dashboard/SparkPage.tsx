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
            // ✅ FIX TIMEZONE: usar zona horaria de México, no UTC
            // new Date().toISOString() da fecha UTC — a las 6 PM MX ya es mañana en UTC
            const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })

            // 1. Get today's spark
            let { data: sparkData } = await supabase
                .from('sparks')
                .select('*')
                .eq('active_date', today)
                .maybeSingle()

            // ✅ FALLBACK: si no hay chispa para hoy, tomar una aleatoria
            if (!sparkData) {
                const { data: anySpark } = await supabase
                    .from('sparks')
                    .select('*')
                    .lte('active_date', today)
                    .order('active_date', { ascending: false })
                    .limit(10)
                if (anySpark && anySpark.length > 0) {
                    sparkData = anySpark[Math.floor(Math.random() * anySpark.length)]
                }
            }

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

        // Sincronizar spark_streak en profiles para que Home lo pueda leer
        try {
            const newStreak = streak + 1
            await supabase.from('profiles')
                .update({ spark_streak: newStreak })
                .eq('id', user.id)
        } catch (_) {}

        // Mostrar pantalla de éxito — el usuario cierra manualmente
        setShowSuccess(true)
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

            {/* Modal de éxito + cooldown informativo */}
            {showSuccess && (
                <div className="spark-page__card glass-strong animate-scale-in" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginTop: '1rem' }}>
                    {/* Animación de éxito */}
                    <div style={{ fontSize: 64, marginBottom: 8, animation: 'sparkPop 0.5s ease' }}>✨</div>
                    <h2 style={{ color: 'var(--success)', marginBottom: 8, fontSize: '1.4rem' }}>
                        ¡Chispa del día completada!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.5 }}>
                        Tu respuesta queda guardada y contribuye a tu<br/>
                        <strong style={{ color: 'var(--love-rose)' }}>perfil de compatibilidad</strong>.
                    </p>

                    {/* Racha */}
                    {streak > 0 && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(255,120,80,0.12)', border: '1px solid rgba(255,120,80,0.35)',
                            borderRadius: 12, padding: '8px 18px', margin: '12px 0'
                        }}>
                            <Flame size={16} color="var(--love-coral)" />
                            <span style={{ color: 'var(--love-coral)', fontWeight: 700, fontSize: '0.95rem' }}>
                                🔥 {streak} días de racha — ¡Sigue así!
                            </span>
                        </div>
                    )}

                    {/* Cuándo regresar */}
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 16, padding: '16px 20px',
                        margin: '16px 0', textAlign: 'left'
                    }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            ⏰ Tu próxima Chispa
                        </p>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: 4 }}>
                            Mañana · {(() => {
                                const tomorrow = new Date()
                                tomorrow.setDate(tomorrow.getDate() + 1)
                                tomorrow.setHours(6, 0, 0, 0)
                                return tomorrow.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
                            })()}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Las preguntas de introspección se actualizan <strong>cada mañana a las 6:00 AM</strong>.
                            El proceso de autoconocimiento funciona mejor con <strong>consistencia diaria</strong> —
                            pequeñas reflexiones cada día construyen un perfil de compatibilidad más preciso.
                        </p>
                    </div>

                    {/* Sugerencias mientras espera */}
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>
                        Mientras tanto puedes:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                        <button className="btn" style={{ padding: '10px 16px', borderRadius: 12, fontSize: '0.88rem',
                            background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)',
                            color: 'var(--love-rose)' }}
                            onClick={() => navigate('/modules')}>
                            📚 Continuar mis Módulos de Relación
                        </button>
                        <button className="btn" style={{ padding: '10px 16px', borderRadius: 12, fontSize: '0.88rem',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)' }}
                            onClick={() => navigate('/radar')}>
                            🗺️ Explorar el Radar
                        </button>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', borderRadius: 14, fontWeight: 700 }}
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
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🌙</div>
                    <h2 style={{ color: 'var(--love-warm)', marginBottom: 12, fontSize: '1.3rem' }}>
                        La Chispa de hoy aún no está lista
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
                        La pregunta diaria de introspección se actualiza cada mañana.<br />
                        <strong style={{ color: 'var(--text-primary)' }}>Vuelve mañana para tu nueva Chispa.</strong>
                    </p>
                    {streak > 0 && (
                        <div style={{ margin: '16px auto', display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(255,120,80,0.12)', border: '1px solid rgba(255,120,80,0.3)',
                            borderRadius: 12, padding: '10px 20px' }}>
                            <Flame size={16} color="var(--love-coral)" />
                            <span style={{ fontSize: '0.9rem', color: 'var(--love-coral)', fontWeight: 600 }}>
                                Racha actual: {streak} días 🔥 ¡No la rompas!
                            </span>
                        </div>
                    )}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 16, marginBottom: 24 }}>
                        Mientras tanto, puedes continuar con:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280, margin: '0 auto' }}>
                        <button className="btn btn-primary" style={{ padding: '12px 20px', borderRadius: 12, fontSize: '0.9rem' }}
                            onClick={() => navigate('/modules')}>
                            📚 Continuar mis Módulos
                        </button>
                        <button className="btn" style={{ padding: '12px 20px', borderRadius: 12, fontSize: '0.9rem',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                            onClick={() => navigate('/home')}>
                            🏠 Volver al inicio
                        </button>
                    </div>
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
