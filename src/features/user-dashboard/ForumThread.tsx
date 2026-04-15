/**
 * LovIA! — Forum Thread View
 *
 * Shows the original post and its replies.
 * Community-driven discussions about app topics.
 */

import { ArrowLeft, ThumbsUp, MessageSquare, BookOpen } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { forumThreads } from './ForumList'
import './CommunityPages.css'

interface Reply {
    author: string
    avatar: string
    timeAgo: string
    text: string
    votes: number
}

const threadReplies: Record<string, Reply[]> = {
    'comunicacion-no-violenta': [
        { author: 'Marco_V', avatar: '🧑', timeAgo: 'hace 1h', text: '¡Sí! Lo probé y al principio se siente artificial pero funciona. La clave es practicar el paso 2 (sentimientos) sin caer en juicios. Rosenberg dice que es un lenguaje nuevo.', votes: 12 },
        { author: 'Sofía_L', avatar: '👩', timeAgo: 'hace 45min', text: 'Yo lo combiné con lo que aprendí en el módulo de Comunicación de LovIA! (basado en Gottman) y me di cuenta que evitar los 4 Jinetes + CNV es una combinación brutal.', votes: 8 },
        { author: 'Pablo_M', avatar: '🧔', timeAgo: 'hace 30min', text: 'Paso 3 (necesidades) es el más difícil para mí. Reconocer qué necesito emocionalmente sin culpar al otro requiere mucha introspección. El ICI me ayudó a ver que tengo baja tolerancia.', votes: 5 },
    ],
    'frecuencia-mejorando': [
        { author: 'Elena_R', avatar: '👩‍🦰', timeAgo: 'hace 4h', text: '¡Felicidades! Yo también noté que trabajar en IE fue lo que más impacto tuvo. Goleman tenía razón: la inteligencia emocional es más predictiva que el IQ para relaciones.', votes: 15 },
        { author: 'Luis_T', avatar: '👨', timeAgo: 'hace 3h', text: '¿Qué módulo específico de IE hiciste? Yo quiero empezar pero no sé si primero el de reconocimiento emocional o el de regulación (ERQ).', votes: 7 },
        { author: 'Carlos_R', avatar: '🧑‍💻', timeAgo: 'hace 2h', text: 'Empecé por regulación (ERQ me salió bajo en reevaluación) y después reconocimiento. La verdad es que ambos se complementan, pero Gross & John recomiendan empezar por reevaluación.', votes: 20 },
    ],
}

const defaultReplies: Reply[] = [
    { author: 'Moderador', avatar: '🛡️', timeAgo: 'recién', text: 'Este hilo está abierto para la discusión. Recuerda mantener un tono respetuoso y constructivo. Las reglas del foro aplican: no spam, no violencia, no acoso.', votes: 0 },
]

export default function ForumThread() {
    const navigate = useNavigate()
    const { threadId } = useParams<{ threadId: string }>()

    const thread = forumThreads.find(t => t.id === threadId)
    const replies = (threadId && threadReplies[threadId]) || defaultReplies

    if (!thread) {
        return (
            <div className="community-sub">
                <div className="community-sub__header">
                    <button className="community-sub__back" onClick={() => navigate('/community/forum')}>
                        <ArrowLeft size={20} />
                    </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Hilo no encontrado</p>
            </div>
        )
    }

    return (
        <div className="community-sub">
            <div className="community-sub__header">
                <button className="community-sub__back" onClick={() => navigate('/community/forum')}>
                    <ArrowLeft size={20} />
                </button>
                <span className="forum-card__tag" style={{ color: thread.tagColor }}>
                    {thread.tag}
                </span>
            </div>

            {/* Original Post */}
            <div className="thread-op glass-strong animate-fade-in-up">
                <h2 className="thread-op__title">{thread.title}</h2>
                <p className="thread-op__body">{thread.preview}</p>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                    marginTop: 'var(--space-4)', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)',
                }}>
                    <span>{thread.author}</span>
                    <span>{thread.timeAgo}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsUp size={12} />{thread.votes}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageSquare size={12} />{thread.replies}
                    </span>
                </div>
            </div>

            {/* Replies */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <BookOpen size={14} color="var(--text-tertiary)" />
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                    {replies.length} respuesta{replies.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {replies.map((reply, i) => (
                    <div key={i} className="thread-reply glass">
                        <div className="thread-reply__avatar">{reply.avatar}</div>
                        <div className="thread-reply__content">
                            <div className="thread-reply__header">
                                <span className="thread-reply__author">{reply.author}</span>
                                <span className="thread-reply__time">• {reply.timeAgo}</span>
                                {reply.votes > 0 && (
                                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-tertiary)' }}>
                                        <ThumbsUp size={10} />{reply.votes}
                                    </span>
                                )}
                            </div>
                            <div className="thread-reply__body">{reply.text}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply CTA */}
            <button
                className="glass-strong"
                style={{
                    width: '100%', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-default)', color: 'var(--text-tertiary)',
                    fontSize: 'var(--fs-sm)', background: 'none',
                    transition: 'all var(--duration-fast)', cursor: 'pointer',
                }}
            >
                💬 Escribe una respuesta...
            </button>
        </div>
    )
}
