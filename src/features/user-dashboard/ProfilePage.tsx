import { useNavigate } from 'react-router-dom'
import { Shield, ChevronRight, Settings, LogOut, FileText, CreditCard, TrendingUp, BarChart3, Activity, Layers, BookOpen, Eye, ShieldAlert, BookHeart, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
import './ProfilePage.css'

export default function ProfilePage() {
    const navigate = useNavigate()
    const { profile, updateProfile, signOut, user } = useAuthStore()
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg })
        setTimeout(() => setToast(null), 3500)
    }

    const handleLogout = () => {
        signOut()
        navigate('/')
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0 || !user) return
            const file = e.target.files[0]

            // ── Validaciones de cliente ──────────────────────────────────────
            if (!ALLOWED_TYPES.includes(file.type)) {
                showToast('error', 'Formato no permitido. Usa JPG, PNG, WEBP o HEIC.')
                return
            }
            if (file.size > MAX_FILE_BYTES) {
                showToast('error', `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El límite es 5 MB.`)
                return
            }

            setUploading(true)
            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
            const fileName = `avatar-${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            // Subir imagen
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            await updateProfile({ avatar_url: publicUrl })
            showToast('success', '¡Foto de perfil actualizada! 🎉')

        } catch (error: any) {
            console.error('Error uploading avatar:', error)
            showToast('error', 'Error al subir la imagen. Verifica que el Bucket "avatars" existe en Supabase.')
        } finally {
            setUploading(false)
        }
    }

    const handleChangeVisibility = async (mode: 'classic' | 'gradual' | 'essence') => {
        await updateProfile({ visibility_mode: mode })
    }

    return (
        <div className="profile-page">
            <div className="profile-page__header animate-fade-in">
                <div
                    className="profile-page__avatar"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                    title="Cambiar foto de perfil"
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        onChange={handleAvatarUpload}
                    />
                    <img 
                        src={profile?.avatar_url || 'https://via.placeholder.com/150'} 
                        alt="Avatar" 
                        style={{width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', opacity: uploading ? 0.5 : 1}} 
                    />
                    {uploading && (
                        <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)', borderRadius:'50%', fontSize:'10px', color:'white', fontWeight:'bold'}}>
                            Subiendo...
                        </div>
                    )}
                </div>
                <h1>{profile?.alias || 'Usuario'}</h1>
                <div className="profile-page__badges">
                    <span className="profile-page__badge glass">{profile?.tier === 'free' ? 'Buscador' : profile?.tier}</span>
                </div>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>Toca tu foto para cambiarla · Máx. 5 MB (JPG/PNG/WEBP)</p>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 20px', borderRadius: 12, maxWidth: 380, width: '90vw',
                    background: toast.type === 'success' ? 'rgba(0,200,100,0.15)' : 'rgba(220,50,50,0.15)',
                    border: `1px solid ${toast.type === 'success' ? 'rgba(0,200,100,0.4)' : 'rgba(220,50,50,0.4)'}`,
                    backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    animation: 'fadeInDown 0.3s ease',
                }}>
                    {toast.type === 'success'
                        ? <CheckCircle size={18} color="#00c864" />
                        : <AlertCircle size={18} color="#dc3545" />}
                    <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>{toast.msg}</span>
                </div>
            )}

            {/* Visibility Mode Selector */}
            <div className="glass" style={{ margin: 'var(--space-4) 0', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Eye size={18} color="var(--love-rose)" />
                    <h3 style={{ margin: 0, fontSize: 'var(--fs-md)' }}>Mi visibilidad para el mundo</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={() => handleChangeVisibility('classic')}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: profile?.visibility_mode === 'classic' ? '2px solid var(--love-rose)' : '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-primary)'}}>
                        Clásico
                    </button>
                    <button 
                        onClick={() => handleChangeVisibility('gradual')}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: profile?.visibility_mode === 'gradual' || !profile?.visibility_mode ? '2px solid var(--love-rose)' : '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-primary)'}}>
                        Gradual
                    </button>
                    <button 
                        onClick={() => handleChangeVisibility('essence')}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: profile?.visibility_mode === 'essence' ? '2px solid var(--love-rose)' : '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-primary)'}}>
                        Esencia
                    </button>
                </div>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {profile?.visibility_mode === 'classic' && 'Tu foto es visible siempre.'}
                    {(profile?.visibility_mode === 'gradual' || !profile?.visibility_mode) && 'Tu foto comienza difuminada y se aclara conforme avanzas niveles con tu match (Recomendado).'}
                    {profile?.visibility_mode === 'essence' && 'Tu foto es totalmente invisible hasta el Nivel 3. Fomenta conexiones 100% emocionales.'}
                </p>
            </div>

            {/* Quick Stats */}
            <div className="profile-page__stats stagger-children">
                <div className="profile-page__stat glass" onClick={() => navigate('/onboard')} style={{ cursor: 'pointer' }}>
                    <Activity size={18} color="var(--freq-mid)" />
                    <span className="profile-page__stat-value">{profile?.onboarding_completed ? 'Listo' : 'No'}</span>
                    <span className="profile-page__stat-label">Readiness</span>
                </div>
                <div className="profile-page__stat glass" onClick={() => navigate('/verification')} style={{ cursor: 'pointer' }}>
                    <Shield size={18} color="var(--line-sex)" />
                    <span className="profile-page__stat-value">{profile?.trust_level || 'bronze'}</span>
                    <span className="profile-page__stat-label">Confianza</span>
                </div>
                <div className="profile-page__stat glass" onClick={() => navigate('/pricing')} style={{ cursor: 'pointer' }}>
                    <TrendingUp size={18} color="var(--line-realization)" />
                    <span className="profile-page__stat-value">{profile?.tier}</span>
                    <span className="profile-page__stat-label">Nivel</span>
                </div>
            </div>

            {/* Menu */}
            <nav className="profile-page__menu">
                <h3 className="profile-page__menu-title">Mi Perfil</h3>
                <MenuItem icon={<BarChart3 size={18} />} label="Gráfica de Relación" color="var(--line-love)" onClick={() => navigate('/profile/graph')} />
                <MenuItem icon={<Activity size={18} />} label="Radar de Frecuencia" color="var(--line-sex)" onClick={() => navigate('/profile/frequency')} />
                <MenuItem icon={<BookHeart size={18} />} label="Mi Diario Emocional" color="var(--love-rose)" onClick={() => navigate('/profile/journal')} />
                <MenuItem icon={<Layers size={18} />} label="Mis Factores" color="var(--line-realization)" onClick={() => navigate('/profile/factors')} />
                <MenuItem icon={<TrendingUp size={18} />} label="Plan de Mejora" color="var(--success)" onClick={() => navigate('/profile/improvement')} />

                <h3 className="profile-page__menu-title">Cuenta</h3>
                <MenuItem icon={<Shield size={18} />} label="Verificación (Selfie)" color="var(--love-warm)" onClick={() => navigate('/selfie-verification')} />
                <MenuItem icon={<ShieldAlert size={18} />} label="Contactos de Emergencia" color="var(--warning)" onClick={() => navigate('/profile/emergency-contacts')} />
                <MenuItem icon={<CreditCard size={18} />} label="Suscripción" color="var(--love-rose)" onClick={() => navigate('/pricing')} />
                <MenuItem icon={<Settings size={18} />} label="Configuración" color="var(--text-secondary)" onClick={() => navigate('/profile/settings')} />
                <MenuItem icon={<FileText size={18} />} label="Legal y Privacidad" color="var(--text-secondary)" onClick={() => navigate('/profile/legal')} />
                <MenuItem icon={<BookOpen size={18} />} label="La Ciencia Detrás" color="var(--line-sex)" onClick={() => navigate('/profile/science')} />
                <MenuItem icon={<Shield size={18} />} label="Acerca del Creador" color="var(--love-rose)" onClick={() => navigate('/profile/creator')} />

                <h3 className="profile-page__menu-title" style={{ color: 'var(--warning)', marginTop: '24px' }}>Zona Creador</h3>
                 <MenuItem icon={<Activity size={18} />} label="Centro de Control (Admin)" color="var(--warning)" onClick={() => navigate('/admin')} />

                <button className="profile-page__logout glass" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                </button>
            </nav>
        </div>
    )
}

function MenuItem({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick?: () => void }) {
    return (
        <button className="profile-page__menu-item glass" onClick={onClick}>
            <div className="profile-page__menu-icon" style={{ color }}>{icon}</div>
            <span>{label}</span>
            <ChevronRight size={16} className="profile-page__menu-arrow" />
        </button>
    )
}
