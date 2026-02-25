import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute() {
    const { user, loading, initialized } = useAuthStore()

    if (!initialized || loading) {
        return (
            <div className="auth-loading">
                <Loader2 className="animate-spin" size={32} color="var(--love-rose)" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
