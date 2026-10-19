import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookHeart, Loader2, Send, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './JournalPage.css'

interface JournalEntry {
    id: string
    content: string
    mood_tags: string[] | null
    created_at: string
}

const PAGE_SIZE = 20
const AVAILABLE_TAGS = ['Agradecido/a', 'Ansioso/a', 'Feliz', 'Triste', 'Enamorado/a', 'Confundido/a', 'En paz']

export default function JournalPage() {
    const navigate = useNavigate()
    const userId = useAuthStore(state => state.user?.id)
    const requestGeneration = useRef(0)
    const pendingInsertId = useRef<string | null>(null)
    const savingRef = useRef(false)
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [content, setContent] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const generation = ++requestGeneration.current
        setEntries([])
        setContent('')
        setSelectedTags([])
        pendingInsertId.current = null
        setError(null)
        setLoading(true)
        if (!userId) { setLoading(false); return }

        void (async () => {
            const { data, error: loadError } = await supabase.from('journal_entries')
                .select('id, content, mood_tags, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(0, PAGE_SIZE - 1)
            if (generation !== requestGeneration.current) return
            if (loadError) setError('No se pudo cargar tu diario. Revisa la conexión e inténtalo de nuevo.')
            else {
                setEntries((data ?? []) as JournalEntry[])
                setHasMore((data?.length ?? 0) === PAGE_SIZE)
            }
            setLoading(false)
        })()
        return () => { requestGeneration.current++ }
    }, [userId])

    useEffect(() => {
        const warn = (event: BeforeUnloadEvent) => {
            if (!content.trim()) return
            event.preventDefault()
            event.returnValue = ''
        }
        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [content])

    const loadMore = async () => {
        if (!userId || loadingMore || !hasMore) return
        const generation = requestGeneration.current
        setLoadingMore(true)
        const { data, error: loadError } = await supabase.from('journal_entries')
            .select('id, content, mood_tags, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(entries.length, entries.length + PAGE_SIZE - 1)
        if (generation === requestGeneration.current) {
            if (loadError) setError('No se pudieron cargar más entradas.')
            else {
                setEntries(old => [...old, ...((data ?? []) as JournalEntry[]).filter(item => !old.some(existing => existing.id === item.id))])
                setHasMore((data?.length ?? 0) === PAGE_SIZE)
                setError(null)
            }
            setLoadingMore(false)
        }
    }

    const toggleTag = (tag: string) => {
        setSelectedTags(current => current.includes(tag) ? current.filter(value => value !== tag) : current.length < 3 ? [...current, tag] : current)
    }

    const handleSubmit = async () => {
        if (!content.trim() || !userId || savingRef.current) return
        savingRef.current = true
        setSaving(true)
        setError(null)
        const generation = requestGeneration.current
        const id = pendingInsertId.current ?? crypto.randomUUID()
        pendingInsertId.current = id
        const submittedContent = content.trim()
        const { data, error: saveError } = await supabase.from('journal_entries').insert({
            id, user_id: userId, content: submittedContent, mood_tags: selectedTags,
        }).select('id, content, mood_tags, created_at').single()
        let confirmed = data as JournalEntry | null
        if (saveError && generation === requestGeneration.current) {
            const { data: existing } = await supabase.from('journal_entries')
                .select('id, content, mood_tags, created_at').eq('user_id', userId).eq('id', id).maybeSingle()
            if (existing?.content === submittedContent) confirmed = existing as JournalEntry
        }
        if (generation === requestGeneration.current) {
            if (!confirmed) setError('No se confirmó el guardado. Conservamos el texto; comprueba el historial antes de reintentar.')
            else {
                setEntries(current => [confirmed, ...current.filter(item => item.id !== id)])
                setContent('')
                setSelectedTags([])
                pendingInsertId.current = null
            }
            setSaving(false)
        }
        savingRef.current = false
    }

    const deleteEntry = async (id: string) => {
        if (!userId || !window.confirm('¿Eliminar esta entrada del diario?')) return
        const generation = requestGeneration.current
        const { data, error: deleteError } = await supabase.from('journal_entries')
            .delete().eq('user_id', userId).eq('id', id).select('id').single()
        if (generation !== requestGeneration.current) return
        if (deleteError || data?.id !== id) setError('No se pudo confirmar el borrado de la entrada.')
        else { setEntries(current => current.filter(item => item.id !== id)); setError(null) }
    }

    return (
        <div className="journal-page">
            <div className="journal-page__header">
                <button className="journal-page__back" onClick={() => {
                    if (!content.trim() || window.confirm('Tienes un borrador sin guardar. ¿Salir y descartarlo?')) navigate('/profile')
                }} aria-label="Volver"><ArrowLeft size={20} /></button>
                <h2>Mi Diario Emocional</h2>
            </div>

            <div className="journal-entry-form glass-strong animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--love-rose)', marginBottom: 8 }}>
                    <BookHeart size={18} /><span style={{ fontWeight: 500 }}>¿Cómo te sientes hoy?</span>
                </div>
                <textarea placeholder="Escribe lo que sientes, un pensamiento del día, o algo que quieras recordar..."
                    value={content} onChange={event => setContent(event.target.value)} disabled={saving} />
                <div className="journal-tags">
                    {AVAILABLE_TAGS.map(tag => <button key={tag} type="button"
                        className={`journal-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                        onClick={() => toggleTag(tag)} disabled={saving}>{tag}</button>)}
                </div>
                <button className="journal-submit" onClick={handleSubmit} disabled={saving || !content.trim()}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Guardar
                </button>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Entradas anteriores</h3>
            {error && <div role="alert" className="alert-error">{error}</div>}
            {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={24} className="animate-spin" /></div>
                : entries.length === 0 && !error ? <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>Aún no tienes entradas en tu diario.</div>
                : <div className="journal-list stagger-children">
                    {entries.map(entry => <div key={entry.id} className="journal-card glass animate-fade-in-up">
                        <div className="journal-card__header">
                            <span className="journal-card__date">{new Date(entry.created_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            <button type="button" aria-label="Eliminar entrada" title="Eliminar entrada" onClick={() => deleteEntry(entry.id)}><Trash2 size={16} /></button>
                        </div>
                        <div className="journal-card__content">{entry.content}</div>
                        {(entry.mood_tags ?? []).length > 0 && <div className="journal-card__tags">
                            {(entry.mood_tags ?? []).map(tag => <span key={tag} className="journal-card__tag">{tag}</span>)}
                        </div>}
                    </div>)}
                    {hasMore && <button type="button" className="journal-submit" onClick={loadMore} disabled={loadingMore}>
                        {loadingMore ? 'Cargando...' : 'Cargar más entradas'}
                    </button>}
                </div>}
        </div>
    )
}
