import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import './AdminLayout.css'

export default function AdminLayout() {
    // Acceso validado por AdminGuard.tsx en las rutas

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-layout__main">
                <Outlet />
            </main>
        </div>
    )
}
