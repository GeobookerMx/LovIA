/**
 * LovIA! — System Config (Admin)
 *
 * System-level configuration: algorithm parameters, feature flags,
 * maintenance mode, and environment info.
 */

import { useState } from 'react'
import { Settings, Sliders, ToggleLeft, ToggleRight, Server, Shield, AlertTriangle, Save } from 'lucide-react'
import './AdminPages.css'

interface FeatureFlag {
    key: string
    label: string
    description: string
    enabled: boolean
    category: string
}

const initialFlags: FeatureFlag[] = [
    { key: 'matching_v2', label: 'Algoritmo Matching v2.1 (Sternberg)', description: 'Usa el modelo triangular para los 3 pesos de compatibilidad', enabled: true, category: 'Algoritmo' },
    { key: 'pss4_penalty', label: 'Penalización PSS-4 por estrés', description: 'Aplica descuento de frecuencia según nivel de estrés percibido', enabled: true, category: 'Algoritmo' },
    { key: 'cognitive_gates', label: 'Gates cognitivos (Stroop + Digit Span)', description: 'Requiere tests cognitivos para avanzar de nivel', enabled: false, category: 'Verificación' },
    { key: 'video_call', label: 'Videollamada integrada', description: 'Permite videollamadas antes del encuentro presencial', enabled: true, category: 'Comunicación' },
    { key: 'mental_checkin', label: 'Mental Check-In diario', description: 'Recordatorio de bienestar emocional con Daily Spark', enabled: true, category: 'Bienestar' },
    { key: 'professional_directory', label: 'Directorio de profesionales', description: 'Acceso al directorio de terapeutas verificados', enabled: true, category: 'Comunidad' },
    { key: 'maintenance_mode', label: '🔧 Modo mantenimiento', description: 'Muestra pantalla de mantenimiento a usuarios no-admin', enabled: false, category: 'Sistema' },
]

const algorithmParams = [
    { key: 'weight_love', label: 'Peso Línea del Amor', value: 0.40, min: 0, max: 1, step: 0.05 },
    { key: 'weight_sex', label: 'Peso Línea Sexual', value: 0.25, min: 0, max: 1, step: 0.05 },
    { key: 'weight_real', label: 'Peso Línea Realización', value: 0.35, min: 0, max: 1, step: 0.05 },
    { key: 'min_compat', label: 'Compatibilidad mínima (%)', value: 55, min: 0, max: 100, step: 5 },
    { key: 'cooldown_days', label: 'Cooldown post-encuentro (días)', value: 14, min: 7, max: 30, step: 1 },
    { key: 'pss4_max_penalty', label: 'Penalización máx PSS-4', value: 15, min: 0, max: 30, step: 1 },
]

const systemInfo = [
    { label: 'Entorno', value: 'Production' },
    { label: 'Versión App', value: 'v0.4.0-beta' },
    { label: 'Algoritmo', value: 'v2.1-sternberg' },
    { label: 'Base de datos', value: 'Supabase Pro (us-east-1)' },
    { label: 'Usuarios registrados', value: '1,247' },
    { label: 'Última actualización', value: '25 Feb 2026 08:00 CST' },
]

export default function SystemConfig() {
    const [flags, setFlags] = useState(initialFlags)
    const [params, setParams] = useState(algorithmParams)
    const [hasChanges, setHasChanges] = useState(false)

    const toggleFlag = (key: string) => {
        setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f))
        setHasChanges(true)
    }

    const updateParam = (key: string, value: number) => {
        setParams(prev => prev.map(p => p.key === key ? { ...p, value } : p))
        setHasChanges(true)
    }

    const categories = [...new Set(flags.map(f => f.category))]

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1>Sistema</h1>
                <p>Configuración del sistema, algoritmo y feature flags</p>
            </div>

            {/* System info */}
            <div className="admin-section glass">
                <div className="admin-section__header">
                    <h3><Server size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />Información del sistema</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                    {systemInfo.map(info => (
                        <div key={info.label}>
                            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>{info.label}</div>
                            <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)' }}>{info.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Algorithm parameters */}
            <div className="admin-section glass">
                <div className="admin-section__header">
                    <h3><Sliders size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />Parámetros del algoritmo</h3>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                        Basado en Sternberg (1986) — Pesos validados por meta-análisis
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {params.map(param => (
                        <div key={param.key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 'var(--fs-sm)' }}>{param.label}</span>
                                <span style={{ fontFamily: 'var(--font-accent)', fontWeight: 'var(--fw-bold)', color: 'var(--line-realization)' }}>
                                    {param.key.startsWith('weight') ? `${(param.value * 100).toFixed(0)}%` : param.value}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                value={param.value}
                                onChange={(e) => updateParam(param.key, parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--line-realization)' }}
                            />
                        </div>
                    ))}
                </div>
                {/* Weight sum warning */}
                {(() => {
                    const weightSum = params.filter(p => p.key.startsWith('weight')).reduce((s, p) => s + p.value, 0)
                    if (Math.abs(weightSum - 1) > 0.01) {
                        return (
                            <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(251,191,36,0.1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--fs-xs)', color: 'var(--warning)' }}>
                                <AlertTriangle size={14} />
                                Suma de pesos: {(weightSum * 100).toFixed(0)}% — debe ser 100%
                            </div>
                        )
                    }
                    return null
                })()}
            </div>

            {/* Feature flags */}
            <div className="admin-section glass">
                <div className="admin-section__header">
                    <h3><Settings size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />Feature Flags</h3>
                </div>
                {categories.map(cat => (
                    <div key={cat} style={{ marginBottom: 'var(--space-5)' }}>
                        <h4 style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
                            {cat}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {flags.filter(f => f.category === cat).map(flag => (
                                <div key={flag.key} style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)',
                                    background: flag.key === 'maintenance_mode' && flag.enabled ? 'rgba(239,68,68,0.08)' : 'transparent',
                                }}>
                                    <button
                                        onClick={() => toggleFlag(flag.key)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                                    >
                                        {flag.enabled
                                            ? <ToggleRight size={28} color="var(--success)" />
                                            : <ToggleLeft size={28} color="var(--text-tertiary)" />
                                        }
                                    </button>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)' }}>{flag.label}</div>
                                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{flag.description}</div>
                                    </div>
                                    {flag.key === 'maintenance_mode' && flag.enabled && (
                                        <Shield size={16} color="var(--danger)" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Save */}
            {hasChanges && (
                <button
                    className="match-detail__accept"
                    onClick={() => setHasChanges(false)}
                    style={{
                        position: 'sticky', bottom: 'var(--space-4)', zIndex: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                    }}
                >
                    <Save size={16} /> Guardar cambios
                </button>
            )}
        </div>
    )
}
