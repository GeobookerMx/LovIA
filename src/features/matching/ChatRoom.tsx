import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { type Message } from '../../lib/database.types'

const SUGGESTED_PROMPTS = [
    "¿Qué fue lo que más te sorprendió de tus resultados en el Mapa de Vida?",
    "¿Cuál es tu forma favorita de recargar energía tras un día pesado?",
    "¿Qué es algo que siempre has querido aprender?",
    "Si pudieras vivir en cualquier etapa histórica, ¿cuál elegirías y por qué?"
]

export default function ChatRoom() {
    const { id: matchId } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [otherUser, setOtherUser] = useState<any>(null)
    const [sendError, setSendError] = useState<string | null>(null)
    const [currentLevel, setCurrentLevel] = useState<number>(0)
    const [securityAlert, setSecurityAlert] = useState<string | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!user || !matchId) return

        let subscription: any

        async function fetchInitialData() {
            // 1. Fetch match and other user info
            const { data: match, error: matchError } = await supabase
                .from('matches')
                .select(`
                    current_level,
                    user_a:profiles!matches_user_a_id_fkey(id, alias, avatar_url, visibility_mode),
                    user_b:profiles!matches_user_b_id_fkey(id, alias, avatar_url, visibility_mode)
                `)
                .eq('id', matchId)
                .single()

            if (matchError || !match) {
                console.error('Error fetching match:', matchError)
                navigate('/matches')
                return
            }

            if (match.current_level < 2) {
                alert('El chat seguro aún no está desbloqueado. Para chatear, ambos deben aceptar el Nivel 2.')
                navigate(`/matches/${matchId}`)
                return
            }

            // Supabase returns related records as objects if not an array relationship, but TS sometimes warns.
            const userA = Array.isArray(match.user_a) ? match.user_a[0] : match.user_a
            const userB = Array.isArray(match.user_b) ? match.user_b[0] : match.user_b

            const other = userA?.id === user?.id ? userB : userA
            setOtherUser(other)
            setCurrentLevel(match.current_level)

            // 2. Fetch messages
            const { data: msgs, error: msgError } = await supabase
                .from('messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: true })

            if (!msgError && msgs) {
                setMessages(msgs)
            }

            setLoading(false)

            // 3. Subscribe to real-time messages
            subscription = supabase.channel('chat_room')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `match_id=eq.${matchId}`
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new as Message])
                })
                .subscribe()
        }

        fetchInitialData()

        return () => {
            if (subscription) supabase.removeChannel(subscription)
        }
    }, [matchId, user, navigate])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !user || !matchId) return

        let content = newMessage.trim()
        setNewMessage('')
        setSendError(null)
        setSecurityAlert(null)

        // Security Filter: Mask sensitive info if currentLevel < 3 (Date Readiness)
        if (currentLevel < 3) {
            let wasBlocked = false;
            
            // Mask Emails
            content = content.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, () => {
                wasBlocked = true;
                return '[EMAIL OCULTO]';
            });
            
            // Mask Phones (matches 8+ digit sequences containing spaces/dashes)
            content = content.replace(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g, (m) => {
                const digitsCount = m.replace(/\D/g, '').length;
                if (digitsCount >= 8 && digitsCount <= 15) {
                    wasBlocked = true;
                    return '[TELÉFONO OCULTO]';
                }
                return m;
            });

            // Mask Social Media mentions
            content = content.replace(/(ig|insta|instagram|snap|snapchat|tiktok|facebook|fb|tw|twitter|x)[\s:=]*@?[a-zA-Z0-9_.-]+/gi, (_m, p1) => {
                wasBlocked = true;
                return `[${p1.toUpperCase()} OCULTO]`;
            });

            if (wasBlocked) {
                setSecurityAlert('Por tu seguridad, los datos de contacto se bloquean automáticamente hasta desbloquear la Cita Segura (Nivel 3).')
            }
        }

        const { error } = await supabase
            .from('messages')
            .insert({
                match_id: matchId,
                sender_id: user.id,
                content: content
            })

        if (error) {
            console.error('Error sending message', error)
            setSendError('No se pudo enviar el mensaje')
            setNewMessage(content) // restore input
        }
    }

    if (loading) {
        return <div className="flex-center" style={{ minHeight: '100vh' }}><Loader2 className="animate-spin" /></div>
    }

    // Determine Avatar based on visibility
    let otherAvatar = otherUser?.avatar_url || 'https://via.placeholder.com/50'
    let maskClass = ''
    if (otherUser?.visibility_mode === 'essence') maskClass = 'match-card__visibility--essence'
    else if (otherUser?.visibility_mode === 'gradual') maskClass = 'match-card__visibility--gradual'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-card)' }}>
            {/* Header */}
            <header style={{ 
                padding: 'var(--space-4)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-4)',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-main)',
                zIndex: 10
            }}>
                <button className="icon-btn" onClick={() => navigate(`/matches/${matchId}`)}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
                    <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
                        {otherUser?.visibility_mode === 'essence' ? (
                            <div style={{ width: '100%', height: '100%', background: 'var(--love-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                🔮
                            </div>
                        ) : (
                            <img src={otherAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className={maskClass} />
                        )}
                    </div>
                    <div>
                        <h2 style={{ fontSize: 'var(--fs-md)', margin: 0 }}>{otherUser?.alias || 'Match'}</h2>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Shield size={10} color="var(--success)"/> Entorno Seguro
                        </span>
                    </div>
                </div>
                <button className="icon-btn" style={{ color: 'var(--text-tertiary)' }} title="Reportar">
                    <AlertTriangle size={18} />
                </button>
            </header>

            {/* Messages Area */}
            <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                        Han desbloqueado el Nivel {currentLevel}.<br/>
                        Recuerda mantener el respeto. Este chat está protegido y monitoreado.
                        {currentLevel < 3 && (
                            <span style={{ display: 'block', marginTop: 4, color: 'var(--warning)', fontWeight: 500 }}>
                                🔒 Datos de contacto bloqueados hasta el Nivel 3.
                            </span>
                        )}
                    </p>
                </div>

                {messages.length === 0 && (
                    <div style={{ marginTop: 'auto', marginBottom: 'var(--space-4)' }}>
                        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                            ¿No sabes qué decir? Rompe el hielo:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {SUGGESTED_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setNewMessage(prompt)}
                                    style={{
                                        background: 'rgba(255, 107, 138, 0.1)',
                                        border: '1px solid var(--love-rose)',
                                        color: 'var(--text-primary)',
                                        padding: '10px 16px',
                                        borderRadius: '16px',
                                        textAlign: 'left',
                                        fontSize: 'var(--fs-sm)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id
                    return (
                        <div key={msg.id} style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            background: isMe ? 'var(--love-gradient)' : 'rgba(255,255,255,0.05)',
                            color: isMe ? 'white' : 'var(--text-primary)',
                            padding: '10px 14px',
                            borderRadius: '16px',
                            borderBottomRightRadius: isMe ? '4px' : '16px',
                            borderBottomLeftRadius: !isMe ? '4px' : '16px',
                            fontSize: 'var(--fs-sm)',
                            lineHeight: 1.4,
                            border: isMe ? 'none' : '1px solid var(--border-subtle)'
                        }}>
                            {msg.content}
                            <div style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)', textAlign: 'right', marginTop: 4 }}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-main)' }}>
                {securityAlert && <div style={{ color: 'var(--warning)', fontSize: 'var(--fs-xs)', marginBottom: '8px', textAlign: 'center', background: 'rgba(255, 184, 0, 0.1)', padding: '6px', borderRadius: '4px' }}>{securityAlert}</div>}
                {sendError && <div style={{ color: 'var(--love-rose)', fontSize: 'var(--fs-xs)', marginBottom: '8px', textAlign: 'center' }}>{sendError}</div>}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                        type="text" 
                        placeholder="Escribe un mensaje..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ 
                            flex: 1, 
                            border: '1px solid var(--border-subtle)', 
                            background: 'var(--bg-input)', 
                            color: 'var(--text-primary)', 
                            padding: '12px 16px', 
                            borderRadius: '24px',
                            outline: 'none'
                        }} 
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        style={{ 
                            background: newMessage.trim() ? 'var(--love-rose)' : 'var(--surface-color)', 
                            color: 'white', 
                            border: 'none', 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                            transition: 'background 0.2s'
                        }}
                    >
                        <Send size={18} style={{ marginLeft: 2 }}/>
                    </button>
                </form>
            </footer>
        </div>
    )
}
