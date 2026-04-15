import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Brain, Activity, Target } from 'lucide-react'
import './ProfilePages.css'

export default function SciencePage() {
    const navigate = useNavigate()

    return (
        <div className="profile-content-page">
            <header className="profile-content__header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>La Ciencia Detrás</h2>
            </header>

            <div className="profile-content__body animate-fade-in-up">
                
                <div className="glass card-body" style={{ marginBottom: '24px' }}>
                    <Brain size={28} color="var(--line-love)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '12px' }}>Neurobiología del Apego</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        LovIA! no utiliza "likes" o deslizamientos ciegos. Nuestro algoritmo está fundamentado en la 
                        <strong> Teoría del Apego de John Bowlby</strong>, cruzada con estudios modernos sobre la 
                        plasticidad cerebral durante el enamoramiento. Evaluamos si tu perfil tiende hacia un apego Seguro, Ansioso, o Evitativo para 
                        emparejarte con frecuencias compatibles, evitando los clásicos choques narcisistas.
                    </p>
                </div>

                <div className="glass card-body" style={{ marginBottom: '24px' }}>
                    <Activity size={28} color="var(--warning)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '12px' }}>Tolerancia a la Frustración</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        A través de pruebas gamificadas como el Efecto Stroop Inverso (reconocimiento bajo presión cognitiva), 
                        medimos tu "Ventana de Tolerancia". Una relación madura no se sostiene en la pasión inicial, 
                        sino en la forma en que ambas partes resuelven el conflicto cuando las expectativas no se cumplen.
                    </p>
                </div>

                <div className="glass card-body">
                    <Target size={28} color="var(--line-sex)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '12px' }}>Frecuencia y Deseo (Libido)</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        La intimidad erosiva es la causa número uno de rompimientos a largo plazo. 
                        Nuestra malla de "Intercambio Energético" analiza la honestidad de tus pulsiones físicas y las 
                        empatiza en un radar ciego con tus prospectos. Solo si hay resonancia, avanzan; si hay discrepancia abismal, 
                        el algoritmo protege a ambos usuarios de expectativas rotas.
                    </p>
                </div>

                <button className="matches-page__cta mt-6" style={{ width: '100%' }} onClick={() => navigate('/profile/creator')}>
                    <BookOpen size={18} /> Leer sobre el Libro Oficial
                </button>
            </div>
        </div>
    )
}
