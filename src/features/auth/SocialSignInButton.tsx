import { Loader2 } from 'lucide-react'

type Provider = 'google' | 'apple'

interface SocialSignInButtonProps {
    provider: Provider
    loading: boolean
    disabled: boolean
    onClick: () => void
}

export default function SocialSignInButton({ provider, loading, disabled, onClick }: SocialSignInButtonProps) {
    const label = provider === 'google' ? 'Continuar con Google' : 'Continuar con Apple'

    return (
        <button
            type="button"
            className={`social-sign-in social-sign-in--${provider}`}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-busy={loading}
        >
            {loading ? (
                <span className="social-sign-in__loading">
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    Conectando con {provider === 'google' ? 'Google' : 'Apple'}…
                </span>
            ) : provider === 'google' ? (
                <>
                    <img className="social-sign-in__google-logo" src="/brand/google-g.svg" alt="" width="20" height="20" />
                    <span>{label}</span>
                </>
            ) : (
                <img className="social-sign-in__apple-art" src="/brand/apple-continue-es.png" alt="" width="280" height="44" />
            )}
        </button>
    )
}
