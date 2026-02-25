import { Shield, ChevronRight, Settings, LogOut, FileText, CreditCard, TrendingUp, BarChart3, Activity } from 'lucide-react'
import './ProfilePage.css'

export default function ProfilePage() {
    // Mock data
    const user = { name: 'Usuario', level: 'Constructor', frequency: 67, tier: 'Explorador' }

    return (
        <div className="profile-page">
            {/* Avatar + Info */}
            <div className="profile-page__header animate-fade-in">
                <div className="profile-page__avatar">
                    <span>👤</span>
                </div>
                <h1>{user.name}</h1>
                <div className="profile-page__badges">
                    <span className="profile-page__badge glass">{user.level}</span>
                    <span className="profile-page__badge profile-page__badge--tier glass">{user.tier}</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="profile-page__stats stagger-children">
                <div className="profile-page__stat glass">
                    <Activity size={18} color="var(--freq-mid)" />
                    <span className="profile-page__stat-value">{user.frequency}</span>
                    <span className="profile-page__stat-label">Frecuencia</span>
                </div>
                <div className="profile-page__stat glass">
                    <BarChart3 size={18} color="var(--line-sex)" />
                    <span className="profile-page__stat-value">27</span>
                    <span className="profile-page__stat-label">Factores</span>
                </div>
                <div className="profile-page__stat glass">
                    <TrendingUp size={18} color="var(--line-realization)" />
                    <span className="profile-page__stat-value">40%</span>
                    <span className="profile-page__stat-label">Progreso</span>
                </div>
            </div>

            {/* Menu */}
            <nav className="profile-page__menu">
                <h3 className="profile-page__menu-title">Mi Perfil</h3>
                <MenuItem icon={<BarChart3 size={18} />} label="Gráfica de Relación" color="var(--line-love)" />
                <MenuItem icon={<Activity size={18} />} label="Radar de Frecuencia" color="var(--line-sex)" />
                <MenuItem icon={<TrendingUp size={18} />} label="Mis Factores" color="var(--line-realization)" />
                <MenuItem icon={<TrendingUp size={18} />} label="Plan de Mejora" color="var(--success)" />

                <h3 className="profile-page__menu-title">Cuenta</h3>
                <MenuItem icon={<Shield size={18} />} label="Verificación" color="var(--love-warm)" />
                <MenuItem icon={<CreditCard size={18} />} label="Suscripción" color="var(--love-rose)" />
                <MenuItem icon={<Settings size={18} />} label="Configuración" color="var(--text-secondary)" />
                <MenuItem icon={<FileText size={18} />} label="Legal y Privacidad" color="var(--text-secondary)" />

                <button className="profile-page__logout glass">
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                </button>
            </nav>
        </div>
    )
}

function MenuItem({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
    return (
        <button className="profile-page__menu-item glass">
            <div className="profile-page__menu-icon" style={{ color }}>{icon}</div>
            <span>{label}</span>
            <ChevronRight size={16} className="profile-page__menu-arrow" />
        </button>
    )
}
