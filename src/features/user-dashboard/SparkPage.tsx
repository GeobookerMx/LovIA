import { Zap, ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import './SparkPage.css'

export default function SparkPage() {
    return (
        <div className="spark-page">
            <header className="spark-page__header">
                <h1>
                    <Zap size={22} color="var(--love-warm)" /> La Chispa
                </h1>
                <div className="spark-page__streak glass">
                    <Flame size={14} color="var(--love-coral)" />
                    <span>5 días</span>
                </div>
            </header>

            {/* Card */}
            <div className="spark-page__card glass-strong animate-scale-in">
                <p className="spark-page__category">Valores y Creencias</p>
                <h2 className="spark-page__question">
                    "¿Qué cualidad admiras más en la persona que amas?"
                </h2>
                <div className="spark-page__options">
                    <button className="spark-page__option glass">Su honestidad</button>
                    <button className="spark-page__option glass">Su empatía</button>
                    <button className="spark-page__option glass">Su ambición</button>
                    <button className="spark-page__option glass">Su sentido del humor</button>
                </div>
            </div>

            <div className="spark-page__nav">
                <button className="spark-page__nav-btn glass" disabled>
                    <ChevronLeft size={18} />
                </button>
                <span className="spark-page__date">Hoy</span>
                <button className="spark-page__nav-btn glass" disabled>
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Insight */}
            <div className="spark-page__insight glass animate-fade-in-up">
                <h3>💡 Tu patrón</h3>
                <p>Tus respuestas recientes muestran una fuerte conexión con la <strong>empatía</strong> y los <strong>valores familiares</strong>.</p>
            </div>
        </div>
    )
}
