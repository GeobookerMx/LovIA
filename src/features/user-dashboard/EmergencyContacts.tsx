import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Save, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

export default function EmergencyContacts() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const [contact1Name, setContact1Name] = useState('')
    const [contact1Phone, setContact1Phone] = useState('')
    const [contact2Name, setContact2Name] = useState('')
    const [contact2Phone, setContact2Phone] = useState('')

    useEffect(() => {
        if (!user) return

        async function fetchPrivateProfile() {
            const { data, error } = await supabase
                .from('private_profiles')
                .select('emergency_contact_1_name, emergency_contact_1_phone, emergency_contact_2_name, emergency_contact_2_phone')
                .eq('id', user!.id)
                .maybeSingle()

            if (!error && data) {
                setContact1Name(data.emergency_contact_1_name || '')
                setContact1Phone(data.emergency_contact_1_phone || '')
                setContact2Name(data.emergency_contact_2_name || '')
                setContact2Phone(data.emergency_contact_2_phone || '')
            }
            setLoading(false)
        }

        fetchPrivateProfile()
    }, [user])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setSaving(true)
        setMessage(null)

        const { error } = await supabase
            .from('private_profiles')
            .update({
                emergency_contact_1_name: contact1Name || null,
                emergency_contact_1_phone: contact1Phone || null,
                emergency_contact_2_name: contact2Name || null,
                emergency_contact_2_phone: contact2Phone || null
            })
            .eq('id', user.id)

        setSaving(false)

        if (error) {
            setMessage({ text: 'Hubo un error al guardar los contactos.', type: 'error' })
        } else {
            setMessage({ text: 'Contactos guardados exitosamente en la bóveda segura.', type: 'success' })
        }
    }

    if (loading) {
        return <div className="flex-center" style={{ minHeight: '100vh' }}><Loader2 className="animate-spin" /></div>
    }

    return (
        <div style={{ padding: 'var(--space-6)', maxWidth: 'var(--max-content-width)', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <button className="icon-btn" onClick={() => navigate('/profile')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ marginLeft: 'var(--space-4)', fontSize: 'var(--fs-xl)' }}>Contactos de Emergencia</h2>
            </header>

            <div className="glass-strong animate-fade-in-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', flex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <ShieldCheck size={48} color="var(--success)" style={{ margin: '0 auto var(--space-4)' }}/>
                    <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-2)' }}>Protección en Citas (SOS)</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
                        Agrega hasta 2 contactos de total confianza. Si presionas el Botón de Pánico durante un encuentro, LovIA compartirá automáticamente tu última ubicación segura con ellos.
                    </p>
                </div>

                <form onSubmit={handleSave} className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    
                    {/* Contacto 1 */}
                    <div style={{ background: 'var(--bg-card)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--love-rose)' }}>Contacto Primario</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input 
                                type="text" 
                                placeholder="Nombre (Ej. Mi hermana Laura)" 
                                className="input-field"
                                value={contact1Name}
                                onChange={(e) => setContact1Name(e.target.value)}
                            />
                            <input 
                                type="tel" 
                                placeholder="Número de Teléfono (+52...)" 
                                className="input-field"
                                value={contact1Phone}
                                onChange={(e) => setContact1Phone(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Contacto 2 */}
                    <div style={{ background: 'var(--bg-card)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--text-primary)' }}>Contacto Secundario (Opcional)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input 
                                type="text" 
                                placeholder="Nombre completo" 
                                className="input-field"
                                value={contact2Name}
                                onChange={(e) => setContact2Name(e.target.value)}
                            />
                            <input 
                                type="tel" 
                                placeholder="Número de Teléfono" 
                                className="input-field"
                                value={contact2Phone}
                                onChange={(e) => setContact2Phone(e.target.value)}
                            />
                        </div>
                    </div>

                    {message && (
                        <div style={{ 
                            padding: '12px', 
                            borderRadius: '8px', 
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: message.type === 'success' ? 'var(--success)' : 'var(--warning)', 
                            textAlign: 'center',
                            fontSize: 'var(--fs-sm)',
                            fontWeight: 'bold'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="matches-page__cta" 
                        disabled={saving}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 'var(--space-4)' }}
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Guardar Privacidad</>}
                    </button>
                    
                </form>
            </div>
        </div>
    )
}
