import { Link } from 'react-router-dom'
import { Heart, Shield, Brain, Sparkles, ArrowRight, Star, BookOpen, Mail, Instagram, Wallet } from 'lucide-react'
import { isWeb } from '../../lib/platform'
import RelationshipsContext from './RelationshipsContext'
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
                        Conoce personas con intención. Aprende a construir relaciones.
                    </p>
                    <p className="landing__description">
                        Explora personas, aclara lo que buscas y practica comunicación,
                        límites y acuerdos a tu ritmo.
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
                        {isWeb() && (
                            <a
                                href="https://play.google.com/store/apps/details?id=mx.lovia.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="landing__google-play"
                                aria-label="Descargar LovIA en Google Play para Android (abre una pestaña nueva)"
                            >
                                <img src="/brand/google-play-es-419.png" alt="Descargar en Google Play" width="646" height="250" />
                            </a>
                        )}
                        <button 
                            className="landing__cta landing__cta--secondary"
                            onClick={() => document.querySelector('.landing__features')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            ¿Cómo funciona?
                        </button>
                    </div>
                </div>
            </section>

            <section className="landing__finance-feature" aria-labelledby="landing-finance-title">
                <span><Wallet size={18} aria-hidden="true" /> Nuevo recurso</span>
                <h2 id="landing-finance-title">Dinero y proyecto de vida</h2>
                <p>Preguntas para conocer tus prioridades y conversar sobre acuerdos, sin calificaciones ni promesas de compatibilidad.</p>
                <a href="/recursos/dinero-y-proyecto-de-vida">Lee la guía gratuita <ArrowRight size={17} aria-hidden="true" /></a>
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
                    <p>Explora preguntas y ejercicios breves para conocerte mejor, a tu ritmo.</p>
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

            <RelationshipsContext />

            <section className="landing__editorial" aria-labelledby="landing-editorial-title">
                <div className="landing__context-heading">
                    <span className="landing__context-kicker">Guías e Infografía</span>
                    <h2 id="landing-editorial-title">Claridad, intención y contexto</h2>
                    <p>Herramientas y datos para pensar cómo nos relacionamos. Contenido educativo para tu camino en LovIA.</p>
                </div>

                {/* Infografía panorámica */}
                <figure className="landing__infografia-banner glass">
                    <img 
                        src="/editorial/infografia_contexto.webp" 
                        width="1440" 
                        height="450" 
                        loading="lazy" 
                        decoding="async" 
                        alt="Infografía: Relaciones en contexto, economía, decisiones y preguntas para elegir con intención." 
                    />
                    <figcaption>Panorama internacional y nacional: datos demográficos, decisiones familiares y preguntas clave para dialogar con intención.</figcaption>
                </figure>

                {/* 4 Posts Oficiales */}
                <div className="landing__editorial-grid">
                    <figure className="landing__editorial-card glass">
                        <img src="/editorial/intencion.webp" width="960" height="1200" loading="lazy" decoding="async" alt="Antes de conectar, aclara lo que buscas: cuatro preguntas para elegir con intención." />
                        <figcaption><strong>Conecta con intención:</strong> Preguntas clave antes de elegir y avanzar.</figcaption>
                    </figure>
                    <figure className="landing__editorial-card glass">
                        <img src="/editorial/conocete.webp" width="960" height="1200" loading="lazy" decoding="async" alt="Conócete antes de conectar: explora tus valores, límites y lo que deseas en una relación." />
                        <figcaption><strong>Conócete primero:</strong> Identifica tus límites, necesidades y valores.</figcaption>
                    </figure>
                    <figure className="landing__editorial-card glass">
                        <img src="/editorial/cuidar.webp" width="960" height="1200" loading="lazy" decoding="async" alt="También es para cuidar tu relación: ideas y ejercicios para hablar de comunicación, confianza y límites." />
                        <figcaption><strong>Cuida tu relación:</strong> Para parejas que buscan fortalecer sus acuerdos.</figcaption>
                    </figure>
                    <figure className="landing__editorial-card glass">
                        <img src="/editorial/claridad.webp" width="960" height="1200" loading="lazy" decoding="async" alt="Más claridad para tus relaciones: Conexiones, Guía, Mi Diario y Ejercicios a tu ritmo." />
                        <figcaption><strong>Más claridad:</strong> Tu espacio personal para reflexionar y crecer.</figcaption>
                    </figure>
                </div>
                <Link to="/register" className="landing__cta landing__cta--primary">Explorar LovIA <ArrowRight size={18} /></Link>
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
