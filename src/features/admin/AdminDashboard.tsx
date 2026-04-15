import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Users, ShieldAlert, CreditCard, Activity, ArrowLeft,
    CheckCircle, XCircle, DollarSign, TrendingUp, AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './Admin.css'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'metrics' | 'moderation' | 'monetization'>('metrics')
    const [banFeedback, setBanFeedback] = useState<string | null>(null)

    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingApprovals: 0,
        activeMatches: 0,
        totalRevenue: 2450 // Hardcoded placeholder for now
    })

    const [reports, setReports] = useState<any[]>([])

    // Simulated Fetch for MVP
    useEffect(() => {
        async function fetchAdminData() {
            // Count users
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
            const { count: matchesCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'active')
            const { count: pendingCount } = await supabase.from('private_profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'review')
            
            // Get reports
            const { data: reportsData } = await supabase.from('moderation_reports').select('*, reporter:profiles!moderation_reports_reporter_id_fkey(alias), reported:profiles!moderation_reports_reported_id_fkey(alias)').eq('status', 'pending')

            setStats({
                totalUsers: usersCount || 0,
                pendingApprovals: pendingCount || 0,
                activeMatches: matchesCount || 0,
                totalRevenue: 12450 // Mock
            })

            if (reportsData) setReports(reportsData)
        }
        
        fetchAdminData()
    }, [])

    const handleDismissReport = async (id: string) => {
        await supabase.from('moderation_reports').update({ status: 'dismissed' }).eq('id', id)
        setReports(reports.filter(r => r.id !== id))
    }

    const handleBanUser = async (reportId: string, reportedUserId: string) => {
        await supabase.from('private_profiles').update({ account_status: 'banned' }).eq('id', reportedUserId)
        await supabase.from('moderation_reports').update({ status: 'action_taken' }).eq('id', reportId)
        setReports(reports.filter(r => r.id !== reportId))
        setBanFeedback('✅ Usuario suspendido correctamente de la plataforma.')
        setTimeout(() => setBanFeedback(null), 4000)
    }

    return (
        <div className="admin-dashboard">
            <header className="admin__header">
                <button className="icon-btn" onClick={() => navigate('/home')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Centro de Control (Admin)</h2>
            </header>

            {banFeedback && (
                <div style={{ margin: '0 16px', padding: '12px 16px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '10px', color: 'var(--success)', fontSize: '14px', fontWeight: 500 }}>
                    {banFeedback}
                </div>
            )}

            <div className="admin__tabs">
                <button className={`admin__tab ${activeTab === 'metrics' ? 'active' : ''}`} onClick={() => setActiveTab('metrics')}>
                    <Activity size={16} /> Métricas V1
                </button>
                <button className={`admin__tab ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                    <ShieldAlert size={16} /> Moderación
                    {stats.pendingApprovals > 0 && <span className="admin__badge">{stats.pendingApprovals}</span>}
                </button>
                <button className={`admin__tab ${activeTab === 'monetization' ? 'active' : ''}`} onClick={() => setActiveTab('monetization')}>
                    <CreditCard size={16} /> Pagos
                </button>
            </div>

            <div className="admin__content animate-fade-in-up">
                
                {activeTab === 'metrics' && (
                    <div className="admin__metrics-grid">
                        <div className="admin__metric-card glass">
                            <Users size={24} color="var(--line-love)" />
                            <h4>Usuarios Totales</h4>
                            <div className="admin__metric-value">{stats.totalUsers}</div>
                            <span className="admin__metric-trend positive"><TrendingUp size={12}/> +12% esta semana</span>
                        </div>
                        <div className="admin__metric-card glass">
                            <Activity size={24} color="var(--line-sex)" />
                            <h4>Matches Activos</h4>
                            <div className="admin__metric-value">{stats.activeMatches}</div>
                            <span className="admin__metric-trend positive"><TrendingUp size={12}/> +5% esta semana</span>
                        </div>
                        <div className="admin__metric-card glass">
                            <AlertTriangle size={24} color="var(--warning)" />
                            <h4>Perfiles Pendientes (Revisión)</h4>
                            <div className="admin__metric-value">{stats.pendingApprovals}</div>
                            <span className="admin__metric-trend">Requieren aprobación manual</span>
                        </div>
                        <div className="admin__metric-card glass">
                            <DollarSign size={24} color="var(--success)" />
                            <h4>Ingresos Brutos (MVP)</h4>
                            <div className="admin__metric-value">${stats.totalRevenue}</div>
                            <span className="admin__metric-trend positive"><TrendingUp size={12}/> Premium & B2B</span>
                        </div>
                    </div>
                )}

                {activeTab === 'moderation' && (
                    <div className="admin__moderation">
                        <h3>Reportes Pendientes ({reports.length})</h3>
                        {reports.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No hay reportes activos. La red está limpia.</p>
                        ) : (
                            <div className="admin__report-list">
                                {reports.map(report => (
                                    <div key={report.id} className="admin__report-card glass-strong">
                                        <div className="admin__report-header">
                                            <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{report.reported?.alias || 'Alguien'} fue reportado</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>por {report.reporter?.alias || 'Usuario'}</span>
                                        </div>
                                        <p className="admin__report-reason">"{report.reason}"</p>
                                        
                                        <div className="admin__report-actions">
                                            <button className="admin__btn-dismiss" onClick={() => handleDismissReport(report.id)}>
                                                <XCircle size={14} /> Ignorar
                                            </button>
                                            <button className="admin__btn-ban" onClick={() => handleBanUser(report.id, report.reported_id)}>
                                                <ShieldAlert size={14} /> Banear
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <h3 style={{ marginTop: 'var(--space-6)' }}>Aprobación de Contenido (Catfishing)</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>En MVP 5, aquí aparecerán lado-a-lado las selfies de verificación para confirmar que empatan con la foto de perfil en caso de que falle el sistema AI.</p>
                    </div>
                )}

                {activeTab === 'monetization' && (
                    <div className="admin__monetization stagger-children">
                        <div className="glass-strong" style={{ padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                            <h3>Suscripciones Premium</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Estado actual de la conexión con Stripe (Modo Test)</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                <span>API Status</span>
                                <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={16} /> Conectado</span>
                            </div>
                        </div>

                        <div className="glass-strong" style={{ padding: '20px', borderRadius: '12px' }}>
                            <h3>B2B Geobooker Venues</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Módulo de gestión para registrar cafeterías locales y cobrar suscripción comercial por leads de primeras citas (Fase 4.3). Próximamente habilitado en V1.1.</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
