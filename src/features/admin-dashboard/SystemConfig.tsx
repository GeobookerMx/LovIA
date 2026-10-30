import { useEffect, useState } from 'react'
import { Activity, CheckCircle2, Loader2, Settings, ShieldAlert, ToggleLeft, ToggleRight, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

interface FeatureFlag {
    key: string
    enabled: boolean
    updated_at: string
}

const FLAG_LABELS: Record<string, { label: string; description: string }> = {
    finance_private_save: {
        label: 'Guardado privado — Finanzas',
        description: 'Permite que los usuarios guarden sus respuestas del módulo "Dinero y proyecto de vida" en su cuenta de forma privada (RLS). Desactivado: las respuestas solo viven en pantalla.',
    },
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function SystemConfig() {
    const [flags, setFlags] = useState<FeatureFlag[]>([])
    const [loading, setLoading] = useState(true)
    const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({})
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        void load()
    }, [])

    async function load() {
        setLoading(true)
        setError(null)
        const { data, error: err } = await supabase
            .from('lovia_feature_flags')
            .select('key, enabled, updated_at')
            .order('key')
        if (err) { setError(err.message); setLoading(false); return }
        setFlags(data ?? [])
        setLoading(false)
    }

    async function toggle(flag: FeatureFlag) {
        setSaveStatus((s) => ({ ...s, [flag.key]: 'saving' }))
        const next = !flag.enabled
        const { error: err } = await supabase
            .from('lovia_feature_flags')
            .update({ enabled: next, updated_at: new Date().toISOString() })
            .eq('key', flag.key)
        if (err) {
            setSaveStatus((s) => ({ ...s, [flag.key]: 'error' }))
            return
        }
        setFlags((prev) => prev.map((f) => f.key === flag.key ? { ...f, enabled: next, updated_at: new Date().toISOString() } : f))
        setSaveStatus((s) => ({ ...s, [flag.key]: 'saved' }))
        setTimeout(() => setSaveStatus((s) => ({ ...s, [flag.key]: 'idle' })), 2000)
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1>Sistema</h1>
                <p>Interruptores de activación (feature flags) y configuración de LovIA</p>
            </div>

            {/* ── Feature Flags ── */}
            <div className="admin-section glass">
                <div className="admin-section__header">
                    <h3><ToggleRight size={18} /> Interruptores de funciones</h3>
                    <button className="admin-btn admin-btn--primary" onClick={() => void load()} disabled={loading}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />} Actualizar
                    </button>
                </div>

                {error && (
                    <p role="alert" style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)' }}>
                        Error cargando flags: {error}
                    </p>
                )}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
                        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--love-rose)' }} />
                    </div>
                )}

                {!loading && flags.length === 0 && !error && (
                    <p style={{ color: 'var(--text-tertiary)' }}>No hay interruptores registrados.</p>
                )}

                {!loading && flags.map((flag) => {
                    const meta = FLAG_LABELS[flag.key] ?? { label: flag.key, description: '' }
                    const status = saveStatus[flag.key] ?? 'idle'
                    return (
                        <div key={flag.key} className="sysconfig-flag glass" style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                            <button
                                type="button"
                                id={`flag-toggle-${flag.key}`}
                                aria-pressed={flag.enabled}
                                aria-label={`${flag.enabled ? 'Desactivar' : 'Activar'} ${meta.label}`}
                                disabled={status === 'saving'}
                                onClick={() => void toggle(flag)}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: status === 'saving' ? 'wait' : 'pointer', color: flag.enabled ? 'var(--success)' : 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }}
                            >
                                {status === 'saving'
                                    ? <Loader2 size={28} className="animate-spin" />
                                    : flag.enabled
                                        ? <ToggleRight size={32} />
                                        : <ToggleLeft size={32} />}
                            </button>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                                    <strong style={{ fontSize: 'var(--fs-sm)' }}>{meta.label}</strong>
                                    {flag.enabled
                                        ? <span className="admin-status admin-status--active">Activo</span>
                                        : <span className="admin-status admin-status--draft">Inactivo</span>}
                                    {status === 'saved' && <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />}
                                    {status === 'error' && <XCircle size={14} style={{ color: 'var(--danger)' }} />}
                                </div>
                                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', margin: 0 }}>{meta.description}</p>
                                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
                                    Clave: <code style={{ fontFamily: 'monospace' }}>{flag.key}</code> · Actualizado: {new Date(flag.updated_at).toLocaleString('es-MX')}
                                </p>
                                {status === 'error' && (
                                    <p role="alert" style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)', margin: '4px 0 0' }}>
                                        No se pudo guardar. ¿Tienes permisos de admin?
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Info del entorno ── */}
            <div className="admin-section glass">
                <h3><Settings size={18} /> Entorno de despliegue</h3>
                <table className="admin-table" style={{ marginTop: 'var(--space-4)' }}>
                    <tbody>
                        <tr><td style={{ color: 'var(--text-tertiary)', width: 160 }}>Entorno</td><td><code>{import.meta.env.VITE_APP_ENV ?? 'production'}</code></td></tr>
                        <tr><td style={{ color: 'var(--text-tertiary)' }}>Supabase URL</td><td><code style={{ wordBreak: 'break-all' }}>{import.meta.env.VITE_SUPABASE_URL ?? '—'}</code></td></tr>
                        <tr><td style={{ color: 'var(--text-tertiary)' }}>Build</td><td><code>{import.meta.env.VITE_APP_VERSION ?? 'local'}</code></td></tr>
                    </tbody>
                </table>
            </div>

            {/* ── Nota de seguridad ── */}
            <div className="admin-section glass" role="note">
                <h3><ShieldAlert size={18} /> Seguridad</h3>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                    Solo los administradores (política RLS <code>is_admin()</code>) pueden modificar interruptores. Los cambios son inmediatos para todos los usuarios autenticados.
                    Los módulos desactivados siguen mostrándose pero no persisten datos en el servidor.
                </p>
            </div>
        </div>
    )
}
