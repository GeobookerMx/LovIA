import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './Matching.css'

export default function PostEncounterReview() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [rating, setRating] = useState(0)
    const [feltSafe, setFeltSafe] = useState<boolean | null>(null)
    const [feedback, setFeedback] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async () => {
        try {
            // Guardar reseña en la base de datos
            const { error } = await supabase.from('encounter_reviews').insert({
                match_id: id,
                rating,
                felt_safe: feltSafe,
                feedback
            });
            
            if (error) throw error;
            
            setSubmitted(true)
            setTimeout(() => navigate('/matches'), 2000)
        } catch (error: any) {
            console.error('Error guardando la reseña:', error)
            alert('Asegúrate de ejecutar el comando SQL de esta fase para crear la tabla encounter_reviews.')
        }
    }

    if (submitted) {
        return (
            <div className="post-review">
                <div className="match-detail__empty glass-strong animate-fade-in-up">
                    <span style={{ fontSize: '3rem' }}>✨</span>
                    <h2>¡Gracias por tu feedback!</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
                        Tu evaluación ayuda a mejorar los matches para todos.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="post-review">
            {/* Header */}
            <div className="meeting-plan__header">
                <button className="meeting-plan__back" onClick={() => navigate(`/matches/${id}`)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>¿Cómo te fue?</h2>
            </div>

            {/* Rating */}
            <div className="meeting-plan__card glass-strong animate-fade-in-up">
                <h3 style={{ textAlign: 'center' }}>Califica tu experiencia</h3>
                <div className="post-review__stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`post-review__star ${star <= rating ? 'post-review__star--active' : ''}`}
                            onClick={() => setRating(star)}
                        >
                            {star <= rating ? '⭐' : '☆'}
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p style={{ textAlign: 'center', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                        {rating <= 2 ? 'Lamentamos que no fue ideal' :
                            rating <= 3 ? 'Experiencia normal' :
                                rating <= 4 ? '¡Bien! Buena conexión' :
                                    '¡Increíble! Gran química ✨'}
                    </p>
                )}
            </div>

            {/* Safety question */}
            <div className="post-review__safety glass-strong animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div>
                    <strong style={{ fontSize: 'var(--fs-sm)' }}>¿Te sentiste seguro/a?</strong>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                        Tu respuesta es confidencial
                    </p>
                </div>
                <div className="post-review__safety-toggle">
                    <button
                        className={`post-review__safety-btn post-review__safety-btn--yes ${feltSafe === true ? 'post-review__safety-btn--selected' : ''}`}
                        onClick={() => setFeltSafe(true)}
                    >
                        👍 Sí
                    </button>
                    <button
                        className={`post-review__safety-btn post-review__safety-btn--no ${feltSafe === false ? 'post-review__safety-btn--selected' : ''}`}
                        onClick={() => setFeltSafe(false)}
                    >
                        👎 No
                    </button>
                </div>
            </div>

            {/* Unsafe → show resources */}
            {feltSafe === false && (
                <div className="meeting-plan__card glass animate-fade-in-up" style={{ borderLeft: '3px solid var(--danger)' }}>
                    <h3><AlertTriangle size={16} /> Recursos de Apoyo</h3>
                    <div className="meeting-plan__detail" style={{ gap: 'var(--space-3)' }}>
                        <p>Si viviste una situación de riesgo:</p>
                        <div className="meeting-plan__starter">📞 Línea de la Vida: 800 911 2000</div>
                        <div className="meeting-plan__starter">📞 SAPTEL: 55 5259 8121</div>
                        <div className="meeting-plan__starter">🏥 Directorio de profesionales en LovIA!</div>
                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                            Tu reporte será revisado por nuestro equipo de moderación en las próximas 24 horas.
                        </p>
                    </div>
                </div>
            )}

            {/* Feedback text */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <textarea
                    className="post-review__textarea"
                    placeholder="Cuéntanos más sobre tu experiencia (opcional)..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
            </div>

            {/* Submit */}
            <button
                className="match-detail__accept"
                onClick={handleSubmit}
                disabled={rating === 0}
                style={{ opacity: rating === 0 ? 0.5 : 1 }}
            >
                <Send size={16} /> Enviar evaluación
            </button>
        </div>
    )
}
