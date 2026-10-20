import { ArrowLeft, ArrowRight, BookOpen, BookHeart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './CommunityPages.css'

export default function BlogList() {
  const navigate = useNavigate()
  return (
    <main className="community-sub">
      <header className="community-sub__header">
        <button type="button" className="community-sub__back" onClick={() => navigate('/community')} aria-label="Volver a Comunidad"><ArrowLeft size={20} /></button>
        <h1>Lecturas y recursos</h1>
      </header>
      <section className="glass" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
        <BookOpen size={28} color="var(--love-warm)" aria-hidden="true" />
        <h2 style={{ fontSize: '1.2rem', margin: '0.65rem 0' }}>Artículos en revisión</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Estamos revisando fuentes, derechos y lenguaje antes de publicar artículos y pasajes del libro. Mientras tanto, puedes usar las actividades disponibles en la Guía.
        </p>
        <button type="button" onClick={() => navigate('/modules')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', minHeight: '2.75rem', marginTop: '1rem', padding: '0.6rem 0.9rem', border: '1px solid var(--love-rose)', borderRadius: '0.65rem', background: '#92294f', color: '#fff', fontWeight: 700 }}>
          Abrir la Guía <ArrowRight size={17} aria-hidden="true" />
        </button>
      </section>
      <section className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', marginTop: '0.85rem' }}>
        <BookHeart size={25} color="var(--love-rose)" aria-hidden="true" />
        <h2 style={{ fontSize: '1.1rem', margin: '0.55rem 0' }}>Una reflexión propia</h2>
        <p style={{ color: 'var(--text-secondary)' }}>¿Qué conversación te gustaría tener con más calma esta semana?</p>
        <button type="button" onClick={() => navigate('/profile/journal')} style={{ minHeight: '2.75rem', marginTop: '0.75rem', padding: '0.5rem 0.85rem', border: '1px solid var(--border-default)', borderRadius: '0.65rem', background: 'transparent', color: 'var(--text-primary)' }}>
          Abrir Mi Diario
        </button>
      </section>
    </main>
  )
}
