import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Clock, Video, MapPin, MessageCircle,
    ThumbsUp, ThumbsDown, AlertTriangle
} from 'lucide-react'
import { useMatchStore } from '../../stores/matchStore'
import MatchProgress from '../../components/matching/MatchProgress'
import '../../components/matching/Matching.css'

const levelActions: Record<number, { label: string; icon: React.ReactNode; route?: string }> = {
    1: { label: 'Aceptar Match', icon: <ThumbsUp size={16} /> },
    2: { label: 'Aceptar y revelar perfil', icon: <ThumbsUp size={16} /> },
    3: { label: 'Iniciar videollamada', icon: <Video size={16} />, route: 'call' },
    4: { label: 'Ver plan de encuentro', icon: <MapPin size={16} />, route: 'meeting' },
    5: { label: 'Evaluar encuentro', icon: <MessageCircle size={16} />, route: 'review' },
}

export default function MatchDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const match = useMatchStore((s) => s.activeMatches.find((m) => m.id === id))
    const acceptLevel = useMatchStore((s) => s.acceptLevel)
    const declineMatch = useMatchStore((s) => s.declineMatch)

    if (!match) {
        return (
            <div className="match-detail">
                <div className="match-detail__empty glass-strong">
                    <h2>Match no encontrado</h2>
                    <button onClick={() => navigate('/matches')}>Volver a matches</button>
                </div>
            </div>
        )
    }

    const action = levelActions[match.current_level]

    const handleAccept = () => {
        if (action.route) {
            navigate(`/matches/${match.id}/${action.route}`)
        } else {
            // For levels 1-2: accept and wait for mutual acceptance
            acceptLevel(match.id, match.user_a_id) // TODO: use actual current user id
        }
    }

    const handleDecline = () => {
        declineMatch(match.id)
        navigate('/matches')
    }

    const daysRemaining = Math.max(0, Math.ceil(
        (new Date(match.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ))

    return (
        <div className="match-detail">
            {/* Header */}
            <div className="match-detail__header">
                <button className="match-detail__back" onClick={() => navigate('/matches')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Match #{match.id.slice(-6)}</h2>
            </div>

            {/* Progress */}
            <div className="match-detail__progress glass-strong">
                <MatchProgress currentLevel={match.current_level} />
            </div>

            {/* Info cards */}
            <div className="match-detail__info-grid">
                <div className="match-detail__info-card glass">
                    <span className="match-detail__info-label">Compatibilidad</span>
                    <span className="match-detail__info-value" style={{
                        color: match.compatibility_score >= 70 ? 'var(--freq-high)' :
                            match.compatibility_score >= 50 ? 'var(--freq-mid)' : 'var(--freq-low)'
                    }}>
                        {match.compatibility_score}%
                    </span>
                </div>

                <div className="match-detail__info-card glass">
                    <span className="match-detail__info-label">Nivel actual</span>
                    <span className="match-detail__info-value">{match.current_level}/5</span>
                </div>

                <div className="match-detail__info-card glass">
                    <span className="match-detail__info-label">Estado</span>
                    <span className={`admin-status admin-status--${match.status}`}>
                        {match.status === 'active' ? 'Activo' :
                            match.status === 'completed' ? 'Completado' :
                                match.status === 'declined' ? 'Rechazado' : 'Archivado'}
                    </span>
                </div>

                <div className="match-detail__info-card glass">
                    <span className="match-detail__info-label">Expira en</span>
                    <span className="match-detail__info-value">
                        <Clock size={14} /> {daysRemaining} días
                    </span>
                </div>
            </div>

            {/* Level description */}
            <div className="match-detail__level-info glass-strong">
                <h3>Nivel {match.current_level}: ¿Qué sigue?</h3>
                {match.current_level === 1 && (
                    <p>Revisa el perfil anónimo. Si ambos aceptan, se revelarán fotos y nombre.</p>
                )}
                {match.current_level === 2 && (
                    <p>Ahora puedes ver fotos y nombre. Si ambos aceptan, podrán hacer una videollamada guiada de 5-15 minutos.</p>
                )}
                {match.current_level === 3 && (
                    <p>Es momento de la videollamada. Tendrán temas sugeridos, timer, y botón de pánico por seguridad.</p>
                )}
                {match.current_level === 4 && (
                    <p>¡Hora de conocerse! LovIA! generará un plan de encuentro en lugar público con protocolo de seguridad.</p>
                )}
                {match.current_level === 5 && (
                    <p>¿Cómo te fue? Evalúa tu experiencia para mejorar futuras recomendaciones.</p>
                )}
            </div>

            {/* Actions */}
            {match.status === 'active' && (
                <div className="match-detail__actions">
                    <button className="match-detail__accept" onClick={handleAccept}>
                        {action.icon} {action.label}
                    </button>
                    <button className="match-detail__decline" onClick={handleDecline}>
                        <ThumbsDown size={16} /> Rechazar
                    </button>
                    <button className="match-detail__report">
                        <AlertTriangle size={14} /> Reportar
                    </button>
                </div>
            )}
        </div>
    )
}
