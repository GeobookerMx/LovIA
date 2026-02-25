import { useState } from 'react'
import { useCheckInStore } from '../../stores/checkInStore'
import '../../features/verification/Verification.css'

const moods = [
    { emoji: '😢', label: 'Mal' },
    { emoji: '😕', label: 'Regular' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😊', label: 'Bien' },
    { emoji: '🤩', label: 'Increíble' },
]

const contextMessages: Record<string, { title: string; subtitle: string }> = {
    weekly: { title: '¿Cómo te sientes hoy?', subtitle: 'Tu check-in semanal' },
    pre_questionnaire: { title: '¿Cómo estás antes de empezar?', subtitle: 'Si no te sientes bien, puedes posponer' },
    post_match: { title: '¿Cómo te sientes?', subtitle: 'Después de ese resultado' },
    pre_video: { title: '¿Listo/a para la llamada?', subtitle: 'Un momento para respirar' },
    post_encounter: { title: '¿Cómo te fue?', subtitle: 'Tu bienestar es prioridad' },
    monthly: { title: 'Check-in mensual', subtitle: 'Tu evolución emocional' },
}

export default function MentalCheckIn() {
    const showCheckIn = useCheckInStore((s) => s.showCheckIn)
    const currentContext = useCheckInStore((s) => s.currentContext)
    const closeCheckIn = useCheckInStore((s) => s.closeCheckIn)
    const addEntry = useCheckInStore((s) => s.addEntry)
    const getLastEntry = useCheckInStore((s) => s.getLastEntry)

    const [selectedMood, setSelectedMood] = useState<string | null>(null)
    const [score, setScore] = useState(5)
    const [submitted, setSubmitted] = useState(false)

    if (!showCheckIn) return null

    const ctx = contextMessages[currentContext] || contextMessages.weekly
    const lastEntry = getLastEntry()

    const handleSubmit = () => {
        if (!selectedMood) return
        addEntry({ mood: selectedMood, score, context: currentContext })
        setSubmitted(true)
        setTimeout(() => {
            setSubmitted(false)
            setSelectedMood(null)
            setScore(5)
        }, 2500)
    }

    return (
        <div className="check-in-overlay" onClick={(e) => e.target === e.currentTarget && closeCheckIn()}>
            <div className="check-in glass-strong">
                <div className="check-in__handle" />

                {submitted ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                        <span style={{ fontSize: '2.5rem' }}>✨</span>
                        <div className="check-in__feedback">
                            {lastEntry && score > (lastEntry.score || 0)
                                ? 'Hoy te sientes mejor que la última vez ✨'
                                : score >= 7
                                    ? '¡Qué bueno que estés bien! 💕'
                                    : 'Gracias por compartir. Recuerda que estamos aquí para ti 🤗'
                            }
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="check-in__header">
                            <h3>{ctx.title}</h3>
                            <p>{ctx.subtitle}</p>
                        </div>

                        {/* Emoji selector */}
                        <div className="check-in__emojis">
                            {moods.map((m) => (
                                <button
                                    key={m.emoji}
                                    className={`check-in__emoji ${selectedMood === m.emoji ? 'check-in__emoji--selected' : ''}`}
                                    onClick={() => setSelectedMood(m.emoji)}
                                    title={m.label}
                                >
                                    {m.emoji}
                                </button>
                            ))}
                        </div>

                        {/* Slider 1-10 */}
                        <div className="check-in__slider-wrap">
                            <input
                                type="range"
                                className="check-in__slider"
                                min={1}
                                max={10}
                                value={score}
                                onChange={(e) => setScore(Number(e.target.value))}
                            />
                            <div className="check-in__slider-labels">
                                <span>1 — Muy mal</span>
                                <span style={{ fontFamily: 'var(--font-accent)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-lg)' }}>
                                    {score}
                                </span>
                                <span>10 — Excelente</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="check-in__actions">
                            <button className="check-in__dismiss" onClick={closeCheckIn}>
                                Ahora no
                            </button>
                            <button
                                className="check-in__submit"
                                onClick={handleSubmit}
                                disabled={!selectedMood}
                                style={{ opacity: selectedMood ? 1 : 0.5 }}
                            >
                                Enviar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
