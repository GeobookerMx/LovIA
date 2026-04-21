import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Quote, Mail, MapPin, GraduationCap, Instagram, Share2 } from 'lucide-react'
import './ProfilePages.css'
import './AuthorPage.css'

export default function AuthorPage() {
    const navigate = useNavigate()

    const handleEmailContact = () => {
        window.location.href = 'mailto:evosocial@hotmail.com'
    }

    const handleFacebook = () => {
        window.open('https://www.facebook.com/juanpablo.penagarcia.37/', '_blank', 'noopener,noreferrer')
    }

    const handleInstagram = () => {
        window.open('https://www.instagram.com/psjuanpablopg', '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="profile-content-page">
            <header className="profile-content__header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Acerca del Autor</h2>
            </header>

            <div className="profile-content__body animate-fade-in-up">

                {/* Hero con Foto */}
                <div className="author__hero">
                    <div className="author__avatar-ring">
                        <img
                            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop"
                            alt="Juan Pablo Peña García — Psicólogo"
                            className="author__avatar"
                        />
                    </div>
                    <h3 className="author__name">Juan Pablo Peña García</h3>
                    <p className="author__title">Psicólogo • Escritor Independiente</p>

                    {/* Info rápida */}
                    <div className="author__info-chips">
                        <span className="author__chip">
                            <MapPin size={12} /> Estado de México
                        </span>
                        <span className="author__chip">
                            <GraduationCap size={12} /> Psicología Evolutiva
                        </span>
                        <span className="author__chip">
                            <Instagram size={12} /> @psjuanpablopg
                        </span>
                    </div>
                </div>

                {/* Institución */}
                <div className="glass author__institution">
                    <span className="author__inst-badge">🏛️ Instituto Mexicano de Psicooncología</span>
                    <p>Escritor independiente especializado en Psicología Evolutiva y dinámica de parejas.</p>
                </div>

                {/* Cita / Bio */}
                <div className="glass-strong author__bio">
                    <Quote size={24} color="var(--love-rose)" style={{ opacity: 0.5, marginBottom: '12px' }} />
                    <p>
                        He dedicado mi carrera a decodificar la complejidad de las relaciones humanas fusionando
                        el <strong style={{ color: 'var(--love-rose)' }}>Análisis Psicológico Clínico</strong> empírico
                        con la ciencia del comportamiento evolutivo.
                    </p>
                    <p style={{ marginTop: '12px' }}>
                        LovIA nace de una convicción: las conexiones auténticas requieren conocerse desde adentro
                        hacia afuera. Esta herramienta es la materialización digital de años de investigación publicada.
                    </p>
                </div>

                {/* Libro */}
                <div className="author__book-promo glass">
                    <div className="author__book-header">
                        <BookOpen size={28} color="var(--warning)" />
                        <div>
                            <h4>Mi Libro</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Escritor y autor · Descarga gratis 6 meses</p>
                        </div>
                    </div>
                    <h3 className="author__book-title">"Evolución de las Relaciones de Pareja"</h3>
                    <p className="author__book-desc">
                        Todo el motor neurobiológico y psicológico detrás del algoritmo de LovIA —
                        Teoría de los apegos paralelos, Frustración Periférica y Dinámicas de Intercambio Energético —
                        detallado en esta obra. La vanguardia del amor moderno, documentada y publicada.
                    </p>
                    <div className="author__book-tags">
                        <span>#terapiadepareja</span>
                        <span>#psicologiaevolutiva</span>
                        <span>#relacionesdepareja</span>
                    </div>
                    {/* CTA Descarga */}
                    <button
                        className="author__book-cta"
                        onClick={() => navigate('/book')}
                        style={{ marginTop: '14px' }}
                    >
                        📖 Descargar libro — GRATIS por 6 meses
                    </button>
                </div>

                {/* Redes Sociales */}
                <div className="author__socials glass">
                    <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Conecta con el autor</h4>

                    <button className="author__social-btn author__social-btn--fb" onClick={handleFacebook}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <div>
                            <span className="author__social-name">Juan Pablo Peña G Psicólogo</span>
                            <span className="author__social-handle">Facebook · Página oficial</span>
                        </div>
                    </button>

                    <button className="author__social-btn author__social-btn--ig" onClick={handleInstagram}>
                        <Instagram size={20} />
                        <div>
                            <span className="author__social-name">@psjuanpablopg</span>
                            <span className="author__social-handle">Instagram · Psicología Evolutiva</span>
                        </div>
                    </button>

                    <button className="author__social-btn author__social-btn--email" onClick={handleEmailContact}>
                        <Mail size={20} />
                        <div>
                            <span className="author__social-name">evosocial@hotmail.com</span>
                            <span className="author__social-handle">Correo electrónico</span>
                        </div>
                    </button>
                </div>

                {/* CTA Compartir */}
                <button
                    className="author__share-cta"
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: 'LovIA! — Relaciones basadas en ciencia',
                                text: 'Descubrí esta app increíble de relaciones basada en psicología evolutiva. ¡Únete gratis 4 meses!',
                                url: 'https://lovia.com.mx'
                            })
                        } else {
                            navigator.clipboard.writeText('https://lovia.com.mx')
                        }
                    }}
                >
                    <Share2 size={18} />
                    Compartir LovIA!
                </button>

            </div>
        </div>
    )
}
