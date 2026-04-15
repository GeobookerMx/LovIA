import { BookOpen, MapPin, GraduationCap, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './CommunityPage.css'

const sections = [
    { icon: BookOpen, label: 'Blog', desc: 'Artículos de especialistas', color: 'var(--line-love)', bg: 'rgba(255,107,138,0.12)', path: '/community/blog' },
    { icon: MessageSquare, label: 'Foro', desc: 'Comparte experiencias', color: 'var(--line-sex)', bg: 'rgba(168,85,247,0.12)', path: '/community/forum' },
    { icon: MapPin, label: 'Directorio', desc: 'Psicólogos y terapeutas', color: 'var(--line-realization)', bg: 'rgba(34,211,238,0.12)', path: '/community/directory' },
    { icon: GraduationCap, label: 'Módulos', desc: 'Cursos de crecimiento', color: 'var(--success)', bg: 'rgba(16,185,129,0.12)', path: '/modules' },
]

export default function CommunityPage() {
    const navigate = useNavigate()

    return (
        <div className="community-page">
            <header className="community-page__header">
                <h1>Comunidad</h1>
                <p className="community-page__subtitle">Crece con otros</p>
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

            <section
                className="community-page__featured glass animate-fade-in-up"
                onClick={() => navigate('/community/blog/gottman-4-jinetes')}
                style={{ cursor: 'pointer' }}
            >
                <h3>📖 Artículo destacado</h3>
                <h2>Los 4 Jinetes de Gottman: señales de peligro en tu relación</h2>
                <p>Aprende a identificar los patrones destructivos que predicen el fin de una relación...</p>
                <span className="community-page__read-time">5 min de lectura</span>
            </section>
        </div>
    )
}
