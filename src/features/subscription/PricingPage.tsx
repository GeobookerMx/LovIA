import { useState } from 'react'
import { Check, Crown, Sparkles, Zap, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
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
    const [loadingTier, setLoadingTier] = useState<Tier | null>(null)

    const [paymentError, setPaymentError] = useState<string | null>(null)

    const handleSubscribe = async (tierId: Tier) => {
        if (tierId === 'free') return
        if (currentTier === tierId) return

        setLoadingTier(tierId)
        setPaymentError(null)

        try {
            // Llamar a la Edge Function de Mercado Pago
            const { data, error } = await supabase.functions.invoke('create-mp-preference', {
                body: {
                    tier: tierId,
                    returnUrl: window.location.origin + '/pricing'
                }
            })

            if (error) throw new Error(error.message)

            if (data?.url) {
                // Redirigir al Checkout de Mercado Pago
                // (incluye OXXO Pay, tarjetas, MSI automáticamente)
                window.location.href = data.url
            } else {
                throw new Error('No se recibió URL de pago')
            }
        } catch (err: any) {
            console.error('[PricingPage] Error al iniciar pago:', err)
            setPaymentError(
                'Hubo un problema al conectar con la pasarela de pago. ' +
                'Intenta de nuevo o contáctanos en clienteslovia@gmail.com'
            )
        } finally {
            setLoadingTier(null)
        }
    }

    return (
        <div className="pricing-page">
            <div className="pricing-page__header animate-fade-in-up">
                <h1>Elige tu plan</h1>
                <p>Invierte en ti. Cada tier desbloquea herramientas más profundas para tu crecimiento.</p>

                {/* Banner 4 meses gratis */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '40px', margin: '12px auto 8px',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08))',
                    border: '1px solid rgba(16,185,129,0.4)', color: '#34d399',
                    fontSize: '0.9rem', fontWeight: 600
                }}>
                    🎉 <strong>Acceso completo GRATIS por 4 meses</strong> — No se requiere tarjeta
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                    🔒 Pago seguro vía Mercado Pago · OXXO · Tarjeta · Hasta 12 MSI
                </p>
            </div>

            {paymentError && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 12, padding: '12px 16px', margin: '0 0 16px',
                    color: '#fca5a5', fontSize: '0.85rem'
                }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    {paymentError}
                </div>
            )}

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
                                onClick={() => handleSubscribe(tier.id)}
                                disabled={isActive || loadingTier !== null}
                            >
                                {loadingTier === tier.id ? <Loader2 size={16} className="animate-spin" /> : isActive ? 'Plan actual' : tier.price ? 'Suscribirse Seguro' : 'Empezar gratis'}
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
