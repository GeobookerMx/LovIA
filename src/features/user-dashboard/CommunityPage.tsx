import { BookOpen, MapPin, GraduationCap, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './CommunityPage.css'

const sections = [
    { icon: BookOpen, label: 'Lecturas', desc: 'Recursos y novedades editoriales', color: 'var(--line-love)', bg: 'rgba(255,107,138,0.12)', path: '/community/blog' },
    { icon: MessageSquare, label: 'Conversar', desc: 'Preguntas para reflexionar', color: 'var(--line-sex)', bg: 'rgba(168,85,247,0.12)', path: '/community/forum' },
    { icon: MapPin, label: 'Directorio', desc: 'Psicólogos y terapeutas', color: 'var(--line-realization)', bg: 'rgba(34,211,238,0.12)', path: '/community/directory' },
    { icon: GraduationCap, label: 'Módulos', desc: 'Cursos de crecimiento', color: 'var(--success)', bg: 'rgba(16,185,129,0.12)', path: '/modules' },
]

export default function CommunityPage() {
    const navigate = useNavigate()

    return (
        <div className="community-page">
            <header className="community-page__header">
                <h1>Comunidad</h1>
                <p className="community-page__subtitle">Ideas para aprender y reflexionar a tu ritmo</p>
            </header>

            <div className="community-page__grid stagger-children">
                {sections.map(({ icon: Icon, label, desc, color, bg, path }) => (
                    <button key={label} className="community-page__card glass" onClick={() => navigate(path)}>
                        <div className="community-page__card-icon" style={{ background: bg }}>
                            <Icon size={24} color={color} />
                        </div>
                        <h3>{label}</h3>
                        <p>{desc}</p>
                    </button>
                ))}
            </div>

            <button
                type="button"
                className="community-page__featured glass animate-fade-in-up"
                onClick={() => navigate('/community/forum')}
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left', color: 'var(--text-primary)' }}
            >
                <h3>💬 Una pregunta para ti</h3>
                <h2>¿Qué te ayuda a conversar con calma cuando hay un desacuerdo?</h2>
                <p>Explora preguntas originales de LovIA para pensar antes de hablar con alguien.</p>
                <span className="community-page__read-time">Abrir ideas para conversar</span>
            </button>
        </div>
    )
}
