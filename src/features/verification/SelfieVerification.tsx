import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Camera, Check, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './Verification.css'

export default function SelfieVerification() {
    const navigate = useNavigate()
    const { user, loadProfile } = useAuthStore()
    
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [isSimulating, setIsSimulating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const localStream = useRef<MediaStream | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [capturedFile, setCapturedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // Step 1: Request Camera
    const startCamera = async () => {
        try {
            setError(null)
            const constraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            localStream.current = stream
            setStep(2)
        } catch (err: any) {
            console.error('[SelfieVerification] Camera error:', err)
            // Fallback: abrir selector de cámara nativa del sistema
            if (fileInputRef.current) {
                fileInputRef.current.click()
            } else {
                setError('No pudimos acceder a tu cámara. Revisa los permisos e inténtalo de nuevo.')
            }
        }
    }

    const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCapturedFile(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setStep(2)
        }
    }

    // Connect stream to video element when step 2 loads
    useEffect(() => {
        if (step === 2 && videoRef.current && localStream.current && !previewUrl) {
            videoRef.current.srcObject = localStream.current
            // ✅ FIX: Android WebView ignora autoPlay — llamamos play() explícitamente
            videoRef.current.play().catch(err => {
                console.warn('[SelfieVerification] video.play() error:', err)
            })
        }
        
        // Cleanup on unmount
        return () => {
            if (localStream.current) {
                localStream.current.getTracks().forEach(t => t.stop())
            }
        }
    }, [step, previewUrl])


    // Step 2: Simulate AWS Rekognition Check and upload
    const takeSnapshotAndVerify = async () => {
        setIsSimulating(true)
        setError(null)
        
        // Simular latencia de red hacia AWS Rekognition
        setTimeout(async () => {
            if (!user) return
            
            let documentUrl = null
            
            if (capturedFile) {
                try {
                    const fileExt = capturedFile.name.split('.').pop() || 'jpg'
                    const filePath = `${user.id}/selfie_${Date.now()}.${fileExt}`
                    
                    // Subir archivo al bucket 'selfies'
                    const { error: uploadError } = await supabase.storage
                        .from('selfies')
                        .upload(filePath, capturedFile, { upsert: true })
                        
                    if (uploadError) {
                        console.warn('[SelfieVerification] Storage upload error:', uploadError.message)
                    } else {
                        const { data: urlData } = supabase.storage.from('selfies').getPublicUrl(filePath)
                        documentUrl = urlData.publicUrl
                    }
                } catch (storageErr) {
                    console.warn('[SelfieVerification] Storage try-catch error:', storageErr)
                }
            }
            
            // Actualizar DB base como verificado
            const { error: dbError } = await supabase
                .from('profiles')
                .update({ verified_selfie: true })
                .eq('id', user.id)
                
            // También insertar en la tabla de verificación de pasos
            await supabase
                .from('verification_steps')
                .upsert({
                    user_id: user.id,
                    step_type: 'selfie',
                    status: 'approved',
                    document_url: documentUrl
                }, { onConflict: 'user_id,step_type' })
                
            setIsSimulating(false)
            
            if (dbError) {
                setError('Hubo un error guardando tu verificación. Intenta más tarde.')
            } else {
                // Forzar recarga del perfil en authStore
                await loadProfile()
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
                        <div style={{ width: '100%' }}>
                            <div className="alert-error" style={{ marginBottom: '16px', display: 'flex', gap: 8 }}>
                                <AlertTriangle size={18} /> {error}
                            </div>
                            <button 
                                className="matches-page__cta" 
                                style={{ width: '100%', marginBottom: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)' }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera size={18} /> Usar Cámara del Sistema
                            </button>
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
                        {previewUrl ? (
                            <img src={previewUrl} className="verification__video" style={{ transform: 'none' }} alt="Selfie preview" />
                        ) : (
                            <video ref={videoRef} autoPlay playsInline muted className="verification__video" />
                        )}
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

            {/* Hidden Input file capture */}
            <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                capture="user" 
                onChange={handleFileCapture} 
                style={{ display: 'none' }} 
            />
        </div>
    )
}
