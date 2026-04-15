import { useState, useEffect } from 'react'
import { Heart, Search, Eye, Clock, CheckCircle2, XCircle, Video, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

interface MatchEntry {
    id: string
    user1: string
    user2: string
    compatScore: number
    freqAvg: number
    status: 'pending' | 'active' | 'declined' | 'completed' | string
    createdAt: string
    algorithm: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: 'Pendiente', color: 'var(--warning)', icon: Clock },
    active: { label: 'Activo', color: 'var(--success)', icon: CheckCircle2 },
    declined: { label: 'Rechazado', color: 'var(--danger)', icon: XCircle },
    completed: { label: 'Completado', color: 'var(--line-realization)', icon: CheckCircle2 },
}

export default function MatchesManager() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [matches, setMatches] = useState<MatchEntry[]>([])
    const [loading, setLoading] = useState(true)

    const fetchMatches = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('matches')
            .select(`
                id,
                status,
                created_at,
                compatibility_score,
                user_a:profiles!matches_user_a_id_fkey(alias, frequency_score),
                user_b:profiles!matches_user_b_id_fkey(alias, frequency_score)
            `)
            .order('created_at', { ascending: false })

        if (!error && data) {
            const parsed = data.map((m: any) => {
                const u1 = Array.isArray(m.user_a) ? m.user_a[0] : m.user_a;
                const u2 = Array.isArray(m.user_b) ? m.user_b[0] : m.user_b;
                const f1 = u1?.frequency_score || 0
                const f2 = u2?.frequency_score || 0
                return {
                    id: m.id,
                    user1: u1?.alias || 'Desconocido',
                    user2: u2?.alias || 'Desconocido',
                    compatScore: m.compatibility_score || 0,
                    freqAvg: Math.round((f1 + f2) / 2),
                    status: m.status,
                    createdAt: m.created_at,
                    algorithm: 'LovIA Algoritmo V1'
                }
            })
            setMatches(parsed)
        }
        setLoading(false)
    }

    useEffect(() => { fetchMatches() }, [])

    const filtered = matches.filter(m => {
        const matchesSearch = !searchTerm ||
            m.user1.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.user2.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const activeCount = matches.filter(m => m.status === 'active').length;
    const acceptRate = matches.length > 0 ? Math.round((activeCount / matches.length) * 100) : 0;
    const avgCompat = matches.length > 0 ? Math.round(matches.reduce((s, m) => s + m.compatScore, 0) / matches.length) : 0;

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1>Matches</h1>
                    <p>Gestión del algoritmo de compatibilidad en vivo</p>
                </div>
                <button className="admin-refresh-btn" onClick={fetchMatches} title="Recargar">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* KPIs */}
            <div className="admin-kpi-grid stagger-children" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { label: 'Matches totales', value: String(matches.length), icon: Heart, color: 'var(--line-love)' },
                    { label: 'Tasa aceptación', value: `${acceptRate}%`, icon: CheckCircle2, color: 'var(--success)' },
                    { label: 'Activos', value: String(activeCount), icon: Video, color: 'var(--line-sex)' },
                    { label: 'Compat. promedio', value: String(avgCompat), icon: Heart, color: 'var(--line-realization)' },
                ].map(kpi => (
                    <div key={kpi.label} className="admin-kpi glass">
                        <div className="admin-kpi__icon" style={{ background: `${kpi.color}18` }}>
                            <kpi.icon size={20} color={kpi.color} />
                        </div>
                        <div className="admin-kpi__data">
                            <span className="admin-kpi__label">{kpi.label}</span>
                            <span className="admin-kpi__value">{kpi.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar glass">
                <div className="admin-toolbar__search">
                    <Search size={16} />
                    <input
                        placeholder="Buscar match, usuario…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {['all', 'pending', 'active', 'declined', 'completed'].map(s => (
                        <button
                            key={s}
                            className={`admin-toolbar__filter ${statusFilter === s ? 'admin-toolbar__filter--active' : ''}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s === 'all' ? 'Todos' : statusConfig[s]?.label || s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-wrap glass">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario 1</th>
                            <th>Usuario 2</th>
                            <th>Compat.</th>
                            <th>Freq. Prom.</th>
                            <th>Estado</th>
                            <th>Algoritmo</th>
                            <th>Fecha</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={9} style={{textAlign:'center', padding: '20px'}}>Cargando...</td></tr>}
                        {!loading && filtered.length === 0 && <tr><td colSpan={9} style={{textAlign:'center', padding: '20px'}}>No se encontraron matches.</td></tr>}
                        {!loading && filtered.map(m => {
                            const sc = statusConfig[m.status] || { label: m.status, icon: Clock, color: 'var(--text-tertiary)' }
                            const StatusIcon = sc.icon
                            return (
                                <tr key={m.id}>
                                    <td><code style={{ fontSize: 'var(--fs-xs)' }}>{m.id.substring(0,8)}</code></td>
                                    <td><strong>{m.user1}</strong></td>
                                    <td><strong>{m.user2}</strong></td>
                                    <td>
                                        <span className="admin-freq-badge" data-level={m.compatScore >= 80 ? 'high' : m.compatScore >= 60 ? 'mid' : 'low'}>
                                            {m.compatScore}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="admin-freq-badge" data-level={m.freqAvg >= 70 ? 'high' : m.freqAvg >= 50 ? 'mid' : 'low'}>
                                            {m.freqAvg}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: sc.color, fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-medium)' }}>
                                            <StatusIcon size={12} /> {sc.label}
                                        </span>
                                    </td>
                                    <td><code style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{m.algorithm}</code></td>
                                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="admin-actions">
                                            <button title="Ver detalle"><Eye size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
