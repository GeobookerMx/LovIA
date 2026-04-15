import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminGuard() {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        setAllowed(false)
        setLoading(false)
        return
      }

      const isJWTAdmin = user.app_metadata?.role === 'admin'
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)

      if (error) console.error("AdminGuard DB Error:", error)

      const hasAdminRow = data && data.some(r => r.role === 'admin')
      
      if (isJWTAdmin || hasAdminRow) {
          setAllowed(true)
      } else {
          setAllowed(false)
      }
      
      setLoading(false)
    }

    check()
  }, [])

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  )
  
  if (!allowed) return <Navigate to="/" replace />

  return <Outlet />
}
