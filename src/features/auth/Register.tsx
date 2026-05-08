import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { signInWithGoogle, signInWithApple } from '../../lib/socialAuth'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import LegalModal from '../../components/ui/LegalModal'
import './Auth.css'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showLegal, setShowLegal] = useState(false)
    const [legalAccepted, setLegalAccepted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
    const { signUp, user, initialized } = useAuthStore()
    const navigate = useNavigate()

    // Redirigir si ya está autenticado — cubre el caso OAuth nativo.
    useEffect(() => {
        if (initialized && user) {
            navigate('/onboarding', { replace: true })
        }
    }, [user, initialized, navigate])

    const passwordChecks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        match: password === confirmPassword && confirmPassword.length > 0,
    }

    const allValid =
        Object.values(passwordChecks).every(Boolean) &&
        legalAccepted &&
        name.length >= 2

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!allValid) {
            if (!legalAccepted) setError('Debes aceptar los términos y condiciones')
            else if (name.length < 2) setError('El nombre debe tener al menos 2 caracteres')
            else if (!passwordChecks.length) setError('La contraseña debe tener al menos 8 caracteres')
            else if (!passwordChecks.upper) setError('La contraseña necesita al menos una mayúscula')
            else if (!passwordChecks.number) setError('La contraseña necesita al menos un número')
            else if (!passwordChecks.match) setError('Las contraseñas no coinciden')
            else setError('Por favor completa todos los campos correctamente')
            return
        }

        setSubmitting(true)
        try {
            const result = await signUp(email, password, name)

            if (result.error) {
                if (result.error.includes('already registered')) {
                    setError('Este email ya está registrado. ¿Quieres iniciar sesión?')
                } else if (result.error.includes('invalid')) {
                    setError('Email o contraseña no válidos. La contraseña necesita 8+ caracteres, 1 mayúscula y 1 número.')
                } else if (result.error.includes('weak')) {
                    setError('Contraseña demasiado débil. Usa 8+ caracteres con mayúscula y número.')
                } else {
                    setError(result.error)
                }
                return
            }

            setSuccess(true)
            setTimeout(() => navigate('/onboarding'), 1500)
        } finally {
            setSubmitting(false)
        }
    }

    const handleOAuthLogin = async (provider: 'google' | 'apple') => {
        setError(null)
        setOauthLoading(provider)
        try {
            if (provider === 'google') {
                await signInWithGoogle()
            } else {
                await signInWithApple()
            }
            // En nativo: appUrlOpen en main.tsx completa el flujo.
            // En web: redirige a /auth/callback?next=/onboarding.
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión.')
        } finally {
            setOauthLoading(null)
        }
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-page__glow auth-page__glow--1" />
                <div className="auth-card glass-strong animate-scale-in" style={{ textAlign: 'center' }}>
                    <div className="auth-card__success-icon animate-heartbeat">
                        <CheckCircle size={48} color="var(--success)" />
                    </div>
                    <h2>¡Cuenta creada!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)' }}>
                        ¡Bienvenido/a a LovIA! Entrando a tu cuenta...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-page__glow auth-page__glow--1" />
            <div className="auth-page__glow auth-page__glow--2" />

            <div className="auth-card glass-strong animate-scale-in">
                <div className="auth-card__header">
                    <h1>Lov<span className="text-gradient">IA!</span></h1>
                    <p>Crea tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-card__form">
                    {error && (
                        <div className="auth-card__error animate-fade-in">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="auth-card__field">
                        <label htmlFor="name">Nombre</label>
                        <div className="auth-card__input-wrap">
                            <User size={18} className="auth-card__input-icon" />
                            <input
                                id="name"
                                type="text"
                                placeholder="Tu nombre"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={2}
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    <div className="auth-card__field">
                        <label htmlFor="reg-email">Email</label>
                        <div className="auth-card__input-wrap">
                            <Mail size={18} className="auth-card__input-icon" />
                            <input
                                id="reg-email"
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
                        <label htmlFor="reg-password">Contraseña</label>
                        <div className="auth-card__input-wrap">
                            <Lock size={18} className="auth-card__input-icon" />
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mínimo 8 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="auth-card__toggle-pw"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="auth-card__pw-checks">
                            <PwCheck ok={passwordChecks.length} label="8+ caracteres" />
                            <PwCheck ok={passwordChecks.upper} label="Una mayúscula" />
                            <PwCheck ok={passwordChecks.number} label="Un número" />
                        </div>
                    </div>

                    <div className="auth-card__field">
                        <label htmlFor="confirm-password">Confirmar contraseña</label>
                        <div className="auth-card__input-wrap">
                            <Lock size={18} className="auth-card__input-icon" />
                            <input
                                id="confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Repite tu contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        {confirmPassword && (
                            <PwCheck
                                ok={passwordChecks.match}
                                label={passwordChecks.match ? 'Contraseñas coinciden' : 'No coinciden'}
                            />
                        )}
                    </div>

                    <div className="auth-card__legal">
                        <label className="auth-card__checkbox-label">
                            <input
                                type="checkbox"
                                checked={legalAccepted}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setShowLegal(true)
                                    } else {
                                        setLegalAccepted(false)
                                    }
                                }}
                            />
                            <span>
                                Acepto el{' '}
                                <button type="button" className="auth-card__link" onClick={() => setShowLegal(true)}>
                                    Aviso de Privacidad
                                </button>{' '}
                                y los{' '}
                                <button type="button" className="auth-card__link" onClick={() => setShowLegal(true)}>
                                    Términos y Condiciones
                                </button>
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-card__submit"
                        disabled={submitting || oauthLoading !== null}
                    >
                        {submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>Crear cuenta <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <div className="auth-card__divider">
                    <span>o</span>
                </div>

                <div className="auth-card__socials">
                    <button
                        type="button"
                        className="btn btn-secondary auth-card__social-btn"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={submitting || oauthLoading !== null}
                    >
                        {oauthLoading === 'google'
                            ? <Loader2 size={18} className="animate-spin" />
                            : <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" width="18" />}
                        Continuar con Google
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary auth-card__social-btn"
                        onClick={() => handleOAuthLogin('apple')}
                        disabled={submitting || oauthLoading !== null}
                    >
                        {oauthLoading === 'apple'
                            ? <Loader2 size={18} className="animate-spin" />
                            : <svg viewBox="0 0 384 512" width="16" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>}
                        Continuar con Apple
                    </button>
                </div>

                <div className="auth-card__footer">
                    <p>
                        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                    </p>
                </div>
            </div>

            {showLegal && (
                <LegalModal
                    onClose={() => setShowLegal(false)}
                    onAccept={() => {
                        setLegalAccepted(true)
                        setShowLegal(false)
                    }}
                />
            )}
        </div>
    )
}

function PwCheck({ ok, label }: { ok: boolean; label: string }) {
    return (
        <div className={`auth-card__pw-check ${ok ? 'ok' : ''}`}>
            <span className="dot" />
            <span>{label}</span>
        </div>
    )
}
