import { Link } from 'react-router-dom'
import { Heart, Shield, Brain, Sparkles, ArrowRight, Star, BookOpen, Mail, Instagram, Smartphone } from 'lucide-react'
import './Landing.css'

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
                        Conoce personas, reflexiona sobre tus vínculos y encuentra herramientas
                        para cuidar tus relaciones a tu ritmo.
                    </p>
                    <p className="landing__audience">Para personas adultas. Explorar personas y conversar requiere consentimiento y controles de seguridad.</p>

                    <div className="landing__free-banner">
                        🎉 <strong>Acceso completo gratis hasta el 31 de enero de 2027</strong> — Sin tarjeta requerida
                    </div>

                    <div className="landing__cta-group">
                        <Link to="/register" className="landing__cta landing__cta--primary">
                            Comenzar gratis
                            <ArrowRight size={18} />
                        </Link>
                        <a
                            href="https://play.google.com/store/apps/details?id=mx.lovia.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="landing__cta landing__cta--android"
                            aria-label="Descargar LovIA en Google Play para Android (abre una pestaña nueva)"
                        >
                            <Smartphone size={20} aria-hidden="true" />
                            Disponible en Android · Google Play
                        </a>
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
                    <p>Amor, sexualidad y realización son temas de exploración de LovIA; conoce sus fuentes y límites.</p>
                </div>

                <div className="landing__feature glass">
                    <div className="landing__feature-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                        <Brain size={24} color="var(--line-sex)" />
                    </div>
                    <h3>Conócete mejor</h3>
                    <p>Reflexiona sobre comunicación, valores y bienestar con actividades opcionales.</p>
                </div>

                <div className="landing__feature glass">
                    <div className="landing__feature-icon" style={{ background: 'rgba(34, 211, 238, 0.15)' }}>
                        <Shield size={24} color="var(--line-realization)" />
                    </div>
                    <h3>Herramientas de seguridad</h3>
                    <p>Herramientas de reporte y bloqueo para cuidar tu experiencia.</p>
                </div>

                <div className="landing__feature glass">
                    <div className="landing__feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                        <Sparkles size={24} color="var(--success)" />
                    </div>
                    <h3>Mejora Continua</h3>
                    <p>Aprende a tu ritmo sin que tus ejercicios condicionen el descubrimiento.</p>
                </div>
            </section>

            {/* Orientación inicial sin afirmar validaciones no revisadas */}
            <section className="landing__science">
                <div className="landing__science-header animate-fade-in-up">
                    <BookOpen size={28} color="var(--love-warm)" />
                    <h2>Encuentra tu <span className="text-gradient">camino</span></h2>
                    <p>Empieza por lo que te interesa hoy. Las actividades de reflexión son opcionales y tus notas del diario son privadas.</p>
                </div>
                <div className="landing__paths">
                    <div className="landing__path glass"><Heart size={24} /><h3>Quiero conocer personas</h3><p>Revisa tus conexiones y conversa sólo cuando exista autorización mutua.</p></div>
                    <div className="landing__path glass"><Brain size={24} /><h3>Quiero comprenderme mejor</h3><p>Usa la Guía, ejercicios y Mi Diario de forma voluntaria.</p></div>
                    <div className="landing__path glass"><Shield size={24} /><h3>Quiero cuidar mi relación</h3><p>Explora herramientas de comunicación sin aparecer por ello en descubrimiento.</p></div>
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
                    <p>© 2026 LovIA! — Juan Pablo Peña García</p>
                    <Link to="/login" className="landing__footer-link">Ya tengo una cuenta</Link>
                </div>
            </footer>
        </div>
    )
}
