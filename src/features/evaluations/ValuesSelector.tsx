import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './AssessmentShared.css'

// Schwartz's 10 Basic Human Values (2012 refinement)
const VALUES = [
  { id: 'power',          emoji: '👑', name: 'Poder',            desc: 'Estatus social, control sobre personas y recursos.' },
  { id: 'achievement',    emoji: '🏆', name: 'Logro',            desc: 'Éxito personal, demostrar competencia.' },
  { id: 'hedonism',       emoji: '🌟', name: 'Hedonismo',        desc: 'Placer, disfrute de la vida, gratificación personal.' },
  { id: 'stimulation',    emoji: '⚡', name: 'Estimulación',     desc: 'Novedad, reto, emoción en la vida.' },
  { id: 'self_direction', emoji: '🧭', name: 'Autodirección',    desc: 'Independencia de pensamiento y acción.' },
  { id: 'universalism',   emoji: '🌍', name: 'Universalismo',    desc: 'Comprensión, tolerancia, igualdad y protección de la naturaleza.' },
  { id: 'benevolence',    emoji: '💞', name: 'Benevolencia',     desc: 'Preservar y mejorar el bienestar de las personas cercanas.' },
  { id: 'tradition',      emoji: '🏛️', name: 'Tradición',        desc: 'Respeto y compromiso con costumbres culturales o religiosas.' },
  { id: 'conformity',     emoji: '🤝', name: 'Conformidad',      desc: 'Moderación de acciones e impulsos que pudieran dañar a otros.' },
  { id: 'security',       emoji: '🛡️', name: 'Seguridad',        desc: 'Estabilidad, armonía y seguridad en sociedad y relaciones.' },
]

const MAX_SELECTION = 3

export default function ValuesSelector() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else if (selected.length < MAX_SELECTION) {
      setSelected([...selected, id])
    }
  }

  const handleSave = async () => {
    if (!user || selected.length === 0) return
    setSaving(true)
    try {
      await updateProfile({ core_values: selected })
      const { data: p } = await supabase.from('profiles').select('assessments_done').eq('id', user.id).single()
      const doneList = [...(p?.assessments_done || []).filter((d: string) => d !== 'values'), 'values']
      await supabase.from('profiles').update({ assessments_done: doneList }).eq('id', user.id)
      setDone(true)
      setTimeout(() => navigate('/profile'), 1800)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="assessment-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="assessment-result glass-strong animate-scale-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🌟</div>
          <h2 style={{ color: 'var(--success)' }}>¡Valores guardados!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tu Gráfica Relacional se ha actualizado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="assessment-page">
      <header className="assessment-header">
        <button className="assessment-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <div>
          <h2>Mis Valores Esenciales</h2>
          <p className="assessment-subtitle">Schwartz Basic Human Values · 2012</p>
        </div>
      </header>

      <div className="values-instruction glass" style={{ marginBottom: 20 }}>
        <Star size={16} color="var(--love-warm)" />
        <span>Selecciona los <strong>3 valores</strong> que más te definen en una relación</span>
      </div>

      {/* Contador */}
      <div className="values-counter">
        {[1, 2, 3].map(n => (
          <div
            key={n}
            className={`values-counter__dot ${selected.length >= n ? 'filled' : ''}`}
          />
        ))}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          {selected.length}/3 seleccionados
        </span>
      </div>

      {/* Tarjetas de valores */}
      <div className="values-grid">
        {VALUES.map(v => {
          const isSelected = selected.includes(v.id)
          const isDisabled = !isSelected && selected.length >= MAX_SELECTION
          return (
            <button
              key={v.id}
              className={`value-card glass ${isSelected ? 'value-card--selected' : ''} ${isDisabled ? 'value-card--disabled' : ''}`}
              onClick={() => toggle(v.id)}
              disabled={isDisabled}
            >
              <span className="value-card__emoji">{v.emoji}</span>
              <strong className="value-card__name">{v.name}</strong>
              <p className="value-card__desc">{v.desc}</p>
              {isSelected && <div className="value-card__check"><CheckCircle size={16} /></div>}
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <button
        className="btn btn-primary assessment-result__btn"
        style={{ marginTop: 24, width: '100%' }}
        onClick={handleSave}
        disabled={selected.length === 0 || saving}
      >
        {saving
          ? <Loader2 size={18} className="animate-spin" />
          : <CheckCircle size={18} />
        }
        {selected.length === 0
          ? 'Selecciona al menos 1 valor'
          : `Guardar mis ${selected.length} valor${selected.length > 1 ? 'es' : ''}`
        }
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 12, lineHeight: 1.5 }}>
        Los valores se comparan con tus matches para medir alineación a largo plazo.
        Basado en la teoría de valores universales de Schwartz (2012).
      </p>
    </div>
  )
}
