import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, MapPin, Clock, MessageCircle,
    Shield, Check, AlertTriangle, Phone, Loader2, X
} from 'lucide-react'
import './Matching.css'

const defaultPlan = {
    place_type: 'Buscando punto medio...',
    why: 'Calculando distancia equitativa',
    suggested_duration: '60-90 minutos',
    exit_protocol: 'Puedes salir cuando quieras sin dar explicaciones. Un simple "fue un gusto" es suficiente.',
    starters: [
        '¿Qué te motivó a probar LovIA!?',
        '¿Cuál fue tu momento más feliz esta semana?',
        '¿Qué es lo primero que notas de un lugar?',
        'Si pudieras cenar con cualquier persona, ¿quién sería?',
        '¿Cuál es tu gusto culposo?',
    ],
}

const safetyItems = [
    { id: 'public', label: 'El lugar es público y concurrido', icon: <MapPin size={16} /> },
    { id: 'contact', label: 'Compartí ubicación con mi contacto de confianza', icon: <Phone size={16} /> },
    { id: 'charged', label: 'Celular cargado al 100%', icon: <Shield size={16} /> },
    { id: 'transport', label: 'Tengo transporte propio de regreso', icon: <Clock size={16} /> },
    { id: 'exit', label: 'Leí el protocolo de salida segura', icon: <AlertTriangle size={16} /> },
]

export default function MeetingPlan() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
    const [sosActive, setSosActive] = useState(false)
    const [sosModalVisible, setSosModalVisible] = useState(false)

    const handleSOS = async () => {
        setSosActive(true)
        // Aquí simulamos enviar la ubicación a supabase y ejecutar un trigger de SMS
        setTimeout(() => {
            setSosActive(false)
            setSosModalVisible(true)
        }, 1500)
    }



    const simulatedGeobookerVenues = [
        { id: 1, name: "Café de la Flor", type: "Cafetería Premium", address: "Av. Siempre Viva 123", rating: 4.8 },
        { id: 2, name: "Parque Bicentenario", type: "Jardín Público Abierto", address: "Zona Centro", rating: 4.5 },
        { id: 3, name: "Librería El Péndulo", type: "Librería y Café", address: "Plaza Mayor", rating: 4.9 }
    ];

    const toggleCheck = (itemId: string) => {
        setCheckedItems((prev) => {
            const next = new Set(prev)
            if (next.has(itemId)) next.delete(itemId)
            else next.add(itemId)
            return next
        })
    }

    const allChecked = checkedItems.size === safetyItems.length

    return (
        <div className="meeting-plan">
            {/* Header */}
            <div className="meeting-plan__header">
                <button className="meeting-plan__back" onClick={() => navigate(`/matches/${id}`)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Plan de Encuentro</h2>
            </div>

            {/* Place suggestion from Geobooker */}
            <div className="meeting-plan__card glass-strong animate-fade-in-up" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--success)', color: 'white', fontSize: '10px', padding: '4px 12px', fontWeight: 'bold', borderBottomLeftRadius: '8px' }}>
                    PATROCINADOS POR GEOBOOKER
                </div>
                <h3 style={{ marginTop: '8px', marginBottom: '16px' }}><MapPin size={18} /> Lugares recomendados (Punto Medio)</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {simulatedGeobookerVenues.map((venue) => (
                        <div key={venue.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong style={{ color: 'var(--love-rose)', display: 'block', fontSize: 'var(--fs-sm)' }}>{venue.name}</strong>
                                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{venue.type} • {venue.address}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontSize: 'var(--fs-xs)', fontWeight: 'bold' }}>
                                ⭐ {venue.rating}
                            </div>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: '16px', fontStyle: 'italic' }}>
                    * Locales verificados en seguridad y privacidad por Geobooker.com.mx
                </p>
            </div>

            {/* Safety checklist */}
            <div className="meeting-plan__card glass-strong animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h3><Shield size={18} /> Checklist de Seguridad</h3>
                <div className="meeting-plan__checklist">
                    {safetyItems.map((item) => (
                        <div
                            key={item.id}
                            className={`meeting-plan__check-item ${checkedItems.has(item.id) ? 'meeting-plan__check-item--done' : ''
                                }`}
                            onClick={() => toggleCheck(item.id)}
                        >
                            <div className="meeting-plan__check-box">
                                {checkedItems.has(item.id) && <Check size={14} />}
                            </div>
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Conversation starters */}
            <div className="meeting-plan__card glass-strong animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3><MessageCircle size={18} /> Tips de Conversación</h3>
                <div className="meeting-plan__starters">
                    {defaultPlan.starters.map((s: string, i: number) => (
                        <div key={i} className="meeting-plan__starter">
                            {s}
                        </div>
                    ))}
                </div>
            </div>

            {/* Exit protocol */}
            <div className="meeting-plan__card glass animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <h3><AlertTriangle size={18} /> Protocolo de Salida</h3>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {defaultPlan.exit_protocol}
                </p>
            </div>

            {/* SOS button */}
            <button 
                className="meeting-plan__sos" 
                onClick={handleSOS}
                disabled={sosActive}
                style={{ opacity: sosActive ? 0.7 : 1 }}
            >
                {sosActive ? <Loader2 size={18} className="animate-spin" /> : '🆘 Botón SOS — Compartir ubicación'}
            </button>

            {/* Proceed */}
            {allChecked && (
                <button
                    className="match-detail__accept animate-fade-in-up"
                    onClick={() => navigate(`/matches/${id}`)}
                >
                    <Check size={16} /> Todo listo — ¡A conocerse!
                </button>
            )}

            {/* Custom SOS Modal */}
            {sosModalVisible && (
                <div className="legal-overlay animate-fade-in" style={{ zIndex: 9999 }}>
                    <div className="legal-modal glass-strong animate-slide-up" style={{ borderLeft: '4px solid var(--danger)', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <AlertTriangle size={24} /> ALERTA SOS ENVIADA
                            </h2>
                            <button onClick={() => setSosModalVisible(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                            Se ha compartido tu <strong>ubicación en tiempo real</strong> y los detalles del encuentro con tus Contactos de Emergencia.
                        </p>
                        <ul style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '24px', paddingLeft: '20px' }}>
                            <li style={{ marginBottom: '8px' }}>Notificación SMS enviada ✔️</li>
                            <li style={{ marginBottom: '8px' }}>Micrófono grabando ambiente (simulado) ✔️</li>
                            <li>Equipo de moderación de LovIA alertado ✔️</li>
                        </ul>
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', background: 'var(--bg-deep)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                            onClick={() => setSosModalVisible(false)}
                        >
                            Entendido, cerrar alerta
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
