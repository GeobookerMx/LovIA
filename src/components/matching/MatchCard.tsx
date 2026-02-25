import { Lock, MapPin, Shield, Star } from 'lucide-react'
import type { MatchCandidate } from '../../lib/matchingEngine'
import './Matching.css'

interface Props {
    candidate: MatchCandidate
    revealedLevel?: 1 | 2 | 3 | 4 | 5
    onSelect?: () => void
}

export default function MatchCard({ candidate, revealedLevel = 1, onSelect }: Props) {
    const { profile, final_score, scores } = candidate
    const isRevealed = revealedLevel >= 2

    const scoreColor =
        final_score >= 80 ? 'var(--freq-high)' :
            final_score >= 60 ? 'var(--freq-mid)' :
                final_score >= 40 ? 'var(--freq-dev)' :
                    'var(--freq-low)'

    return (
        <div className="match-card glass animate-fade-in-up" onClick={onSelect} role="button" tabIndex={0}>
            {/* Avatar area */}
            <div className="match-card__avatar-area">
                {isRevealed ? (
                    <div className="match-card__avatar match-card__avatar--revealed">
                        <span>{profile.id.slice(0, 2).toUpperCase()}</span>
                    </div>
                ) : (
                    <div className="match-card__avatar match-card__avatar--anonymous">
                        <Lock size={20} />
                    </div>
                )}
                {profile.verified_selfie && (
                    <div className="match-card__verified" title="Verificado">
                        <Shield size={12} />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="match-card__info">
                <h4 className="match-card__name">
                    {isRevealed ? `Usuario ${profile.id.slice(-4)}` : 'Perfil anónimo'}
                </h4>
                <div className="match-card__meta">
                    <span>{profile.age} años</span>
                    <span className="match-card__dot">·</span>
                    <span><MapPin size={12} /> {profile.city}</span>
                </div>
            </div>

            {/* Score */}
            <div className="match-card__score" style={{ color: scoreColor }}>
                <Star size={14} />
                <span>{final_score}%</span>
            </div>

            {/* Mini radar — 3 bars */}
            <div className="match-card__radar">
                <div className="match-card__radar-bar" title="Frecuencia">
                    <span>🎵</span>
                    <div className="match-card__bar-track">
                        <div className="match-card__bar-fill" style={{ width: `${scores.frequency_compat * 100}%`, background: 'var(--line-love)' }} />
                    </div>
                </div>
                <div className="match-card__radar-bar" title="Factores">
                    <span>⚖️</span>
                    <div className="match-card__bar-track">
                        <div className="match-card__bar-fill" style={{ width: `${scores.factor_compat * 100}%`, background: 'var(--line-sex)' }} />
                    </div>
                </div>
                <div className="match-card__radar-bar" title="Confianza">
                    <span>🛡️</span>
                    <div className="match-card__bar-track">
                        <div className="match-card__bar-fill" style={{ width: `${scores.confidence_bonus * 100}%`, background: 'var(--line-realization)' }} />
                    </div>
                </div>
            </div>
        </div>
    )
}
