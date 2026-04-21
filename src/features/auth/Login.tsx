import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import './Auth.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { signIn, loading } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const result = await signIn(email, password)

        if (result.error) {
            setError(result.error)
            return
        }

        const { data: authData } = await supabase.auth.getUser()
        const user = authData.user

        if (!user) {
            navigate('/home')
            return
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .maybeSingle()

        navigate(profile?.onboarding_completed ? '/home' : '/onboarding')
    }

    const handleOAuthLogin = async (provider: 'google' | 'apple') => {
        setError(null)

        const redirectUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? `${window.location.origin}/auth/callback`
            : 'https://www.lovia.com.mx/auth/callback'

        const result = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: redirectUrl
            }
        })

        if (result.error) {
            setError(result.error.message)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-page__glow auth-page__glow--1" />
            <div className="auth-page__glow auth-page__glow--2" />

            <div className="auth-card glass-strong animate-scale-in">
                <div className="auth-card__header">
                    <h1>Lov<span className="text-gradient">IA!</span></h1>
                    <p>Inicia sesión en tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-card__form">
                    {error && (
                        <div className="auth-card__error animate-fade-in">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="auth-card__field">
                        <label htmlFor="email">Email</label>
                        <div className="auth-card__input-wrap">
                            <Mail size={18} className="auth-card__input-icon" />
                            <input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="auth-card__field">
                        <label htmlFor="password">Contraseña</label>
                        <div className="auth-card__input-wrap">
                            <Lock size={18} className="auth-card__input-icon" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="auth-card__toggle-pw"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-card__submit" disabled={loading}>
                        {loading ? (
                            <span className="auth-card__spinner" />
                        ) : (
                            <>
                                Entrar <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>O continúa con</span>
                </div>

                <div className="auth-social">
                    <button type="button" className="btn-social google" onClick={() => handleOAuthLogin('google')}>
                        <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" width="20" />
                        Google
                    </button>
                    <button type="button" className="btn-social apple" onClick={() => handleOAuthLogin('apple')}>
                        <svg viewBox="0 0 384 512" width="18" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                        Apple
                    </button>
                </div>

                <p className="auth-card__footer">
                    ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
                </p>
            </div>
        </div>
    )
}