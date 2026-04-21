import { Link } from 'react-router-dom'
import { Heart, Shield, Brain, Sparkles, ArrowRight, Star, BookOpen, Mail, Instagram } from 'lucide-react'
import './Landing.css'

const scienceAuthors = [
    { name: 'J. P. Peña', field: 'Evolución de las Relaciones de Pareja', year: '2023' },
    { name: 'Sternberg', field: 'Teoría Triangular del Amor', year: '1986' },
    { name: 'Gottman', field: '7 Principios del Matrimonio', year: '1999' },
    { name: 'Chapman', field: '5 Lenguajes del Amor', year: '1992' },
    { name: 'Johnson', field: 'Terapia Focalizada en Emociones', year: '2008' },
    { name: 'Perel', field: 'Deseo y Relaciones Modernas', year: '2006' },
    { name: 'Cohen', field: 'PSS-4 Estrés Percibido', year: '1983' },
    { name: 'Gross & John', field: 'Regulación Emocional (ERQ)', year: '2003' },
]

export default function Landing() {
    return (
        <div className="landing">
            {/* Hero */}
            <section className="landing__hero">
                <div className="landing__glow landing__glow--1" />
                <div className="landing__glow landing__glow--2" />
                <div className="landing__glow landing__glow--3" />

                <div className="landing__hero-content animate-fade-in-up">
                    <div className="landing__badge">
                        <Star size={14} />
                        <span>Ingeniería Relacional</span>
                    </div>
                    <h1 className="landing__title">
                        Lov<span className="text-gradient">IA!</span>
                    </h1>
                    <p className="landing__subtitle">
                        Conecta desde quien eres
                    </p>
                    <p className="landing__description">
                        Descubre tu <strong>Frecuencia de Relación</strong> basada en ciencia,
                        y conecta con personas en tu misma sintonía.
                    </p>

                    <div className="landing__free-banner">
                        🎉 <strong>Acceso completo GRATIS por 4 meses</strong> — Sin tarjeta requerida
                    </div>

                    <div className="landing__cta-group">
                        <Link to="/home" className="landing__cta landing__cta--primary">
                            Comenzar gratis
                            <ArrowRight size={18} />
                        </Link>
                        <button 
                            className="landing__cta landing__cta--secondary"
                            onClick={() => document.querySelector('.landing__features')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            ¿Cómo funciona?
                        </button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="landing__features stagger-children">
                <div className="landing__feature glass">
                    <div className="landing__feature-icon" style={{ background: 'rgba(255, 107, 138, 0.15)' }}>
                        <Heart size={24} color="var(--line-love)" />
                    </div>
                    <h3>3 Líneas de Análisis</h3>
                    <p>Amor, Sexual y Realización — basado en la Teoría Triangular de Sternberg (1986).</p>
                </div>

                <div className="landing__feature glass">
                    <div className="landing__feature-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                        <Brain size={24} color="var(--line-sex)" />
                    </div>
                    <h3>27+ Factores</h3>
                    <p>Inteligencia emocional, comunicación, valores — evaluados con instrumentos validados.</p>
                </div>

                <div className="landing__feature glass">
                    <div className="landing__feature-icon" style={{ background: 'rgba(34, 211, 238, 0.15)' }}>
                        <Shield size={24} color="var(--line-realization)" />
                    </div>
                    <h3>Seguridad Multi-Capa</h3>
                    <p>5 niveles de verificación progresiva. Tu seguridad es nuestra arquitectura.</p>
                </div>

                <div className="landing__feature glass">
                    <div className="landing__feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                        <Sparkles size={24} color="var(--success)" />
                    </div>
                    <h3>Mejora Continua</h3>
                    <p>Cada área que trabajas mejora tu Frecuencia y abre nuevas conexiones.</p>
                </div>
            </section>

            {/* Science Section */}
            <section className="landing__science">
                <div className="landing__science-header animate-fade-in-up">
                    <BookOpen size={28} color="var(--love-warm)" />
                    <h2>Respaldado por <span className="text-gradient">Ciencia</span></h2>
                    <p>Cada test, variable y algoritmo está fundamentado en investigación publicada y revisada por pares.</p>
                </div>

                <div className="landing__science-counter glass-strong animate-fade-in-up">
                    <span className="landing__science-number">37+</span>
                    <span className="landing__science-label">estudios publicados respaldan nuestro modelo</span>
                </div>

                <div className="landing__science-authors stagger-children">
                    {scienceAuthors.map((author) => (
                        <div key={author.name} className="landing__author-badge glass">
                            <strong>{author.name}</strong>
                            <span>{author.field}</span>
                            <small>{author.year}</small>
                        </div>
                    ))}
                </div>

                <div className="landing__science-instruments animate-fade-in-up">
                    <h3>Instrumentos Validados</h3>
                    <div className="landing__instruments-grid">
                        <div className="landing__instrument glass">
                            <span className="landing__instrument-tag">PSS-4</span>
                            <p>Estrés percibido — Cohen et al., 1983</p>
                        </div>
                        <div className="landing__instrument glass">
                            <span className="landing__instrument-tag">ERQ</span>
                            <p>Regulación emocional — Gross & John, 2003</p>
                        </div>
                        <div className="landing__instrument glass">
                            <span className="landing__instrument-tag">ICI</span>
                            <p>Tolerancia a frustración — Validado UNAM</p>
                        </div>
                        <div className="landing__instrument glass">
                            <span className="landing__instrument-tag">Stroop</span>
                            <p>Control cognitivo — Stroop, 1935</p>
                        </div>
                        <div className="landing__instrument glass">
                            <span className="landing__instrument-tag">WAIS-IV</span>
                            <p>Memoria de trabajo — Wechsler, 2008</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing__footer">
                <div className="landing__footer-social">
                    <a
                        href="https://www.facebook.com/juanpablo.penagarcia.37/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="landing__footer-social-btn landing__footer-social-btn--fb"
                        aria-label="Facebook del autor"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Juan Pablo Peña G Psicólogo
                    </a>
                    <a
                        href="https://www.instagram.com/psjuanpablopg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="landing__footer-social-btn landing__footer-social-btn--ig"
                        aria-label="Instagram del autor"
                    >
                        <Instagram size={18} />
                        @psjuanpablopg
                    </a>
                    <a
                        href="mailto:evosocial@hotmail.com"
                        className="landing__footer-social-btn landing__footer-social-btn--email"
                        aria-label="Email del autor"
                    >
                        <Mail size={18} />
                        evosocial@hotmail.com
                    </a>
                </div>
                <div className="landing__footer-bottom">
                    <p>© 2025 LovIA! — Todos los derechos reservados</p>
                    <Link to="/home" className="landing__footer-link">Acerca del Autor</Link>
                </div>
            </footer>
        </div>
    )
}
