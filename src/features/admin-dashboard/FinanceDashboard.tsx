import { useState, useEffect } from 'react'
import {
    DollarSign, TrendingUp, Users, CreditCard,
    ArrowUpRight, RefreshCw
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

interface PlanStat {
    plan: string
    users: number
    pct: number
    revenueStr: string
    revenue: number
    color: string
}

const recentTransactions = [
    { user: 'Usuario Prueba', plan: 'Arquitecto', amount: '$79.00', date: 'Simulada', type: 'renewal' },
    { user: 'Sistema LovIA', plan: 'Ingeniero', amount: '$149.00', date: 'Simulada', type: 'upgrade' },
    { user: 'Admin Test', plan: 'Diamante', amount: '$299.00', date: 'Simulada', type: 'new' },
]

export default function FinanceDashboard() {
    const [loading, setLoading] = useState(true)
    const [planBreakdown, setPlanBreakdown] = useState<PlanStat[]>([])
    const [mrr, setMrr] = useState(0)
    const [totalSubs, setTotalSubs] = useState(0)

    const fetchFinances = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('profiles').select('tier')
        
        if (!error && data) {
            let free = 0, arq = 0, ing = 0, dia = 0;
            data.forEach(u => {
                const t = u.tier?.toLowerCase() || 'free'
                if (t === 'arquitecto') arq++
                else if (t === 'ingeniero') ing++
                else if (t === 'diamante') dia++
                else free++
            })

            const total = Math.max(1, data.length)
            const revArq = arq * 79
            const revIng = ing * 149
            const revDia = dia * 299
            const totalMrr = revArq + revIng + revDia

            setMrr(totalMrr)
            setTotalSubs(arq + ing + dia)

            setPlanBreakdown([
                { plan: 'Explorador (Free)', users: free, pct: (free/total)*100, revenue: 0, revenueStr: '$0', color: 'var(--text-tertiary)' },
                { plan: 'Arquitecto ($79/m)', users: arq, pct: (arq/total)*100, revenue: revArq, revenueStr: `$${revArq.toLocaleString()}`, color: 'var(--line-love)' },
                { plan: 'Ingeniero ($149/m)', users: ing, pct: (ing/total)*100, revenue: revIng, revenueStr: `$${revIng.toLocaleString()}`, color: 'var(--line-sex)' },
                { plan: 'Diamante ($299/m)', users: dia, pct: (dia/total)*100, revenue: revDia, revenueStr: `$${revDia.toLocaleString()}`, color: 'var(--line-realization)' },
            ])
        }
        setLoading(false)
    }

    useEffect(() => { fetchFinances() }, [])

    const kpis = [
        { label: 'MRR', value: `$${mrr.toLocaleString()}`, change: 'En vivo', trend: 'up', icon: DollarSign, color: 'var(--success)' },
        { label: 'ARR Proyectado', value: `$${(mrr * 12).toLocaleString()}`, change: 'En vivo', trend: 'up', icon: TrendingUp, color: 'var(--line-realization)' },
        { label: 'Suscriptores Activos', value: String(totalSubs), change: 'Planes de pago', trend: 'up', icon: Users, color: 'var(--line-love)' },
        { label: 'ARPU', value: totalSubs > 0 ? `$${(mrr/totalSubs).toFixed(2)}` : '$0', change: 'Prom. por usuario', trend: 'neutral', icon: CreditCard, color: 'var(--line-sex)' },
    ]

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1>Finanzas</h1>
                    <p>Revenue y Suscripciones reales desde Supabase</p>
                </div>
                <button className="admin-refresh-btn" onClick={fetchFinances} title="Recargar">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* KPIs */}
            <div className="admin-kpi-grid stagger-children" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {kpis.map(kpi => (
                    <div key={kpi.label} className="admin-kpi glass">
                        <div className="admin-kpi__icon" style={{ background: `${kpi.color}18` }}>
                            <kpi.icon size={20} color={kpi.color} />
                        </div>
                        <div className="admin-kpi__data">
                            <span className="admin-kpi__label">{kpi.label}</span>
                            <span className="admin-kpi__value">{loading ? '...' : kpi.value}</span>
                        </div>
                        {kpi.change && (
                            <span className={`admin-kpi__change admin-kpi__change--${kpi.trend}`}>
                                {kpi.trend === 'up' && <ArrowUpRight size={14} />}
                                {kpi.change}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Plan breakdown */}
            <div className="admin-section glass">
                <div className="admin-section__header">
                    <h3>Distribución por Plan en Vivo</h3>
                </div>
                {loading ? <div style={{textAlign: 'center', color: 'var(--text-tertiary)', padding: 20}}>Calculando métricas...</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {planBreakdown.map(plan => (
                            <div key={plan.plan} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: plan.color, flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)' }}>{plan.plan}</span>
                                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{plan.users} usuarios</span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bg-glass)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${plan.pct}%`, background: plan.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                                <span style={{ fontFamily: 'var(--font-accent)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', color: 'var(--text-primary)', minWidth: 60, textAlign: 'right' }}>
                                    {plan.revenueStr}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Revenue chart placeholder */}
            <div className="admin-chart glass">
                <h3>📈 Proyección visual de crecimiento</h3>
                <div className="admin-chart__placeholder">
                    <div className="admin-chart__bars">
                        {[20, 35, 42, 55, 68, 78, 72, 85, 92, 98, 105, 124].map((h, i) => (
                            <div
                                key={i}
                                className="admin-chart__bar"
                                style={{
                                    height: `${(h / 130) * 100}%`,
                                    animationDelay: `${i * 60}ms`,
                                    background: i === 11 ? 'var(--gradient-accent)' : undefined,
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                        <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
                    </div>
                </div>
            </div>

            {/* Recent transactions */}
            <div className="admin-table-wrap glass">
                <h3>Transacciones Recientes (Mock Histórico)</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Plan</th>
                            <th>Monto</th>
                            <th>Tipo</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransactions.map((tx, i) => (
                            <tr key={i}>
                                <td><strong>{tx.user}</strong></td>
                                <td>{tx.plan}</td>
                                <td style={{ color: tx.amount.startsWith('-') ? 'var(--danger)' : 'var(--success)', fontWeight: 'var(--fw-semibold)' }}>
                                    {tx.amount}
                                </td>
                                <td>
                                    <span className={`admin-status admin-status--${tx.type === 'refund' ? 'suspended' : 'active'}`}>
                                        {tx.type === 'renewal' ? 'Renovación' : tx.type === 'upgrade' ? 'Upgrade' : tx.type === 'new' ? 'Nuevo' : 'Reembolso'}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-tertiary)' }}>{tx.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
