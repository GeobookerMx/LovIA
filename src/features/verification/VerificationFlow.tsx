import { Camera, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './Verification.css'

export default function VerificationFlow() {
    const navigate = useNavigate()
    return <div className="verification">
        <div className="verification__header animate-fade-in-up">
            <h2>Verificación de identidad</h2>
            <p>La revisión de identidad está en preparación. Ninguna insignia se concede automáticamente.</p>
        </div>
        <div className="verification__step glass" role="status">
            <ShieldAlert size={28} />
            <div className="verification__step-info">
                <strong>Sin revisión activa</strong>
                <p>Correo, selfie y documentos requieren procedimientos separados y comprobados. No se usan como barrera para explorar LovIA.</p>
            </div>
        </div>
        <button type="button" className="verification__step-btn" onClick={() => navigate('/selfie-verification')}>
            <Camera size={16} /> Estado de selfie
        </button>
    </div>
}
