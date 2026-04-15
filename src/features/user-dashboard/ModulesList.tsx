import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, CheckCircle, Clock, BookOpen, Brain, Heart, MessageCircle, Shield, Flame } from 'lucide-react'
import './ModulesPages.css'

/**
 * LovIA! — Catálogo de Módulos de Mejora Personal
 *
 * Los módulos están diseñados con base en investigación científica para
 * desarrollar competencias relacionales específicas. Cada módulo incluye
 * autor/fuente, duración estimada, y beneficio medible.
 *
 * Sources:
 * - IE: Salovey & Mayer (1990), Brackett et al. (2005)
 * - CNV: Rosenberg (2015), Gottman (1999)
 * - Regulación: Gross & John (2003)
 * - Apego: Bowlby (1969), Hazan & Shaver (1987)
 * - Sexualidad: Perel (2006), Masters & Johnson
 */

export interface Module {
    id: string
    title: string
    subtitle: string
    icon: React.ReactNode
    color: string
    author: string
    duration: string
    lessons: number
    benefit: string
    locked: boolean
    completed: boolean
    progress: number
    requiredTier: 'free' | 'explorador' | 'constructor' | 'visionario'
}

const modules: Module[] = [
    {
        id: 'ie',
        title: 'Inteligencia Emocional',
        subtitle: 'Reconoce, comprende y gestiona tus emociones',
        icon: <Brain size={24} />,
        color: 'var(--line-love)',
        author: 'Salovey & Mayer (1990)',
        duration: '3 semanas',
        lessons: 8,
        benefit: '+36% satisfacción relacional (Brackett et al., 2005)',
        locked: false,
        completed: false,
        progress: 37,
        requiredTier: 'free',
    },
    {
        id: 'cnv',
        title: 'Comunicación No Violenta',
        subtitle: 'Expresa necesidades sin atacar ni retraerte',
        icon: <MessageCircle size={24} />,
        color: 'var(--line-sex)',
        author: 'Rosenberg (2015) + Gottman (1999)',
        duration: '4 semanas',
        lessons: 10,
        benefit: 'Reduce 94% de los patrones que predicen ruptura',
        locked: false,
        completed: false,
        progress: 0,
        requiredTier: 'free',
    },
    {
        id: 'regulation',
        title: 'Regulación Emocional',
        subtitle: 'Estrategias para manejar emociones intensas',
        icon: <Shield size={24} />,
        color: 'var(--line-realization)',
        author: 'Gross & John (2003)',
        duration: '2 semanas',
        lessons: 6,
        benefit: 'Las personas con alta RE tienen relaciones 40% más estables',
        locked: false,
        completed: true,
        progress: 100,
        requiredTier: 'explorador',
    },
    {
        id: 'attachment',
        title: 'Estilos de Apego',
        subtitle: 'Comprende tu patrón de vinculación',
        icon: <Heart size={24} />,
        color: 'var(--love-warm)',
        author: 'Bowlby (1969) + Hazan & Shaver (1987)',
        duration: '3 semanas',
        lessons: 7,
        benefit: 'El apego seguro predice 50% más estabilidad (Mikulincer, 2003)',
        locked: true,
        completed: false,
        progress: 0,
        requiredTier: 'constructor',
    },
    {
        id: 'sexuality',
        title: 'Sexualidad Consciente',
        subtitle: 'Intimidad, deseo y comunicación sexual',
        icon: <Flame size={24} />,
        color: 'var(--love-coral)',
        author: 'Perel (2006) + Masters & Johnson',
        duration: '3 semanas',
        lessons: 8,
        benefit: 'Parejas que hablan de deseo reportan 60% más satisfacción',
        locked: true,
        completed: false,
        progress: 0,
        requiredTier: 'visionario',
    },
]

const tierLabels: Record<string, string> = {
    free: 'Gratis',
    explorador: 'Explorador',
    constructor: 'Constructor',
    visionario: 'Visionario',
}

export default function ModulesList() {
    const navigate = useNavigate()

    const completedCount = modules.filter((m) => m.completed).length
    const inProgressCount = modules.filter((m) => m.progress > 0 && !m.completed).length

    return (
        <div className="modules-page">
            {/* Header */}
            <div className="modules-page__header">
                <button className="modules-page__back" onClick={() => navigate('/profile/improvement')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Módulos de Crecimiento</h2>
            </div>

            {/* Stats */}
            <div className="modules-page__stats animate-fade-in-up">
                <div className="modules-page__stat glass">
                    <span className="modules-page__stat-value">{modules.length}</span>
                    <span className="modules-page__stat-label">Módulos</span>
                </div>
                <div className="modules-page__stat glass">
                    <span className="modules-page__stat-value" style={{ color: 'var(--success)' }}>{completedCount}</span>
                    <span className="modules-page__stat-label">Completados</span>
                </div>
                <div className="modules-page__stat glass">
                    <span className="modules-page__stat-value" style={{ color: 'var(--love-warm)' }}>{inProgressCount}</span>
                    <span className="modules-page__stat-label">En progreso</span>
                </div>
            </div>

            {/* Intro */}
            <div className="modules-page__intro glass-strong animate-fade-in-up">
                <BookOpen size={20} color="var(--love-warm)" />
                <p>
                    Cada módulo está respaldado por investigación científica publicada.
                    Trabaja en las áreas que más impactan tu <strong>Frecuencia de Relación</strong>.
                </p>
            </div>

            {/* Module Cards */}
            <div className="modules-page__list stagger-children">
                {modules.map((mod) => (
                    <button
                        key={mod.id}
                        className={`modules-page__card glass ${mod.locked ? 'modules-page__card--locked' : ''} ${mod.completed ? 'modules-page__card--completed' : ''}`}
                        onClick={() => !mod.locked && navigate(`/modules/${mod.id}`)}
                        disabled={mod.locked}
                    >
                        <div className="modules-page__card-icon" style={{ color: mod.color, background: `${mod.color}15` }}>
                            {mod.locked ? <Lock size={24} /> : mod.completed ? <CheckCircle size={24} /> : mod.icon}
                        </div>

                        <div className="modules-page__card-content">
                            <div className="modules-page__card-top">
                                <h3>{mod.title}</h3>
                                {mod.locked && (
                                    <span className="modules-page__tier-badge">
                                        {tierLabels[mod.requiredTier]}
                                    </span>
                                )}
                            </div>
                            <p className="modules-page__card-subtitle">{mod.subtitle}</p>

                            <div className="modules-page__card-meta">
                                <span><Clock size={12} /> {mod.duration}</span>
                                <span><BookOpen size={12} /> {mod.lessons} lecciones</span>
                            </div>

                            <div className="modules-page__card-author">
                                📚 {mod.author}
                            </div>

                            <div className="modules-page__card-benefit">
                                ✨ {mod.benefit}
                            </div>

                            {mod.progress > 0 && !mod.completed && (
                                <div className="modules-page__progress-bar">
                                    <div className="modules-page__progress-fill" style={{ width: `${mod.progress}%`, background: mod.color }} />
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
