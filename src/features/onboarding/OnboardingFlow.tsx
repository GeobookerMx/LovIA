import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { level1Questions, pss4Questions, pss4Options } from './questionData'
import { calculateFrequency, type OnboardingResults } from './scoring'
import QuestionCard from './QuestionCard'
import PSS4Card from './PSS4Card'
import FrequencyResult from './FrequencyResult'
import './Onboarding.css'

type Phase = 'welcome' | 'pss4' | 'questions' | 'calculating' | 'result'

export default function OnboardingFlow() {
    const navigate = useNavigate()
    const [phase, setPhase] = useState<Phase>('welcome')
    const [pssIndex, setPssIndex] = useState(0)
    const [pssAnswers, setPssAnswers] = useState<Record<string, number>>({})
    const [qIndex, setQIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string | number>>({})
    const [result, setResult] = useState<OnboardingResults | null>(null)

    const totalSteps = pss4Questions.length + level1Questions.length
    const currentStep =
        phase === 'pss4' ? pssIndex + 1 :
            phase === 'questions' ? pss4Questions.length + qIndex + 1 :
                0
    const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

    // ── PSS-4 handlers ──
    const handlePssAnswer = useCallback((value: number) => {
        const q = pss4Questions[pssIndex]
        setPssAnswers((prev) => ({ ...prev, [q.id]: value }))

        setTimeout(() => {
            if (pssIndex < pss4Questions.length - 1) {
                setPssIndex((i) => i + 1)
            } else {
                setPhase('questions')
            }
        }, 400)
    }, [pssIndex])

    // ── Question handlers ──
    const handleAnswer = useCallback((questionId: string, value: string | number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
    }, [])

    const goNext = useCallback(() => {
        const q = level1Questions[qIndex]
        if (answers[q.id] === undefined) return

        if (qIndex < level1Questions.length - 1) {
            setQIndex((i) => i + 1)
        } else {
            // All done — calculate
            setPhase('calculating')
            setTimeout(() => {
                const res = calculateFrequency(answers, pssAnswers)
                setResult(res)
                setPhase('result')
            }, 2500)
        }
    }, [qIndex, answers, pssAnswers])

    const goBack = useCallback(() => {
        if (phase === 'questions' && qIndex > 0) {
            setQIndex((i) => i - 1)
        } else if (phase === 'questions' && qIndex === 0) {
            setPhase('pss4')
            setPssIndex(pss4Questions.length - 1)
        } else if (phase === 'pss4' && pssIndex > 0) {
            setPssIndex((i) => i - 1)
        }
    }, [phase, qIndex, pssIndex])

    // ── Welcome ──
    if (phase === 'welcome') {
        return (
            <div className="onboarding">
                <div className="onboarding__welcome animate-fade-in">
                    <div className="onboarding__welcome-icon animate-heartbeat">
                        <Sparkles size={48} color="var(--love-rose)" />
                    </div>
                    <h1>Descubre tu <span className="text-gradient">Frecuencia</span></h1>
                    <p>
                        Responderás <strong>14 preguntas</strong> que nos ayudarán a entender
                        tu momento de vida y calcular tu perfil relacional inicial.
                    </p>
                    <ul className="onboarding__welcome-list">
                        <li>⏱️ ~5 minutos</li>
                        <li>🔒 100% confidencial</li>
                        <li>🧠 Basado en investigación científica</li>
                        <li>📊 Sin respuestas correctas o incorrectas</li>
                    </ul>
                    <button className="onboarding__cta" onClick={() => setPhase('pss4')}>
                        Comenzar <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )
    }

    // ── Calculating ──
    if (phase === 'calculating') {
        return (
            <div className="onboarding">
                <div className="onboarding__calculating">
                    <div className="onboarding__calc-orbs">
                        <div className="onboarding__orb onboarding__orb--love" />
                        <div className="onboarding__orb onboarding__orb--sex" />
                        <div className="onboarding__orb onboarding__orb--real" />
                    </div>
                    <h2 className="animate-pulse-soft">Calculando tu Frecuencia...</h2>
                    <p>Analizando tus respuestas con nuestro algoritmo</p>
                </div>
            </div>
        )
    }

    // ── Result ──
    if (phase === 'result' && result) {
        return <FrequencyResult result={result} onContinue={() => navigate('/home')} />
    }

    // ── PSS-4 + Questions ──
    return (
        <div className="onboarding">
            {/* Progress bar */}
            <div className="onboarding__top-bar">
                <button
                    className="onboarding__back"
                    onClick={goBack}
                    disabled={phase === 'pss4' && pssIndex === 0}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="onboarding__progress">
                    <div className="onboarding__progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <span className="onboarding__step-count">{currentStep}/{totalSteps}</span>
            </div>

            {/* Card area */}
            <div className="onboarding__card-area">
                {phase === 'pss4' && (
                    <PSS4Card
                        key={pss4Questions[pssIndex].id}
                        question={pss4Questions[pssIndex]}
                        options={pss4Options}
                        selected={pssAnswers[pss4Questions[pssIndex].id]}
                        onSelect={handlePssAnswer}
                        index={pssIndex}
                    />
                )}

                {phase === 'questions' && (
                    <>
                        <QuestionCard
                            key={level1Questions[qIndex].id}
                            question={level1Questions[qIndex]}
                            answer={answers[level1Questions[qIndex].id]}
                            onAnswer={(val: string | number) => handleAnswer(level1Questions[qIndex].id, val)}
                        />
                        <button
                            className="onboarding__next"
                            onClick={goNext}
                            disabled={answers[level1Questions[qIndex].id] === undefined}
                        >
                            {qIndex === level1Questions.length - 1 ? 'Ver mi resultado' : 'Siguiente'}
                            <ArrowRight size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
