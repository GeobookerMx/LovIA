/**
 * LovIA! — Settings Page
 *
 * User preferences: notifications, privacy, language, theme, account.
 * Persisted via Zustand settingsStore with localStorage.
 */

import { useState } from 'react'
import { ArrowLeft, Bell, Eye, Globe, Palette, User, Shield, Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import './ProfilePages.css'

export default function SettingsPage() {
    const navigate = useNavigate()
    const settings = useSettingsStore()
    const { signOut } = useAuthStore()
    const [isDeleting, setIsDeleting] = useState(false)
    // Doble confirmación: paso 1 = mostrar aviso, paso 2 = botón rojo activo
    const [deleteStep, setDeleteStep] = useState<0 | 1>(0)

    const handleDeleteAccount = async () => {
        // Paso 1: mostrar panel de advertencia
        if (deleteStep === 0) {
            setDeleteStep(1)
            return
        }

        // Paso 2: usuario leyó la advertencia y confirma
        try {
            setIsDeleting(true)

            // Invoke the secure edge function to delete the user
            const { error } = await supabase.functions.invoke('delete-account')

            if (error) throw error

            // Log out and clear local state
            await signOut()
            navigate('/', { replace: true })

        } catch (error: any) {
            console.error('Error deleting account:', error)
            alert('Hubo un error al eliminar la cuenta. Por favor, intenta de nuevo más tarde o contacta a soporte en clienteslovia@gmail.com')
            setIsDeleting(false)
            setDeleteStep(0)
        }
    }

    return (
        <div className="profile-sub">
            <div className="profile-sub__header">
                <button className="profile-sub__back" onClick={() => navigate('/profile')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Configuración</h2>
            </div>

            {/* Notifications */}
            <div className="settings-section">
                <div className="settings-section__title">🔔 Notificaciones</div>

                <ToggleItem
                    icon={<Bell size={18} />}
                    label="Notificaciones push"
                    desc="Matches, sparks, check-ins"
                    active={settings.pushEnabled}
                    onToggle={() => settings.toggle('pushEnabled')}
                />
                <ToggleItem
                    icon={<Bell size={18} />}
                    label="Email semanal"
                    desc="Resumen de tu progreso"
                    active={settings.weeklyEmail}
                    onToggle={() => settings.toggle('weeklyEmail')}
                />
                <ToggleItem
                    icon={<Bell size={18} />}
                    label="Recordatorio Daily Spark"
                    desc="Notificación diaria para tu chispa"
                    active={settings.sparkReminder}
                    onToggle={() => settings.toggle('sparkReminder')}
                />
            </div>

            {/* Privacy */}
            <div className="settings-section">
                <div className="settings-section__title">🔒 Privacidad</div>

                <ToggleItem
                    icon={<Eye size={18} />}
                    label="Perfil visible en matching"
                    desc="Si desactivas, no aparecerás en el pool"
                    active={settings.profileVisible}
                    onToggle={() => settings.toggle('profileVisible')}
                />
                <ToggleItem
                    icon={<Shield size={18} />}
                    label="Compartir datos anónimos"
                    desc="Contribuye a mejorar el algoritmo (datos no identificables)"
                    active={settings.anonymousData}
                    onToggle={() => settings.toggle('anonymousData')}
                />
            </div>

            {/* Appearance */}
            <div className="settings-section">
                <div className="settings-section__title">🎨 Apariencia</div>

                <div className="settings-item glass">
                    <div className="settings-item__left">
                        <Palette size={18} className="settings-item__icon" />
                        <div>
                            <div className="settings-item__label">Tema</div>
                        </div>
                    </div>
                    <select
                        className="settings-select"
                        value={settings.theme}
                        onChange={(e) => settings.setTheme(e.target.value as 'dark' | 'light' | 'system')}
                    >
                        <option value="dark">Oscuro</option>
                        <option value="light">Claro</option>
                        <option value="system">Sistema</option>
                    </select>
                </div>

                <div className="settings-item glass">
                    <div className="settings-item__left">
                        <Globe size={18} className="settings-item__icon" />
                        <div>
                            <div className="settings-item__label">Idioma</div>
                        </div>
                    </div>
                    <select
                        className="settings-select"
                        value={settings.language}
                        onChange={(e) => settings.setLanguage(e.target.value as 'es' | 'en')}
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>

            {/* Account */}
            <div className="settings-section">
                <div className="settings-section__title">👤 Cuenta</div>

                <div className="settings-item glass" onClick={() => navigate('/profile/edit')} style={{ cursor: 'pointer' }}>
                    <div className="settings-item__left">
                        <User size={18} className="settings-item__icon" />
                        <div>
                            <div className="settings-item__label">Editar perfil</div>
                            <div className="settings-item__desc">Nombre, bio, foto</div>
                        </div>
                    </div>
                </div>

                {/* Paso 1: botón inicial */}
                {deleteStep === 0 && (
                    <button
                        className="settings-item glass"
                        onClick={handleDeleteAccount}
                        style={{ cursor: 'pointer', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: 0 }}
                    >
                        <div className="settings-item__left">
                            <Trash2 size={18} style={{ color: 'var(--danger)', margin: '0 12px' }} />
                            <div>
                                <div className="settings-item__label" style={{ color: 'var(--danger)' }}>Eliminar cuenta</div>
                                <div className="settings-item__desc">Derecho ARCO — LFPDPPP Art. 16</div>
                            </div>
                        </div>
                    </button>
                )}

                {/* Paso 2: panel de confirmación explícita */}
                {deleteStep === 1 && (
                    <div className="glass-strong animate-fade-in" style={{
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(239,68,68,0.4)',
                        padding: 'var(--space-4)',
                        marginTop: 'var(--space-2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <p style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 'var(--space-1)', fontSize: 'var(--fs-sm)' }}>
                                    ¿Confirmas la eliminación permanente?
                                </p>
                                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    Se eliminarán tu perfil, matches, mensajes, evaluaciones y todos tus datos de forma
                                    <strong> permanente e irreversible</strong>. Esta acción no se puede deshacer.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button
                                onClick={() => setDeleteStep(0)}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'var(--fs-sm)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                }}
                            >
                                <X size={14} /> Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)',
                                    color: '#ef4444', cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    fontSize: 'var(--fs-sm)', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                }}
                            >
                                {isDeleting
                                    ? <><Loader2 size={14} className="animate-spin" /> Eliminando...</>
                                    : <><Trash2 size={14} /> Sí, eliminar mi cuenta</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ToggleItem({
    icon, label, desc, active, onToggle,
}: {
    icon: React.ReactNode
    label: string
    desc: string
    active: boolean
    onToggle: () => void
}) {
    return (
        <div className="settings-item glass">
            <div className="settings-item__left">
                <span className="settings-item__icon">{icon}</span>
                <div>
                    <div className="settings-item__label">{label}</div>
                    <div className="settings-item__desc">{desc}</div>
                </div>
            </div>
            <button className={`toggle ${active ? 'toggle--active' : ''}`} onClick={onToggle}>
                <div className="toggle__knob" />
            </button>
        </div>
    )
}
