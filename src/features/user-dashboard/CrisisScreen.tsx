import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, ShieldAlert, Heart, Siren } from 'lucide-react'
import './CrisisScreen.css'

export default function CrisisScreen() {
    const navigate = useNavigate()

    return (
        <div className="crisis-page">
            <div className="crisis-page__header">
                <button className="crisis-page__back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Botón de Crisis</h2>
            </div>

            <div className="crisis-alert-box animate-fade-in">
                <ShieldAlert size={28} className="crisis-alert-icon" />
                <div className="crisis-alert-text">
                    <h3>No estás solo/a. Hay ayuda disponible 24/7.</h3>
                    <p>
                        Si tu integridad física o mental están en riesgo inminente, o si sufres de violencia, 
                        por favor contacta de inmediato a las autoridades o líneas especializadas.
                    </p>
                </div>
            </div>

            <div className="crisis-list stagger-children">
                <div className="crisis-card crisis-card--urgent glass">
                    <div className="crisis-card__icon" style={{ color: 'var(--danger)' }}>
                        <Siren size={24} />
                    </div>
                    <div className="crisis-card__content">
                        <div className="crisis-card__title">Emergencias (México)</div>
                        <div className="crisis-card__desc">Policía, Cruz Roja, Bomberos. Si tu vida o la de alguien más corre peligro inmediato.</div>
                        <div className="crisis-card__number">911</div>
                    </div>
                    <a href="tel:911" className="crisis-card__action">
                        <Phone size={18} />
                    </a>
                </div>

                <div className="crisis-card crisis-card--support glass">
                    <div className="crisis-card__icon" style={{ color: 'var(--warning)' }}>
                        <ShieldAlert size={24} />
                    </div>
                    <div className="crisis-card__content">
                        <div className="crisis-card__title">Línea Mujeres (CDMX)</div>
                        <div className="crisis-card__desc">Atención psicológica y legal por violencia de género 24/7.</div>
                        <div className="crisis-card__number">*765</div>
                    </div>
                    <a href="tel:*765" className="crisis-card__action">
                        <Phone size={18} />
                    </a>
                </div>

                <div className="crisis-card crisis-card--support glass">
                    <div className="crisis-card__icon" style={{ color: 'var(--love-warm)' }}>
                        <Heart size={24} />
                    </div>
                    <div className="crisis-card__content">
                        <div className="crisis-card__title">Línea de la Vida</div>
                        <div className="crisis-card__desc">Apoyo psicológico para crisis emocionales, depresión o ansiedad a nivel nacional.</div>
                        <div className="crisis-card__number">800 911 2000</div>
                    </div>
                    <a href="tel:8009112000" className="crisis-card__action">
                        <Phone size={18} />
                    </a>
                </div>

                <div className="crisis-card glass">
                    <div className="crisis-card__icon" style={{ color: 'var(--text-tertiary)' }}>
                        <Phone size={24} />
                    </div>
                    <div className="crisis-card__content">
                        <div className="crisis-card__title">SAPTEL</div>
                        <div className="crisis-card__desc">Sistema Nacional de Apoyo Psicológico e Intervención en Crisis.</div>
                        <div className="crisis-card__number">55 5259 8121</div>
                    </div>
                    <a href="tel:5552598121" className="crisis-card__action">
                        <Phone size={18} />
                    </a>
                </div>
            </div>
            
            <p style={{ textAlign: 'center', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-6)' }}>
                LovIA es una plataforma educativa y de apoyo, pero no sustituye el cuidado profesional de emergencia. 
                Tu seguridad es lo más importante.
            </p>
        </div>
    )
}
