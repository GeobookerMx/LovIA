import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, User, MapPin, AlignLeft } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import './ProfilePages.css'

export default function EditProfilePage() {
    const navigate = useNavigate()
    const { profile, updateProfile } = useAuthStore()
    
    const [formData, setFormData] = useState<{
        alias: string
        city: string
        full_name?: string
        bio?: string
    }>({
        alias: '',
        city: '',
        full_name: '',
        bio: ''
    })
    const [isSaving, setIsSaving] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        if (profile) {
            setFormData({
                alias: profile.alias || '',
                city: profile.city || '',
            })
        }
    }, [profile])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setSuccessMsg('')
        
        const { error } = await updateProfile(formData as any)
        
        setIsSaving(false)
        if (!error) {
            setSuccessMsg('¡Perfil actualizado con éxito!')
            setTimeout(() => navigate(-1), 1500)
        } else {
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

                    <div className="settings-item glass-strong" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px', marginTop: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                            <AlignLeft size={16} /> Biografía
                        </label>
                        <textarea 
                            className="settings-select"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-deep)', minHeight: '100px', resize: 'vertical' }}
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            placeholder="Cuenta un poco sobre ti y lo que buscas construir..."
                            maxLength={300}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', alignSelf: 'flex-end' }}>{(formData.bio ?? '').length}/300</span>
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
