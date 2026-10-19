import { Link } from 'react-router-dom'
import { Home, Heart, MapPin, Users, User } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import './BottomTabBar.css'

interface Props {
    currentPath: string
}

const tabs = [
    { path: '/home', icon: Home, label: 'Inicio' },
    { path: '/radar', icon: MapPin, label: 'Radar' },
    { path: '/matches', icon: Heart, label: 'Matches' },
    { path: '/community', icon: Users, label: 'Comunidad' },
    { path: '/profile', icon: User, label: 'Perfil' },
]

export default function BottomTabBar({ currentPath }: Props) {
    const profile = useAuthStore(s => s.profile)
    
    // Obtener readiness score del perfil del usuario
    const readiness = profile?.readiness_score ?? 0
    const isUnlocked = readiness >= 40

    // Ocultar visualmente 'Radar' y 'Matches' si el score es inferior a 40 (Discovery locked/preview threshold)
    const visibleTabs = tabs.filter(tab => {
        if (tab.path === '/radar' || tab.path === '/matches') {
            return isUnlocked
        }
        return true
    })

    return (
        <nav className="tab-bar" role="navigation" aria-label="Navegación principal">
            {visibleTabs.map(({ path, icon: Icon, label }) => {
                const isActive = currentPath === path
                return (
                    <Link
                        key={path}
                        to={path}
                        className={`tab-bar__item ${isActive ? 'tab-bar__item--active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <Icon className="tab-bar__icon" size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span className="tab-bar__label">{label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
