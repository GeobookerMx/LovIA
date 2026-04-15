import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
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
    const { signUp, loading } = useAuthStore()
    const navigate = useNavigate()

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
    }

    const handleOAuthLogin = async (provider: 'google' | 'apple') => {
        setError(null)

        const result = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`
            }
        })

        if (result.error) {
            setError(result.error.message)
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
                        disabled={loading}
                    >
                        {loading ? 'Creando...' : 'Crear cuenta'}
                        {!loading && <ArrowRight size={18} />}
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
                    >
                        Continuar con Google
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary auth-card__social-btn"
                        onClick={() => handleOAuthLogin('apple')}
                    >
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