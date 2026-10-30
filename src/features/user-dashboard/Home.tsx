import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, BookHeart, Heart, Share2, Sparkles, UserRound, Wallet, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { LOVIA_GOALS, readLoviaGoal, type LoviaGoal } from '../../lib/loviaGoals'
import { mexicoCityDate } from '../../lib/campaignDates'
import { supabase } from '../../lib/supabase'
import ShareCard from '../../components/shared/ShareCard'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const [goalOverride, setGoalOverride] = useState<{ owner: string; goal: LoviaGoal } | null>(null)
  const [goalSaving, setGoalSaving] = useState(false)
  const [goalError, setGoalError] = useState<string | null>(null)
  const [spark, setSpark] = useState<string | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [financeNoticeClosed, setFinanceNoticeClosed] = useState(false)

  useEffect(() => {
    try {
      setFinanceNoticeClosed(user?.id ? localStorage.getItem(`lovia-finance-notice:${user.id}`) === 'closed' : false)
    } catch {
      setFinanceNoticeClosed(false)
    }
  }, [user?.id])

  const closeFinanceNotice = () => {
    setFinanceNoticeClosed(true)
    try {
      if (user?.id) localStorage.setItem(`lovia-finance-notice:${user.id}`, 'closed')
    } catch { /* La invitación se cierra en esta sesión aunque el navegador bloquee almacenamiento. */ }
  }

  useEffect(() => {
    let active = true
    supabase.from('sparks').select('question').eq('active_date', mexicoCityDate()).maybeSingle()
      .then(({ data }) => { if (active) setSpark(data?.question ?? null) })
    return () => { active = false }
  }, [])

  const goal = goalOverride && goalOverride.owner === user?.id ? goalOverride.goal : readLoviaGoal(user?.user_metadata)

  const changeGoal = async (nextGoal: LoviaGoal) => {
    if (goalSaving || nextGoal === goal) return
    setGoalSaving(true)
    setGoalError(null)
    const { error } = await supabase.auth.updateUser({ data: { lovia_goal: nextGoal } })
    if (error) setGoalError('No pudimos cambiar tu objetivo. Inténtalo de nuevo.')
    else if (user) setGoalOverride({ owner: user.id, goal: nextGoal })
    setGoalSaving(false)
  }

  const current = LOVIA_GOALS.find((option) => option.id === goal)
  const name = profile?.alias || 'tú'

  return (
    <main className="home">
      <header className="home__header">
        <div>
          <p className="home__eyebrow">Tu espacio en LovIA</p>
          <h1>Hola, {name} 👋</h1>
          <p>Hoy puedes descubrir algo útil a tu propio ritmo.</p>
        </div>
        <button type="button" className="home__share" onClick={() => setShowShare(true)} aria-label="Compartir LovIA">
          <Share2 size={19} />
        </button>
      </header>

      {!financeNoticeClosed && (
        <section className="home__finance-spotlight" aria-labelledby="home-finance-heading">
          <div className="home__finance-spotlight-top">
            <span className="home__finance-tag"><Wallet size={16} aria-hidden="true" /> Nuevo en LovIA</span>
            <button type="button" className="home__finance-close" onClick={closeFinanceNotice} aria-label="Cerrar invitación a Dinero y proyecto de vida"><X size={20} /></button>
          </div>
          <h2 id="home-finance-heading">Dinero y proyecto de vida</h2>
          <p>Descubre qué es importante para ti y encuentra preguntas para conversar en pareja. Cuatro sesiones breves, a tu ritmo y sin calificaciones.</p>
          <button type="button" className="home__finance-cta" onClick={() => navigate('/guide/finance')}>
            Explorar el nuevo módulo <ArrowRight size={18} aria-hidden="true" />
          </button>
        </section>
      )}

      <section className="home__panel home__panel--goal" aria-labelledby="home-goal-heading">
        <div className="home__section-heading">
          <span className="home__section-icon" aria-hidden="true">✨</span>
          <div>
            <h2 id="home-goal-heading">¿Qué te gustaría explorar?</h2>
            <p>Elige un camino para hoy. Puedes cambiarlo cuando quieras.</p>
          </div>
        </div>
        <div className="home__goal-grid" role="group" aria-label="Tu objetivo personal">
          {LOVIA_GOALS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`home__goal ${goal === option.id ? 'home__goal--selected' : ''}`}
              aria-pressed={goal === option.id}
              disabled={goalSaving}
              onClick={() => void changeGoal(option.id)}
            >
              <span aria-hidden="true">{option.icon}</span>
              <strong>{option.title}</strong>
            </button>
          ))}
        </div>
        {goalError && <p className="home__error" role="alert">{goalError}</p>}
        {current && (
          <div className="home__first-step">
            <div>
              <span className="home__eyebrow">Tu primer paso</span>
              <h3>{current.firstStep}</h3>
              <p>{current.description}</p>
            </div>
            <button type="button" onClick={() => navigate(current.route)}>
              Ir ahora <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      <section className="home__panel home__panel--reflection" aria-labelledby="home-reflection-heading">
        <div className="home__section-heading">
          <Sparkles size={24} aria-hidden="true" />
          <div>
            <h2 id="home-reflection-heading">Una pregunta para ti</h2>
            <p>Una pausa breve para conocerte mejor, sin calificación.</p>
          </div>
        </div>
        <blockquote>{spark ?? current?.reflection ?? '¿Qué valor quieres cuidar en tu próxima relación?'}</blockquote>
        <div className="home__reflection-actions">
          <button type="button" onClick={() => navigate('/spark')}>Responder una Chispa</button>
          <button type="button" onClick={() => navigate('/profile/journal')}>Escribir en Mi Diario</button>
        </div>
      </section>

      <section className="home__panel" aria-labelledby="home-tools-heading">
        <div className="home__section-heading">
          <BookOpen size={24} aria-hidden="true" />
          <div>
            <h2 id="home-tools-heading">Sigue a tu ritmo</h2>
            <p>Usa la Guía y Mi Diario a tu ritmo. Ningún resultado define tu valor.</p>
          </div>
        </div>
        <div className="home__tools">
          <button type="button" onClick={() => navigate('/modules')}><BookOpen size={20} /> Guía y ejercicios <ArrowRight size={17} /></button>
          <button type="button" onClick={() => navigate('/guide/finance')}><Wallet size={20} /> Dinero y proyecto de vida <ArrowRight size={17} /></button>
          <button type="button" onClick={() => navigate('/profile/journal')}><BookHeart size={20} /> Mi Diario <ArrowRight size={17} /></button>
          <button type="button" onClick={() => navigate('/profile/edit')}><UserRound size={20} /> Mi perfil <ArrowRight size={17} /></button>
          <button type="button" onClick={() => navigate('/matches')}><Heart size={20} /> Mis conexiones <ArrowRight size={17} /></button>
        </div>
      </section>

      <p className="home__disclaimer">Estas actividades sirven para reflexionar; no predicen el éxito de una relación ni sustituyen apoyo profesional.</p>
      {showShare && <ShareCard onClose={() => setShowShare(false)} />}
    </main>
  )
}
