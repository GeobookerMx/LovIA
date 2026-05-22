import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Brain, CheckCircle, Loader2, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './AssessmentShared.css'

// BFI-10 — validado en 56 países (Rammstedt & John, 2007)
const QUESTIONS = [
  { id: 1,  text: 'Me veo como alguien que es reservado/a.',                    dim: 'E', reverse: true },
  { id: 2,  text: 'Me veo como alguien generalmente confiable y responsable.',   dim: 'C' },
  { id: 3,  text: 'Me veo como alguien que tiende a ser crítico/a con los demás.',dim: 'A', reverse: true },
  { id: 4,  text: 'Me veo como alguien que es relajado/a y maneja bien el estrés.',dim: 'N', reverse: true },
  { id: 5,  text: 'Me veo como alguien que tiene poca imaginación artística.',   dim: 'O', reverse: true },
  { id: 6,  text: 'Me veo como alguien extrovertido/a y entusiasta.',           dim: 'E' },
  { id: 7,  text: 'Me veo como alguien que tiende a ser desorganizado/a.',      dim: 'C', reverse: true },
  { id: 8,  text: 'Me veo como alguien empático/a y amable.',                   dim: 'A' },
  { id: 9,  text: 'Me veo como alguien que se pone nervioso/a fácilmente.',     dim: 'N' },
  { id: 10, text: 'Me veo como alguien con amplias inquietudes artísticas y culturales.', dim: 'O' },
]

const DIM_INFO: Record<string, { name: string; color: string; desc: string; emoji: string }> = {
  O: { name: 'Apertura',         emoji: '🌌', color: '#a78bfa', desc: 'Curiosidad intelectual, imaginación y amplitud de intereses.' },
  C: { name: 'Responsabilidad',  emoji: '⚙️',  color: '#60a5fa', desc: 'Organización, autodisciplina y orientación a metas.' },
  E: { name: 'Extraversión',     emoji: '⚡',  color: '#f59e0b', desc: 'Sociabilidad, asertividad y energía en interacciones sociales.' },
  A: { name: 'Amabilidad',       emoji: '💞',  color: '#f472b6', desc: 'Cooperación, confianza y orientación hacia los demás.' },
  N: { name: 'Neuroticismo',     emoji: '🌊',  color: '#6ee7b7', desc: 'Tendencia a experimentar emociones negativas y reactividad emocional.' },
}

const LABELS = ['Desacuerdo total', 'Desacuerdo', 'Neutral', 'Acuerdo', 'Acuerdo total']

function computeOcean(answers: Record<number, number>) {
  const scores: Record<string, number[]> = { O: [], C: [], E: [], A: [], N: [] }
  QUESTIONS.forEach(q => {
    const val = answers[q.id] ?? 3
    scores[q.dim].push(q.reverse ? 6 - val : val)
  })
  const result: Record<string, number> = {}
  Object.entries(scores).forEach(([dim, vals]) => {
    result[dim] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 20)
  })
  return result
}

export default function BigFiveQuiz() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<Record<string, number> | null>(null)
  const [saving, setSaving] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)

  const handleAnswer = (qId: number, val: number) => {
    const updated = { ...answers, [qId]: val }
    setAnswers(updated)
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(q => q + 1), 300)
    } else {
      setResult(computeOcean(updated))
    }
  }

  const handleSave = async () => {
    if (!user || !result) return
    setSaving(true)
    try {
      await updateProfile({ ocean_scores: result })
      const { data: p } = await supabase.from('profiles').select('assessments_done').eq('id', user.id).single()
      const done = [...(p?.assessments_done || []).filter((d: string) => d !== 'bigfive'), 'bigfive']
      await supabase.from('profiles').update({ assessments_done: done }).eq('id', user.id)
      navigate('/profile')
    } finally {
      setSaving(false)
    }
  }

  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100
  const q = QUESTIONS[currentQ]

  return (
    <div className="assessment-page">
      <header className="assessment-header">
        <button className="assessment-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <div>
          <h2>Personalidad OCEAN</h2>
          <p className="assessment-subtitle">Big Five · Costa & McCrae · BFI-10</p>
        </div>
      </header>

      {!result ? (
        <>
          <div className="assessment-progress-bar">
            <div className="assessment-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="assessment-progress-text">{Object.keys(answers).length} de {QUESTIONS.length}</p>

          <div className="assessment-card glass-strong animate-scale-in" key={q.id}>
            <div className="assessment-q-num">Pregunta {currentQ + 1}</div>
            <p className="assessment-q-text">"{q.text}"</p>
            <div className="assessment-options assessment-options--scale">
              {LABELS.map((label, i) => (
                <button
                  key={i}
                  className={`assessment-option assessment-option--scale ${answers[q.id] === i + 1 ? 'selected' : ''}`}
                  onClick={() => handleAnswer(q.id, i + 1)}
                >
                  <span className="assessment-option__num">{i + 1}</span>
                  <span className="assessment-option__label">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="assessment-result glass-strong animate-scale-in">
          <Brain size={40} color="var(--line-sex)" style={{ marginBottom: 12 }} />
          <h2>Tu Perfil OCEAN</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
            Basado en el BFI-10, instrumento validado en 56 países.
          </p>

          {/* Barras por dimensión */}
          <div className="ocean-bars">
            {Object.entries(DIM_INFO).map(([dim, info]) => (
              <div key={dim} className="ocean-bar-row">
                <div className="ocean-bar-label">
                  <span>{info.emoji}</span>
                  <span>{info.name}</span>
                </div>
                <div className="ocean-bar-track">
                  <div
                    className="ocean-bar-fill"
                    style={{ width: `${result[dim]}%`, background: info.color }}
                  />
                </div>
                <span className="ocean-bar-pct">{result[dim]}%</span>
              </div>
            ))}
          </div>

          {/* Dimensión más alta */}
          <div className="assessment-result__science glass" style={{ marginTop: 20 }}>
            <ChevronRight size={14} color="var(--line-sex)" />
            <span>
              Tu dimensión dominante es <strong>{DIM_INFO[Object.entries(result).sort((a,b) => b[1]-a[1])[0][0]].name}</strong>.
              Esto afecta cómo te relacionas en pareja.
            </span>
          </div>

          <div className="assessment-result__impact">
            <h4>Impacto en tu compatibilidad</h4>
            <p>Tu perfil OCEAN se integra a la <strong>Gráfica Relacional</strong> para encontrar matches con personalidades complementarias.</p>
          </div>

          <button className="btn btn-primary assessment-result__btn" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            Guardar en mi perfil
          </button>
          <button className="btn assessment-result__retry" onClick={() => { setAnswers({}); setResult(null); setCurrentQ(0) }}>
            Repetir evaluación
          </button>
        </div>
      )}
    </div>
  )
}
