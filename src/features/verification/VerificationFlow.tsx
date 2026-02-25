import { useState } from 'react'
import { Mail, Camera, CreditCard, Video, Check, ArrowRight, Shield } from 'lucide-react'
import './Verification.css'

interface VerificationStep {
    id: string
    label: string
    desc: string
    icon: React.ReactNode
    when: string
    cost: string
    completed: boolean
}

export default function VerificationFlow() {
    const [steps, setSteps] = useState<VerificationStep[]>([
        { id: 'email', label: 'Email', desc: 'Código de 6 dígitos', icon: <Mail size={20} />, when: 'Registro', cost: 'Gratis', completed: true },
        { id: 'selfie', label: 'Selfie', desc: 'IA compara con foto de perfil', icon: <Camera size={20} />, when: 'Al activar matching', cost: 'Gratis (badge ✓)', completed: false },
        { id: 'ine', label: 'INE', desc: 'Foto → IA extrae datos + compara rostro', icon: <CreditCard size={20} />, when: 'Antes de encuentro', cost: 'Tier 3+ / Compra única', completed: false },
        { id: 'video', label: 'Video-verificación', desc: 'Gesto aleatorio en llamada 30s', icon: <Video size={20} />, when: 'Badge Diamante', cost: 'Tier 4', completed: false },
    ])

    const completedCount = steps.filter((s) => s.completed).length
    const trustScore = completedCount * 25  // Simplified: 25 pts per step
    const trustLevel =
        trustScore >= 81 ? 'diamond' :
            trustScore >= 56 ? 'gold' :
                trustScore >= 31 ? 'silver' : 'bronze'

    const trustColors: Record<string, string> = {
        bronze: 'var(--trust-bronze)',
        silver: 'var(--trust-silver)',
        gold: 'var(--trust-gold)',
        diamond: 'var(--trust-diamond)',
    }

    const handleVerify = (stepId: string) => {
        // Simulate verification
        setSteps((prev) =>
            prev.map((s) => (s.id === stepId ? { ...s, completed: true } : s))
        )
    }

    return (
        <div className="verification">
            <div className="verification__header animate-fade-in-up">
                <h2>Verificación Progresiva</h2>
                <p>Cada paso aumenta tu Score de Confianza y visibilidad en matches.</p>
            </div>

            {/* Trust Score */}
            <div className="verification__trust glass-strong animate-fade-in-up">
                <div className="verification__trust-badge" style={{ borderColor: trustColors[trustLevel] }}>
                    <Shield size={28} style={{ color: trustColors[trustLevel] }} />
                    <span className="verification__trust-score" style={{ color: trustColors[trustLevel] }}>
                        {trustScore}
                    </span>
                </div>
                <div className="verification__trust-info">
                    <strong style={{ color: trustColors[trustLevel], textTransform: 'capitalize' }}>
                        {trustLevel === 'diamond' ? '💎 Diamante' :
                            trustLevel === 'gold' ? '🥇 Gold' :
                                trustLevel === 'silver' ? '🥈 Silver' : '🥉 Bronze'}
                    </strong>
                    <p>{completedCount}/4 verificaciones completadas</p>
                    <div className="verification__trust-bar">
                        <div
                            className="verification__trust-fill"
                            style={{ width: `${trustScore}%`, background: trustColors[trustLevel] }}
                        />
                    </div>
                </div>
            </div>

            {/* Steps */}
            <div className="verification__steps">
                {steps.map((step, i) => (
                    <div
                        key={step.id}
                        className={`verification__step glass animate-fade-in-up ${step.completed ? 'verification__step--done' : ''
                            }`}
                        style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                    >
                        <div className={`verification__step-icon ${step.completed ? 'verification__step-icon--done' : ''}`}>
                            {step.completed ? <Check size={18} /> : step.icon}
                        </div>

                        <div className="verification__step-info">
                            <strong>{step.label}</strong>
                            <p>{step.desc}</p>
                            <div className="verification__step-meta">
                                <span>📅 {step.when}</span>
                                <span>💰 {step.cost}</span>
                            </div>
                        </div>

                        {!step.completed && (
                            <button
                                className="verification__step-btn"
                                onClick={() => handleVerify(step.id)}
                            >
                                Verificar <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
