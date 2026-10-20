import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Heart, ShieldCheck, Sparkles } from 'lucide-react'
import './ProfilePages.css'

export default function SciencePage() {
    const navigate = useNavigate()

    return (
        <div className="profile-content-page">
            <header className="profile-content__header">
                <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Volver">
                    <ArrowLeft size={20} />
                </button>
                <h2>Bases y límites de LovIA</h2>
            </header>

            <div className="profile-content__body animate-fade-in-up">
                <div className="glass card-body" style={{ marginBottom: 24 }}>
                    <BookOpen size={28} color="var(--line-love)" style={{ marginBottom: 16 }} />
                    <h3 style={{ marginBottom: 12 }}>Un marco educativo propio</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        El libro <em>Evolución de las Relaciones de Pareja</em>, de Juan Pablo Peña García,
                        inspira temas como amor, sexualidad y realización. LovIA los presenta como preguntas
                        para pensar y conversar; no como verdades universales sobre cada persona.
                    </p>
                </div>

                <div className="glass card-body" style={{ marginBottom: 24 }}>
                    <Sparkles size={28} color="var(--warning)" style={{ marginBottom: 16 }} />
                    <h3 style={{ marginBottom: 12 }}>Actividades de reflexión</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Las Chispas, ejercicios y preguntas pueden ayudarte a ordenar ideas. Su progreso solo
                        indica lo que decidiste explorar. No diagnostican, no miden tu valor y no predicen el
                        éxito de una relación.
                    </p>
                </div>

                <div className="glass card-body">
                    <ShieldCheck size={28} color="var(--line-sex)" style={{ marginBottom: 16 }} />
                    <h3 style={{ marginBottom: 12 }}>Elegir con contexto y seguridad</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Una sugerencia dentro de la app no sustituye conocer a la otra persona. Considera
                        valores, límites, conducta, consentimiento y preferencias recíprocas. Usa bloqueo y
                        reporte cuando lo necesites.
                    </p>
                </div>

                <button className="matches-page__cta mt-6" style={{ width: '100%' }} onClick={() => navigate('/profile/creator')}>
                    <Heart size={18} /> Conocer el libro y a su autor
                </button>
            </div>
        </div>
    )
}
