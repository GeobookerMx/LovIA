import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import './Verification.css'

/**
 * La verificación requiere un bucket privado y un revisor autorizado.
 * Nunca se concede una insignia ni se solicita una selfie desde el cliente.
 */
export default function SelfieVerification() {
    const navigate = useNavigate()

    return (
        <div className="verification-hub">
            <header className="verification__header">
                <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Volver">
                    <ArrowLeft size={20} />
                </button>
                <h2>Verificación de identidad</h2>
            </header>
            <div className="verification__step animate-fade-in-up">
                <div className="verification__icon-wrapper"><ShieldAlert size={48} /></div>
                <h3>Verificación temporalmente no disponible</h3>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Estamos preparando una revisión segura de identidad. Por ahora no pedimos selfies ni concedemos insignias de verificación. Puedes seguir usando las funciones básicas de LovIA.
                </p>
                <button className="matches-page__cta" onClick={() => navigate('/profile')}>
                    Volver a mi perfil
                </button>
            </div>
        </div>
    )
}
