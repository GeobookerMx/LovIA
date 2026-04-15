import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, DollarSign, Phone, Globe, BookOpen, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './SpecialistForm.css'

const SPECIALTIES = [
    'Terapia de pareja',
    'Psicología individual',
    'Sexología clínica',
    'Terapia familiar sistémica',
    'EFT — Emociones Focalizadas',
    'Tanatología y duelo',
    'Psiquiatría relacional',
    'Coaching relacional',
    'Neuropsicología',
    'Mindfulness y ACT',
]

const MODALITIES = ['Presencial', 'En línea (videollamada)', 'Ambas modalidades']

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function SpecialistRegisterPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [form, setForm] = useState({
        // Personal & credentials
        full_name: '',
        title: '',    // Lic., Mtro., Dr., Dra.
        cedula: '',   // Cédula profesional
        specialty: '',
        bio: '',
        approach: '',  // Marco teórico / enfoque

        // Service details
        modality: 'Ambas modalidades',
        session_duration_min: 50,
        price_individual: '',
        price_couple: '',
        currency: 'MXN',
        offers_sliding_scale: false,  // Escala móvil (precio adaptable)

        // Location
        city: '',
        state: '',
        neighborhood: '',
        address_street: '',
        maps_link: '',

        // Schedule
        available_days: [] as string[],
        time_start: '09:00',
        time_end: '19:00',
        accepts_urgent: false,

        // Contact & online presence
        phone_whatsapp: '',
        email_professional: '',
        website: '',
        instagram: '',
        calendly_link: '',

        // Verification
        agree_terms: false,
        cross_register_geobooker: false,
    })

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

    const toggleDay = (day: string) => {
        setForm(f => ({
            ...f,
            available_days: f.available_days.includes(day)
                ? f.available_days.filter(d => d !== day)
                : [...f.available_days, day]
        }))
    }

    const handleSubmit = async () => {
        if (!user) return
        setLoading(true)
        try {
            const { error } = await supabase.from('specialists').insert({
                user_id: user.id,
                full_name: form.full_name,
                title: form.title,
                cedula: form.cedula,
                specialty: form.specialty,
                bio: form.bio,
                approach: form.approach,
                modality: form.modality,
                session_duration_min: form.session_duration_min,
                price_individual: parseFloat(form.price_individual) || null,
                price_couple: parseFloat(form.price_couple) || null,
                currency: form.currency,
                offers_sliding_scale: form.offers_sliding_scale,
                city: form.city,
                state: form.state,
                neighborhood: form.neighborhood,
                address_street: form.address_street,
                maps_link: form.maps_link,
                available_days: form.available_days,
                time_start: form.time_start,
                time_end: form.time_end,
                accepts_urgent: form.accepts_urgent,
                phone_whatsapp: form.phone_whatsapp,
                email_professional: form.email_professional,
                website: form.website,
                instagram: form.instagram,
                calendly_link: form.calendly_link,
                cross_register_geobooker: form.cross_register_geobooker,
                status: 'pending',  // Requires admin approval
                verified: false,
            })
            if (!error) setSuccess(true)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="specialist-form">
                <div className="specialist-success glass-strong animate-scale-in">
                    <CheckCircle size={56} color="var(--success)" className="animate-heartbeat" />
                    <h2>¡Solicitud enviada!</h2>
                    <p>
                        Tu perfil profesional está en revisión. El equipo de LovIA verificará tu cédula y 
                        credenciales en 24-48 horas. Te notificaremos por email cuando esté activo.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/community/directory')}>
                        Ver directorio
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="specialist-form">
            <header className="specialist-form__header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2>Únete al Directorio</h2>
                    <p className="specialist-form__subtitle">Paso {step} de 4</p>
                </div>
            </header>

            {/* Step indicators */}
            <div className="specialist-steps">
                {['Perfil', 'Servicio', 'Ubicación y Horarios', 'Contacto'].map((s, i) => (
                    <div key={s} className={`specialist-step ${step >= i + 1 ? 'active' : ''}`}>
                        <div className="specialist-step__dot">{i + 1}</div>
                        <span>{s}</span>
                    </div>
                ))}
            </div>

            <div className="specialist-form__body glass-strong">

                {/* Step 1: Perfil y Credenciales */}
                {step === 1 && (
                    <div className="form-section animate-fade-in-up">
                        <h3>👤 Perfil Profesional</h3>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Título profesional</label>
                                <select value={form.title} onChange={e => set('title', e.target.value)}>
                                    <option value="">Selecciona...</option>
                                    {['Lic.', 'Mtro.', 'Mtra.', 'Dr.', 'Dra.', 'Psic.'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field flex-2">
                                <label>Nombre completo</label>
                                <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Patricia Vázquez Morales" />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Cédula profesional <span className="required">*</span></label>
                            <input value={form.cedula} onChange={e => set('cedula', e.target.value)} placeholder="12345678" maxLength={10} />
                            <small>Se verificará en el Registro Nacional de Profesionistas (SEP)</small>
                        </div>

                        <div className="form-field">
                            <label>Especialidad principal</label>
                            <select value={form.specialty} onChange={e => set('specialty', e.target.value)}>
                                <option value="">Selecciona tu especialidad...</option>
                                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Marco teórico / Enfoque clínico</label>
                            <input value={form.approach} onChange={e => set('approach', e.target.value)} placeholder="Ej: Gottman Level 2, EFT, TCC, ACT, Sistémica..." />
                        </div>

                        <div className="form-field">
                            <label>Descripción de tu práctica</label>
                            <textarea
                                value={form.bio}
                                onChange={e => set('bio', e.target.value)}
                                placeholder="Cuéntale a los usuarios cómo trabajas, qué problemas atiendes y qué los puede motivar a buscarte..."
                                rows={4}
                            />
                            <small>{form.bio.length}/400 caracteres</small>
                        </div>
                    </div>
                )}

                {/* Step 2: Servicio y Costos */}
                {step === 2 && (
                    <div className="form-section animate-fade-in-up">
                        <h3><DollarSign size={18} style={{ display: 'inline', marginRight: 6 }} />Servicio y Costos</h3>

                        <div className="form-field">
                            <label>Modalidad de atención</label>
                            <div className="form-radio-group">
                                {MODALITIES.map(m => (
                                    <label key={m} className={`radio-option ${form.modality === m ? 'active' : ''}`}>
                                        <input type="radio" name="modality" value={m} checked={form.modality === m} onChange={() => set('modality', m)} />
                                        {m}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Duración de sesión estándar</label>
                            <select value={form.session_duration_min} onChange={e => set('session_duration_min', +e.target.value)}>
                                {[45, 50, 60, 75, 90].map(d => <option key={d} value={d}>{d} minutos</option>)}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Costo individual ({form.currency})</label>
                                <input
                                    type="number"
                                    value={form.price_individual}
                                    onChange={e => set('price_individual', e.target.value)}
                                    placeholder="800"
                                    min="0"
                                />
                            </div>
                            <div className="form-field">
                                <label>Costo pareja ({form.currency})</label>
                                <input
                                    type="number"
                                    value={form.price_couple}
                                    onChange={e => set('price_couple', e.target.value)}
                                    placeholder="1200"
                                    min="0"
                                />
                            </div>
                            <div className="form-field">
                                <label>Moneda</label>
                                <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                                    <option value="MXN">MXN</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>

                        <label className="form-checkbox">
                            <input type="checkbox" checked={form.offers_sliding_scale} onChange={e => set('offers_sliding_scale', e.target.checked)} />
                            <span>Ofrezco escala de honorarios adaptable (ajuste por nivel socioeconómico)</span>
                        </label>
                    </div>
                )}

                {/* Step 3: Ubicación y Horarios */}
                {step === 3 && (
                    <div className="form-section animate-fade-in-up">
                        <h3><MapPin size={18} style={{ display: 'inline', marginRight: 6 }} />Ubicación y Horarios</h3>

                        <div className="form-row">
                            <div className="form-field flex-2">
                                <label>Ciudad</label>
                                <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Ciudad de México" />
                            </div>
                            <div className="form-field">
                                <label>Estado</label>
                                <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="CDMX" />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Colonia / Barrio (opcional)</label>
                            <input value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} placeholder="Coyoacán, Roma Norte..." />
                        </div>

                        {(form.modality === 'Presencial' || form.modality === 'Ambas modalidades') && (
                            <>
                                <div className="form-field">
                                    <label>Dirección del consultorio (solo referencias, no número exacto)</label>
                                    <input value={form.address_street} onChange={e => set('address_street', e.target.value)} placeholder="Av. Universidad y Copilco, CDMX" />
                                </div>
                                <div className="form-field">
                                    <label><Globe size={14} style={{ display: 'inline', marginRight: 4 }} />Liga de Google Maps (opcional)</label>
                                    <input value={form.maps_link} onChange={e => set('maps_link', e.target.value)} placeholder="https://maps.app.goo.gl/..." />
                                </div>
                            </>
                        )}

                        <div className="form-field">
                            <label><Clock size={14} style={{ display: 'inline', marginRight: 4 }} />Días disponibles</label>
                            <div className="day-selector">
                                {DAYS.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`day-btn ${form.available_days.includes(day) ? 'active' : ''}`}
                                        onClick={() => toggleDay(day)}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Horario de inicio</label>
                                <input type="time" value={form.time_start} onChange={e => set('time_start', e.target.value)} />
                            </div>
                            <div className="form-field">
                                <label>Horario de cierre</label>
                                <input type="time" value={form.time_end} onChange={e => set('time_end', e.target.value)} />
                            </div>
                        </div>

                        <label className="form-checkbox">
                            <input type="checkbox" checked={form.accepts_urgent} onChange={e => set('accepts_urgent', e.target.checked)} />
                            <span>Acepto citas urgentes o de crisis (mismo día)</span>
                        </label>
                    </div>
                )}

                {/* Step 4: Contacto y verificación */}
                {step === 4 && (
                    <div className="form-section animate-fade-in-up">
                        <h3><Phone size={18} style={{ display: 'inline', marginRight: 6 }} />Contacto y Presencia Digital</h3>

                        <div className="form-field">
                            <label>WhatsApp profesional</label>
                            <input value={form.phone_whatsapp} onChange={e => set('phone_whatsapp', e.target.value)} placeholder="+52 55 1234 5678" type="tel" />
                        </div>
                        <div className="form-field">
                            <label>Email profesional</label>
                            <input value={form.email_professional} onChange={e => set('email_professional', e.target.value)} placeholder="contacto@tucuconsultorio.com" type="email" />
                        </div>
                        <div className="form-field">
                            <label><Globe size={14} style={{ display: 'inline', marginRight: 4 }} />Sitio web o perfil profesional (opcional)</label>
                            <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://tuweb.com" />
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Instagram (opcional)</label>
                                <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@tu_cuenta" />
                            </div>
                            <div className="form-field">
                                <label>Calendly / Agenda online (opcional)</label>
                                <input value={form.calendly_link} onChange={e => set('calendly_link', e.target.value)} placeholder="https://calendly.com/tu-link" />
                            </div>
                        </div>

                        <div className="specialist-legal glass" style={{ marginTop: 20 }}>
                            <BookOpen size={20} color="var(--love-rose)" />
                            <p>
                                Al registrarte confirmas que tu cédula profesional es válida, que tu práctica sigue los lineamientos éticos del 
                                Código Deontológico de la APA y la AMAPSI, y aceptas que LovIA puede mostrar tu perfil a usuarios que necesiten apoyo profesional.
                            </p>
                        </div>

                        <label className="form-checkbox" style={{ marginTop: 12 }}>
                            <input type="checkbox" checked={form.agree_terms} onChange={e => set('agree_terms', e.target.checked)} />
                            <span>Acepto los términos del Directorio Profesional de LovIA</span>
                        </label>

                        <div className="specialist-legal glass" style={{ marginTop: 20, borderLeft: '4px solid var(--success)' }}>
                            <Globe size={20} color="var(--success)" />
                            <p>
                                <strong>¡Llega a más pacientes!</strong> Geobooker.com.mx es el ecosistema oficial de LovIA. 
                            </p>
                            <label className="form-checkbox" style={{ marginTop: 12 }}>
                                <input type="checkbox" checked={form.cross_register_geobooker} onChange={e => set('cross_register_geobooker', e.target.checked)} />
                                <span>Deseo vincular gratuitamente mi consultorio o perfil online a <strong>Geobooker</strong> para aparecer en resultados locales verificados e incrementar mis consultas.</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="specialist-form__nav">
                    {step > 1 && (
                        <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                            ← Anterior
                        </button>
                    )}
                    {step < 4 ? (
                        <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}
                            style={{ marginLeft: 'auto' }}>
                            Siguiente →
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading || !form.agree_terms || !form.cedula || !form.full_name}
                            style={{ marginLeft: 'auto' }}
                        >
                            {loading ? 'Enviando...' : '🚀 Enviar solicitud'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
