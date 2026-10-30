import { Link } from 'react-router-dom'
import { Home, Heart, MapPin, BookOpen, User } from 'lucide-react'
import './BottomTabBar.css'

interface Props {
    currentPath: string
}

const radarEnabled = import.meta.env.VITE_ENABLE_RADAR === 'true'

const tabs = [
    { path: '/home', icon: Home, label: 'Inicio' },
    ...(radarEnabled ? [{ path: '/radar', icon: MapPin, label: 'Explorar' }] : []),
    { path: '/modules', icon: BookOpen, label: 'Guía' },
    { path: '/matches', icon: Heart, label: 'Conexiones' },
    { path: '/profile', icon: User, label: 'Perfil' },
]

export default function BottomTabBar({ currentPath }: Props) {
    return (
        <nav className="tab-bar" role="navigation" aria-label="Navegación principal">
            {tabs.map(({ path, icon: Icon, label }) => {
                const isActive = currentPath === path || currentPath.startsWith(`${path}/`)
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
