import { ArrowLeft, ArrowRight, BookHeart, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './CommunityPages.css'

const conversationPrompts = [
  { title: 'Lo que necesito para confiar', question: '¿Qué gesto concreto te ayuda a sentir confianza sin dejar de respetar la privacidad de ambos?' },
  { title: 'Cuando no estamos de acuerdo', question: '¿Cómo podrías expresar una necesidad sin convertirla en un juicio sobre la otra persona?' },
  { title: 'Límites que cuidan', question: '¿Qué límite personal te gustaría explicar con claridad y respeto?' },
]

export default function ForumList() {
  const navigate = useNavigate()
  return (
    <main className="community-sub">
      <header className="community-sub__header">
        <button type="button" className="community-sub__back" onClick={() => navigate('/community')} aria-label="Volver a Comunidad"><ArrowLeft size={20} /></button>
        <h1>Ideas para conversar</h1>
      </header>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Estas preguntas son propuestas originales de LovIA para reflexionar. No son publicaciones ni respuestas de otras personas.
      </p>
      <div style={{ display: 'grid', gap: '0.8rem' }}>
        {conversationPrompts.map((prompt) => (
          <article key={prompt.title} className="glass" style={{ padding: '1.1rem', borderRadius: '1rem' }}>
            <MessageCircle size={20} color="var(--love-rose)" aria-hidden="true" />
            <h2 style={{ fontSize: '1.1rem', margin: '0.4rem 0' }}>{prompt.title}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>{prompt.question}</p>
            <button type="button" onClick={() => navigate('/profile/journal')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', minHeight: '2.75rem', marginTop: '0.8rem', padding: '0.45rem 0.75rem', border: '1px solid var(--love-rose)', borderRadius: '0.65rem', background: 'transparent', color: 'var(--text-primary)' }}>
              <BookHeart size={17} aria-hidden="true" /> Pensarlo en Mi Diario <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
    </main>
  )
}
