import { useState } from 'react'
import type { Question } from './questionData'
import './Onboarding.css'

interface Props {
    question: Question
    answer: string | number | undefined
    onAnswer: (value: string | number) => void
}

export default function QuestionCard({ question, answer, onAnswer }: Props) {
    const [sliderVal, setSliderVal] = useState<number>(
        typeof answer === 'number' ? answer : question.sliderConfig?.min ?? 5
    )

    const categoryColors: Record<string, string> = {
        love: 'var(--line-love)',
        sexual: 'var(--line-sex)',
        realization: 'var(--line-realization)',
        common: 'var(--love-warm)',
        positive: 'var(--success)',
        negative: 'var(--warning)',
    }

    const color = categoryColors[question.category] || 'var(--text-primary)'

    return (
        <div className="onboarding__card glass-strong animate-fade-in-up">
            <div className="onboarding__card-badge">
                <span className="onboarding__card-badge-dot" style={{ background: color }} />
                {question.categoryLabel}
            </div>

            <div className="onboarding__card-emoji">{question.emoji}</div>
            <h2 className="onboarding__card-question">{question.text}</h2>
            {question.subtitle && (
                <p className="onboarding__card-subtitle">{question.subtitle}</p>
            )}

            {/* Single choice */}
            {question.type === 'single' && question.options && (
                <div className="onboarding__options">
                    {question.options.map((opt) => (
                        <button
                            key={opt.id}
                            className={`onboarding__option ${answer === opt.id ? 'onboarding__option--selected' : ''}`}
                            onClick={() => onAnswer(opt.id)}
                            style={answer === opt.id ? { borderColor: color, boxShadow: `0 0 12px ${color}33` } : {}}
                        >
                            <span className="onboarding__option-emoji">{opt.emoji}</span>
                            <span>{opt.text}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Slider */}
            {question.type === 'slider' && question.sliderConfig && (
                <div className="onboarding__slider-wrap">
                    <input
                        type="range"
                        min={question.sliderConfig.min}
                        max={question.sliderConfig.max}
                        step={question.sliderConfig.step}
                        value={sliderVal}
                        onChange={(e) => {
                            const v = Number(e.target.value)
                            setSliderVal(v)
                            onAnswer(v)
                        }}
                        className="onboarding__slider"
                        style={{
                            '--slider-progress': `${((sliderVal - question.sliderConfig.min) / (question.sliderConfig.max - question.sliderConfig.min)) * 100}%`,
                            '--slider-color': color,
                        } as React.CSSProperties}
                    />
                    <div className="onboarding__slider-labels">
                        <span>{question.sliderConfig.labels[0]}</span>
                        <span className="onboarding__slider-value">{sliderVal}</span>
                        <span>{question.sliderConfig.labels[1]}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
