import { useCallback, useEffect, useState } from 'react'
import { Heart, RefreshCw, ShieldAlert, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

type Counts = {
    users: number | null
    new24h: number | null
    onboarding: number | null
    matches: number | null
    pendingReports: number | null
}

type RecentUser = {
    id: string
    alias: string | null
    created_at: string
    onboarding_completed: boolean | null
}

const emptyCounts: Counts = { users: null, new24h: null, onboarding: null, matches: null, pendingReports: null }

export default function Overview() {
    const [counts, setCounts] = useState<Counts>(emptyCounts)
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setLoadError(false)
        try {
        const ago24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const [users, new24h, onboarding, matches, reports, recent] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', ago24h),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('onboarding_completed', true),
            supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('moderation_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('profiles').select('id, alias, created_at, onboarding_completed').order('created_at', { ascending: false }).limit(5),
        ])

        setCounts({
            users: users.error ? null : users.count,
            new24h: new24h.error ? null : new24h.count,
            onboarding: onboarding.error ? null : onboarding.count,
            matches: matches.error ? null : matches.count,
            pendingReports: reports.error ? null : reports.count,
        })
        setRecentUsers(recent.error ? [] : (recent.data ?? []) as RecentUser[])
        setLoadError(Boolean(users.error || new24h.error || onboarding.error || matches.error || reports.error || recent.error))
        } catch {
            setCounts(emptyCounts)
            setRecentUsers([])
            setLoadError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { void fetchData() }, [fetchData])

    const kpis = [
        { label: 'Usuarios registrados', value: counts.users, icon: Users },
        { label: 'Registros en 24 horas', value: counts.new24h, icon: Users },
        { label: 'Onboarding completado', value: counts.onboarding, icon: Users },
        { label: 'Conexiones activas', value: counts.matches, icon: Heart },
        { label: 'Reportes pendientes', value: counts.pendingReports, icon: ShieldAlert },
    ]

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1>Resumen de LovIA</h1>
                    <p>Datos consultados al abrir esta pantalla. Actualiza para ver cambios recientes.</p>
                </div>
                <button className="admin-refresh-btn" onClick={() => void fetchData()} disabled={loading} aria-label="Actualizar resumen">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loadError && <p role="alert" className="alert-error">No se pudieron consultar algunos datos. Un guion indica que el dato no está disponible; no equivale a cero.</p>}

            <div className="admin-kpi-grid">
                {kpis.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="admin-kpi glass">
                        <div className="admin-kpi__icon"><Icon size={20} /></div>
                        <div className="admin-kpi__data">
                            <span className="admin-kpi__label">{label}</span>
                            <span className="admin-kpi__value">{loading ? '…' : value ?? '—'}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-table-wrap glass">
                <h2>Registros recientes</h2>
                <table className="admin-table">
                    <thead><tr><th>Alias</th><th>Inicio</th><th>Registro</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={3}>Cargando…</td></tr> : recentUsers.length === 0 ? (
                            <tr><td colSpan={3}>{loadError ? 'No disponible' : 'Sin registros visibles'}</td></tr>
                        ) : recentUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.alias || 'Sin alias'}</td>
                                <td>{user.onboarding_completed ? 'Completado' : 'Pendiente'}</td>
                                <td>{new Date(user.created_at).toLocaleDateString('es-MX')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
