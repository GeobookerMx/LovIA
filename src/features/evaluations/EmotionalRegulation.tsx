import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../verification/Verification.css'

const questions = [
    // Reevaluación Cognitiva (CR) — 6 items
    { id: 'erq_1', text: 'Cuando quiero sentir una emoción más positiva, cambio mi manera de pensar sobre la situación.', sub: 'CR' },
    { id: 'erq_3', text: 'Cuando quiero sentirme menos negativo/a, cambio mi forma de pensar sobre la situación.', sub: 'CR' },
    { id: 'erq_5', text: 'Cuando enfrento una situación estresante, me obligo a pensar de una manera que me ayude a mantener la calma.', sub: 'CR' },
    { id: 'erq_7', text: 'Cuando quiero sentir una emoción más positiva sobre algo, cambio la forma en que pienso en ello.', sub: 'CR' },
    { id: 'erq_8', text: 'Controlo mis emociones cambiando mi manera de pensar sobre la situación en la que estoy.', sub: 'CR' },
    { id: 'erq_10', text: 'Cuando quiero sentirme menos negativo/a sobre algo, cambio la forma en que pienso en ello.', sub: 'CR' },
    // Supresión Expresiva (ES) — 4 items
    { id: 'erq_2', text: 'Mantengo mis emociones para mí mismo/a.', sub: 'ES' },
    { id: 'erq_4', text: 'Cuando estoy sintiendo emociones positivas, tengo cuidado de no expresarlas.', sub: 'ES' },
    { id: 'erq_6', text: 'Controlo mis emociones no expresándolas.', sub: 'ES' },
    { id: 'erq_9', text: 'Cuando estoy sintiendo emociones negativas, me aseguro de no expresarlas.', sub: 'ES' },
]

const options = [
    { value: 1, label: 'Totalmente\nen desacuerdo' },
    { value: 2, label: 'En\ndesacuerdo' },
    { value: 3, label: 'Algo en\ndesacuerdo' },
    { value: 4, label: 'Neutral' },
    { value: 5, label: 'Algo de\nacuerdo' },
    { value: 6, label: 'De\nacuerdo' },
    { value: 7, label: 'Totalmente\nde acuerdo' },
]

export default function EmotionalRegulation() {
    const navigate = useNavigate()
    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [showResult, setShowResult] = useState(false)

    const handleAnswer = (qId: string, value: number) => {
        setAnswers((prev) => ({ ...prev, [qId]: value }))
    }

    const canNext = answers[questions[currentQ]?.id] !== undefined
    const allDone = Object.keys(answers).length === questions.length

    // Calculate subscale scores
    const crItems = questions.filter((q) => q.sub === 'CR')
    const esItems = questions.filter((q) => q.sub === 'ES')
    const crScore = crItems.reduce((sum, q) => sum + (answers[q.id] || 0), 0) / crItems.length
    const esScore = esItems.reduce((sum, q) => sum + (answers[q.id] || 0), 0) / esItems.length

    const crLevel = crScore >= 5 ? { label: '🟢 Alta', color: 'var(--freq-high)' } :
        crScore >= 3.5 ? { label: '🟡 Media', color: 'var(--freq-mid)' } :
            { label: '🔴 Baja', color: 'var(--freq-low)' }

    const esLevel = esScore >= 5 ? { label: '🔴 Alta supresión', color: 'var(--freq-low)' } :
        esScore >= 3.5 ? { label: '🟡 Media', color: 'var(--freq-mid)' } :
            { label: '🟢 Baja supresión', color: 'var(--freq-high)' }

    if (showResult) {
        return (
            <div className="psych-eval">
                <div className="psych-eval__header animate-fade-in-up">
                    <h2>Regulación Emocional</h2>
                </div>

                <div className="psych-eval__result glass-strong animate-fade-in-up">
                    <h3 style={{ marginBottom: 'var(--space-3)' }}>Reevaluación Cognitiva</h3>
                    <div className="psych-eval__result-score" style={{ color: crLevel.color }}>
                        {crScore.toFixed(1)}/7
                    </div>
                    <div className="psych-eval__result-level" style={{ color: crLevel.color }}>
                        {crLevel.label}
                    </div>
                    <p className="psych-eval__result-action">
                        Capacidad de cambiar tu interpretación para regular emociones.
                    </p>
                </div>

                <div className="psych-eval__result glass-strong animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h3 style={{ marginBottom: 'var(--space-3)' }}>Supresión Expresiva</h3>
                    <div className="psych-eval__result-score" style={{ color: esLevel.color }}>
                        {esScore.toFixed(1)}/7
                    </div>
                    <div className="psych-eval__result-level" style={{ color: esLevel.color }}>
                        {esLevel.label}
                    </div>
                    <p className="psych-eval__result-action">
                        Tendencia a ocultar emociones. Alta supresión puede reducir bienestar.
                    </p>
                </div>

                <button className="match-detail__accept" onClick={() => navigate('/profile')}>
                    Continuar
                </button>
            </div>
        )
    }

    return (
        <div className="psych-eval">
            <div className="meeting-plan__header">
                <button className="meeting-plan__back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Regulación Emocional</h2>
            </div>

            <div className="psych-eval__disclaimer glass">
                ⚠️ ERQ validado en muestras mexicanas. Mide dos estrategias:
                Reevaluación Cognitiva (adaptar pensamiento) y Supresión Expresiva (ocultar emociones).
            </div>

            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                Pregunta {currentQ + 1} de {questions.length}
                <span style={{ marginLeft: 'var(--space-2)', opacity: 0.6 }}>
                    ({questions[currentQ].sub === 'CR' ? 'Reevaluación' : 'Supresión'})
                </span>
            </p>

            <div className="psych-eval__question glass-strong animate-fade-in-up" key={currentQ}>
                <p>"{questions[currentQ].text}"</p>
                <div className="psych-eval__likert">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            className={`psych-eval__likert-btn ${answers[questions[currentQ].id] === opt.value ? 'psych-eval__likert-btn--selected' : ''
                                }`}
                            onClick={() => handleAnswer(questions[currentQ].id, opt.value)}
                        >
                            {opt.value}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                    <span>Totalmente en desacuerdo</span>
                    <span>Totalmente de acuerdo</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                {currentQ > 0 && (
                    <button className="match-detail__decline" onClick={() => setCurrentQ((c) => c - 1)}>
                        <ArrowLeft size={14} /> Anterior
                    </button>
                )}
                {currentQ < questions.length - 1 ? (
                    <button
                        className="match-detail__accept"
                        onClick={() => setCurrentQ((c) => c + 1)}
                        disabled={!canNext}
                        style={{ opacity: canNext ? 1 : 0.5 }}
                    >
                        Siguiente <ArrowRight size={14} />
                    </button>
                ) : (
                    <button
                        className="match-detail__accept"
                        onClick={() => setShowResult(true)}
                        disabled={!allDone}
                        style={{ opacity: allDone ? 1 : 0.5 }}
                    >
                        Ver resultado
                    </button>
                )}
            </div>
        </div>
    )
}
