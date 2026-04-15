import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Quote } from 'lucide-react'
import './ProfilePages.css'

export default function AuthorPage() {
    const navigate = useNavigate()

    return (
        <div className="profile-content-page">
            <header className="profile-content__header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Acerca del Creador</h2>
            </header>

            <div className="profile-content__body animate-fade-in-up">
                <div className="author__hero">
                    <img 
                        src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=400&auto=format&fit=crop" 
                        alt="Juan Pablo Peña García" 
                        className="author__avatar"
                    />
                    <h3>Juan Pablo Peña García</h3>
                    <p className="author__subtitle">Programador, Psicólogo y Autor de LovIA</p>
                </div>

                <div className="glass-strong card-body" style={{ marginTop: '24px' }}>
                    <Quote size={24} color="var(--love-rose)" style={{ opacity: 0.5, marginBottom: '12px' }} />
                    <p>
                        He dedicado mi carrera a decodificar la complejidad de las relaciones humanas fusionando dos mundos: 
                        el <strong style={{ color: 'var(--love-rose)' }}>Análisis Psicológico Clínico</strong> empírico y 
                        la <strong style={{ color: 'var(--love-rose)' }}>Ingeniería de Software</strong> de alto nivel.
                    </p>
                    <p style={{ marginTop: '12px' }}>
                        LovIA nace de una frustración tangible: las aplicaciones de citas tradicionales destruyen la conexión 
                        basándose en la superficialidad de un <em>'swipe'</em> infinito sin fondo. LovIA construye desde 
                        adentro hacia afuera, fundamentado en la ciencia del comportamiento.
                    </p>
                </div>

                <div className="author__book-promo glass p-6 mt-6">
                    <BookOpen size={32} color="var(--warning)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '8px' }}>Mi Libro: "Evolución de las Relaciones de Pareja"</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                        Todo el motor neurobiológico y psicológico detrás del algoritmo profundo de LovIA 
                        (Teoría de los apegos paralelos, la Frustración Periférica y las Dinámicas de Intercambio Energético) 
                        se encuentra detallado y publicado en mi obra maestra literaria. 
                        Este libro fundamenta científicamente el ecosistema y es obligatorio para entender la vanguardia del amor moderno.
                    </p>
                    <button className="matches-page__cta" style={{ width: '100%', marginTop: '20px', background: 'var(--warning)', color: '#000' }}>
                        Adquirir Libro
                    </button>
                </div>
            </div>
        </div>
    )
}
