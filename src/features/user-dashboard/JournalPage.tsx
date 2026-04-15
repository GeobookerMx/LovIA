import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookHeart, Loader2, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './JournalPage.css'

interface JournalEntry {
    id: string
    content: string
    mood_tags: string[]
    created_at: string
}

const AVAILABLE_TAGS = ['Agradecido/a', 'Ansioso/a', 'Feliz', 'Triste', 'Enamorado/a', 'Confundido/a', 'En paz']

export default function JournalPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [content, setContent] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (user) fetchEntries()
    }, [user])

    const fetchEntries = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            
        if (!error && data) {
            setEntries(data)
        }
        setLoading(false)
    }

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag))
        } else {
            if (selectedTags.length >= 3) return // Max 3 tags
            setSelectedTags([...selectedTags, tag])
        }
    }

    const handleSubmit = async () => {
        if (!content.trim() || !user) return

        setSaving(true)
        const { error } = await supabase.from('journal_entries').insert({
            user_id: user.id,
            content: content.trim(),
            mood_tags: selectedTags,
        })

        if (!error) {
            setContent('')
            setSelectedTags([])
            fetchEntries() // reload
        } else {
            alert('Error al guardar tu entrada. Inténtalo de nuevo.')
        }
        setSaving(false)
    }

    return (
        <div className="journal-page">
            <div className="journal-page__header">
                <button className="journal-page__back" onClick={() => navigate('/profile')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Mi Diario Emocional</h2>
            </div>

            {/* Input Form */}
            <div className="journal-entry-form glass-strong animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--love-rose)', marginBottom: 8 }}>
                    <BookHeart size={18} />
                    <span style={{ fontWeight: 500 }}>¿Cómo te sientes hoy?</span>
                </div>
                
                <textarea 
                    placeholder="Escribe lo que sientes, un pensamiento del día, o algo que quieras recordar..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={saving}
                />

                <div className="journal-tags">
                    {AVAILABLE_TAGS.map(tag => (
                        <button 
                            key={tag}
                            className={`journal-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                            onClick={() => toggleTag(tag)}
                            disabled={saving}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <button 
                    className="journal-submit" 
                    onClick={handleSubmit}
                    disabled={saving || !content.trim()}
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Guardar
                </button>
            </div>

            {/* History */}
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Entradas Anteriores</h3>
            
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Loader2 size={24} className="animate-spin" color="var(--love-rose)" />
                </div>
            ) : entries.length === 0 ? (
                <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    Aún no tienes entradas en tu diario. ¡Escribe la primera!
                </div>
            ) : (
                <div className="journal-list stagger-children">
                    {entries.map(entry => (
                        <div key={entry.id} className="journal-card glass animate-fade-in-up">
                            <div className="journal-card__header">
                                <span className="journal-card__date">
                                    {new Date(entry.created_at).toLocaleDateString('es-MX', { 
                                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                                    })}
                                </span>
                            </div>
                            <div className="journal-card__content">
                                {entry.content}
                            </div>
                            {entry.mood_tags.length > 0 && (
                                <div className="journal-card__tags">
                                    {entry.mood_tags.map(tag => (
                                        <span key={tag} className="journal-card__tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
