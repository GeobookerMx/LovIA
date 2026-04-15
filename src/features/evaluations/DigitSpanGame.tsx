/**
 * LovIA! — Digit Span Game (Gate Nivel 3)
 *
 * Cognitive test based on the Digit Span task from the WAIS
 * (Wechsler Adult Intelligence Scale).
 * Measures working memory capacity — a core executive function.
 *
 * Scientific basis:
 * - Wechsler, D. (2008). WAIS-IV Administration and Scoring Manual.
 * - Baddeley, A. (2003). Working memory: Looking back and looking forward.
 *   Nature Reviews Neuroscience, 4, 829–839.
 * - Engle, R.W. (2002). Working memory capacity as executive attention.
 *   Current Directions in Psychological Science, 11(1), 19–23.
 *
 * How it works:
 * 1. A sequence of digits appears one by one
 * 2. User must recall the sequence in the same order
 * 3. Difficulty increases progressively (3 → up to 9 digits)
 * 4. Two consecutive failures at any level ends the test
 * 5. Maximum span achieved correlates with working memory capacity
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, Zap, Award, RotateCcw, Delete } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../verification/Verification.css'

const MIN_SPAN = 3
const MAX_SPAN = 9
const DIGIT_DISPLAY_MS = 800
const DIGIT_PAUSE_MS = 300

function generateSequence(length: number): number[] {
    const seq: number[] = []
    for (let i = 0; i < length; i++) {
        let digit: number
        do {
            digit = Math.floor(Math.random() * 10) // 0-9
        } while (seq.length > 0 && digit === seq[seq.length - 1]) // no repeats in a row
        seq.push(digit)
    }
    return seq
}

function getDigitSpanScore(maxSpan: number): { score: number; level: string; color: string; description: string } {
    // Normal adult span: 5-9 digits (mean ~7, Baddeley/Miller)
    if (maxSpan >= 7) return { score: maxSpan, level: '🟢 Memoria de trabajo alta', color: 'var(--freq-high)', description: `Tu span de ${maxSpan} dígitos es excelente. La investigación de Engle (2002) muestra que alta capacidad de working memory correlaciona con mejor resolución de conflictos en pareja.` }
    if (maxSpan >= 5) return { score: maxSpan, level: '🟡 Memoria de trabajo normal', color: 'var(--freq-mid)', description: `Tu span de ${maxSpan} dígitos está en el rango normal (5-9, Miller 1956). Tu capacidad de working memory te permite manejar adecuadamente las demandas cognitivas de una relación.` }
    if (maxSpan >= 4) return { score: maxSpan, level: '🟠 Memoria de trabajo en desarrollo', color: 'var(--freq-dev)', description: `Tu span de ${maxSpan} dígitos está ligeramente por debajo del promedio. Se recomiendan ejercicios de entrenamiento cognitivo para fortalecer esta área.` }
    return { score: maxSpan, level: '🔴 Requiere atención', color: 'var(--freq-critical)', description: `Tu span de ${maxSpan} dígitos sugiere que la memoria de trabajo puede beneficiarse de ejercicios específicos. Considera consultar con un profesional.` }
}

type Phase = 'instructions' | 'showing' | 'recalling' | 'feedback' | 'result'

export default function DigitSpanGame() {
    const navigate = useNavigate()
    const [phase, setPhase] = useState<Phase>('instructions')
    const [currentSpan, setCurrentSpan] = useState(MIN_SPAN)
    const [sequence, setSequence] = useState<number[]>([])
    const [displayIndex, setDisplayIndex] = useState(-1)
    const [userInput, setUserInput] = useState<number[]>([])
    const [consecutiveFailures, setConsecutiveFailures] = useState(0)
    const [maxSpanReached, setMaxSpanReached] = useState(0)
    const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
    const [trialInSpan, setTrialInSpan] = useState(0)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const startNewSequence = useCallback((span: number) => {
        const seq = generateSequence(span)
        setSequence(seq)
        setUserInput([])
        setDisplayIndex(-1)
        setPhase('showing')
    }, [])

    const startGame = useCallback(() => {
        setCurrentSpan(MIN_SPAN)
        setMaxSpanReached(0)
        setConsecutiveFailures(0)
        setTrialInSpan(0)
        startNewSequence(MIN_SPAN)
    }, [startNewSequence])

    // Show digits one at a time
    useEffect(() => {
        if (phase !== 'showing') return

        if (displayIndex < sequence.length - 1) {
            timerRef.current = setTimeout(() => {
                setDisplayIndex(i => i + 1)
            }, displayIndex === -1 ? DIGIT_PAUSE_MS : DIGIT_DISPLAY_MS + DIGIT_PAUSE_MS)
        } else if (displayIndex === sequence.length - 1) {
            timerRef.current = setTimeout(() => {
                setDisplayIndex(-1)
                setPhase('recalling')
            }, DIGIT_DISPLAY_MS)
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [phase, displayIndex, sequence])

    const handleDigitPress = (digit: number) => {
        if (phase !== 'recalling') return
        const newInput = [...userInput, digit]
        setUserInput(newInput)

        if (newInput.length === sequence.length) {
            // Check answer
            const correct = newInput.every((d, i) => d === sequence[i])
            setLastCorrect(correct)
            setPhase('feedback')

            setTimeout(() => {
                if (correct) {
                    const newMax = Math.max(maxSpanReached, currentSpan)
                    setMaxSpanReached(newMax)
                    setConsecutiveFailures(0)

                    if (currentSpan < MAX_SPAN) {
                        const nextSpan = currentSpan + 1
                        setCurrentSpan(nextSpan)
                        setTrialInSpan(0)
                        startNewSequence(nextSpan)
                    } else {
                        setPhase('result')
                    }
                } else {
                    const newFailures = consecutiveFailures + 1
                    setConsecutiveFailures(newFailures)

                    if (newFailures >= 2) {
                        // Two failures at this level → test ends
                        setPhase('result')
                    } else {
                        // Try again at same level
                        setTrialInSpan(t => t + 1)
                        startNewSequence(currentSpan)
                    }
                }
            }, 1200)
        }
    }

    const handleDelete = () => {
        if (phase !== 'recalling' || userInput.length === 0) return
        setUserInput(prev => prev.slice(0, -1))
    }

    const result = (phase === 'result') ? getDigitSpanScore(Math.max(maxSpanReached, consecutiveFailures < 2 ? currentSpan : maxSpanReached)) : null

    // Instructions
    if (phase === 'instructions') {
        return (
            <div className="psych-eval">
                <div className="meeting-plan__header">
                    <button className="meeting-plan__back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Digit Span</h2>
                </div>

                <div className="psych-eval__disclaimer glass">
                    🧠 Gate Nivel 3 — Evalúa tu memoria de trabajo (working memory).
                </div>

                <div className="psych-eval__question glass-strong animate-fade-in-up">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                        <Zap size={40} color="var(--line-realization)" />
                    </div>
                    <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>¿Cómo funciona?</h3>
                    <div style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            Se mostrarán dígitos <strong style={{ color: 'var(--text-primary)' }}>uno por uno</strong>.
                            Después, deberás repetir la secuencia en el <strong style={{ color: 'var(--line-realization)' }}>mismo orden</strong>.
                        </p>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            Se comienza con <strong>3 dígitos</strong> y la dificultad aumenta progresivamente hasta un máximo de 9.
                        </p>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            El test termina cuando fallas <strong>2 veces consecutivas</strong> en el mismo nivel.
                        </p>
                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                            🔬 Basado en: WAIS-IV (Wechsler, 2008) · Baddeley (2003) Working Memory
                        </p>
                    </div>
                </div>

                <button className="match-detail__accept" onClick={startGame}>
                    Comenzar Test
                </button>
            </div>
        )
    }

    // Result
    if (phase === 'result' && result) {
        return (
            <div className="psych-eval">
                <div className="psych-eval__result glass-strong animate-fade-in-up">
                    <Award size={36} color={result.color} style={{ margin: '0 auto var(--space-3)', display: 'block' }} />
                    <h3>Digit Span — Resultado</h3>
                    <div className="psych-eval__result-score" style={{ color: result.color }}>
                        {result.score} dígitos
                    </div>
                    <div className="psych-eval__result-level" style={{ color: result.color }}>
                        {result.level}
                    </div>

                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: 'var(--space-2)',
                        margin: 'var(--space-4) 0',
                    }}>
                        {Array.from({ length: MAX_SPAN }, (_, i) => i + 1).map(n => (
                            <div key={n} style={{
                                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)',
                                background: n <= result.score ? `${result.color}` : 'var(--bg-glass)',
                                color: n <= result.score ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                                opacity: n <= result.score ? 1 : 0.4,
                            }}>
                                {n}
                            </div>
                        ))}
                    </div>

                    <p className="psych-eval__result-action">{result.description}</p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="match-detail__decline" onClick={startGame}>
                        <RotateCcw size={14} /> Reintentar
                    </button>
                    <button className="match-detail__accept" onClick={() => navigate('/profile')}>
                        Continuar
                    </button>
                </div>
            </div>
        )
    }

    // Showing digits / Recalling / Feedback
    return (
        <div className="psych-eval">
            <div className="meeting-plan__header">
                <button className="meeting-plan__back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Digit Span</h2>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                <span>Nivel: {currentSpan} dígitos</span>
                <span>Máx alcanzado: {maxSpanReached || '–'}</span>
            </div>

            {/* Progress */}
            <div style={{
                display: 'flex', gap: 4, justifyContent: 'center', margin: 'var(--space-2) 0',
            }}>
                {Array.from({ length: MAX_SPAN - MIN_SPAN + 1 }, (_, i) => MIN_SPAN + i).map(n => (
                    <div key={n} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: n <= currentSpan ? 'var(--gradient-accent)' : 'var(--bg-glass)',
                        opacity: n <= currentSpan ? 1 : 0.3,
                        transition: 'all 0.3s ease',
                    }} />
                ))}
            </div>

            {/* Display area */}
            <div
                className="psych-eval__question glass-strong"
                style={{
                    textAlign: 'center',
                    padding: 'var(--space-8)',
                    minHeight: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: phase === 'feedback' ? (lastCorrect ? 'var(--success)' : 'var(--danger)') : 'transparent',
                    borderWidth: 2,
                    borderStyle: 'solid',
                    transition: 'border-color 0.3s',
                }}
            >
                {phase === 'showing' && displayIndex >= 0 && (
                    <>
                        <span style={{
                            fontFamily: 'var(--font-accent)',
                            fontSize: '4rem',
                            fontWeight: 'var(--fw-bold)',
                            color: 'var(--text-primary)',
                            animation: 'fadeIn 0.2s ease',
                        }}>
                            {sequence[displayIndex]}
                        </span>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                            Observa y memoriza...
                        </span>
                    </>
                )}
                {phase === 'showing' && displayIndex === -1 && (
                    <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>
                        Preparándose...
                    </span>
                )}
                {phase === 'recalling' && (
                    <>
                        <div style={{
                            display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)',
                            minHeight: 48, alignItems: 'center',
                        }}>
                            {sequence.map((_, i) => (
                                <div key={i} style={{
                                    width: 40, height: 48, borderRadius: 'var(--radius-sm)',
                                    border: `2px ${i < userInput.length ? 'solid var(--line-realization)' : 'dashed var(--border-default)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'var(--font-accent)', fontSize: 'var(--fs-xl)',
                                    fontWeight: 'var(--fw-bold)',
                                    color: i < userInput.length ? 'var(--text-primary)' : 'transparent',
                                    background: i < userInput.length ? 'rgba(34,211,238,0.08)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                }}>
                                    {userInput[i] ?? ''}
                                </div>
                            ))}
                        </div>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                            Ingresa la secuencia ({userInput.length}/{sequence.length})
                        </span>
                    </>
                )}
                {phase === 'feedback' && (
                    <div style={{ textAlign: 'center' }}>
                        <span style={{
                            fontSize: '2.5rem',
                            display: 'block',
                            marginBottom: 'var(--space-2)',
                        }}>
                            {lastCorrect ? '✅' : '❌'}
                        </span>
                        <span style={{
                            fontSize: 'var(--fs-sm)',
                            color: lastCorrect ? 'var(--success)' : 'var(--danger)',
                            fontWeight: 'var(--fw-semibold)',
                        }}>
                            {lastCorrect ? '¡Correcto!' : `Incorrecto — era: ${sequence.join(' ')}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Numpad */}
            {phase === 'recalling' && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 'var(--space-2)', maxWidth: 320, margin: '0 auto',
                }}>
                    {Array.from({ length: 10 }, (_, i) => i).map(digit => (
                        <button
                            key={digit}
                            onClick={() => handleDigitPress(digit)}
                            style={{
                                padding: 'var(--space-3)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-default)',
                                background: 'var(--bg-glass)',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-accent)',
                                fontSize: 'var(--fs-lg)',
                                fontWeight: 'var(--fw-bold)',
                                cursor: 'pointer',
                                transition: 'all var(--duration-fast)',
                            }}
                        >
                            {digit}
                        </button>
                    ))}
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-default)',
                            background: 'rgba(255,107,138,0.1)',
                            color: 'var(--line-love)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Delete size={18} />
                    </button>
                </div>
            )}

            {/* Trial info */}
            {trialInSpan > 0 && phase !== 'feedback' && (
                <p style={{ textAlign: 'center', fontSize: 'var(--fs-xs)', color: 'var(--warning)' }}>
                    Intento {trialInSpan + 1} en nivel {currentSpan}
                </p>
            )}
        </div>
    )
}
