import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Camera, Check, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './Verification.css'

export default function SelfieVerification() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [isSimulating, setIsSimulating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const localStream = useRef<MediaStream | null>(null)

    // Step 1: Request Camera
    const startCamera = async () => {
        try {
            setError(null)
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            localStream.current = stream
            setStep(2)
        } catch (err) {
            setError('No pudimos acceder a tu cámara. Revisa los permisos e inténtalo de nuevo.')
        }
    }

    // Connect stream to video element when step 2 loads
    useEffect(() => {
        if (step === 2 && videoRef.current && localStream.current) {
            videoRef.current.srcObject = localStream.current
        }
        
        // Cleanup on unmount
        return () => {
            if (localStream.current) {
                localStream.current.getTracks().forEach(t => t.stop())
            }
        }
    }, [step])

    // Step 2: Simulate AWS Rekognition Check
    const takeSnapshotAndVerify = async () => {
        setIsSimulating(true)
        
        // Simular latencia de red hacia AWS Rekognition
        setTimeout(async () => {
            if (!user) return
            
            // Aquí iría la llamada real a la Edge Function de AWS
            // await supabase.functions.invoke('verify-selfie', { body: { imageBase64 } })
            
            // Actualizar DB base como verificado
            const { error: dbError } = await supabase
                .from('private_profiles')
                .update({ verified_selfie: true })
                .eq('id', user.id)
                
            setIsSimulating(false)
            
            if (dbError) {
                setError('Hubo un error guardando tu verificación. Intenta más tarde.')
            } else {
                setStep(3)
                // Detener cámara
                if (localStream.current) {
                    localStream.current.getTracks().forEach(t => t.stop())
                }
            }
        }, 3000)
    }

    return (
        <div className="verification-hub">
            <header className="verification__header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Verificación de Identidad</h2>
            </header>

            {step === 1 && (
                <div className="verification__step animate-fade-in-up">
                    <div className="verification__icon-wrapper">
                        <Shield size={48} color="var(--success)" />
                    </div>
                    <h3>Anti-Catfishing</h3>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
                        LovIA utiliza verificación biométrica para asegurar que todas las personas en la plataforma son reales y se ven como en sus fotos. Ninguna selfie es guardada ni compartida.
                    </p>
                    
                    {error && (
                        <div className="alert-error" style={{ marginBottom: '16px', display: 'flex', gap: 8 }}>
                            <AlertTriangle size={18} /> {error}
                        </div>
                    )}
                    
                    <button className="matches-page__cta" onClick={startCamera}>
                        <Camera size={18} /> Iniciar Escaneo Biométrico
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="verification__step animate-fade-in-up">
                    <h3 style={{ marginBottom: '8px' }}>Posiciona tu rostro</h3>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>Asegúrate de tener buena iluminación</p>
                    
                    <div className="verification__camera-container">
                        <div className="verification__camera-overlay">
                            <div className="verification__face-guide"></div>
                        </div>
                        <video ref={videoRef} autoPlay playsInline muted className="verification__video" />
                    </div>
                    
                    <button 
                        className="matches-page__cta" 
                        onClick={takeSnapshotAndVerify}
                        disabled={isSimulating}
                        style={{ marginTop: 'var(--space-5)', width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                        {isSimulating ? (
                            <><Loader2 size={18} className="animate-spin" /> Analizando encriptadamente (AWS)...</>
                        ) : (
                            <><Camera size={18} /> Tomar Selfie & Verificar</>
                        )}
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="verification__step animate-fade-in-up">
                    <div className="verification__icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                        <Check size={48} color="var(--success)" />
                    </div>
                    <h3 style={{ color: 'var(--success)' }}>¡Identidad Confirmada!</h3>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                        Tu rostro coincide. Ahora tienes la insignia dorada de verificación, lo que aumentará inmensamente la confianza de tus matches.
                    </p>
                    
                    <button className="matches-page__cta" onClick={() => navigate('/profile')}>
                        Volver a Mi Perfil
                    </button>
                </div>
            )}
        </div>
    )
}
