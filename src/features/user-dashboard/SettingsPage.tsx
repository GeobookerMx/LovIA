/**
 * LovIA! — Settings Page
 *
 * User preferences: notifications, privacy, language, theme, account.
 * Persisted via Zustand settingsStore with localStorage.
 */

import { useState } from 'react'
import { ArrowLeft, Bell, Eye, Globe, Palette, User, Shield, Trash2, Loader2 } from 'lucide-react'
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

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción ELIMINARÁ todos tus datos y relaciones de forma permanente. No se puede deshacer.'
        )
        if (!confirmed) return

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
            alert('Hubo un error al eliminar la cuenta. Por favor, intenta de nuevo más tarde o contacta a soporte.')
            setIsDeleting(false)
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

                <button 
                    className="settings-item glass" 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    style={{ cursor: isDeleting ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: 0 }} 
                >
                    <div className="settings-item__left">
                        {isDeleting ? (
                            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--danger)', margin: '0 12px' }} />
                        ) : (
                            <Trash2 size={18} style={{ color: 'var(--danger)', margin: '0 12px' }} />
                        )}
                        <div>
                            <div className="settings-item__label" style={{ color: 'var(--danger)' }}>
                                {isDeleting ? 'Eliminando cuenta...' : 'Eliminar cuenta'}
                            </div>
                            <div className="settings-item__desc">Derecho ARCO — LFPDPPP Art. 16</div>
                        </div>
                    </div>
                </button>
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
