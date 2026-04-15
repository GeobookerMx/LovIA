/**
 * LovIA! — Forum List
 *
 * Community forum with threads organized by tags.
 * Upvote/downvote, reply counts, and time-based sorting.
 */

import { ArrowLeft, MessageSquare, ThumbsUp, Clock, PenLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './CommunityPages.css'

export interface ForumThread {
    id: string
    title: string
    preview: string
    author: string
    votes: number
    replies: number
    tag: string
    tagColor: string
    timeAgo: string
}

export const forumThreads: ForumThread[] = [
    {
        id: 'comunicacion-no-violenta',
        title: '¿Alguien ha aplicado la Comunicación No Violenta de Rosenberg?',
        preview: 'Acabo de leer el libro y quiero saber si alguien más lo ha probado con su pareja. Los 4 pasos me parecen lógicos pero difíciles de aplicar...',
        author: 'Ana_MX',
        votes: 24,
        replies: 8,
        tag: 'Comunicación',
        tagColor: 'var(--line-love)',
        timeAgo: 'hace 2h',
    },
    {
        id: 'frecuencia-mejorando',
        title: 'Mi Frecuencia subió 12 puntos en 3 meses — así lo hice',
        preview: 'Cuando empecé estaba en 48 (Explorador). Ahora estoy en 60 y casi Constructor. Lo que más me ayudó fue el módulo de IE...',
        author: 'Carlos_R',
        votes: 42,
        replies: 15,
        tag: 'Frecuencia',
        tagColor: 'var(--line-sex)',
        timeAgo: 'hace 5h',
    },
    {
        id: 'primer-encuentro',
        title: 'Tuve mi primer encuentro presencial — tips y reflexiones',
        preview: 'El plan de encuentro que generó LovIA! fue genial. La videollamada previa ayudó mucho a la confianza. Algunas cosas que aprendí...',
        author: 'María_GT',
        votes: 31,
        replies: 12,
        tag: 'Encuentros',
        tagColor: 'var(--success)',
        timeAgo: 'hace 8h',
    },
    {
        id: 'tolerancia-frustracion',
        title: '¿El ICI mide bien la tolerancia? Mi experiencia',
        preview: 'Me salió 2.1 en tolerancia a la frustración y al principio dudé, pero después de reflexionar creo que tiene razón. El instrumento de la UNAM...',
        author: 'Diego_J',
        votes: 18,
        replies: 6,
        tag: 'Evaluaciones',
        tagColor: 'var(--line-realization)',
        timeAgo: 'hace 12h',
    },
    {
        id: 'erq-regulacion',
        title: 'Reevaluación vs Supresión: mi resultado del ERQ',
        preview: 'Gross y John dicen que reevaluar es más sano que suprimir emociones. Mi ERQ mostró que suprimo mucho y no sabía. ¿Alguien más le pasó?',
        author: 'Lucía_P',
        votes: 27,
        replies: 9,
        tag: 'Emociones',
        tagColor: 'var(--love-warm)',
        timeAgo: 'hace 1d',
    },
    {
        id: 'estres-pss4',
        title: 'El estrés me bajó 10 puntos de Frecuencia — PSS-4 real',
        preview: 'Estaba en un momento laboral horrible y mi PSS-4 reflejó que mi estrés estaba por las nubes. Me penalizó fuerte en el matching...',
        author: 'Roberto_S',
        votes: 35,
        replies: 11,
        tag: 'Estrés',
        tagColor: 'var(--danger)',
        timeAgo: 'hace 1d',
    },
]

export default function ForumList() {
    const navigate = useNavigate()

    return (
        <div className="community-sub">
            <div className="community-sub__header">
                <button className="community-sub__back" onClick={() => navigate('/community')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Foro</h2>
                <button
                    className="community-sub__back"
                    style={{ marginLeft: 'auto', color: 'var(--line-sex)' }}
                    title="Nuevo hilo"
                >
                    <PenLine size={18} />
                </button>
            </div>

            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>
                Comparte experiencias y aprende de la comunidad.
            </p>

            <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {forumThreads.map((thread) => (
                    <button
                        key={thread.id}
                        className="forum-card glass"
                        onClick={() => navigate(`/community/forum/${thread.id}`)}
                    >
                        <div className="forum-card__votes">
                            <ThumbsUp size={14} color="var(--text-tertiary)" />
                            <span className="forum-card__vote-count">{thread.votes}</span>
                        </div>
                        <div className="forum-card__content">
                            <div className="forum-card__title">{thread.title}</div>
                            <div className="forum-card__preview">{thread.preview}</div>
                            <div className="forum-card__meta">
                                <span className="forum-card__tag" style={{ color: thread.tagColor, borderColor: thread.tagColor }}>
                                    {thread.tag}
                                </span>
                                <span>{thread.author}</span>
                                <span>
                                    <MessageSquare size={10} style={{ verticalAlign: 'middle' }} /> {thread.replies}
                                </span>
                                <span>
                                    <Clock size={10} style={{ verticalAlign: 'middle' }} /> {thread.timeAgo}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
