import {
    Users, Heart, TrendingUp, DollarSign,
    ArrowUpRight, ArrowDownRight, Activity, ShieldAlert
} from 'lucide-react'
import './AdminPages.css'

const kpis = [
    { label: 'Usuarios totales', value: '1,247', change: '+12%', trend: 'up', icon: Users, color: 'var(--line-love)' },
    { label: 'Usuarios activos (MAU)', value: '834', change: '+8%', trend: 'up', icon: Activity, color: 'var(--line-realization)' },
    { label: 'Matches generados', value: '156', change: '+23%', trend: 'up', icon: Heart, color: 'var(--love-rose)' },
    { label: 'Frecuencia promedio', value: '64', change: '-2', trend: 'down', icon: TrendingUp, color: 'var(--freq-mid)' },
    { label: 'Conversión Free→Paid', value: '6.2%', change: '+0.8%', trend: 'up', icon: DollarSign, color: 'var(--success)' },
    { label: 'Revenue (MRR)', value: '$12,450', change: '+18%', trend: 'up', icon: DollarSign, color: 'var(--success)' },
    { label: 'Reportes pendientes', value: '3', change: '', trend: 'neutral', icon: ShieldAlert, color: 'var(--warning)' },
    { label: 'NPS Promedio', value: '4.3/5', change: '+0.2', trend: 'up', icon: TrendingUp, color: 'var(--line-realization)' },
]

const recentUsers = [
    { name: 'María G.', email: 'maria@email.com', freq: 78, tier: 'Constructor', date: '24 Feb' },
    { name: 'Carlos R.', email: 'carlos@email.com', freq: 52, tier: 'Explorador', date: '24 Feb' },
    { name: 'Ana L.', email: 'ana@email.com', freq: 89, tier: 'Armonizador', date: '23 Feb' },
    { name: 'Pedro M.', email: 'pedro@email.com', freq: 41, tier: 'Buscador', date: '23 Feb' },
    { name: 'Sofía T.', email: 'sofia@email.com', freq: 65, tier: 'Constructor', date: '22 Feb' },
]

export default function Overview() {
    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1>Overview</h1>
                <p>Métricas generales de LovIA!</p>
            </div>

            {/* KPI Grid */}
            <div className="admin-kpi-grid stagger-children">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="admin-kpi glass">
                        <div className="admin-kpi__icon" style={{ background: `${kpi.color}18` }}>
                            <kpi.icon size={20} color={kpi.color} />
                        </div>
                        <div className="admin-kpi__data">
                            <span className="admin-kpi__label">{kpi.label}</span>
                            <span className="admin-kpi__value">{kpi.value}</span>
                        </div>
                        {kpi.change && (
                            <span className={`admin-kpi__change admin-kpi__change--${kpi.trend}`}>
                                {kpi.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {kpi.change}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts area (placeholder for Recharts integration) */}
            <div className="admin-charts-row">
                <div className="admin-chart glass">
                    <h3>📈 Usuarios por semana</h3>
                    <div className="admin-chart__placeholder">
                        <div className="admin-chart__bars">
                            {[35, 50, 45, 60, 55, 72, 68, 85, 78, 92, 88, 95].map((h, i) => (
                                <div
                                    key={i}
                                    className="admin-chart__bar"
                                    style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="admin-chart glass">
                    <h3>🍩 Distribución de Tiers</h3>
                    <div className="admin-chart__donut-wrap">
                        <div className="admin-chart__donut">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="12" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line-love)" strokeWidth="12"
                                    strokeDasharray="180 251" strokeDashoffset="-62" strokeLinecap="round" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line-sex)" strokeWidth="12"
                                    strokeDasharray="45 251" strokeDashoffset="-242" strokeLinecap="round" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line-realization)" strokeWidth="12"
                                    strokeDasharray="20 251" strokeDashoffset="-287" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="admin-chart__legend">
                            <span><i style={{ background: 'var(--border-subtle)' }} /> Explorador (Free) — 72%</span>
                            <span><i style={{ background: 'var(--line-love)' }} /> Arquitecto — 18%</span>
                            <span><i style={{ background: 'var(--line-sex)' }} /> Ingeniero — 7%</span>
                            <span><i style={{ background: 'var(--line-realization)' }} /> Diamante — 3%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent users table */}
            <div className="admin-table-wrap glass">
                <h3>Usuarios recientes</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Frecuencia</th>
                            <th>Nivel</th>
                            <th>Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentUsers.map((u) => (
                            <tr key={u.email}>
                                <td><strong>{u.name}</strong></td>
                                <td>{u.email}</td>
                                <td>
                                    <span className="admin-freq-badge" data-level={u.freq >= 70 ? 'high' : u.freq >= 50 ? 'mid' : 'low'}>
                                        {u.freq}
                                    </span>
                                </td>
                                <td>{u.tier}</td>
                                <td>{u.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
