import { Outlet, useLocation } from 'react-router-dom'
import BottomTabBar from './BottomTabBar'
import './UserLayout.css'

export default function UserLayout() {
    const location = useLocation()

    return (
        <div className="user-layout">
            <main className="user-layout__content">
                <Outlet />
            </main>
            <BottomTabBar currentPath={location.pathname} />
        </div>
    )
}
