import { useEffect, useState } from 'react'
import { Activity, BookOpen, Loader2, ShieldCheck, Users, Wallet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

interface FinanceStats {
    totalUsers: number
    totalAnswers: number
    completedUsers: number   // usuarios con ≥ 18 respuestas
    flagEnabled: boolean
    flagUpdatedAt: string | null
}

const TOTAL_QUESTIONS = 19  // 18 preguntas + next_step

export default function FinanceDashboard() {
    const [stats, setStats] = useState<FinanceStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => { void load() }, [])

    async function load() {
        setLoading(true)
        setError(null)
        try {
            const [flagRes, answersRes] = await Promise.all([
                supabase
                    .from('lovia_feature_flags')
                    .select('enabled, updated_at')
                    .eq('key', 'finance_private_save')
                    .maybeSingle(),
                supabase
                    .from('finance_answers')
                    .select('user_id, catalog_version')
                    .eq('catalog_version', 'v2'),
            ])

            if (flagRes.error) throw flagRes.error
            if (answersRes.error) throw answersRes.error

            const rows = answersRes.data ?? []

            // Agrupar por usuario
            const byUser: Record<string, number> = {}
            for (const row of rows) {
                byUser[row.user_id] = (byUser[row.user_id] ?? 0) + 1
            }
            const userIds = Object.keys(byUser)
            const completed = userIds.filter((uid) => byUser[uid] >= TOTAL_QUESTIONS - 1)

            setStats({
                totalUsers: userIds.length,
                totalAnswers: rows.length,
                completedUsers: completed.length,
                flagEnabled: flagRes.data?.enabled ?? false,
                flagUpdatedAt: flagRes.data?.updated_at ?? null,
            })
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    const completionRate = stats && stats.totalUsers > 0
        ? Math.round((stats.completedUsers / stats.totalUsers) * 100)
        : 0

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1>Finanzas · Módulo</h1>
                <p>Métricas del recorrido «Dinero y proyecto de vida» — respuestas privadas (catálogo v2)</p>
            </div>

            {/* Estado del interruptor */}
            <div className="admin-section glass" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <ShieldCheck size={20} style={{ color: stats?.flagEnabled ? 'var(--success)' : 'var(--text-tertiary)', flexShrink: 0 }} />
                <div>
                    <strong style={{ fontSize: 'var(--fs-sm)' }}>
                        Guardado privado: {loading ? '…' : stats?.flagEnabled ? 'Activo ✅' : 'Inactivo ⚪'}
                    </strong>
                    {stats?.flagUpdatedAt && (
                        <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                            Última modificación: {new Date(stats.flagUpdatedAt).toLocaleString('es-MX')}
                            {' · '}Actívalo desde <a href="/admin/system" style={{ color: 'var(--love-rose)' }}>Sistema → Interruptores</a>
                        </p>
                    )}
                </div>
                <button
                    id="finance-refresh-btn"
                    className="admin-btn admin-btn--primary"
                    onClick={() => void load()}
                    disabled={loading}
                    style={{ marginLeft: 'auto' }}
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />} Actualizar
                </button>
            </div>

            {error && (
                <div className="admin-section glass" role="alert" style={{ color: 'var(--danger)' }}>
                    Error al cargar métricas: {error}
                </div>
            )}

            {/* KPIs */}
            <div className="admin-kpi-grid">
                <div className="admin-kpi glass">
                    <div className="admin-kpi__icon" style={{ background: 'rgba(255,107,138,0.15)' }}>
                        <Users size={20} style={{ color: 'var(--love-rose)' }} />
                    </div>
                    <div className="admin-kpi__data">
                        <span className="admin-kpi__label">Usuarios con respuestas</span>
                        <span className="admin-kpi__value">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : stats?.totalUsers ?? '—'}
                        </span>
                    </div>
                </div>

                <div className="admin-kpi glass">
                    <div className="admin-kpi__icon" style={{ background: 'rgba(34,211,238,0.15)' }}>
                        <BookOpen size={20} style={{ color: 'var(--line-realization)' }} />
                    </div>
                    <div className="admin-kpi__data">
                        <span className="admin-kpi__label">Total de respuestas</span>
                        <span className="admin-kpi__value">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : stats?.totalAnswers ?? '—'}
                        </span>
                    </div>
                </div>

                <div className="admin-kpi glass">
                    <div className="admin-kpi__icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                        <Wallet size={20} style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="admin-kpi__data">
                        <span className="admin-kpi__label">Recorrido completo</span>
                        <span className="admin-kpi__value">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : stats?.completedUsers ?? '—'}
                        </span>
                    </div>
                </div>

                <div className="admin-kpi glass">
                    <div className="admin-kpi__icon" style={{ background: 'rgba(168,85,247,0.15)' }}>
                        <Activity size={20} style={{ color: 'var(--line-sex)' }} />
                    </div>
                    <div className="admin-kpi__data">
                        <span className="admin-kpi__label">Tasa de completado</span>
                        <span className="admin-kpi__value">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : `${completionRate}%`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Barra de progreso de completado */}
            {!loading && stats && stats.totalUsers > 0 && (
                <div className="admin-section glass">
                    <h3 style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                        <Activity size={16} /> Completado del recorrido ({stats.completedUsers} de {stats.totalUsers} usuarios)
                    </h3>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', height: 12, overflow: 'hidden' }}>
                        <div style={{
                            width: `${completionRate}%`,
                            height: '100%',
                            background: 'var(--love-gradient)',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.8s var(--ease-out)',
                        }} />
                    </div>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                        «Completo» = ≥ {TOTAL_QUESTIONS - 1} preguntas respondidas del catálogo v2. No se registran contenidos de respuestas (privacidad RLS estricta).
                    </p>
                </div>
            )}

            {/* Nota de privacidad */}
            <div className="admin-section glass" role="note">
                <h3 style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                    <ShieldCheck size={16} /> Privacidad de datos
                </h3>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                    Las políticas RLS impiden leer el contenido de las respuestas, incluso desde el panel de admin. Solo se muestran conteos
                    agregados. El recuento de usuarios es posible porque <code>user_id</code> es accesible en COUNT sin exponer las respuestas.
                </p>
            </div>
        </div>
    )
}
