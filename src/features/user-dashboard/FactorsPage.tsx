import { ArrowLeft, ArrowRight, BookHeart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './ProfilePages.css'

const topics = [
  { icon: '💬', title: 'Comunicación', question: '¿Cómo te gustaría conversar cuando piensan distinto?' },
  { icon: '🧭', title: 'Valores', question: '¿Qué valor no quieres dejar de cuidar en una relación?' },
  { icon: '🗓️', title: 'Tiempo', question: '¿Cuánto tiempo puedes compartir sin abandonar tus responsabilidades?' },
  { icon: '🏠', title: 'Planes', question: '¿Qué proyectos de vida te gustaría conversar antes de comprometerte?' },
  { icon: '🛡️', title: 'Límites', question: '¿Qué límite necesitas poder expresar y respetar?' },
  { icon: '🤝', title: 'Apoyo', question: '¿Cómo prefieres pedir o brindar apoyo en un momento difícil?' },
]

export default function FactorsPage() {
  const navigate = useNavigate()
  return (
    <main className="profile-sub">
      <header className="profile-sub__header">
        <button type="button" className="profile-sub__back" onClick={() => navigate('/profile')} aria-label="Volver al perfil"><ArrowLeft size={20} /></button>
        <h1>Preguntas sobre afinidad</h1>
      </header>
      <p className="profile-sub__subtitle">Estas preguntas pueden ayudarte a conocerte y conversar. No son factores medidos ni una evaluación de otra persona.</p>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {topics.map((topic) => (
          <section key={topic.title} className="chart-card glass-strong">
            <h2 style={{ fontSize: '1.1rem' }}>{topic.icon} {topic.title}</h2>
            <p style={{ marginTop: '0.45rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{topic.question}</p>
          </section>
        ))}
      </div>
      <button type="button" onClick={() => navigate('/profile/journal')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', minHeight: '2.75rem', marginTop: '1rem', padding: '0.55rem 0.85rem', border: '1px solid var(--love-rose)', borderRadius: '0.7rem', background: '#92294f', color: '#fff' }}><BookHeart size={18} /> Guardar una reflexión <ArrowRight size={17} /></button>
    </main>
  )
}
