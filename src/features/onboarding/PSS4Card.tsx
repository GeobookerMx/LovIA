import type { Question } from './questionData'
import './Onboarding.css'

interface Props {
    question: Question
    options: { value: number; label: string }[]
    selected: number | undefined
    onSelect: (value: number) => void
    index: number
}

export default function PSS4Card({ question, options, selected, onSelect, index }: Props) {
    return (
        <div className="onboarding__card glass-strong animate-fade-in-up">
            <div className="onboarding__card-badge">
                <span className="onboarding__card-badge-dot" style={{ background: 'var(--line-realization)' }} />
                PSS-4 · Estrés Percibido
            </div>

            <p className="onboarding__card-number">Pregunta {index + 1} de 4</p>
            <h2 className="onboarding__card-question">{question.text}</h2>

            <div className="onboarding__pss-options">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        className={`onboarding__pss-option ${selected === opt.value ? 'onboarding__pss-option--selected' : ''}`}
                        onClick={() => onSelect(opt.value)}
                    >
                        <span className="onboarding__pss-value">{opt.value}</span>
                        <span className="onboarding__pss-label">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
