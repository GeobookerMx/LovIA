import { Heart, Lock, Search } from 'lucide-react'
import './MatchesList.css'

export default function MatchesList() {
    return (
        <div className="matches-page">
            <header className="matches-page__header">
                <h1>Matches</h1>
                <p className="matches-page__subtitle">Encuentra tu frecuencia</p>
            </header>

            {/* Empty state — user needs to complete requirements */}
            <div className="matches-page__empty glass animate-scale-in">
                <div className="matches-page__empty-icon animate-float">
                    <Heart size={48} color="var(--love-rose)" />
                </div>
                <h2>Aún no tienes matches</h2>
                <p>Completa tu perfil y cuestionario para desbloquear el matching con personas en tu frecuencia.</p>

                <div className="matches-page__requirements">
                    <div className="matches-page__req">
                        <div className="matches-page__req-check matches-page__req-check--done">✓</div>
                        <span>Email verificado</span>
                    </div>
                    <div className="matches-page__req">
                        <div className="matches-page__req-check">
                            <Lock size={12} />
                        </div>
                        <span>Cuestionario Nivel 1 completo</span>
                    </div>
                    <div className="matches-page__req">
                        <div className="matches-page__req-check">
                            <Lock size={12} />
                        </div>
                        <span>Frecuencia ≥ 40</span>
                    </div>
                </div>

                <button className="matches-page__cta">
                    <Search size={16} />
                    Completar cuestionario
                </button>
            </div>
        </div>
    )
}
