/**
 * LovIA! — Directory Page
 *
 * Filterable directory of mental health professionals.
 * Specialties: parejas, individual, sexología, tanatología.
 */

import { useState } from 'react'
import { ArrowLeft, MapPin, Star, ExternalLink, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './CommunityPages.css'

interface Professional {
    name: string
    specialty: string
    city: string
    rating: number
    tags: { label: string; color: string; bg: string }[]
    emoji: string
}

const professionals: Professional[] = [
    {
        name: 'Dra. Patricia Vázquez',
        specialty: 'Terapia de pareja (Gottman Level 2)',
        city: 'CDMX — Coyoacán',
        rating: 4.9,
        tags: [
            { label: 'Parejas', color: 'var(--line-love)', bg: 'rgba(255,107,138,0.12)' },
            { label: 'Gottman', color: 'var(--love-warm)', bg: 'rgba(255,179,71,0.12)' },
        ],
        emoji: '👩‍⚕️',
    },
    {
        name: 'Mtro. Daniel Torres',
        specialty: 'EFT — Terapia Focalizada en Emociones',
        city: 'Guadalajara — Providencia',
        rating: 4.8,
        tags: [
            { label: 'EFT', color: 'var(--success)', bg: 'rgba(16,185,129,0.12)' },
            { label: 'Johnson', color: 'var(--line-realization)', bg: 'rgba(34,211,238,0.12)' },
        ],
        emoji: '👨‍💼',
    },
    {
        name: 'Dra. Gabriela Mendoza',
        specialty: 'Sexología clínica certificada',
        city: 'Monterrey — San Pedro',
        rating: 4.7,
        tags: [
            { label: 'Sexología', color: 'var(--line-sex)', bg: 'rgba(168,85,247,0.12)' },
            { label: 'Perel', color: 'var(--love-coral)', bg: 'rgba(255,142,114,0.12)' },
        ],
        emoji: '👩‍🔬',
    },
    {
        name: 'Lic. Roberto Hernández',
        specialty: 'Psicología individual — ACT y mindfulness',
        city: 'CDMX — Roma Norte',
        rating: 4.6,
        tags: [
            { label: 'Individual', color: 'var(--info)', bg: 'rgba(59,130,246,0.12)' },
            { label: 'ACT', color: 'var(--text-secondary)', bg: 'rgba(248,250,252,0.08)' },
        ],
        emoji: '🧑‍💻',
    },
    {
        name: 'Dra. Elena Ríos',
        specialty: 'Tanatología — Duelo y pérdidas',
        city: 'Puebla — Centro',
        rating: 4.8,
        tags: [
            { label: 'Tanatología', color: 'var(--text-secondary)', bg: 'rgba(248,250,252,0.08)' },
            { label: 'Kübler-Ross', color: 'var(--line-realization)', bg: 'rgba(34,211,238,0.12)' },
        ],
        emoji: '👩‍⚕️',
    },
    {
        name: 'Mtro. Alejandro Fuentes',
        specialty: 'Terapia familiar sistémica — Bowen',
        city: 'Querétaro — Centro',
        rating: 4.5,
        tags: [
            { label: 'Familiar', color: 'var(--love-warm)', bg: 'rgba(255,179,71,0.12)' },
            { label: 'Bowen', color: 'var(--line-love)', bg: 'rgba(255,107,138,0.12)' },
        ],
        emoji: '👨‍💼',
    },
]

type Filter = 'todos' | 'parejas' | 'individual' | 'sexología' | 'tanatología' | 'familiar'

const filterOptions: { key: Filter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'parejas', label: '💑 Parejas' },
    { key: 'individual', label: '🧠 Individual' },
    { key: 'sexología', label: '🔥 Sexología' },
    { key: 'tanatología', label: '🕊️ Tanatología' },
    { key: 'familiar', label: '👨‍👩‍👧 Familiar' },
]

export default function DirectoryPage() {
    const navigate = useNavigate()
    const [filter, setFilter] = useState<Filter>('todos')

    const filtered = filter === 'todos'
        ? professionals
        : professionals.filter(p =>
            p.tags.some(t => t.label.toLowerCase() === filter.toLowerCase())
        )

    return (
        <div className="community-sub">
            <div className="community-sub__header">
                <button className="community-sub__back" onClick={() => navigate('/community')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Directorio</h2>
            </div>

            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>
                Profesionales de salud mental verificados. Sesiones presenciales y en línea.
            </p>

            {/* Filters */}
            <div className="directory-filters">
                {filterOptions.map((f) => (
                    <button
                        key={f.key}
                        className={`directory-filter ${filter === f.key ? 'directory-filter--active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Results */}
            <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {filtered.map((pro) => (
                    <div key={pro.name} className="professional-card glass">
                        <div className="professional-card__avatar">{pro.emoji}</div>
                        <div className="professional-card__info">
                            <div className="professional-card__name">{pro.name}</div>
                            <div className="professional-card__specialty">{pro.specialty}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                                <MapPin size={10} /> {pro.city}
                            </div>
                            <div className="professional-card__tags">
                                {pro.tags.map((tag) => (
                                    <span key={tag.label} className="professional-card__tag" style={{ color: tag.color, background: tag.bg }}>
                                        {tag.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div className="professional-card__rating">
                                <Star size={14} fill="var(--love-warm)" />
                                {pro.rating}
                            </div>
                            <ExternalLink size={14} color="var(--text-tertiary)" />
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 'var(--space-8)' }}>
                    No se encontraron profesionales en esta categoría.
                </p>
            )}

            {/* Disclaimer */}
            <div className="info-box" style={{ marginTop: 'var(--space-4)' }}>
                <strong>Nota importante:</strong> LovIA! no realiza diagnósticos clínicos.
                El directorio es un servicio informativo. Verifica siempre la cédula profesional
                del terapeuta antes de iniciar tratamiento.
            </div>

            {/* CTA for professionals */}
            <div className="glass" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
                <PlusCircle size={28} color="var(--love-rose)" style={{ marginBottom: 12 }} />
                <h3 style={{ marginBottom: 8 }}>¿Eres terapeuta o especialista?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 16 }}>
                    ÚNete al directorio verificado de LovIA y conecta con usuarios que necesitan apoyo profesional.
                </p>
                <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => navigate('/community/directory/register')}
                >
                    Unirme como Profesional
                </button>
            </div>
        </div>
    )
}
