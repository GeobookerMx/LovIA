import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import { TIERS, useSubscriptionStore } from '../../stores/subscriptionStore'
import type { Tier } from '../../stores/subscriptionStore'
import './Pricing.css'

const tierIcons: Record<Tier, React.ReactNode> = {
    free: <Zap size={24} />,
    arquitecto: <Sparkles size={24} />,
    ingeniero: <Crown size={24} />,
    diamante: <span style={{ fontSize: '1.5rem' }}>💎</span>,
}

export default function PricingPage() {
    const currentTier = useSubscriptionStore((s) => s.currentTier)
    const setTier = useSubscriptionStore((s) => s.setTier)

    return (
        <div className="pricing-page">
            <div className="pricing-page__header animate-fade-in-up">
                <h1>Elige tu plan</h1>
                <p>Invierte en ti. Cada tier desbloquea herramientas más profundas para tu crecimiento.</p>
            </div>

            <div className="pricing-grid">
                {TIERS.map((tier, i) => {
                    const isActive = currentTier === tier.id
                    const isPopular = tier.id === 'ingeniero'

                    return (
                        <div
                            key={tier.id}
                            className={`pricing-card glass-strong animate-fade-in-up ${isActive ? 'pricing-card--active' : ''
                                } ${isPopular ? 'pricing-card--popular' : ''}`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            {isPopular && <div className="pricing-card__badge">Más popular</div>}

                            <div className="pricing-card__icon" style={{ color: tier.color }}>
                                {tierIcons[tier.id]}
                            </div>

                            <h3 className="pricing-card__name">
                                {tier.emoji} {tier.name}
                            </h3>

                            <div className="pricing-card__price">
                                {tier.price ? (
                                    <>
                                        <span className="pricing-card__amount">{tier.price.split('/')[0]}</span>
                                        <span className="pricing-card__period">/{tier.price.split('/')[1]}</span>
                                    </>
                                ) : (
                                    <span className="pricing-card__amount">Gratis</span>
                                )}
                            </div>

                            <ul className="pricing-card__features">
                                {tier.features.map((f, j) => (
                                    <li key={j}>
                                        <Check size={14} style={{ color: tier.color, flexShrink: 0 }} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`pricing-card__cta ${isActive ? 'pricing-card__cta--current' : ''}`}
                                style={!isActive ? { background: `linear-gradient(135deg, ${tier.color}, ${tier.color}dd)` } : {}}
                                onClick={() => setTier(tier.id)}
                                disabled={isActive}
                            >
                                {isActive ? 'Plan actual' : tier.price ? 'Suscribirse' : 'Empezar gratis'}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Feature comparison */}
            <div className="pricing-compare glass-strong animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <h3>Comparación completa</h3>
                <table className="pricing-table">
                    <thead>
                        <tr>
                            <th>Función</th>
                            {TIERS.map((t) => (
                                <th key={t.id} style={{ color: t.color }}>{t.emoji}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Cuestionario L1 + Frecuencia', true, true, true, true],
                            ['Daily Spark + Blog', true, true, true, true],
                            ['Selfie verificada', true, true, true, true],
                            ['Cuestionario L2 + Gráfica', false, true, true, true],
                            ['Matching + Chat', '—', '3/mes', '10/mes', '∞'],
                            ['Videollamadas', false, false, true, true],
                            ['Plan de encuentro', false, false, true, true],
                            ['AI Coach', false, false, true, true],
                            ['INE verificación', false, false, true, true],
                            ['Módulos Perel/Johnson', false, false, false, true],
                            ['Predicción temporal', false, false, false, true],
                            ['Badge especial', false, false, false, true],
                        ].map(([feature, ...values], i) => (
                            <tr key={i}>
                                <td>{feature as string}</td>
                                {values.map((v, j) => (
                                    <td key={j}>
                                        {v === true ? '✅' : v === false ? '—' : v}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
