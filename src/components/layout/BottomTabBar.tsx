import { Link } from 'react-router-dom'
import { Home, Heart, MapPin, BookOpen, User } from 'lucide-react'
import { isRadarAvailable, isRadarDemoAvailable } from '../../lib/discoveryAvailability'
import './BottomTabBar.css'
import { useEffect, useState } from 'react'
import { isChristmasCampaign } from '../../lib/campaignDates'

interface Props {
    currentPath: string
}

const tabs = [
    { path: '/home', icon: Home, label: 'Inicio' },
    ...(isRadarAvailable || isRadarDemoAvailable ? [{ path: '/radar', icon: MapPin, label: isRadarAvailable ? 'Explorar' : 'Mapa demo' }] : []),
    { path: '/modules', icon: BookOpen, label: 'Guía' },
    { path: '/matches', icon: Heart, label: 'Conexiones' },
    { path: '/profile', icon: User, label: 'Perfil' },
]

function activeSection(path: string): string {
    if (/^\/(modules|guide|book|assessment|evaluations)(\/|$)/.test(path)) return '/modules'
    if (/^\/(profile|verification|selfie-verification|crisis)(\/|$)/.test(path)) return '/profile'
    if (/^\/(home|spark|community)(\/|$)/.test(path)) return '/home'
    if (/^\/matches(\/|$)/.test(path)) return '/matches'
    return path
}

export default function BottomTabBar({ currentPath }: Props) {
    const [christmas, setChristmas] = useState(() => isChristmasCampaign())
    useEffect(() => {
        const timer = window.setInterval(() => setChristmas(isChristmasCampaign()), 60_000)
        return () => window.clearInterval(timer)
    }, [])
    const seasonalMarks = ['🎄', '❄️', '🎁', '✨', '🎄']
    return (
        <nav className={`tab-bar${christmas ? ' tab-bar--christmas' : ''}`} role="navigation" aria-label="Navegación principal">
            {tabs.map(({ path, icon: Icon, label }, index) => {
                const isActive = activeSection(currentPath) === path
                return (
                    <Link
                        key={path}
                        to={path}
                        className={`tab-bar__item ${isActive ? 'tab-bar__item--active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <span className="tab-bar__icon-wrap"><Icon className="tab-bar__icon" size={22} strokeWidth={isActive ? 2.5 : 1.8} />{christmas && <span className="tab-bar__season" aria-hidden="true">{seasonalMarks[index]}</span>}</span>
                        <span className="tab-bar__label">{label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
