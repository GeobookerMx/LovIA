/**
 * LovIA! — Dr. LovIA Guide Chatbot Widget
 * Floating chatbot accessible from any screen.
 * Uses a rule-based knowledge base — no external AI API required.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
    INTENTS,
    FALLBACK,
    detectIntent,
    type BotMessage,
    type QuickReply,
} from './guideKnowledge'
import './GuideChat.css'

interface ChatMessage {
    id: string
    role: 'bot' | 'user'
    text: string
    richContent?: BotMessage['richContent']
    quickReplies?: QuickReply[]
    timestamp: Date
}

interface SpecialistPreview {
    full_name: string
    title: string
    specialty: string
    city: string
}

// Simple markdown bold renderer (converts **text** → <strong>)
function renderMarkdown(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
            ? <strong key={i}>{part.slice(2, -2)}</strong>
            : part
    )
}

// ── Rich Content Renderer ──────────────────────────────────────────────────
function RichRenderer({
    rich,
    specialists,
}: {
    rich: BotMessage['richContent']
    specialists: SpecialistPreview[]
}) {
    if (!rich) return null

    if (rich.type === 'steps' && rich.steps) {
        return (
            <div className="guide-steps">
                {rich.steps.map((step, i) => (
                    <div key={i} className="guide-step-card" style={{ animationDelay: `${i * 55}ms` }}>
                        <div className="guide-step-card__num">{step.n}</div>
                        <div className="guide-step-card__content">
                            <h4>{step.title}</h4>
                            <p>{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (rich.type === 'specialist') {
        const list = specialists.length > 0 ? specialists : null
        return (
            <div className="guide-specialist">
                {list ? (
                    list.map((s, i) => (
                        <div key={i} className="guide-specialist-card" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="guide-specialist-card__avatar">👩‍⚕️</div>
                            <div className="guide-specialist-card__info">
                                <h4>{s.title} {s.full_name}</h4>
                                <p>{s.specialty} · {s.city}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="guide-rich__item">
                        📋 Aún no hay especialistas verificados en el directorio. ¡Pronto! Mientras tanto puedes buscar apoyo en el módulo Comunidad → Directorio.
                    </div>
                )}
            </div>
        )
    }

    if (rich.items) {
        return (
            <div className="guide-rich">
                {rich.items.map((item, i) => (
                    <div key={i} className="guide-rich__item" style={{ animationDelay: `${i * 50}ms` }}>
                        {renderMarkdown(item)}
                    </div>
                ))}
            </div>
        )
    }

    return null
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function GuideChatbot() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const [specialists, setSpecialists] = useState<SpecialistPreview[]>([])
    const [hasGreeted, setHasGreeted] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Fetch specialists from Supabase
    useEffect(() => {
        supabase
            .from('specialists')
            .select('full_name, title, specialty, city')
            .eq('status', 'active')
            .eq('verified', true)
            .limit(4)
            .then(({ data }) => { if (data) setSpecialists(data) })
    }, [])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, typing])

    // Show welcome message when first opened
    useEffect(() => {
        if (open && !hasGreeted) {
            setHasGreeted(true)
            pushBotMessage(INTENTS.welcome, 350)
        }
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 400)
        }
    }, [open])

    const pushBotMessage = useCallback((msg: BotMessage, delay = 0) => {
        setTyping(true)
        setTimeout(() => {
            setTyping(false)
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'bot',
                text: msg.text,
                richContent: msg.richContent,
                quickReplies: msg.quickReplies,
                timestamp: new Date(),
            }])
        }, delay + 600 + Math.random() * 400)
    }, [])

    const handleIntent = useCallback((intent: string) => {
        // Clear quick replies from all previous messages
        setMessages(prev => prev.map(m => ({ ...m, quickReplies: undefined })))

        const response = INTENTS[intent] || FALLBACK
        pushBotMessage(response, 0)
    }, [pushBotMessage])

    const handleUserSend = (text: string) => {
        if (!text.trim()) return
        setInput('')

        // Add user message
        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text: text.trim(),
            timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMsg])

        // Detect intent and respond
        const intent = detectIntent(text)
        handleIntent(intent)
    }

    const handleQuickReply = (qr: QuickReply) => {
        // Navigate to real pages
        if (qr.intent === 'go_directory') {
            window.location.href = '/community/directory'
            return
        }
        if (qr.intent === 'go_pricing') {
            window.location.href = '/pricing'
            return
        }

        // Show user's selection as a message then respond
        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text: qr.label,
            timestamp: new Date(),
        }
        setMessages(prev => [...prev.map(m => ({ ...m, quickReplies: undefined })), userMsg])
        handleIntent(qr.intent)
    }

    return (
        <>
            {/* Floating Action Button */}
            {!open && (
                <button
                    className="guide-fab"
                    onClick={() => setOpen(true)}
                    aria-label="Abrir Guía LovIA"
                    title="Dr. LovIA — Tu guía"
                >
                    <MessageCircle size={22} color="white" />
                    <div className="guide-fab__badge" />
                </button>
            )}

            {/* Chat Panel */}
            {open && (
                <div className="guide-panel">
                    {/* Header */}
                    <div className="guide-header">
                        <div className="guide-avatar">🧠</div>
                        <div className="guide-header__info">
                            <div className="guide-header__name">Dr. LovIA</div>
                            <div className="guide-header__status">En línea ahora</div>
                        </div>
                        <button className="guide-close" onClick={() => setOpen(false)}>
                            <X size={14} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="guide-messages">
                        {messages.map((msg) => (
                            <div key={msg.id}>
                                <div className={`guide-msg guide-msg--${msg.role}`}>
                                    {msg.role === 'bot' && (
                                        <div className="guide-msg__mini-avatar">🧠</div>
                                    )}
                                    <div className="guide-msg__bubble">
                                        {renderMarkdown(msg.text)}
                                        {msg.richContent && (
                                            <RichRenderer
                                                rich={msg.richContent}
                                                specialists={specialists}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Quick Replies */}
                                {msg.quickReplies && msg.quickReplies.length > 0 && (
                                    <div className="guide-quickreplies">
                                        {msg.quickReplies.map((qr, i) => (
                                            <button
                                                key={i}
                                                className="guide-qr-btn"
                                                onClick={() => handleQuickReply(qr)}
                                            >
                                                {qr.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {typing && (
                            <div className="guide-msg guide-msg--bot">
                                <div className="guide-msg__mini-avatar">🧠</div>
                                <div className="guide-typing">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Text Input */}
                    <div className="guide-input-row">
                        <input
                            ref={inputRef}
                            className="guide-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleUserSend(input)}
                            placeholder="Pregúntame lo que quieras..."
                            maxLength={200}
                        />
                        <button
                            className="guide-send"
                            onClick={() => handleUserSend(input)}
                            disabled={!input.trim()}
                        >
                            <Send size={14} color="white" />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
