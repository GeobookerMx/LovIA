import { useEffect } from 'react'
import './PrivacyPolicyPage.css'

const CONTACT = 'clienteslovia@gmail.com'

export default function PrivacyPolicyPage() {
    useEffect(() => {
        document.title = 'Política de Privacidad — LovIA!'
        const meta = document.querySelector('meta[name="description"]')
        meta?.setAttribute('content', 'Política de privacidad de LovIA: datos utilizados, finalidades, proveedores y derechos de las personas usuarias.')
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="pp-page">
            <header className="pp-header">
                <div className="pp-header__brand">Lov<span>IA!</span></div>
                <a href="https://www.lovia.com.mx" className="pp-header__home-link">← Volver a LovIA</a>
            </header>

            <main className="pp-main">
                <div className="pp-container">
                    <h1 className="pp-title">Política de Privacidad</h1>
                    <div className="pp-meta">
                        <p><strong>Servicio:</strong> LovIA</p>
                        <p><strong>Responsable:</strong> Juan Pablo Peña García</p>
                        <p><strong>Contacto:</strong> <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
                        <p><strong>Última actualización:</strong> 20 de octubre de 2026</p>
                        <p><strong>Versión:</strong> 2026-10-20</p>
                    </div>

                    <section className="pp-section">
                        <h2>1. Alcance</h2>
                        <p>Este aviso explica qué información utiliza LovIA, para qué se usa y cómo solicitar acceso, corrección, cancelación u oposición. LovIA está dirigida únicamente a personas de 18 años o más.</p>
                    </section>

                    <section className="pp-section">
                        <h2>2. Datos que puede utilizar LovIA</h2>
                        <ul>
                            <li><strong>Cuenta:</strong> alias, correo electrónico y datos necesarios para iniciar sesión.</li>
                            <li><strong>Perfil:</strong> foto y la información que decidas completar, como ciudad, intereses o preferencias.</li>
                            <li><strong>Actividad:</strong> conexiones, mensajes, reportes y progreso en herramientas voluntarias.</li>
                            <li><strong>Datos sensibles opcionales:</strong> orientación, respuestas emocionales y otras reflexiones que decidas proporcionar.</li>
                            <li><strong>Ubicación:</strong> cuando autorices el permiso para una función concreta.</li>
                            <li><strong>Datos técnicos:</strong> información de sesión, dispositivo y registros necesarios para seguridad y diagnóstico de fallos.</li>
                        </ul>
                    </section>

                    <section className="pp-section">
                        <h2>3. Finalidades</h2>
                        <ul>
                            <li>Crear y mantener tu cuenta y perfil.</li>
                            <li>Mostrar las herramientas y el contenido que solicites.</li>
                            <li>Gestionar conexiones, conversaciones, bloqueos y reportes.</li>
                            <li>Guardar tu progreso y preferencias dentro de la app.</li>
                            <li>Proteger la cuenta, prevenir abuso y atender solicitudes de soporte.</li>
                        </ul>
                        <p>Las actividades educativas sirven para reflexionar. No producen un diagnóstico ni garantizan compatibilidad o el éxito de una relación.</p>
                    </section>

                    <section className="pp-section">
                        <h2>4. Consentimiento y datos sensibles</h2>
                        <p>LovIA solicita consentimiento expreso antes de tratar los datos sensibles que decidas proporcionar. Puedes evitar las actividades opcionales y solicitar la revocación de tu consentimiento escribiendo al contacto de privacidad. Revocar el consentimiento no tiene efectos retroactivos.</p>
                    </section>

                    <section className="pp-section">
                        <h2>5. Proveedores</h2>
                        <p>LovIA utiliza servicios de Supabase para autenticación y datos, Netlify para alojar la web, y Google o Apple cuando eliges iniciar sesión con esos proveedores. Cada proveedor trata la información necesaria para prestar su servicio conforme a sus condiciones aplicables.</p>
                        <p>El acceso está documentado como gratuito hasta el 31 de enero de 2027 inclusive. Terminar ese periodo no inicia cobros automáticos. Si se habilitan pagos o publicidad con nuevos proveedores, este aviso deberá actualizarse antes de solicitar datos.</p>
                    </section>

                    <section className="pp-section">
                        <h2>6. Seguridad y conservación</h2>
                        <p>LovIA aplica sesiones autenticadas, conexiones HTTPS y permisos de acceso para proteger la información. Ningún sistema es infalible; reporta accesos que no reconozcas. Los datos se conservan mientras la cuenta esté activa o durante el plazo necesario para atender obligaciones y solicitudes aplicables.</p>
                    </section>

                    <section className="pp-section">
                        <h2>7. Tus derechos</h2>
                        <p>Puedes solicitar acceso, rectificación, cancelación u oposición, así como revocar el consentimiento cuando corresponda. Escribe a <a href={`mailto:${CONTACT}`}>{CONTACT}</a> con la cuenta relacionada y una descripción clara de tu solicitud. Podremos pedir información razonable para verificar que eres la persona titular. Para eliminar tu cuenta y datos, consulta también <a href="/delete-account">las instrucciones públicas de LovIA</a>.</p>
                    </section>

                    <section className="pp-section">
                        <h2>8. Menores de edad</h2>
                        <p>LovIA no permite cuentas de menores de 18 años. Si crees que una persona menor creó una cuenta, informa a <a href={`mailto:${CONTACT}`}>{CONTACT}</a> para revisar el caso.</p>
                    </section>

                    <section className="pp-section">
                        <h2>9. Cambios al aviso</h2>
                        <p>Los cambios materiales se comunicarán en la aplicación y se publicarán en esta página con una nueva fecha y versión.</p>
                    </section>

                    <section className="pp-section pp-section--contact">
                        <h2>10. Contacto</h2>
                        <div className="pp-contact-card">
                            <p><strong>LovIA — Juan Pablo Peña García</strong></p>
                            <p>📧 <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
                            <p>🌐 <a href="https://www.lovia.com.mx">www.lovia.com.mx</a></p>
                            <p>📍 Estado de México, México</p>
                        </div>
                    </section>

                    <footer className="pp-footer">
                        <p>© 2026 LovIA · <a href="https://www.lovia.com.mx/privacy">Política de Privacidad</a></p>
                    </footer>
                </div>
            </main>
        </div>
    )
}
