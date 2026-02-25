import { ArrowRight, TrendingUp, Brain, Lightbulb } from 'lucide-react'
import type { OnboardingResults } from './scoring'
import './Onboarding.css'

interface Props {
    result: OnboardingResults
    onContinue: () => void
}

export default function FrequencyResult({ result, onContinue }: Props) {
    const getFreqColor = (score: number) =>
        score >= 80 ? 'var(--freq-high)' :
            score >= 60 ? 'var(--freq-mid)' :
                score >= 40 ? 'var(--freq-low)' :
                    'var(--freq-critical)'

    return (
        <div className="onboarding">
            <div className="result animate-fade-in">
                {/* Frequency Score */}
                <div className="result__hero glass-strong">
                    <h2 className="result__label">Tu Frecuencia de Relación</h2>
                    <div className="result__score" style={{ color: getFreqColor(result.frequency) }}>
                        <span className="result__score-number animate-scale-in">{result.frequency}</span>
                        <span className="result__score-unit">/100</span>
                    </div>
                    <div className="result__level">
                        <span>{result.levelEmoji}</span>
                        <span>Nivel: <strong>{result.level}</strong></span>
                    </div>
                </div>

                {/* 3 Lines */}
                <div className="result__lines glass">
                    <h3><TrendingUp size={16} /> Las 3 Líneas</h3>
                    <div className="result__lines-grid">
                        {result.lines.map((line) => (
                            <div key={line.label} className="result__line">
                                <div className="result__line-header">
                                    <span>{line.emoji} {line.label}</span>
                                    <span style={{ color: line.color }}>{line.score}%</span>
                                </div>
                                <div className="result__line-bar">
                                    <div
                                        className="result__line-fill animate-slide-right"
                                        style={{ width: `${line.score}%`, background: line.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stress */}
                <div className="result__stress glass">
                    <h3><Brain size={16} /> Estrés Percibido (PSS-4)</h3>
                    <div className="result__stress-row">
                        <span className="result__stress-badge" data-level={result.stressLabel.toLowerCase()}>
                            {result.stressLabel}
                        </span>
                        <span className="result__stress-score">{result.stressLevel}/16</span>
                    </div>
                </div>

                {/* Insights */}
                <div className="result__insights glass">
                    <h3><Lightbulb size={16} /> Tus Insights</h3>
                    <ul>
                        {result.insights.map((text, i) => (
                            <li key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>

                <button className="onboarding__cta" onClick={onContinue}>
                    Ir a mi Dashboard <ArrowRight size={18} />
                </button>
            </div>
        </div>
    )
}
