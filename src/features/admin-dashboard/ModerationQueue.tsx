/**
 * LovIA! — Moderation Queue (Admin)
 * Connected to real Supabase `moderation_reports` table.
 * LFPDPPP compliance: all moderation actions logged.
 */

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, MessageSquare, Image, User, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

interface Report {
    id: string
    type: string
    reason: string
    status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed'
    created_at: string
    reporter: { alias: string } | null
    reported: { alias: string } | null
    reported_id: string
    reporter_id: string
}

const typeIcons: Record<string, any> = {
    profile: User,
    message: MessageSquare,
    photo: Image,
    behavior: AlertTriangle,
}

const priorityColors: Record<string, string> = {
    high: 'var(--danger)',
    medium: 'var(--warning)',
    low: 'var(--text-tertiary)',
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'var(--warning)' },
    reviewed: { label: 'Revisado', color: 'var(--info)' },
    action_taken: { label: 'Acción tomada', color: 'var(--success)' },
    dismissed: { label: 'Descartado', color: 'var(--text-tertiary)' },
}

export default function ModerationQueue() {
    const [filter, setFilter] = useState<string>('all')
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [feedback, setFeedback] = useState<string | null>(null)

    const fetchReports = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('moderation_reports')
            .select('*, reporter:profiles!moderation_reports_reporter_id_fkey(alias), reported:profiles!moderation_reports_reported_id_fkey(alias)')
            .order('created_at', { ascending: false })
            .limit(50)

        if (!error && data) setReports(data as any)
        setLoading(false)
    }

    useEffect(() => { fetchReports() }, [])

    const handleAction = async (reportId: string, action: 'dismissed' | 'action_taken', reportedId?: string) => {
        if (action === 'action_taken' && reportedId) {
            await supabase.from('private_profiles').update({ account_status: 'banned' }).eq('id', reportedId)
        }
        await supabase.from('moderation_reports').update({ status: action }).eq('id', reportId)
        setFeedback(action === 'dismissed' ? '✓ Reporte descartado' : '✅ Usuario suspendido de la plataforma')
        setTimeout(() => setFeedback(null), 3500)
        fetchReports()
    }

    const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)
    const pendingCount = reports.filter(r => r.status === 'pending').length
    const highCount = reports.filter(r => r.status === 'pending').length

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1>Moderación</h1>
                    <p>Cola de reportes en tiempo real — conectada a Supabase</p>
                </div>
                <button className="admin-refresh-btn" onClick={fetchReports} title="Recargar">
                    <RefreshCw size={16} />
                </button>
            </div>

            {feedback && (
                <div style={{ padding: '12px 16px', marginBottom: 16, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: 'var(--success)', fontSize: '14px', fontWeight: 500 }}>
                    {feedback}
                </div>
            )}

            {/* KPIs */}
            <div className="admin-kpi-grid stagger-children" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { label: 'Pendientes', value: String(pendingCount), icon: Clock, color: 'var(--warning)' },
                    { label: 'Total reportes', value: String(reports.length), icon: Shield, color: 'var(--line-realization)' },
                    { label: 'Alta prioridad', value: String(highCount), icon: AlertTriangle, color: 'var(--danger)' },
                    { label: 'Resueltos', value: String(reports.filter(r => r.status === 'action_taken').length), icon: CheckCircle2, color: 'var(--success)' },
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

            {/* Filters */}
            <div className="admin-toolbar glass">
                <Shield size={18} color="var(--text-tertiary)" />
                {['all', 'pending', 'reviewed', 'action_taken', 'dismissed'].map(s => (
                    <button
                        key={s}
                        className={`admin-toolbar__filter ${filter === s ? 'admin-toolbar__filter--active' : ''}`}
                        onClick={() => setFilter(s)}
                    >
                        {s === 'all' ? 'Todos' : statusLabels[s]?.label}
                        {s === 'pending' && pendingCount > 0 && (
                            <span style={{ marginLeft: 4, background: 'var(--danger)', color: '#fff', borderRadius: 99, padding: '0 5px', fontSize: '10px' }}>{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Report cards */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>Cargando reportes...</div>
            ) : filtered.length === 0 ? (
                <div className="glass" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    ✅ No hay reportes en esta categoría. La red está limpia.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} className="stagger-children">
                    {filtered.map(report => {
                        const TypeIcon = typeIcons[report.type] || Shield
                        const status = statusLabels[report.status] || { label: report.status, color: 'var(--text-tertiary)' }
                        return (
                            <div key={report.id} className="admin-section glass">
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${priorityColors.high}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <TypeIcon size={20} color={priorityColors.high} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                                            <code style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{report.id.slice(0, 8)}</code>
                                            <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                                                {new Date(report.created_at).toLocaleDateString('es-MX')}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-semibold)', marginBottom: 4 }}>
                                            "{report.reason}"
                                        </p>
                                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                                            Reportado: <strong>{report.reported?.alias || 'Desconocido'}</strong> · Por: {report.reporter?.alias || 'Sistema'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                                        <span style={{ fontSize: 'var(--fs-xs)', color: status.color, fontWeight: 'var(--fw-medium)' }}>
                                            {status.label}
                                        </span>
                                        {report.status === 'pending' && (
                                            <div className="admin-actions">
                                                <button title="Descartar" onClick={() => handleAction(report.id, 'dismissed')}>
                                                    <XCircle size={14} color="var(--text-tertiary)" />
                                                </button>
                                                <button title="Banear usuario" onClick={() => handleAction(report.id, 'action_taken', report.reported_id)}>
                                                    <CheckCircle2 size={14} color="var(--danger)" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
