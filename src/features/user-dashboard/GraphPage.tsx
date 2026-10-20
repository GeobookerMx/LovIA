import { ArrowLeft, ArrowRight, BookOpen, BookHeart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './ProfilePages.css'

const paths = [
  { icon: '💞', title: 'Vínculos', question: '¿Qué significa sentirte escuchado/a en una relación?' },
  { icon: '🔥', title: 'Intimidad', question: '¿Qué límites y necesidades te gustaría poder expresar con confianza?' },
  { icon: '🌟', title: 'Proyecto de vida', question: '¿Qué planes tuyos deseas cuidar al construir una relación?' },
]

export default function GraphPage() {
  const navigate = useNavigate()
  return (
    <main className="profile-sub">
      <header className="profile-sub__header">
        <button type="button" className="profile-sub__back" onClick={() => navigate('/profile')} aria-label="Volver al perfil"><ArrowLeft size={20} /></button>
        <h1>Mi recorrido</h1>
      </header>
      <p className="profile-sub__subtitle">Tres temas para conocerte mejor. Estas preguntas son originales de LovIA y no producen una puntuación de compatibilidad.</p>
      <div style={{ display: 'grid', gap: '0.8rem' }}>
        {paths.map((path) => (
          <section key={path.title} className="chart-card glass-strong">
            <h2 style={{ fontSize: '1.15rem' }}>{path.icon} {path.title}</h2>
            <p style={{ marginTop: '0.55rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{path.question}</p>
          </section>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '1rem' }}>
        <button type="button" onClick={() => navigate('/modules')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', minHeight: '2.75rem', padding: '0.55rem 0.85rem', border: '1px solid var(--border-default)', borderRadius: '0.7rem', background: 'transparent', color: 'var(--text-primary)' }}><BookOpen size={18} /> Abrir Guía <ArrowRight size={17} /></button>
        <button type="button" onClick={() => navigate('/profile/journal')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', minHeight: '2.75rem', padding: '0.55rem 0.85rem', border: '1px solid var(--border-default)', borderRadius: '0.7rem', background: 'transparent', color: 'var(--text-primary)' }}><BookHeart size={18} /> Mi Diario <ArrowRight size={17} /></button>
      </div>
    </main>
  )
}
