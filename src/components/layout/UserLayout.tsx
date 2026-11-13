import { useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BottomTabBar from './BottomTabBar'
import Footer from './Footer'
import './UserLayout.css'

export default function UserLayout() {
    const location = useLocation()
    const contentRef = useRef<HTMLElement>(null)

    useLayoutEffect(() => {
        window.scrollTo(0, 0)
        contentRef.current?.scrollTo(0, 0)
    }, [location.pathname])

    return (
        <div className="user-layout">
            <main ref={contentRef} className="user-layout__content" id="main-content">
                <Outlet />
                <Footer />
            </main>
            <BottomTabBar currentPath={location.pathname} />
        </div>
    )
}
