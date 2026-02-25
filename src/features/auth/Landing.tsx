import { Link } from 'react-router-dom'
import { Heart, Shield, Brain, Sparkles, ArrowRight, Star } from 'lucide-react'
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
                        Parejas de calidad comienzan con autoconocimiento de calidad
                    </p>
                    <p className="landing__description">
                        Descubre tu <strong>Frecuencia de Relación</strong> basada en ciencia,
                        y conecta con personas en tu misma sintonía.
                    </p>

                    <div className="landing__cta-group">
                        <Link to="/home" className="landing__cta landing__cta--primary">
                            Comenzar gratis
                            <ArrowRight size={18} />
                        </Link>
                        <button className="landing__cta landing__cta--secondary">
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
                    <p>Amor, Sexual y Realización Personal — cada una con factores únicos evaluados científicamente.</p>
                </div>

                <div className="landing__feature glass">
                    <div className="landing__feature-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                        <Brain size={24} color="var(--line-sex)" />
                    </div>
                    <h3>27+ Factores</h3>
                    <p>De la inteligencia emocional al manejo financiero, evaluamos lo que realmente importa.</p>
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

            {/* Footer */}
            <footer className="landing__footer">
                <p>© 2025 LovIA! — Todos los derechos reservados</p>
            </footer>
        </div>
    )
}
