import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../verification/Verification.css'

const questions = [
    { id: 'ici_1', text: 'Cuando algo no sale como espero, siento que no puedo soportarlo.' },
    { id: 'ici_2', text: 'Si mi pareja cambia de planes, me resulta difícil adaptarme.' },
    { id: 'ici_3', text: 'Necesito que las cosas funcionen como las planeo.' },
    { id: 'ici_4', text: 'Me resulta difícil aceptar lo que no puedo controlar.' },
]

const options = [
    { value: 1, label: 'Nunca' },
    { value: 2, label: 'Pocas veces' },
    { value: 3, label: 'A veces' },
    { value: 4, label: 'Muchas veces' },
    { value: 5, label: 'Siempre' },
]

function getResult(score: number) {
    // Inverted: high score = lower tolerance
    const inverted = 24 - score // Range 4-20
    if (inverted >= 16) return { level: '🟢 Alta', color: 'var(--freq-high)', action: 'Fortaleza: suma a tus factores positivos en matching.' }
    if (inverted >= 11) return { level: '🟡 Media', color: 'var(--freq-mid)', action: 'Módulo de resiliencia sugerido para fortalecer esta área.' }
    if (inverted >= 6) return { level: '🟠 Baja', color: 'var(--freq-dev)', action: 'Módulo + Daily Spark enfocado en tolerancia y flexibilidad.' }
    return { level: '🔴 Muy baja', color: 'var(--freq-critical)', action: 'Sugerimos apoyo profesional. Consulta el directorio de profesionales en LovIA!' }
}

export default function FrustrationTolerance() {
    const navigate = useNavigate()
    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [showResult, setShowResult] = useState(false)

    const handleAnswer = (qId: string, value: number) => {
        setAnswers((prev) => ({ ...prev, [qId]: value }))
    }

    const canNext = answers[questions[currentQ]?.id] !== undefined
    const allDone = Object.keys(answers).length === questions.length

    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
    const result = getResult(totalScore)

    if (showResult) {
        return (
            <div className="psych-eval">
                <div className="psych-eval__result glass-strong animate-fade-in-up">
                    <h3>Tolerancia a la Frustración</h3>
                    <div className="psych-eval__result-score" style={{ color: result.color }}>
                        {24 - totalScore}/20
                    </div>
                    <div className="psych-eval__result-level" style={{ color: result.color }}>
                        {result.level}
                    </div>
                    <p className="psych-eval__result-action">{result.action}</p>
                </div>

                <button
                    className="match-detail__accept"
                    onClick={() => navigate('/profile')}
                >
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
                <h2>Tolerancia a la Frustración</h2>
            </div>

            <div className="psych-eval__disclaimer glass">
                ⚠️ Esta evaluación NO sustituye diagnóstico profesional.
                Es un screening validado (ICI — UNAM) que orienta hacia recursos cuando se detectan indicadores.
            </div>

            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                Pregunta {currentQ + 1} de {questions.length}
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
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                {currentQ > 0 && (
                    <button
                        className="match-detail__decline"
                        onClick={() => setCurrentQ((c) => c - 1)}
                    >
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
