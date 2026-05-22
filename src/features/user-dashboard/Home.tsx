import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Zap, Target, ChevronRight, Brain, Heart, Star, Shield, Share2, Lock, Eye } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useEvaluationStore } from '../../stores/evaluationStore'
import { supabase } from '../../lib/supabase'
import ShareCard from '../../components/shared/ShareCard'
import './Home.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDynamicGreeting() {
    const h = new Date().getHours()
    if (h >= 6 && h < 12)  return 'Buenos días ☀️'
    if (h >= 12 && h < 19) return 'Buenas tardes 🌤️'
    return 'Buenas noches 🌙'
}

/** Calcular Readiness Score client-side (0–100) */
function calcReadiness(
    profile: Record<string, unknown> | null,
    assessmentsDone: string[],
    sparkStreak: number,
    evalProgress: number,
): number {
    let score = 0
    // Perfil base completado (25 pts)
    const profilePct = (profile?.profile_pct as number) ?? 0
    score += Math.round((profilePct / 100) * 25)
    // Assessments psicológicos (30 pts — 10 por cada uno de los 3)
    if (assessmentsDone.includes('attachment')) score += 10
    if (assessmentsDone.includes('bigfive'))   score += 10
    if (assessmentsDone.includes('values'))    score += 10
    // Evaluaciones cognitivas (20 pts)
    score += Math.round((evalProgress / 100) * 20)
    // Streak de Chispas (15 pts — 3 pts por día, máx 5 días)
    score += Math.min(sparkStreak * 3, 15)
    // Módulos de introspección (10 pts — 2.5 por eje)
    const ejes = ['amor', 'intimidad', 'realizacion', 'seguridad']
    const axesDone = ejes.filter(e => assessmentsDone.includes(e)).length
    score += Math.round((axesDone / 4) * 10)
    return Math.min(score, 100)
}

function getReadinessBand(score: number) {
    if (score >= 75) return { label: 'Listo para conectar',       color: 'var(--success)',          emoji: '🟢', discovery: 'open' }
    if (score >= 60) return { label: 'Preparado',                 color: 'var(--freq-high)',         emoji: '🟢', discovery: 'open' }
    if (score >= 40) return { label: 'Creciendo',                 color: 'var(--love-warm)',         emoji: '🟡', discovery: 'preview' }
    return               { label: 'En proceso de autoconocimiento', color: 'var(--freq-low)',         emoji: '🟠', discovery: 'locked' }
}

function getNextAction(
    score: number,
    assessmentsDone: string[],
    evalProgress: number,
    profilePct: number,
): { icon: string; title: string; desc: string; route: string } {
    if (profilePct < 60) return { icon: '👤', title: 'Completa tu perfil', desc: 'Faltan datos clave para tu Frecuencia de Relación', route: '/profile/edit' }
    if (!assessmentsDone.includes('attachment')) return { icon: '💚', title: 'Descubre tu Estilo de Apego', desc: 'Suma 10 puntos a tu Readiness · 3 min', route: '/assessment/attachment' }
    if (!assessmentsDone.includes('bigfive'))    return { icon: '🧬', title: 'Evalúa tu Personalidad OCEAN', desc: 'Suma 10 puntos · BFI-10 validado · 4 min', route: '/assessment/bigfive' }
    if (!assessmentsDone.includes('values'))     return { icon: '🌟', title: 'Define tus Valores Esenciales', desc: 'Suma 10 puntos a tu compatibilidad · 2 min', route: '/assessment/values' }
    if (evalProgress < 100)                      return { icon: '🧠', title: 'Completa las evaluaciones', desc: 'Stroop, Memoria, Tolerancia... suma 20 puntos', route: '/modules' }
    if (score < 60)                              return { icon: '⚡', title: 'Responde la Chispa de hoy', desc: 'Cada respuesta mejora tu perfil relacional', route: '/spark' }
    return { icon: '🎯', title: 'Explora tu compatibilidad', desc: 'Tu Frecuencia de Relación está activa', route: '/radar' }
}

interface Spark { question: string; category: string; responded?: boolean }

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
    const navigate  = useNavigate()
    const profile   = useAuthStore(s => s.profile)
    const evalStore = useEvaluationStore()
    const [spark, setSpark] = useState<Spark | null>(null)
    const [showShare, setShowShare] = useState(false)

    const profileAny      = profile as unknown as Record<string, unknown> | null
    const assessmentsDone = (profileAny?.assessments_done as string[]) ?? []
    const sparkStreak     = (profileAny?.spark_streak as number) ?? 0
    const profilePct      = (profileAny?.profile_pct as number) ?? 0

    const evalTests     = [evalStore.stroop, evalStore.digitSpan, evalStore.frustrationTolerance, evalStore.emotionalRegulation]
    const evalProgress  = Math.round(evalTests.filter(t => t?.passed).length / evalTests.length * 100)

    const readiness     = calcReadiness(profileAny, assessmentsDone, sparkStreak, evalProgress)
    const band          = getReadinessBand(readiness)
    const nextAction    = getNextAction(readiness, assessmentsDone, evalProgress, profilePct)

    // Módulos de introspección por eje
    const ejes = [
        { key: 'amor',        icon: '💞', label: 'Amor', done: assessmentsDone.includes('attachment') || assessmentsDone.includes('amor') },
        { key: 'intimidad',   icon: '🔥', label: 'Intimidad', done: assessmentsDone.includes('intimidad') },
        { key: 'realizacion', icon: '🌟', label: 'Realización', done: assessmentsDone.includes('realizacion') || assessmentsDone.includes('values') },
        { key: 'seguridad',   icon: '🛡️', label: 'Seguridad', done: assessmentsDone.includes('bigfive') || assessmentsDone.includes('seguridad') },
    ]
    const ejesPct = Math.round(ejes.filter(e => e.done).length / 4 * 100)

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        supabase
            .from('sparks')
            .select('question, category')
            .eq('active_date', today)
            .maybeSingle()
            .then(({ data }) => { if (data) setSpark(data) })
    }, [])

    const name     = profile?.alias || 'tú'
    const greeting = getDynamicGreeting()

    return (
        <div className="home">
            {/* ── Header ────────────────────────────────────── */}
            <header className="home__header">
                <div>
                    <p className="home__greeting">{greeting}</p>
                    <h1 className="home__name">{name} 👋</h1>
                </div>
                <button className="home__share-icon glass" onClick={() => setShowShare(true)} aria-label="Compartir LovIA">
                    <Share2 size={16} />
                </button>
            </header>

            {/* ══════════════════════════════════════════════
                BLOQUE 1 — Frecuencia de Relación (banda, no número)
            ══════════════════════════════════════════════ */}
            <div className="home__block home__block--frequency glass animate-fade-in-up">
                <div className="home__block-header">
                    <TrendingUp size={18} color={band.color} />
                    <span>Tu Frecuencia de Relación</span>
                    <button className="home__block-cta" onClick={() => navigate('/profile/graph')}>
                        Ver análisis <ChevronRight size={14} />
                    </button>
                </div>

                <div className="home__freq-band" style={{ color: band.color }}>
                    <span className="home__freq-emoji">{band.emoji}</span>
                    <span className="home__freq-label">{band.label}</span>
                </div>

                {/* Barra de progreso — readiness */}
                <div className="home__freq-bar-track">
                    <div className="home__freq-bar-fill" style={{ width: `${readiness}%`, background: band.color }} />
                    {/* Marcas de umbral */}
                    <div className="home__freq-threshold" style={{ left: '40%' }} title="preview" />
                    <div className="home__freq-threshold" style={{ left: '60%' }} title="open" />
                    <div className="home__freq-threshold" style={{ left: '75%' }} title="match" />
                </div>

                {/* Estado de descubrimiento */}
                <div className="home__discovery-state">
                    {band.discovery === 'locked' && <><Lock size={13} /> Solo introspección por ahora</>}
                    {band.discovery === 'preview' && <><Eye size={13} /> Vista previa de compatibilidades desbloqueada</>}
                    {band.discovery === 'open'    && <><Target size={13} /> Descubrimiento completo activo</>}
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                BLOQUE 2 — Progreso de Evaluaciones (4 ejes)
            ══════════════════════════════════════════════ */}
            <div className="home__block glass animate-fade-in-up" style={{ animationDelay: '80ms' }}>
                <div className="home__block-header">
                    <Brain size={18} color="var(--line-sex)" />
                    <span>Mapa Interno</span>
                    <span className="home__block-pct">{ejesPct}%</span>
                </div>

                <div className="home__axes">
                    {ejes.map(eje => (
                        <div key={eje.key} className={`home__axis ${eje.done ? 'home__axis--done' : ''}`}
                            onClick={() => !eje.done && navigate('/assessment/' + (eje.key === 'amor' ? 'attachment' : eje.key === 'realizacion' ? 'values' : eje.key === 'seguridad' ? 'bigfive' : eje.key))}>
                            <span className="home__axis-icon">{eje.icon}</span>
                            <span className="home__axis-label">{eje.label}</span>
                            {eje.done
                                ? <span className="home__axis-check">✓</span>
                                : <ChevronRight size={12} className="home__axis-arrow" />
                            }
                        </div>
                    ))}
                </div>

                <div className="home__eval-row">
                    <div className="home__eval-bar-track">
                        <div className="home__eval-bar-fill" style={{ width: `${evalProgress}%` }} />
                    </div>
                    <span className="home__eval-label">Evaluaciones cognitivas {evalProgress}%</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                BLOQUE 3 — La Chispa del Día
            ══════════════════════════════════════════════ */}
            <div className="home__block home__block--spark glass animate-fade-in-up" style={{ animationDelay: '160ms' }}>
                <div className="home__block-header">
                    <Zap size={18} color="var(--love-warm)" />
                    <span>La Chispa del Día</span>
                    {sparkStreak > 0 && (
                        <span className="home__streak">🔥 {sparkStreak} días</span>
                    )}
                </div>
                <p className="home__spark-question">
                    "{spark?.question ?? 'Cargando pregunta del día...'}"
                </p>
                <button className="home__spark-cta" onClick={() => navigate('/spark')}>
                    Responder ahora <ChevronRight size={16} />
                </button>
            </div>

            {/* ══════════════════════════════════════════════
                BLOQUE 4 — Tu Siguiente Avance (1 acción clara)
            ══════════════════════════════════════════════ */}
            <div className="home__block home__block--next glass animate-fade-in-up" style={{ animationDelay: '240ms' }}>
                <div className="home__next-label">
                    <Star size={14} color="var(--love-rose)" />
                    <span>Tu siguiente avance</span>
                </div>
                <div className="home__next-content" onClick={() => navigate(nextAction.route)}>
                    <span className="home__next-icon">{nextAction.icon}</span>
                    <div className="home__next-text">
                        <strong>{nextAction.title}</strong>
                        <p>{nextAction.desc}</p>
                    </div>
                    <ChevronRight size={20} color="var(--love-rose)" />
                </div>
            </div>

            {/* Disclaimer */}
            <p className="home__disclaimer">
                LovIA no sustituye terapia profesional. Si necesitas apoyo, visita{' '}
                <button className="home__disclaimer-link" onClick={() => navigate('/community/directory')}>
                    nuestro directorio
                </button>.
            </p>

            {showShare && <ShareCard onClose={() => setShowShare(false)} />}
        </div>
    )
}
