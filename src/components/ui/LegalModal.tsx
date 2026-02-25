import { X, Shield, FileText, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import './LegalModal.css'

interface Props {
    onAccept: () => void
    onClose: () => void
}

export default function LegalModal({ onAccept, onClose }: Props) {
    const [scrolledPrivacy, setScrolledPrivacy] = useState(false)
    const [scrolledTerms, setScrolledTerms] = useState(false)
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')
    const [consentSensitive, setConsentSensitive] = useState(false)

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
        if (atBottom) {
            if (activeTab === 'privacy') setScrolledPrivacy(true)
            if (activeTab === 'terms') setScrolledTerms(true)
        }
    }

    const canAccept = scrolledPrivacy && scrolledTerms && consentSensitive

    return (
        <div className="legal-overlay animate-fade-in" onClick={onClose}>
            <div className="legal-modal glass-strong animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="legal-modal__header">
                    <h2>
                        <Shield size={20} color="var(--love-rose)" />
                        Aviso Legal
                    </h2>
                    <button className="legal-modal__close" onClick={onClose} aria-label="Cerrar">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="legal-modal__tabs">
                    <button
                        className={`legal-modal__tab ${activeTab === 'privacy' ? 'legal-modal__tab--active' : ''}`}
                        onClick={() => setActiveTab('privacy')}
                    >
                        <Shield size={14} />
                        Privacidad {scrolledPrivacy && '✓'}
                    </button>
                    <button
                        className={`legal-modal__tab ${activeTab === 'terms' ? 'legal-modal__tab--active' : ''}`}
                        onClick={() => setActiveTab('terms')}
                    >
                        <FileText size={14} />
                        T&C {scrolledTerms && '✓'}
                    </button>
                </div>

                {/* Content */}
                <div className="legal-modal__content" onScroll={handleScroll}>
                    {activeTab === 'privacy' ? (
                        <div className="legal-modal__text">
                            <h3>Aviso de Privacidad — LovIA!</h3>
                            <p><strong>Responsable:</strong> LovIA! Tecnología Relacional, S.A. de C.V.</p>
                            <p><strong>Fundamento legal:</strong> Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) 2025.</p>

                            <h4>1. Datos que recopilamos</h4>
                            <p>Recopilamos los siguientes datos personales:</p>
                            <ul>
                                <li><strong>Identificación:</strong> Nombre, email, fecha de nacimiento, género, orientación sexual</li>
                                <li><strong>Psicológicos (datos sensibles):</strong> Respuestas a cuestionarios de compatibilidad, evaluaciones de estado emocional, historial de frecuencia de relación</li>
                                <li><strong>Verificación:</strong> Fotografías de perfil, selfie de verificación (opcional), INE (solo para encuentros presenciales)</li>
                                <li><strong>Uso:</strong> Interacciones en la app, historial de matches, registros de videollamadas (metadatos, no contenido)</li>
                            </ul>

                            <h4>2. Finalidad del tratamiento</h4>
                            <ul>
                                <li>Crear y mantener tu perfil de usuario</li>
                                <li>Calcular tu Frecuencia de Relación y Gráfica Relacional</li>
                                <li>Generar matches basados en compatibilidad algorítmica</li>
                                <li>Proporcionar recomendaciones de autoconocimiento</li>
                                <li>Verificar tu identidad para encuentros presenciales seguros</li>
                                <li>Mejorar nuestros algoritmos de manera anónima y agregada</li>
                            </ul>

                            <h4>3. Datos sensibles (LFPDPPP Art. 3-VI)</h4>
                            <p>Ciertos datos que recopilamos se consideran <strong>datos sensibles</strong> bajo la LFPDPPP, incluyendo: orientación sexual, estado emocional, perfil psicológico, y respuestas a evaluaciones de salud mental. Para su tratamiento requerimos tu <strong>consentimiento expreso y por escrito</strong>, el cual se otorga mediante la casilla de consentimiento al final de este aviso.</p>

                            <h4>4. Derechos ARCO</h4>
                            <p>Tienes derecho a <strong>Acceder, Rectificar, Cancelar u Oponerte</strong> al tratamiento de tus datos en cualquier momento. Para ejercer tus derechos ARCO, contacta a: <strong>privacidad@lovia.app</strong></p>

                            <h4>5. Seguridad</h4>
                            <p>Implementamos cifrado TLS 1.3 en tránsito, AES-256 en reposo, Row Level Security (RLS) en base de datos, y auditorías periódicas de seguridad.</p>

                            <h4>6. Transferencias</h4>
                            <p>No compartimos tus datos personales con terceros, excepto cuando sea requerido por autoridad competente o para la prestación de servicios esenciales (Supabase como procesador de datos, bajo contrato de confidencialidad).</p>

                            <h4>7. Cambios al aviso</h4>
                            <p>Te notificaremos de cualquier cambio material a este aviso mediante la app y por email.</p>

                            <p><em>Última actualización: Febrero 2025</em></p>
                        </div>
                    ) : (
                        <div className="legal-modal__text">
                            <h3>Términos y Condiciones — LovIA!</h3>

                            <h4>1. Definición del servicio</h4>
                            <p>LovIA! es una herramienta de autoconocimiento y compatibilidad basada en investigación científica. <strong>LovIA! NO es:</strong></p>
                            <ul>
                                <li>Un servicio de seguridad personal</li>
                                <li>Un sustituto de terapia profesional</li>
                                <li>Una garantía de compatibilidad (el matching es probabilístico)</li>
                                <li>Un servicio de investigación de antecedentes penales</li>
                            </ul>

                            <h4>2. Uso responsable</h4>
                            <p>Al usar LovIA!, te comprometes a:</p>
                            <ul>
                                <li>Proporcionar información veraz en tu perfil y cuestionarios</li>
                                <li>Tratar a otros usuarios con respeto</li>
                                <li>No compartir información personal de otros usuarios fuera de la app</li>
                                <li>Reportar cualquier comportamiento inapropiado o peligroso</li>
                                <li>No usar la plataforma para actividades ilegales</li>
                            </ul>

                            <h4>3. Seguridad en encuentros</h4>
                            <p>LovIA! proporciona herramientas de seguridad (geolocalización, contactos de emergencia, verificación de identidad), pero <strong>no garantiza la seguridad física</strong> de los usuarios. Cada usuario es responsable de tomar precauciones al reunirse con otra persona.</p>

                            <h4>4. Contenido algorítmico</h4>
                            <p>Los resultados de compatibilidad, la Frecuencia de Relación y las recomendaciones son generados por algoritmos basados en investigación publicada. Son herramientas de reflexión, no diagnósticos clínicos.</p>

                            <h4>5. Suscripciones y pagos</h4>
                            <p>LovIA! ofrece un modelo freemium. Las funciones premium están sujetas a suscripción mensual. Puedes cancelar en cualquier momento desde tu perfil.</p>

                            <h4>6. Propiedad intelectual</h4>
                            <p>El contenido, algoritmos, diseño y marca de LovIA! son propiedad exclusiva de LovIA! Tecnología Relacional. Tu contenido (respuestas, fotos de perfil) te pertenece, pero nos otorgas licencia para procesarlo según este acuerdo.</p>

                            <h4>7. Jurisdicción</h4>
                            <p>Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será resuelta en los tribunales de la Ciudad de México.</p>

                            <p><em>Última actualización: Febrero 2025</em></p>
                        </div>
                    )}

                    {(!scrolledPrivacy && activeTab === 'privacy') || (!scrolledTerms && activeTab === 'terms') ? (
                        <div className="legal-modal__scroll-hint">
                            <ChevronDown size={16} />
                            Desplázate para leer todo
                        </div>
                    ) : null}
                </div>

                {/* Sensitive data consent (LFPDPPP) */}
                <div className="legal-modal__consent">
                    <label className="legal-modal__checkbox">
                        <input
                            type="checkbox"
                            checked={consentSensitive}
                            onChange={(e) => setConsentSensitive(e.target.checked)}
                        />
                        <span>
                            <strong>Consentimiento datos sensibles (LFPDPPP Art. 9):</strong> Autorizo expresamente el tratamiento de mis datos sensibles (orientación sexual, estado emocional, perfil psicológico) para las finalidades descritas en el Aviso de Privacidad.
                        </span>
                    </label>
                </div>

                <div className="legal-modal__actions">
                    <button className="legal-modal__btn legal-modal__btn--secondary" onClick={onClose}>
                        No acepto
                    </button>
                    <button
                        className="legal-modal__btn legal-modal__btn--primary"
                        onClick={onAccept}
                        disabled={!canAccept}
                    >
                        Acepto todo
                    </button>
                </div>
            </div>
        </div>
    )
}
