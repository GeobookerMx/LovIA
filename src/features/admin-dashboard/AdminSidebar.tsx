import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    BarChart3, Users, Heart, Shield, FileText, Building2,
    DollarSign, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import './AdminSidebar.css'

const navItems = [
    { to: '/admin', icon: BarChart3, label: 'Overview', end: true },
    { to: '/admin/users', icon: Users, label: 'Usuarios' },
    { to: '/admin/matches', icon: Heart, label: 'Matches' },
    { to: '/admin/moderation', icon: Shield, label: 'Moderación' },
    { to: '/admin/content', icon: FileText, label: 'Contenido' },
    { to: '/admin/directory', icon: Building2, label: 'Directorio Pro' },
    { to: '/admin/finance', icon: DollarSign, label: 'Finanzas' },
    { to: '/admin/system', icon: Settings, label: 'Sistema' },
]

export default function AdminSidebar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const signOut = useAuthStore((s) => s.signOut)
    const navigate = useNavigate()

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="admin-sidebar__mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div className="admin-sidebar__overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar glass-strong ${mobileOpen ? 'admin-sidebar--open' : ''}`}>
                <div className="admin-sidebar__brand">
                    <h1>Lov<span className="text-gradient">IA!</span></h1>
                    <span className="admin-sidebar__brand-tag">Admin</span>
                </div>

                <nav className="admin-sidebar__nav">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                            }
                            onClick={() => setMobileOpen(false)}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                            <ChevronRight size={14} className="admin-sidebar__link-arrow" />
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <button className="admin-sidebar__logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
