import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, MessageCircle, Shield, Check, AlertTriangle, Phone } from 'lucide-react'
import './Matching.css'

const safetyItems = [
    { id: 'public', label: 'Elegí un lugar público y concurrido', icon: <MapPin size={16} /> },
    { id: 'contact', label: 'Avisé a una persona de confianza por mis propios medios', icon: <Phone size={16} /> },
    { id: 'charged', label: 'Tengo batería y conexión en el celular', icon: <Shield size={16} /> },
    { id: 'transport', label: 'Tengo una forma independiente de regresar', icon: <Clock size={16} /> },
    { id: 'exit', label: 'Sé que puedo retirarme cuando lo necesite', icon: <AlertTriangle size={16} /> },
]
const starters = ['¿Qué te motivó a probar LovIA?', '¿Qué disfrutaste esta semana?', '¿Qué te gusta hacer en tu tiempo libre?']

export default function MeetingPlan() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
    const toggleCheck = (itemId: string) => setCheckedItems(previous => {
        const next = new Set(previous)
        if (next.has(itemId)) next.delete(itemId)
        else next.add(itemId)
        return next
    })

    return (
        <main className="meeting-plan">
            <header className="meeting-plan__header">
                <button type="button" className="meeting-plan__back" onClick={() => navigate(`/matches/${id}`)} aria-label="Volver a la conexión"><ArrowLeft size={20} /></button>
                <h2>Prepara tu encuentro</h2>
            </header>
            <section className="meeting-plan__card glass-strong">
                <h3><MapPin size={18} /> Elijan un lugar público</h3>
                <p>Acuerden un lugar concurrido y comprueben por su cuenta su dirección y horario. LovIA aún no ofrece un catálogo de establecimientos verificados ni calcula puntos de encuentro.</p>
                <p>No compartas tu domicilio ni tu ubicación precisa para organizar una primera cita.</p>
            </section>
            <section className="meeting-plan__card glass-strong">
                <h3><Shield size={18} /> Antes de salir</h3>
                <div className="meeting-plan__checklist">
                    {safetyItems.map(item => <label key={item.id} className={`meeting-plan__check-item ${checkedItems.has(item.id) ? 'meeting-plan__check-item--done' : ''}`}>
                        <input type="checkbox" checked={checkedItems.has(item.id)} onChange={() => toggleCheck(item.id)} />{item.icon}<span>{item.label}</span>
                    </label>)}
                </div>
                <p>Esta lista es una ayuda personal; completarla no garantiza la seguridad de un encuentro.</p>
            </section>
            <section className="meeting-plan__card glass-strong">
                <h3><MessageCircle size={18} /> Para empezar a conversar</h3>
                <div className="meeting-plan__starters">{starters.map(text => <p key={text} className="meeting-plan__starter">{text}</p>)}</div>
            </section>
            <section className="meeting-plan__card glass" aria-labelledby="meeting-help-title">
                <h3 id="meeting-help-title"><AlertTriangle size={18} /> Si necesitas ayuda</h3>
                <p>Puedes retirarte cuando quieras. Si te sientes en riesgo, busca un lugar concurrido, pide ayuda al personal y contacta directamente a alguien de confianza o a los servicios de emergencia de tu localidad.</p>
                <p><strong>LovIA no envía alertas SOS, SMS ni tu ubicación a contactos o moderadores desde esta pantalla.</strong> No esperes una respuesta de emergencia de la app.</p>
            </section>
            {checkedItems.size === safetyItems.length && <button type="button" className="match-detail__accept" onClick={() => navigate(`/matches/${id}`)}><Check size={16} /> Lista revisada · Volver a la conexión</button>}
        </main>
    )
}
