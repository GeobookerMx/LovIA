import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { momentoDeVidaQuestions, vinculoQuestions, pss4Questions, pss4Options } from './questionData'
import { calculateReadiness, calculateFrequency, type OnboardingResults } from './scoring'
import QuestionCard from './QuestionCard'
import PSS4Card from './PSS4Card'
import FrequencyResult from './FrequencyResult'
import './Onboarding.css'

import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'

type Phase = 'welcome' | 'questions' | 'pss4' | 'calculating' | 'result'

// Combinar ambos tests para el flujo de preguntas principales
const allQuestions = [...momentoDeVidaQuestions, ...vinculoQuestions]
const TOTAL_STEPS = allQuestions.length + pss4Questions.length

export default function OnboardingFlow() {
    const navigate = useNavigate()
    const { user, updateProfile } = useAuthStore()
    const [phase, setPhase] = useState<Phase>('welcome')
    const [qIndex, setQIndex] = useState(0)
    const [pssIndex, setPssIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string | number>>({})
    const [pssAnswers, setPssAnswers] = useState<Record<string, number>>({})
    const [needsSupport, setNeedsSupport] = useState(false)
    const [freqResult, setFreqResult] = useState<OnboardingResults | null>(null)

    // Progreso continuo a través de ambas fases
    const currentStep =
        phase === 'questions' ? qIndex + 1 :
        phase === 'pss4'      ? allQuestions.length + pssIndex + 1 : 0
    const progress = TOTAL_STEPS > 0 ? (currentStep / TOTAL_STEPS) * 100 : 0

    // ── Handlers: preguntas principales ──
    const handleAnswer = useCallback((questionId: string, value: string | number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
    }, [])

    const handlePssAnswer = useCallback((value: number) => {
        const qId = pss4Questions[pssIndex].id
        setPssAnswers((prev) => ({ ...prev, [qId]: value }))
    }, [pssIndex])

    const goNext = useCallback(() => {
        const q = allQuestions[qIndex]
        if (answers[q.id] === undefined) return

        if (qIndex < allQuestions.length - 1) {
            setQIndex((i) => i + 1)
        } else {
            // Fin de preguntas principales → pasar a PSS-4
            setPhase('pss4')
        }
    }, [qIndex, answers])

    const goNextPss = useCallback(() => {
        const qId = pss4Questions[pssIndex].id
        if (pssAnswers[qId] === undefined) return

        if (pssIndex < pss4Questions.length - 1) {
            setPssIndex((i) => i + 1)
        } else {
            // Fin de PSS-4 → calcular
            setPhase('calculating')
            setTimeout(async () => {
                const readiness = calculateReadiness(answers)
                const freq      = calculateFrequency(answers, pssAnswers)

                if (user) {
                    await supabase.from('assessments_raw').insert({
                        user_id:   user.id,
                        test_type: 'momento_vida_pss4',
                        answers:   { ...answers, ...pssAnswers },
                    })

                    await supabase.from('assessment_scores').update({
                        readiness_score:   readiness.readinessScore,
                        needs_support:     readiness.needsSupport,
                        frequency_score:   freq.frequency,
                        stress_level:      freq.stressLevel,
                        last_calculated_at: new Date().toISOString(),
                    }).eq('id', user.id)
                }

                await updateProfile({ onboarding_completed: true })

                setNeedsSupport(readiness.needsSupport)
                setFreqResult(freq)
                setPhase('result')
            }, 2500)
        }
    }, [pssIndex, pssAnswers, answers, updateProfile, user])

    const goBack = useCallback(() => {
        if (phase === 'questions' && qIndex > 0) setQIndex((i) => i - 1)
        if (phase === 'pss4' && pssIndex > 0)   setPssIndex((i) => i - 1)
        if (phase === 'pss4' && pssIndex === 0)  setPhase('questions')
    }, [phase, qIndex, pssIndex])

    // ── Welcome ──
    if (phase === 'welcome') {
        return (
            <div className="onboarding">
                <div className="onboarding__welcome animate-fade-in">
                    <div className="onboarding__welcome-icon animate-heartbeat">
                        <Sparkles size={48} color="var(--love-rose)" />
                    </div>
                    <h1>Tu Mapa de <span className="text-gradient">Momento de Vida</span></h1>
                    <p>
                        No buscamos enamorarte a la fuerza. Primero queremos entender
                        <strong> desde qué parte de ti te quieres vincular</strong>.
                    </p>
                    <ul className="onboarding__welcome-list">
                        <li>⏱️ ~3 minutos de honestidad pura</li>
                        <li>🔒 100% privado (no lo verán otros perfiles)</li>
                        <li>📚 Basado en el libro <strong>Evolución de las Relaciones de Pareja</strong> por J. P. Peña García</li>
                        <li>🪞 Respuestas reales logísticas y emocionales</li>
                    </ul>
                    <button className="onboarding__cta" onClick={() => setPhase('questions')}>
                        Comenzar Introspección <ArrowRight size={18} />
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
                    <h2 className="animate-pulse-soft">Calculando tu Frecuencia de Relación...</h2>
                    <p>Procesando las 3 líneas + PSS-4</p>
                </div>
            </div>
        )
    }

    // ── Result — FrequencyResult con lógica de soporte preservada ──
    if (phase === 'result' && freqResult) {
        const onContinue = needsSupport
            ? () => navigate('/community')
            : () => navigate('/home')

        return (
            <>
                <FrequencyResult result={freqResult} onContinue={onContinue} />
                {needsSupport && (
                    <div style={{ padding: '0 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button className="onboarding__cta onboarding__cta--outline" onClick={() => navigate('/home')}>
                            Continuar a la app de todos modos
                        </button>
                    </div>
                )}
            </>
        )
    }

    // ── Questions + PSS-4 (comparten la barra de progreso) ──
    return (
        <div className="onboarding">
            {/* Barra de progreso continua */}
            <div className="onboarding__top-bar">
                <button
                    className="onboarding__back"
                    onClick={goBack}
                    disabled={phase === 'questions' && qIndex === 0}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="onboarding__progress">
                    <div className="onboarding__progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <span className="onboarding__step-count">{currentStep}/{TOTAL_STEPS}</span>
            </div>

            {/* Card area */}
            <div className="onboarding__card-area">
                {phase === 'questions' && (
                    <>
                        <QuestionCard
                            key={allQuestions[qIndex].id}
                            question={allQuestions[qIndex]}
                            answer={answers[allQuestions[qIndex].id]}
                            onAnswer={(val: string | number) => handleAnswer(allQuestions[qIndex].id, val)}
                        />
                        <button
                            className="onboarding__next"
                            onClick={goNext}
                            disabled={answers[allQuestions[qIndex].id] === undefined}
                        >
                            {qIndex === allQuestions.length - 1 ? 'Continuar a Bienestar' : 'Siguiente'}
                            <ArrowRight size={18} />
                        </button>
                    </>
                )}

                {phase === 'pss4' && (
                    <>
                        <PSS4Card
                            key={pss4Questions[pssIndex].id}
                            question={pss4Questions[pssIndex] as any}
                            options={pss4Options}
                            selected={pssAnswers[pss4Questions[pssIndex].id]}
                            onSelect={handlePssAnswer}
                            index={pssIndex}
                        />
                        <button
                            className="onboarding__next"
                            onClick={goNextPss}
                            disabled={pssAnswers[pss4Questions[pssIndex].id] === undefined}
                        >
                            {pssIndex === pss4Questions.length - 1 ? 'Ver mi Frecuencia' : 'Siguiente'}
                            <ArrowRight size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
