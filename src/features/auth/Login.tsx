import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { signInWithGoogle, signInWithApple } from '../../lib/socialAuth'
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import SocialSignInButton from './SocialSignInButton'
import { isIOS } from '../../lib/platform'
import './Auth.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
    const { signIn, user, initialized } = useAuthStore()
    const navigate = useNavigate()
    // Un solo destino para contraseña y OAuth. La sesión actualizada por Supabase
    // decide la navegación también cuando iOS regresa desde el navegador nativo.
    useEffect(() => {
        if (!initialized || !user) return
        let active = true
        void supabase.from('profiles').select('onboarding_completed').eq('id', user.id).maybeSingle()
            .then(({ data, error }) => {
                if (!active) return
                if (error) {
                    setError('No pudimos cargar tu perfil. Inténtalo de nuevo.')
                    setSubmitting(false)
                    return
                }
                navigate(data?.onboarding_completed ? '/home' : '/onboarding', { replace: true })
            })
        return () => { active = false }
    }, [user, initialized, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            const result = await signIn(email, password)

            if (result.error) {
                setError(result.error)
                setSubmitting(false)
                return
            }
        } catch {
            console.error('[LovIA] Error inesperado en inicio de sesión.')
            setError('Error al iniciar sesión. Por favor intenta de nuevo.')
            setSubmitting(false)
        }
    }

    const handleOAuthLogin = async (provider: 'google' | 'apple') => {
        setError(null)
        setOauthLoading(provider)
        try {
            console.log('[LovIA] OAuth login iniciado con:', provider)
            if (provider === 'google') {
                await signInWithGoogle()
            } else {
                await signInWithApple()
            }
            // En nativo: el flujo continúa vía appUrlOpen en main.tsx.
            // En web: la página redirige a /auth/callback automáticamente.
        } catch {
            console.error('[LovIA] Error de OAuth:', provider)
            setError('Error al iniciar sesión. Verifica tu conexión e intenta de nuevo.')
        } finally {
            setOauthLoading(null)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-page__glow auth-page__glow--1" />
            <div className="auth-page__glow auth-page__glow--2" />

            <div className="auth-card glass-strong animate-scale-in">
                <div className="auth-card__header">
                    {isIOS() && <img className="auth-card__brand-mark" src="/icons/icon-1024.png" alt="" aria-hidden="true" />}
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

                    <button type="submit" className="auth-card__submit" disabled={submitting || oauthLoading !== null}>
                        {submitting ? (
                            <span className="auth-card__spinner" />
                        ) : (
                            <>
                                Entrar <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                    <p className="auth-card__footer"><Link to="/recover">¿Olvidaste tu contraseña?</Link></p>
                </form>

                <div className="auth-divider">
                    <span>O continúa con</span>
                </div>

                <div className="auth-social">
                    <SocialSignInButton
                        provider="google"
                        onClick={() => handleOAuthLogin('google')}
                        loading={oauthLoading === 'google'}
                        disabled={submitting || oauthLoading !== null}
                    />
                    <SocialSignInButton
                        provider="apple"
                        onClick={() => handleOAuthLogin('apple')}
                        loading={oauthLoading === 'apple'}
                        disabled={submitting || oauthLoading !== null}
                    />
                </div>

                <p className="auth-card__footer">
                    ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
                </p>
            </div>
        </div>
    )
}
