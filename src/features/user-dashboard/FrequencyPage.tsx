import { ArrowLeft, ArrowRight, BookHeart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './ProfilePages.css'

export default function FrequencyPage() {
  const navigate = useNavigate()
  return (
    <main className="profile-sub">
      <header className="profile-sub__header">
        <button type="button" className="profile-sub__back" onClick={() => navigate('/profile')} aria-label="Volver al perfil"><ArrowLeft size={20} /></button>
        <h1>Frecuencia de Relación</h1>
      </header>
      <section className="chart-card glass-strong">
        <h2>Una forma de reflexionar, no una nota</h2>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          LovIA utiliza Amor, Sexualidad y Realización como temas del modelo editorial de Juan Pablo Peña García. Pueden ayudarte a ordenar preguntas sobre vínculos, intimidad y proyectos de vida. No forman una medición clínica ni predicen si una pareja funcionará.
        </p>
      </section>
      <section className="chart-card glass-strong">
        <h2>Para pensar hoy</h2>
        <p style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>¿Qué necesitas conversar con otra persona para saber si sus proyectos y tus límites pueden convivir?</p>
        <button type="button" onClick={() => navigate('/profile/journal')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', minHeight: '2.75rem', marginTop: '1rem', padding: '0.55rem 0.85rem', border: '1px solid var(--love-rose)', borderRadius: '0.7rem', background: '#92294f', color: '#fff' }}>
          <BookHeart size={18} aria-hidden="true" /> Escribir en Mi Diario <ArrowRight size={17} aria-hidden="true" />
        </button>
      </section>
    </main>
  )
}
