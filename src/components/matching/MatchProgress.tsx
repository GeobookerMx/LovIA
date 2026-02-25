import { Check } from 'lucide-react'
import './Matching.css'

const levels = [
    { num: 1, icon: '🔒', label: 'Match Inicial', desc: 'Perfil anónimo' },
    { num: 2, icon: '🔓', label: 'Confirmado', desc: 'Fotos + nombre' },
    { num: 3, icon: '📹', label: 'Videollamada', desc: '5-15 min guiada' },
    { num: 4, icon: '📍', label: 'Encuentro', desc: 'Lugar público' },
    { num: 5, icon: '💬', label: 'Post-Encuentro', desc: 'Rating + feedback' },
]

interface Props {
    currentLevel: 1 | 2 | 3 | 4 | 5
    compact?: boolean
}

export default function MatchProgress({ currentLevel, compact = false }: Props) {
    return (
        <div className={`match-progress ${compact ? 'match-progress--compact' : ''}`}>
            {levels.map((level, i) => {
                const isCompleted = level.num < currentLevel
                const isCurrent = level.num === currentLevel
                const isFuture = level.num > currentLevel

                return (
                    <div key={level.num} className="match-progress__step-wrap">
                        <div
                            className={`match-progress__step ${isCompleted ? 'match-progress__step--done' :
                                    isCurrent ? 'match-progress__step--active' :
                                        'match-progress__step--future'
                                }`}
                        >
                            <div className="match-progress__icon">
                                {isCompleted ? <Check size={16} /> : <span>{level.icon}</span>}
                            </div>
                            {!compact && (
                                <div className="match-progress__label">
                                    <strong>{level.label}</strong>
                                    {isCurrent && <span>{level.desc}</span>}
                                </div>
                            )}
                        </div>
                        {i < levels.length - 1 && (
                            <div className={`match-progress__connector ${isCompleted ? 'match-progress__connector--done' :
                                    isFuture ? 'match-progress__connector--future' : ''
                                }`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
