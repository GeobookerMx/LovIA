/**
 * ContentManager.tsx — Panel editorial del libro LovIA
 * Permite al admin crear, editar, ordenar, publicar y eliminar tarjetas de lectura
 * del libro "Evolución de las Relaciones de Pareja" sin tocar el código fuente.
 */
import { useEffect, useState } from 'react'
import {
    BookOpen, CheckCircle2, ChevronDown, ChevronUp,
    Eye, EyeOff, FileText, Loader2, Pencil, Plus, Save, Trash2, XCircle,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

interface BookCard {
    id: string
    num: string
    title: string
    fragment: string
    synthesis: string
    question: string
    reading_time: string
    published: boolean
    sort_order: number
    updated_at: string
}

const EMPTY_CARD: Omit<BookCard, 'id' | 'updated_at'> = {
    num: '', title: '', fragment: '', synthesis: '', question: '',
    reading_time: '3 min', published: false, sort_order: 99,
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function ContentManager() {
    const [cards, setCards] = useState<BookCard[]>([])
    const [loading, setLoading] = useState(true)
    const [editId, setEditId] = useState<string | null>(null)   // null = nuevo
    const [editing, setEditing] = useState<typeof EMPTY_CARD | null>(null)
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => { void load() }, [])

    async function load() {
        setLoading(true)
        const { data, error } = await supabase
            .from('book_cards')
            .select('*')
            .order('sort_order')
        if (!error) setCards((data ?? []) as BookCard[])
        setLoading(false)
    }

    function startNew() {
        const nextOrder = cards.length > 0 ? Math.max(...cards.map((c) => c.sort_order)) + 1 : 1
        const nextNum = String(cards.length + 1).padStart(2, '0')
        setEditId(null)
        setEditing({ ...EMPTY_CARD, num: nextNum, sort_order: nextOrder })
        setSaveStatus('idle')
    }

    function startEdit(card: BookCard) {
        setEditId(card.id)
        const { id: _id, updated_at: _u, ...rest } = card
        setEditing(rest)
        setSaveStatus('idle')
        setErrorMsg('')
    }

    function cancelEdit() {
        setEditing(null)
        setEditId(null)
        setSaveStatus('idle')
    }

    async function save() {
        if (!editing) return
        setSaveStatus('saving')
        setErrorMsg('')
        try {
            if (editId) {
                const { error } = await supabase.from('book_cards').update(editing).eq('id', editId)
                if (error) throw error
                setCards((prev) => prev.map((c) => c.id === editId ? { ...c, ...editing, updated_at: new Date().toISOString() } : c))
            } else {
                const { data, error } = await supabase.from('book_cards').insert(editing).select().single()
                if (error) throw error
                setCards((prev) => [...prev, data as BookCard].sort((a, b) => a.sort_order - b.sort_order))
            }
            setSaveStatus('saved')
            setTimeout(() => { setEditing(null); setEditId(null); setSaveStatus('idle') }, 800)
        } catch (e: unknown) {
            setErrorMsg(e instanceof Error ? e.message : 'Error al guardar')
            setSaveStatus('error')
        }
    }

    async function togglePublish(card: BookCard) {
        const next = !card.published
        setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, published: next } : c))
        const { error } = await supabase.from('book_cards').update({ published: next }).eq('id', card.id)
        if (error) setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, published: !next } : c))
    }

    async function moveOrder(card: BookCard, direction: 'up' | 'down') {
        const sorted = [...cards].sort((a, b) => a.sort_order - b.sort_order)
        const idx = sorted.findIndex((c) => c.id === card.id)
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= sorted.length) return
        const a = sorted[idx], b = sorted[swapIdx]
        const newA = { ...a, sort_order: b.sort_order }
        const newB = { ...b, sort_order: a.sort_order }
        setCards((prev) => prev.map((c) => c.id === a.id ? newA : c.id === b.id ? newB : c).sort((x, y) => x.sort_order - y.sort_order))
        await Promise.all([
            supabase.from('book_cards').update({ sort_order: newA.sort_order }).eq('id', a.id),
            supabase.from('book_cards').update({ sort_order: newB.sort_order }).eq('id', b.id),
        ])
    }

    async function deleteCard(id: string) {
        const { error } = await supabase.from('book_cards').delete().eq('id', id)
        if (!error) setCards((prev) => prev.filter((c) => c.id !== id))
        setDeleteConfirm(null)
    }

    const set = (field: keyof typeof EMPTY_CARD, value: string | boolean | number) =>
        setEditing((e) => e ? { ...e, [field]: value } : e)

    const published = cards.filter((c) => c.published).length
    const draft = cards.filter((c) => !c.published).length

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1>Panel Editorial · Libro</h1>
                <p>Gestión de tarjetas de lectura de «Evolución de las Relaciones de Pareja» — los cambios se reflejan en la app al instante.</p>
            </div>

            {/* KPIs */}
            <div className="admin-kpi-grid">
                <div className="admin-kpi glass">
                    <div className="admin-kpi__icon" style={{ background: 'rgba(255,107,138,0.15)' }}>
                        <BookOpen size={20} style={{ color: 'var(--love-rose)' }} />
                    </div>
                    <div className="admin-kpi__data">
                        <span className="admin-kpi__label">Total de tarjetas</span>
                        <span className="admin-kpi__value">{loading ? '…' : cards.length}</span>
                    </div>
                </div>
                <div className="admin-kpi glass">
                    <div className="admin-kpi__icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                        <Eye size={20} style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="admin-kpi__data">
                        <span className="admin-kpi__label">Publicadas</span>
                        <span className="admin-kpi__value">{loading ? '…' : published}</span>
                    </div>
                </div>
                <div className="admin-kpi glass">
                    <div className="admin-kpi__icon" style={{ background: 'rgba(251,191,36,0.15)' }}>
                        <FileText size={20} style={{ color: 'var(--warning)' }} />
                    </div>
                    <div className="admin-kpi__data">
                        <span className="admin-kpi__label">Borradores</span>
                        <span className="admin-kpi__value">{loading ? '…' : draft}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="admin-section glass" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                    Las tarjetas publicadas aparecen en BookPage para todos los usuarios autenticados.
                </span>
                <button id="content-new-card-btn" className="admin-btn admin-btn--primary" onClick={startNew} disabled={!!editing}>
                    <Plus size={14} /> Nueva tarjeta
                </button>
            </div>

            {/* Formulario de edición */}
            {editing && (
                <div className="admin-section glass" role="dialog" aria-label={editId ? 'Editar tarjeta' : 'Nueva tarjeta'}>
                    <div className="admin-section__header">
                        <h3><Pencil size={16} /> {editId ? 'Editar tarjeta' : 'Nueva tarjeta'}</h3>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)' }} onClick={cancelEdit}><XCircle size={18} /></button>
                    </div>

                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px', gap: 'var(--space-3)' }}>
                            <label style={{ display: 'grid', gap: 4 }}>
                                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>Número</span>
                                <input id="card-num" value={editing.num} onChange={(e) => set('num', e.target.value)} maxLength={3} placeholder="01"
                                    style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', fontFamily: 'monospace', width: '100%' }} />
                            </label>
                            <label style={{ display: 'grid', gap: 4 }}>
                                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>Título *</span>
                                <input id="card-title" value={editing.title} onChange={(e) => set('title', e.target.value)} maxLength={120} placeholder="Autoconocimiento"
                                    style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', width: '100%' }} />
                            </label>
                            <label style={{ display: 'grid', gap: 4 }}>
                                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>Tiempo lectura</span>
                                <input id="card-time" value={editing.reading_time} onChange={(e) => set('reading_time', e.target.value)} maxLength={20} placeholder="3 min"
                                    style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', width: '100%' }} />
                            </label>
                        </div>

                        {[
                            { id: 'card-fragment', field: 'fragment' as const, label: 'Fragmento del libro (entrecomillado) *', rows: 4, max: 600 },
                            { id: 'card-synthesis', field: 'synthesis' as const, label: 'Síntesis (enfoque) *', rows: 2, max: 400 },
                            { id: 'card-question', field: 'question' as const, label: 'Pregunta para reflexionar *', rows: 2, max: 300 },
                        ].map(({ id, field, label, rows, max }) => (
                            <label key={field} style={{ display: 'grid', gap: 4 }}>
                                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{label}</span>
                                <textarea id={id} value={editing[field] as string} onChange={(e) => set(field, e.target.value)} rows={rows} maxLength={max}
                                    style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', resize: 'vertical', fontFamily: 'inherit', width: '100%' }} />
                                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textAlign: 'right' }}>{(editing[field] as string).length} / {max}</span>
                            </label>
                        ))}

                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                            <input id="card-published" type="checkbox" checked={editing.published} onChange={(e) => set('published', e.target.checked)}
                                style={{ width: 18, height: 18, accentColor: 'var(--success)' }} />
                            <span style={{ fontSize: 'var(--fs-sm)' }}>Publicar inmediatamente (visible para todos los usuarios)</span>
                        </label>

                        {errorMsg && (
                            <p role="alert" style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'var(--danger)', fontSize: 'var(--fs-sm)' }}>
                                <XCircle size={14} /> {errorMsg}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button id="card-save-btn" className="admin-btn admin-btn--primary" onClick={() => void save()} disabled={saveStatus === 'saving' || !editing.title || !editing.fragment}>
                                {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle2 size={14} /> : <Save size={14} />}
                                {saveStatus === 'saving' ? 'Guardando…' : saveStatus === 'saved' ? 'Guardado ✓' : 'Guardar tarjeta'}
                            </button>
                            <button className="admin-btn" style={{ background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }} onClick={cancelEdit}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de tarjetas */}
            <div className="admin-table-wrap glass">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <h3>Tarjetas del libro</h3>
                    {loading && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--love-rose)' }} />}
                </div>
                {!loading && cards.length === 0 && (
                    <p style={{ color: 'var(--text-tertiary)', padding: 'var(--space-6)', textAlign: 'center' }}>
                        Sin tarjetas. Crea la primera con el botón «Nueva tarjeta».
                    </p>
                )}
                {cards.length > 0 && (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: 50 }}>Orden</th>
                                <th style={{ width: 40 }}>#</th>
                                <th>Título</th>
                                <th style={{ width: 80 }}>Tiempo</th>
                                <th style={{ width: 100 }}>Estado</th>
                                <th style={{ width: 140 }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...cards].sort((a, b) => a.sort_order - b.sort_order).map((card) => (
                                <tr key={card.id}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: '2px', cursor: 'pointer' }} onClick={() => void moveOrder(card, 'up')} title="Subir">
                                                <ChevronUp size={14} />
                                            </button>
                                            <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: '2px', cursor: 'pointer' }} onClick={() => void moveOrder(card, 'down')} title="Bajar">
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td><code style={{ fontFamily: 'monospace', fontSize: 'var(--fs-xs)' }}>{card.num}</code></td>
                                    <td>
                                        <strong style={{ fontSize: 'var(--fs-sm)' }}>{card.title}</strong>
                                        <p style={{ margin: '2px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {card.question}
                                        </p>
                                    </td>
                                    <td style={{ fontSize: 'var(--fs-xs)' }}>{card.reading_time}</td>
                                    <td>
                                        <button
                                            id={`card-toggle-publish-${card.id}`}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                            onClick={() => void togglePublish(card)}
                                            title={card.published ? 'Despublicar' : 'Publicar'}
                                        >
                                            {card.published
                                                ? <><Eye size={14} style={{ color: 'var(--success)' }} /><span className="admin-status admin-status--active">Publicada</span></>
                                                : <><EyeOff size={14} style={{ color: 'var(--text-tertiary)' }} /><span className="admin-status admin-status--draft">Borrador</span></>}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="admin-actions">
                                            <button id={`card-edit-${card.id}`} title="Editar" onClick={() => startEdit(card)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: 'var(--space-1)', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
                                                <Pencil size={15} />
                                            </button>
                                            {deleteConfirm === card.id ? (
                                                <>
                                                    <button title="Confirmar borrado" onClick={() => void deleteCard(card.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: 'var(--space-1)', cursor: 'pointer' }}>
                                                        <CheckCircle2 size={15} />
                                                    </button>
                                                    <button title="Cancelar" onClick={() => setDeleteConfirm(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: 'var(--space-1)', cursor: 'pointer' }}>
                                                        <XCircle size={15} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button id={`card-delete-${card.id}`} title="Borrar" onClick={() => setDeleteConfirm(card.id)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: 'var(--space-1)', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Nota editorial */}
            <div className="admin-section glass" role="note">
                <h3 style={{ fontSize: 'var(--fs-sm)', display: 'flex', gap: 'var(--space-2)' }}><BookOpen size={15} /> Nota editorial</h3>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                    Solo las tarjetas «Publicadas» aparecen en BookPage. Los borradores son invisibles para los usuarios.
                    El orden se actualiza en tiempo real — arrastra con las flechas ↑↓. Los textos libres del autor
                    se entrecomillan automáticamente en la UI. Cualquier cambio tiene efecto inmediato en producción.
                </p>
            </div>
        </div>
    )
}
