import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Shield, Cookie, Mail } from 'lucide-react'
import './ProfilePages.css'

export default function LegalPage() {
    const navigate = useNavigate()

    return (
        <div className="profile-content-page">
            <header className="profile-content__header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Legal y Privacidad</h2>
            </header>

            <div className="profile-content__body animate-fade-in-up stagger-children">
                
                <section className="legal__section glass-strong card-body mb-4">
                    <Shield size={24} color="var(--success)" style={{ marginBottom: '12px' }} />
                    <h3 style={{ marginBottom: '8px' }}>1. Aviso de Privacidad Estricto</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        LovIA recopila datos sensibles de tu personalidad, miedos, y tendencias de apego. 
                        Garantizamos que el 100% de esta información está encriptada bajo <strong>Row Level Security (RLS)</strong> 
                        en servidores aislados. Nadie, ni siquiera los administradores, tiene acceso crudo a tu información psicológica personal, a menos que 
                        sea cruzada algorítmicamente para darte un Match seguro. NUNCA venderemos tus datos de perfilamiento a anunciantes.
                    </p>
                </section>

                <section className="legal__section glass-strong card-body mb-4">
                    <FileText size={24} color="var(--text-primary)" style={{ marginBottom: '12px' }} />
                    <h3 style={{ marginBottom: '8px' }}>2. Términos y Condiciones</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Al usar LovIA, te comprometes a seguir nuestro Pacto de Integridad Comercial y Emocional. 
                        El acoso, el uso de fotos falsas, el catfishing y el lenguaje hostil dentro del Chat Interno llevarán a una 
                        <strong> Suspensión Inmediata </strong> (Ban) sin derecho a réplica. La plataforma usa moderación inteligente y 
                        un sistema de botones de pánico (SOS) que actúan en la vida real.
                    </p>
                </section>

                <section className="legal__section glass-strong card-body mb-4">
                    <Cookie size={24} color="var(--warning)" style={{ marginBottom: '12px' }} />
                    <h3 style={{ marginBottom: '8px' }}>3. Política de Cookies</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Solo utilizamos tokens criptográficos esenciales de sesión (JWT) para mantener tu inicio de sesión activo y seguro. 
                        No usamos cookies de rastreo transversal ("cross-site tracking") ni píxeles invasivos de Facebook o TikTok.
                    </p>
                </section>

                <section className="legal__section glass-strong card-body mb-4">
                    <Mail size={24} color="var(--love-rose)" style={{ marginBottom: '12px' }} />
                    <h3 style={{ marginBottom: '8px' }}>4. Derechos ARCO y Contacto</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Para cualquier duda sobre tus datos, ejercer tus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), 
                        o reportar algún error crítico dentro de la plataforma, puedes contactarnos en todo momento al equipo legal en: 
                        <a href="mailto:clienteslovia@gmail.com" style={{ color: 'var(--love-rose)', marginLeft: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                            clienteslovia@gmail.com
                        </a>.
                    </p>
                </section>

            </div>
        </div>
    )
}
