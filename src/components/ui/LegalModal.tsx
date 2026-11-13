import { X, Shield, FileText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LEGAL_VERSION } from '../../lib/legalConsentPolicy'
import './LegalModal.css'

interface Props {
    onAccept: (sensitiveDataAccepted: boolean) => void
    onClose: () => void
    initialSensitiveData?: boolean
}

export default function LegalModal({ onAccept, onClose, initialSensitiveData = false }: Props) {
    const dialog = useRef<HTMLDivElement>(null)
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')
    const [consentSensitive, setConsentSensitive] = useState(initialSensitiveData)
    const [ageConfirmed, setAgeConfirmed] = useState(false)

    const canAccept = termsAccepted && ageConfirmed
    useEffect(() => {
        const previous = document.activeElement
        dialog.current?.querySelector<HTMLButtonElement>('button')?.focus()
        return () => { if (previous instanceof HTMLElement) previous.focus() }
    }, [])

    return (
        <div className="legal-overlay animate-fade-in" onClick={onClose}>
            <div ref={dialog} className="legal-modal glass-strong animate-slide-up" role="dialog" aria-modal="true" aria-label="Aviso y elecciones de privacidad" onClick={(e) => e.stopPropagation()} onKeyDown={event => {
                if (event.key === 'Escape') { onClose(); return }
                if (event.key !== 'Tab') return
                const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]') ?? []).filter(element => element.offsetParent !== null)
                const first = elements[0], last = elements[elements.length - 1]
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
            }}>
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
                        Privacidad
                    </button>
                    <button
                        className={`legal-modal__tab ${activeTab === 'terms' ? 'legal-modal__tab--active' : ''}`}
                        onClick={() => setActiveTab('terms')}
                    >
                        <FileText size={14} />
                        Términos
                    </button>
                </div>

                {/* Content */}
                <div className="legal-modal__content">
                    {activeTab === 'privacy' ? (
                        <div className="legal-modal__text">
                            <h3>Aviso de Privacidad — LovIA!</h3>
                            <p><strong>Contacto de privacidad:</strong> clienteslovia@gmail.com</p>
                            <p><strong>Marco aplicable:</strong> Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente.</p>

                            <h4>1. Datos que recopilamos</h4>
                            <p>Recopilamos los siguientes datos personales:</p>
                            <ul>
                                <li><strong>Cuenta:</strong> alias, email y datos necesarios para iniciar sesión.</li>
                                <li><strong>Perfil:</strong> foto y la información que decidas completar, como ciudad, intereses o preferencias.</li>
                                <li><strong>Actividad:</strong> conexiones, mensajes, reportes y progreso en herramientas voluntarias.</li>
                                <li><strong>Datos sensibles opcionales:</strong> respuestas personales, orientación o información emocional cuando decidas proporcionarlas.</li>
                                <li><strong>Ubicación:</strong> únicamente cuando autorices el permiso correspondiente para una función que la necesite.</li>
                            </ul>

                            <h4>2. Finalidad del tratamiento</h4>
                            <ul>
                                <li>Crear y mantener tu perfil de usuario</li>
                                <li>Mostrar las herramientas y el contenido que solicites</li>
                                <li>Gestionar conexiones, conversaciones, bloqueos y reportes</li>
                                <li>Guardar tu progreso y preferencias dentro de la app</li>
                                <li>Proteger la cuenta, prevenir abuso y atender solicitudes de soporte</li>
                            </ul>

                            <h4>3. Datos sensibles (LFPDPPP Art. 3-VI)</h4>
                            <p>La orientación, las respuestas emocionales y otras reflexiones pueden revelar datos sensibles. Su tratamiento requiere consentimiento expreso. Puedes evitar las actividades opcionales y solicitar la revocación del consentimiento mediante el contacto de privacidad.</p>

                            <h4>4. Derechos ARCO</h4>
                            <p>Tienes derecho a <strong>Acceder, Rectificar, Cancelar u Oponerte</strong> al tratamiento de tus datos en cualquier momento. Para ejercer tus derechos ARCO, contacta a: <strong>clienteslovia@gmail.com</strong></p>

                            <h4>5. Seguridad</h4>
                            <p>Actualmente las fotos de perfil se almacenan mediante una URL pública. Los modos de ocultamiento aún están en preparación. El mapa de demostración usa perfiles ficticios y no solicita GPS. Una solicitud de eliminación pendiente requiere atención y no equivale a un borrado ya completado.</p>
                            <p>LovIA aplica controles técnicos y de acceso para proteger la información. Ningún sistema es infalible; reporta cualquier incidente o acceso que no reconozcas al contacto de privacidad.</p>

                            <h4>6. Transferencias</h4>
                            <p>LovIA utiliza proveedores tecnológicos para autenticación, almacenamiento, alojamiento y funcionamiento de la app. También puede comunicar información cuando exista una obligación legal. El aviso integral deberá mantener identificados los proveedores y finalidades vigentes.</p>

                            <h4>7. Cambios al aviso</h4>
                            <p>Te notificaremos de cualquier cambio material a este aviso mediante la app y por email.</p>

                            <p><em>Versión del texto mostrado: {LEGAL_VERSION}.</em></p>
                        </div>
                    ) : (
                        <div className="legal-modal__text">
                            <h3>Términos y Condiciones — LovIA!</h3>

                            <h4>1. Definición del servicio</h4>
                            <p>LovIA es una plataforma para conocer personas y usar herramientas educativas de reflexión. Sus actividades no predicen el éxito de una relación. LovIA no es:</p>
                            <ul>
                                <li>Un servicio de emergencia o seguridad personal</li>
                                <li>Un diagnóstico ni un sustituto de atención profesional</li>
                                <li>Una garantía de afinidad, identidad o conducta de otra persona</li>
                                <li>Un servicio de investigación de antecedentes</li>
                            </ul>

                            <h4>2. Uso responsable</h4>
                            <p>Al usar LovIA!, te comprometes a:</p>
                            <ul>
                                <li>Tener al menos 18 años y proporcionar información veraz</li>
                                <li>Tratar a otros usuarios con respeto</li>
                                <li>No compartir información personal de otros usuarios fuera de la app</li>
                                <li>Reportar cualquier comportamiento inapropiado o peligroso</li>
                                <li>No usar la plataforma para actividades ilegales</li>
                            </ul>

                            <h4>3. Seguridad en encuentros</h4>
                            <p>Las opciones de bloqueo, reporte o contacto de emergencia ayudan a responder ante situaciones concretas, pero no garantizan la seguridad física. Si decides reunirte con alguien, toma precauciones y utiliza servicios de emergencia locales cuando sea necesario.</p>

                            <h4>4. Contenido algorítmico</h4>
                            <p>El progreso, las Chispas y las preguntas educativas sirven para reflexionar. No son diagnósticos ni puntuaciones psicológicas validadas, y no determinan el valor de una persona o el acceso a funciones básicas.</p>

                            <h4>5. Suscripciones y pagos</h4>
                            <p>El acceso está documentado como gratuito hasta el 31 de enero de 2027 inclusive. Terminar ese periodo no inicia un cobro automático. Cualquier oferta futura deberá mostrar precio, vigencia y consentimiento antes de contratar.</p>

                            <h4>6. Propiedad intelectual</h4>
                            <p>La marca, el diseño y el contenido propio de LovIA conservan sus derechos correspondientes. Conservas los derechos sobre el contenido que aportas y autorizas su tratamiento únicamente para prestar las funciones que solicites conforme al aviso de privacidad.</p>

                            <h4>7. Jurisdicción</h4>
                            <p>Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será resuelta en los tribunales de la Ciudad de México.</p>

                            <p><em>Última actualización del texto mostrado: 20 de octubre de 2026.</em></p>
                        </div>
                    )}

                </div>

                {/* Sensitive data consent (LFPDPPP) */}
                <div className="legal-modal__consent">
                    <label className="legal-modal__checkbox"><input type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} /><span>He leído y acepto el aviso de privacidad y los términos mostrados, versión {LEGAL_VERSION}.</span></label>
                    <label className="legal-modal__checkbox">
                        <input
                            type="checkbox"
                            checked={ageConfirmed}
                            onChange={(e) => setAgeConfirmed(e.target.checked)}
                        />
                        <span><strong>Mayoría de edad:</strong> Confirmo que tengo al menos 18 años.</span>
                    </label>
                    <label className="legal-modal__checkbox">
                        <input
                            type="checkbox"
                            checked={consentSensitive}
                            onChange={(e) => setConsentSensitive(e.target.checked)}
                        />
                        <span>
                            <strong>Consentimiento opcional para datos sensibles:</strong> Autorizo expresamente el tratamiento de los datos sensibles que decida proporcionar para las finalidades descritas. Si no marco esta casilla, podré crear mi cuenta y evitar esas actividades.
                        </span>
                    </label>
                </div>

                <div className="legal-modal__actions">
                    <button className="legal-modal__btn legal-modal__btn--secondary" onClick={onClose}>
                        No acepto
                    </button>
                    <button
                        className="legal-modal__btn legal-modal__btn--primary"
                        onClick={() => onAccept(consentSensitive)}
                        disabled={!canAccept}
                    >
                        Aceptar y continuar
                    </button>
                </div>
            </div>
        </div>
    )
}
