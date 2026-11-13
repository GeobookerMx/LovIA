import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Shield, Mail } from 'lucide-react'
import './ProfilePages.css'

export default function LegalPage() {
    const navigate = useNavigate()

    return (
        <div className="profile-content-page">
            <header className="profile-content__header">
                <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="Volver">
                    <ArrowLeft size={20} />
                </button>
                <h2>Privacidad y ayuda</h2>
            </header>

            <div className="profile-content__body animate-fade-in-up stagger-children">
                <section className="legal__section glass-strong card-body mb-4">
                    <FileText size={24} color="var(--love-rose)" style={{ marginBottom: 12 }} aria-hidden="true" />
                    <h3 style={{ marginBottom: 8 }}>Tus datos</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        LovIA usa los datos que compartes para ofrecer tu perfil y las actividades de la app.
                        Consulta qué se recopila, cómo se usa y cómo solicitar su eliminación en el aviso de privacidad.
                    </p>
                    <p><Link to="/privacy">Leer el aviso de privacidad</Link></p>
                </section>

                <section className="legal__section glass-strong card-body mb-4">
                    <Shield size={24} color="var(--success)" style={{ marginBottom: 12 }} aria-hidden="true" />
                    <h3 style={{ marginBottom: 8 }}>Seguridad y reportes</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Puedes reportar o bloquear a otra persona desde las funciones disponibles en LovIA.
                        Si necesitas asistencia adicional, escríbenos para explicar lo ocurrido.
                    </p>
                </section>

                <section className="legal__section glass-strong card-body mb-4">
                    <Mail size={24} color="var(--love-rose)" style={{ marginBottom: 12 }} aria-hidden="true" />
                    <h3 style={{ marginBottom: 8 }}>Ayuda con tu cuenta</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Para pedir ayuda, consultar tus datos o solicitar la eliminación de tu cuenta, escríbenos a{' '}
                        <a href="mailto:clienteslovia@gmail.com">clienteslovia@gmail.com</a>.
                    </p>
                    <p><a href="https://lovia.com.mx/delete-account" target="_blank" rel="noopener noreferrer">Cómo solicitar la eliminación</a></p>
                </section>
            </div>
        </div>
    )
}
