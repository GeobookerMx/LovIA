import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const finish = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        navigate('/login', { replace: true })
        return
      }

      const next = searchParams.get('next')

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .maybeSingle()

      if (next === '/onboarding') {
        navigate('/onboarding', { replace: true })
        return
      }

      if (profile?.onboarding_completed) {
        navigate('/home', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    }

    finish()
  }, [navigate, searchParams])

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-lg font-medium text-zinc-300">Iniciando sesión segura...</p>
      </div>
    </div>
  )
}