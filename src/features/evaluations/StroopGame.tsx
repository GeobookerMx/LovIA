/**
 * LovIA! — Stroop Game (Gate Nivel 2)
 *
 * Cognitive test based on the Stroop Effect (Stroop, 1935).
 * Measures selective attention and cognitive control — predictors of
 * emotional regulation capacity in relationships.
 *
 * Scientific basis:
 * - Stroop, J.R. (1935). Studies of interference in serial verbal reactions.
 *   Journal of Experimental Psychology, 18(6), 643–662.
 * - Miyake, A. et al. (2000). The unity and diversity of executive functions.
 *   Cognitive Psychology, 41, 49–100.
 *
 * How it works:
 * 1. User sees a color word (e.g., "ROJO") displayed in a different ink color
 * 2. User must tap the button matching the INK COLOR, not the word
 * 3. Measures reaction time and accuracy across 12 trials
 * 4. Score maps to cognitive flexibility (important for conflict resolution)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, Brain, Clock, Target, Award, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../verification/Verification.css'

type ColorKey = 'rojo' | 'azul' | 'verde' | 'amarillo'

interface ColorDef {
    label: string
    hex: string
}

const COLORS: Record<ColorKey, ColorDef> = {
    rojo: { label: 'ROJO', hex: '#FF6B8A' },
    azul: { label: 'AZUL', hex: '#3B82F6' },
    verde: { label: 'VERDE', hex: '#10B981' },
    amarillo: { label: 'AMARILLO', hex: '#FBBF24' },
}

const COLOR_KEYS: ColorKey[] = ['rojo', 'azul', 'verde', 'amarillo']

const TOTAL_TRIALS = 12

interface Trial {
    word: ColorKey      // The text displayed
    inkColor: ColorKey  // The color of the text (correct answer)
    congruent: boolean
}

function generateTrials(count: number): Trial[] {
    const trials: Trial[] = []
    for (let i = 0; i < count; i++) {
        const word = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)]
        let ink: ColorKey
        // 70% incongruent trials (harder)
        if (Math.random() < 0.7) {
            const others = COLOR_KEYS.filter(c => c !== word)
            ink = others[Math.floor(Math.random() * others.length)]
        } else {
            ink = word
        }
        trials.push({ word, inkColor: ink, congruent: word === ink })
    }
    return trials
}

interface TrialResult {
    trial: Trial
    answer: ColorKey
    correct: boolean
    reactionTime: number
}

function getStroopScore(results: TrialResult[]): { score: number; level: string; color: string; description: string } {
    const correct = results.filter(r => r.correct).length
    const accuracy = correct / results.length
    const avgRT = results.filter(r => r.correct).reduce((sum, r) => sum + r.reactionTime, 0) / (correct || 1)

    // Combined score: accuracy (60%) + speed (40%)
    const speedScore = Math.max(0, Math.min(1, (3000 - avgRT) / 2500))
    const combinedScore = Math.round((accuracy * 0.6 + speedScore * 0.4) * 100)

    if (combinedScore >= 80) return { score: combinedScore, level: '🟢 Alto control cognitivo', color: 'var(--freq-high)', description: 'Excelente capacidad de inhibición y atención selectiva. Esto correlaciona con mejor regulación emocional en conflictos de pareja.' }
    if (combinedScore >= 60) return { score: combinedScore, level: '🟡 Control adecuado', color: 'var(--freq-mid)', description: 'Capacidad normal de control cognitivo. Tu atención selectiva está en un rango funcional para manejar las complejidades de una relación.' }
    if (combinedScore >= 40) return { score: combinedScore, level: '🟠 Control en desarrollo', color: 'var(--freq-dev)', description: 'Tu control inhibitorio puede mejorar. Sugerimos ejercicios de mindfulness y atención plena.' }
    return { score: combinedScore, level: '🔴 Requiere fortalecimiento', color: 'var(--freq-critical)', description: 'El control cognitivo es un predictor de regulación emocional. Te recomendamos el módulo de atención y mindfulness.' }
}

export default function StroopGame() {
    const navigate = useNavigate()
    const [phase, setPhase] = useState<'instructions' | 'playing' | 'result'>('instructions')
    const [trials, setTrials] = useState<Trial[]>([])
    const [currentTrial, setCurrentTrial] = useState(0)
    const [results, setResults] = useState<TrialResult[]>([])
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
    const startTimeRef = useRef<number>(0)

    const startGame = useCallback(() => {
        setTrials(generateTrials(TOTAL_TRIALS))
        setCurrentTrial(0)
        setResults([])
        setPhase('playing')
    }, [])

    useEffect(() => {
        if (phase === 'playing') {
            startTimeRef.current = Date.now()
        }
    }, [phase, currentTrial])

    const handleAnswer = (answer: ColorKey) => {
        if (feedback) return // prevent double-tap

        const rt = Date.now() - startTimeRef.current
        const trial = trials[currentTrial]
        const correct = answer === trial.inkColor

        const result: TrialResult = { trial, answer, correct, reactionTime: rt }
        const newResults = [...results, result]
        setResults(newResults)

        setFeedback(correct ? 'correct' : 'incorrect')
        setTimeout(() => {
            setFeedback(null)
            if (currentTrial + 1 < TOTAL_TRIALS) {
                setCurrentTrial(c => c + 1)
            } else {
                setPhase('result')
            }
        }, 500)
    }

    const score = phase === 'result' ? getStroopScore(results) : null

    // Instructions
    if (phase === 'instructions') {
        return (
            <div className="psych-eval">
                <div className="meeting-plan__header">
                    <button className="meeting-plan__back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Test Stroop</h2>
                </div>

                <div className="psych-eval__disclaimer glass">
                    🧠 Gate Nivel 2 — Evalúa tu control cognitivo y atención selectiva.
                </div>

                <div className="psych-eval__question glass-strong animate-fade-in-up">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                        <Brain size={40} color="var(--line-sex)" />
                    </div>
                    <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>¿Cómo funciona?</h3>
                    <div style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            Verás una palabra de color (ej: <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>ROJO</span>)
                            escrita en un color diferente.
                        </p>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Tu tarea:</strong> Toca el botón del
                            <strong style={{ color: 'var(--line-love)' }}> COLOR de la tinta</strong>, no de la palabra.
                        </p>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            En el ejemplo, deberías tocar <strong style={{ color: '#3B82F6' }}>AZUL</strong>
                            (el color en que está escrito), no rojo (la palabra).
                        </p>
                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                            📊 {TOTAL_TRIALS} ensayos · Se mide precisión y velocidad
                        </p>
                    </div>
                </div>

                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
                    Basado en: Stroop, J.R. (1935). Studies of interference in serial verbal reactions.
                </div>

                <button className="match-detail__accept" onClick={startGame}>
                    Comenzar Test
                </button>
            </div>
        )
    }

    // Result
    if (phase === 'result' && score) {
        const correctCount = results.filter(r => r.correct).length
        const avgRT = results.filter(r => r.correct).reduce((s, r) => s + r.reactionTime, 0) / (correctCount || 1)

        return (
            <div className="psych-eval">
                <div className="psych-eval__result glass-strong animate-fade-in-up">
                    <Award size={36} color={score.color} style={{ margin: '0 auto var(--space-3)', display: 'block' }} />
                    <h3>Test Stroop — Resultado</h3>
                    <div className="psych-eval__result-score" style={{ color: score.color }}>
                        {score.score}/100
                    </div>
                    <div className="psych-eval__result-level" style={{ color: score.color }}>
                        {score.level}
                    </div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)',
                        margin: 'var(--space-4) 0', fontSize: 'var(--fs-xs)',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <Target size={16} color="var(--text-tertiary)" style={{ margin: '0 auto 4px' }} />
                            <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-bold)' }}>
                                {correctCount}/{TOTAL_TRIALS}
                            </div>
                            <div style={{ color: 'var(--text-tertiary)' }}>Aciertos</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Clock size={16} color="var(--text-tertiary)" style={{ margin: '0 auto 4px' }} />
                            <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-bold)' }}>
                                {Math.round(avgRT)}ms
                            </div>
                            <div style={{ color: 'var(--text-tertiary)' }}>Tiempo promedio</div>
                        </div>
                    </div>

                    <p className="psych-eval__result-action">{score.description}</p>
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

    // Playing
    const trial = trials[currentTrial]
    if (!trial) return null

    return (
        <div className="psych-eval">
            <div className="meeting-plan__header">
                <button className="meeting-plan__back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Test Stroop</h2>
            </div>

            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                Ensayo {currentTrial + 1} de {TOTAL_TRIALS}
            </p>

            {/* Progress bar */}
            <div style={{
                height: 4, background: 'var(--bg-glass)', borderRadius: 2, overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%', width: `${((currentTrial + 1) / TOTAL_TRIALS) * 100}%`,
                    background: 'var(--gradient-accent)', transition: 'width 0.3s ease',
                }} />
            </div>

            {/* Stimulus */}
            <div
                className={`psych-eval__question glass-strong ${feedback === 'correct' ? 'animate-fade-in' : ''}`}
                style={{
                    textAlign: 'center',
                    padding: 'var(--space-8)',
                    borderColor: feedback === 'correct' ? 'var(--success)' : feedback === 'incorrect' ? 'var(--danger)' : 'transparent',
                    borderWidth: 2,
                    borderStyle: 'solid',
                    transition: 'border-color 0.2s',
                }}
            >
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                    ¿De qué COLOR está escrita?
                </p>
                <span style={{
                    fontFamily: 'var(--font-accent)',
                    fontSize: '3rem',
                    fontWeight: 'var(--fw-bold)',
                    color: COLORS[trial.inkColor].hex,
                    letterSpacing: '0.1em',
                    userSelect: 'none',
                }}>
                    {COLORS[trial.word].label}
                </span>
            </div>

            {/* Answer buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                {COLOR_KEYS.map(key => (
                    <button
                        key={key}
                        onClick={() => handleAnswer(key)}
                        disabled={!!feedback}
                        style={{
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid transparent',
                            background: `${COLORS[key].hex}22`,
                            color: COLORS[key].hex,
                            fontWeight: 'var(--fw-bold)',
                            fontSize: 'var(--fs-base)',
                            cursor: feedback ? 'default' : 'pointer',
                            transition: 'all var(--duration-fast)',
                            opacity: feedback ? 0.6 : 1,
                        }}
                    >
                        {COLORS[key].label}
                    </button>
                ))}
            </div>
        </div>
    )
}
