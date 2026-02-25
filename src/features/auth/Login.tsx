import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
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
        } else {
            navigate('/home')
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

                <p className="auth-card__footer">
                    ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
                </p>
            </div>
        </div>
    )
}
