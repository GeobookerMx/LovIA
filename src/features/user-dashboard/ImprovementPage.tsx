import { ArrowLeft, ArrowRight, BookHeart, BookOpen, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { LOVIA_GOALS, readLoviaGoal } from '../../lib/loviaGoals'
import './ProfilePages.css'

const activities = [
  { title: 'Una pregunta para ti', desc: 'Haz una pausa y escribe qué necesitas o qué quieres cuidar.', icon: BookHeart, route: '/profile/journal' },
  { title: 'Guía y ejercicios', desc: 'Elige un tema y toma sólo la actividad que te sirva hoy.', icon: BookOpen, route: '/modules' },
  { title: 'Ideas para conversar', desc: 'Prepara una conversación con preguntas abiertas y límites claros.', icon: MessageCircle, route: '/community/forum' },
]

export default function ImprovementPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const goal = LOVIA_GOALS.find((option) => option.id === readLoviaGoal(user?.user_metadata))

  return (
    <main className="profile-sub">
      <header className="profile-sub__header">
        <button type="button" className="profile-sub__back" onClick={() => navigate('/profile')} aria-label="Volver al perfil"><ArrowLeft size={20} /></button>
        <h1>Ideas para seguir</h1>
      </header>
      <p className="profile-sub__subtitle">{goal ? `Tu objetivo actual: ${goal.title.toLowerCase()}. ` : ''}Elige una actividad breve cuando te resulte útil. No hay tareas obligatorias ni puntos para demostrar que mereces conocer a alguien.</p>
      <div style={{ display: 'grid', gap: '0.8rem' }}>
        {activities.map(({ title, desc, icon: Icon, route }) => (
          <button key={title} type="button" className="chart-card glass-strong" onClick={() => navigate(route)} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', color: 'var(--text-primary)', textAlign: 'left', minHeight: '5rem' }}>
            <Icon size={23} color="var(--love-rose)" aria-hidden="true" />
            <span style={{ display: 'grid', gap: '0.25rem', flex: 1 }}><strong>{title}</strong><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.45 }}>{desc}</span></span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        ))}
      </div>
    </main>
  )
}
