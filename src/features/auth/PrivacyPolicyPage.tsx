/**
 * PrivacyPolicyPage — Página pública de Política de Privacidad
 *
 * URL: /privacy  y  /privacy-policy (ambas apuntan aquí)
 *
 * REQUISITOS CUMPLIDOS:
 * ✅ Accesible sin login (ruta pública en App.tsx)
 * ✅ Título explícito "Privacy Policy / Política de Privacidad"
 * ✅ Menciona LovIA y datos del responsable
 * ✅ Cubre: recolección, uso, compartición, retención, eliminación y contacto
 * ✅ URL directa y estable (no PDF, no editable, sin redirecciones)
 * ✅ Meta tags para Google Play y App Store
 */

import { useEffect } from 'react'
import './PrivacyPolicyPage.css'

export default function PrivacyPolicyPage() {
    useEffect(() => {
        // Actualiza el title para que Google Play vea "Privacy Policy" al rastrear
        document.title = 'Privacy Policy — LovIA!'
        const meta = document.querySelector('meta[name="description"]')
        if (meta) {
            meta.setAttribute(
                'content',
                'LovIA! Privacy Policy — How we collect, use, and protect your personal data.'
            )
        }
        // Scroll al inicio
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="pp-page">
            {/* Header mínimo sin login */}
            <header className="pp-header">
                <div className="pp-header__brand">
                    <span className="pp-header__logo">Lov<span>IA!</span></span>
                </div>
                <a href="https://www.lovia.com.mx" className="pp-header__home-link">
                    ← Volver a LovIA
                </a>
            </header>

            <main className="pp-main">
                <div className="pp-container">

                    {/* ── Título principal (H1) ── */}
                    <h1 className="pp-title">
                        Privacy Policy<br />
                        <span className="pp-title__sub">Política de Privacidad</span>
                    </h1>

                    <div className="pp-meta">
                        <p>
                            <strong>App:</strong> LovIA! — Compatibilidad Relacional con IA
                        </p>
                        <p>
                            <strong>Desarrollador / Responsable:</strong> LovIA! Tecnología Relacional
                        </p>
                        <p>
                            <strong>Contacto:</strong>{' '}
                            <a href="mailto:clienteslovia@gmail.com">clienteslovia@gmail.com</a>
                        </p>
                        <p>
                            <strong>Última actualización:</strong> Junio 2026
                        </p>
                        <p>
                            <strong>Versión efectiva:</strong> 1.0
                        </p>
                    </div>

                    <hr className="pp-divider" />

                    {/* ── Sección 1: Introducción ── */}
                    <section className="pp-section">
                        <h2>1. Introduction / Introducción</h2>
                        <p>
                            LovIA! ("the App", "we", "us") is a relational compatibility platform built
                            on scientific research. This Privacy Policy explains what personal data we
                            collect, why we collect it, how we use it, and what rights you have
                            regarding your information.
                        </p>
                        <p>
                            LovIA! es una plataforma de compatibilidad relacional basada en
                            investigación científica. Esta Política de Privacidad explica qué datos
                            personales recopilamos, por qué, cómo los usamos y cuáles son tus
                            derechos. Cumplimos con la{' '}
                            <strong>
                                Ley Federal de Protección de Datos Personales en Posesión de los
                                Particulares (LFPDPPP)
                            </strong>{' '}
                            de México y con las políticas de Google Play y Apple App Store.
                        </p>
                    </section>

                    {/* ── Sección 2: Datos recopilados ── */}
                    <section className="pp-section">
                        <h2>2. Data We Collect / Datos que Recopilamos</h2>
                        <p>We collect the following categories of personal data:</p>
                        <table className="pp-table">
                            <thead>
                                <tr>
                                    <th>Category / Categoría</th>
                                    <th>Examples / Ejemplos</th>
                                    <th>Required / Requerido</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Identification</td>
                                    <td>Name, email, date of birth, gender, sexual orientation</td>
                                    <td>Yes — to create account</td>
                                </tr>
                                <tr>
                                    <td>Psychological (Sensitive)</td>
                                    <td>
                                        Compatibility questionnaire responses, emotional state
                                        assessments, attachment style, relationship frequency
                                    </td>
                                    <td>Yes — for matching algorithm</td>
                                </tr>
                                <tr>
                                    <td>Verification</td>
                                    <td>
                                        Profile photos, selfie verification (optional), ID for
                                        in-person encounters (optional)
                                    </td>
                                    <td>Optional</td>
                                </tr>
                                <tr>
                                    <td>Usage Data</td>
                                    <td>
                                        In-app interactions, match history, video call metadata (not
                                        content), session timestamps
                                    </td>
                                    <td>Automatically collected</td>
                                </tr>
                                <tr>
                                    <td>Technical</td>
                                    <td>Device type, OS version, IP address (anonymized), crash logs</td>
                                    <td>Automatically collected</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="pp-note">
                            <strong>Sensitive Data Notice:</strong> Sexual orientation, emotional state,
                            and psychological profile are considered <em>sensitive data</em> under
                            LFPDPPP Art. 3-VI. We process them only with your explicit written consent,
                            given at account registration.
                        </p>
                    </section>

                    {/* ── Sección 3: Uso de datos ── */}
                    <section className="pp-section">
                        <h2>3. How We Use Your Data / Uso de tus Datos</h2>
                        <ul>
                            <li>Create and maintain your user profile and account</li>
                            <li>
                                Calculate your Relational Frequency, Relational Graph, and compatibility
                                score
                            </li>
                            <li>Generate matches based on algorithmic compatibility</li>
                            <li>Provide personalized self-knowledge recommendations</li>
                            <li>Verify your identity for safe in-person encounters</li>
                            <li>
                                Improve our algorithms using anonymized and aggregated data (never
                                individual)
                            </li>
                            <li>
                                Send transactional notifications (match alerts, check-in reminders)
                            </li>
                            <li>Comply with applicable law and respond to legal requests</li>
                        </ul>
                        <p>
                            <strong>We do NOT:</strong> sell your data to advertisers, use
                            cross-site tracking pixels, or share your psychological profile with any
                            third party for commercial purposes.
                        </p>
                    </section>

                    {/* ── Sección 4: Compartición de datos ── */}
                    <section className="pp-section">
                        <h2>4. Data Sharing / Compartición de Datos</h2>
                        <p>We share data only in the following limited cases:</p>
                        <ul>
                            <li>
                                <strong>Supabase (Data Processor):</strong> Our database provider,
                                operating under a Data Processing Agreement (DPA). Supabase stores data
                                in isolated, encrypted servers. They do not access your personal data for
                                their own purposes.
                            </li>
                            <li>
                                <strong>Legal compliance:</strong> We may disclose data if required by a
                                competent Mexican authority (courts, INAI) following due legal process.
                            </li>
                            <li>
                                <strong>Safety:</strong> If we believe disclosure is necessary to
                                prevent imminent harm to a user or third party.
                            </li>
                        </ul>
                        <p>
                            <strong>No third-party advertising networks. No data brokers. No sale of
                            personal data.</strong>
                        </p>
                    </section>

                    {/* ── Sección 5: Retención ── */}
                    <section className="pp-section">
                        <h2>5. Data Retention / Retención de Datos</h2>
                        <table className="pp-table">
                            <thead>
                                <tr>
                                    <th>Data Type</th>
                                    <th>Retention Period</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Active account data</td>
                                    <td>While your account is active</td>
                                </tr>
                                <tr>
                                    <td>Psychological assessments</td>
                                    <td>While account is active + 30 days after deletion request</td>
                                </tr>
                                <tr>
                                    <td>Chat / match history</td>
                                    <td>90 days after account deletion</td>
                                </tr>
                                <tr>
                                    <td>Anonymized analytics</td>
                                    <td>Up to 3 years (no personal identifiers)</td>
                                </tr>
                                <tr>
                                    <td>Legal compliance logs</td>
                                    <td>5 years (as required by Mexican law)</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    {/* ── Sección 6: Eliminación de datos ── */}
                    <section className="pp-section">
                        <h2>6. Data Deletion / Eliminación de Datos</h2>
                        <p>
                            You can request complete deletion of your account and all associated
                            personal data at any time:
                        </p>
                        <ul>
                            <li>
                                <strong>In-app:</strong> Go to Profile → Settings → Delete Account
                            </li>
                            <li>
                                <strong>By email:</strong>{' '}
                                <a href="mailto:clienteslovia@gmail.com">clienteslovia@gmail.com</a>{' '}
                                with subject "ARCO — Cancelación / Account Deletion"
                            </li>
                        </ul>
                        <p>
                            We will process your request within <strong>30 business days</strong> and
                            send confirmation to your registered email. Anonymized aggregate data may
                            be retained for statistical purposes without any personal identifiers.
                        </p>
                    </section>

                    {/* ── Sección 7: Derechos del usuario ── */}
                    <section className="pp-section">
                        <h2>7. Your Rights / Tus Derechos</h2>
                        <p>
                            Under LFPDPPP and general data protection principles, you have the
                            following <strong>ARCO rights</strong>:
                        </p>
                        <ul>
                            <li>
                                <strong>Acceso / Access:</strong> Request a copy of the personal data we
                                hold about you.
                            </li>
                            <li>
                                <strong>Rectificación / Rectification:</strong> Correct inaccurate or
                                incomplete data.
                            </li>
                            <li>
                                <strong>Cancelación / Erasure:</strong> Request deletion of your personal
                                data.
                            </li>
                            <li>
                                <strong>Oposición / Objection:</strong> Object to certain types of
                                processing (e.g., profiling for marketing).
                            </li>
                            <li>
                                <strong>Portabilidad / Portability:</strong> Request an export of your
                                data in a machine-readable format.
                            </li>
                            <li>
                                <strong>Revoke consent:</strong> Withdraw consent for sensitive data
                                processing at any time (this will result in account deactivation, as
                                sensitive data is essential to our service).
                            </li>
                        </ul>
                        <p>
                            To exercise any of these rights, contact:{' '}
                            <a href="mailto:clienteslovia@gmail.com">clienteslovia@gmail.com</a>
                        </p>
                    </section>

                    {/* ── Sección 8: Seguridad ── */}
                    <section className="pp-section">
                        <h2>8. Security / Seguridad</h2>
                        <p>We implement industry-standard security measures:</p>
                        <ul>
                            <li>TLS 1.3 encryption in transit</li>
                            <li>AES-256 encryption at rest</li>
                            <li>Row Level Security (RLS) — each user can only access their own data</li>
                            <li>
                                Multi-factor authentication available for admin access
                            </li>
                            <li>Regular security audits</li>
                        </ul>
                    </section>

                    {/* ── Sección 9: Menores ── */}
                    <section className="pp-section">
                        <h2>9. Minors / Menores de Edad</h2>
                        <p>
                            LovIA! is intended for users <strong>18 years of age or older</strong>.
                            We do not knowingly collect personal data from anyone under 18. If we
                            become aware that a minor has registered, we will immediately delete
                            their account and data. If you believe a minor has used our service,
                            contact us at{' '}
                            <a href="mailto:clienteslovia@gmail.com">clienteslovia@gmail.com</a>.
                        </p>
                    </section>

                    {/* ── Sección 10: Cambios ── */}
                    <section className="pp-section">
                        <h2>10. Changes to This Policy / Cambios a esta Política</h2>
                        <p>
                            We may update this Privacy Policy from time to time. When we make material
                            changes, we will notify you via the app and by email to your registered
                            address at least 15 days before the changes take effect. The updated
                            policy will always be available at{' '}
                            <a href="https://www.lovia.com.mx/privacy">
                                https://www.lovia.com.mx/privacy
                            </a>
                            .
                        </p>
                    </section>

                    {/* ── Sección 11: Contacto ── */}
                    <section className="pp-section pp-section--contact">
                        <h2>11. Contact / Contacto</h2>
                        <p>
                            For any questions, requests, or complaints regarding this Privacy Policy or
                            how we handle your personal data:
                        </p>
                        <div className="pp-contact-card">
                            <p><strong>LovIA! Tecnología Relacional</strong></p>
                            <p>📧 <a href="mailto:clienteslovia@gmail.com">clienteslovia@gmail.com</a></p>
                            <p>🌐 <a href="https://www.lovia.com.mx">www.lovia.com.mx</a></p>
                            <p>📍 Ciudad de México, México</p>
                        </div>
                        <p style={{ marginTop: '1rem' }}>
                            You also have the right to lodge a complaint with the{' '}
                            <strong>
                                Instituto Nacional de Transparencia, Acceso a la Información y
                                Protección de Datos Personales (INAI)
                            </strong>{' '}
                            at{' '}
                            <a
                                href="https://www.inai.org.mx"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                www.inai.org.mx
                            </a>
                            .
                        </p>
                    </section>

                    <hr className="pp-divider" />

                    <footer className="pp-footer">
                        <p>
                            © 2026 LovIA! Tecnología Relacional. All rights reserved. ·{' '}
                            <a href="https://www.lovia.com.mx/privacy">Privacy Policy</a> ·{' '}
                            <a href="https://www.lovia.com.mx">lovia.com.mx</a>
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    )
}
