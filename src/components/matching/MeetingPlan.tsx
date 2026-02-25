import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, MapPin, Clock, Coffee, MessageCircle,
    Shield, Check, AlertTriangle, Phone
} from 'lucide-react'
import './Matching.css'

const plan = {
    place_type: 'Cafetería con terraza',
    why: 'Ambos disfrutan espacios tranquilos y abiertos',
    suggested_duration: '60-90 minutos',
    exit_protocol: 'Puedes salir cuando quieras sin dar explicaciones. Un simple "fue un gusto" es suficiente.',
    starters: [
        '¿Qué te motivó a probar LovIA!?',
        '¿Cuál fue tu momento más feliz esta semana?',
        '¿Qué es lo primero que notas de alguien?',
        'Si pudieras cenar con cualquier persona, ¿quién sería?',
        '¿Cuál es tu guilty pleasure favorito?',
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

            {/* Place suggestion */}
            <div className="meeting-plan__card glass-strong animate-fade-in-up">
                <h3><Coffee size={18} /> Sugerencia de Lugar</h3>
                <div className="meeting-plan__detail">
                    <div className="meeting-plan__detail-row">
                        <MapPin size={14} /> <strong>{plan.place_type}</strong>
                    </div>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                        {plan.why}
                    </p>
                    <div className="meeting-plan__detail-row">
                        <Clock size={14} /> Duración sugerida: {plan.suggested_duration}
                    </div>
                </div>
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
                    {plan.starters.map((s, i) => (
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
                    {plan.exit_protocol}
                </p>
            </div>

            {/* SOS button */}
            <button className="meeting-plan__sos">
                🆘 Botón SOS — Compartir ubicación
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
        </div>
    )
}
