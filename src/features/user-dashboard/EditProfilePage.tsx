import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, User, MapPin } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { trackEvent } from '../../lib/analytics'
import './ProfilePages.css'

export default function EditProfilePage() {
    const navigate = useNavigate()
    const { profile, updateProfile } = useAuthStore()
    
    const [formData, setFormData] = useState<{
        alias: string
        city: string
        full_name?: string
    }>({
        alias: '',
        city: '',
        full_name: ''
    })
    const [isSaving, setIsSaving] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        if (profile) {
            setFormData({
                alias: (profile as any).alias || '',
                city: (profile as any).city || '',
                full_name: (profile as any).full_name || '',
            })
        }
    }, [profile])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setSuccessMsg('')

        // Guardar todos los campos editables del perfil
        const updates = {
            alias: formData.alias.trim(),
            city: formData.city.trim(),
            full_name: (formData.full_name ?? '').trim(),
        }

        const { error } = await updateProfile(updates)

        setIsSaving(false)
        if (!error) {
            trackEvent('profile_saved')
            setSuccessMsg('¡Perfil actualizado con éxito!')
            setTimeout(() => navigate('/profile'), 1500)
        } else {
            trackEvent('error_profile_save', { error })
            alert('Error al guardar: ' + error)
        }
    }


    return (
        <div className="profile-sub">
            <header className="profile-sub__header">
                <button className="profile-sub__back" type="button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Editar Perfil</h2>
            </header>

            <form className="profile-content__body animate-fade-in-up" onSubmit={handleSave}>
                <div className="settings-section">
                    <div className="settings-item glass-strong" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                            <User size={16} /> Nombre Completo (Privado)
                        </label>
                        <input 
                            type="text" 
                            className="settings-select"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-deep)' }}
                            value={formData.full_name}
                            onChange={e => setFormData({...formData, full_name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="settings-item glass-strong" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px', marginTop: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                            <User size={16} color="var(--love-rose)" /> Alias (Avatar Público)
                        </label>
                        <input 
                            type="text" 
                            className="settings-select"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-deep)' }}
                            value={formData.alias}
                            onChange={e => setFormData({...formData, alias: e.target.value})}
                            maxLength={15}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Tu Alias es cómo te verán tus Matches.</span>
                    </div>

                    <div className="settings-item glass-strong" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px', marginTop: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                            <MapPin size={16} /> Ciudad o Estado
                        </label>
                        <input 
                            type="text" 
                            className="settings-select"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-deep)' }}
                            value={formData.city}
                            onChange={e => setFormData({...formData, city: e.target.value})}
                            placeholder="Ej. CDMX, Monterrey, Guadalajara..."
                        />
                    </div>

                </div>

                {successMsg && (
                    <div style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '16px', fontWeight: 'bold' }}>
                        {successMsg}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}
                    disabled={isSaving}
                >
                    <Save size={18} />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    )
}
