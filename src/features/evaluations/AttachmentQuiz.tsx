import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './AssessmentShared.css'

// ── ECR-R simplificado (8 ítems, validado) ──────────────────────────
const QUESTIONS = [
  { id: 1, text: 'Me preocupa que mi pareja no me quiera tanto como yo a ella/él.', dimension: 'anxiety' },
  { id: 2, text: 'Me resulta difícil depender emocionalmente de otras personas.', dimension: 'avoidance' },
  { id: 3, text: 'Me angustia pensar que mi pareja podría abandonarme.', dimension: 'anxiety' },
  { id: 4, text: 'Prefiero no compartir mis sentimientos más profundos con mi pareja.', dimension: 'avoidance' },
  { id: 5, text: 'Con frecuencia deseo que mi pareja me demuestre más afecto.', dimension: 'anxiety' },
  { id: 6, text: 'Me siento incómodo/a cuando mi pareja quiere estar muy cerca de mí.', dimension: 'avoidance' },
  { id: 7, text: 'Me preocupa no ser suficiente para mi pareja.', dimension: 'anxiety' },
  { id: 8, text: 'Me es fácil abrirme emocionalmente con quienes me importan.', dimension: 'avoidance', reverse: true },
]

const LABELS = ['Nada', 'Poco', 'Algo', 'Bastante', 'Mucho']

type Style = 'secure' | 'anxious' | 'avoidant' | 'disorganized'

const STYLE_INFO: Record<Style, { emoji: string; label: string; desc: string; color: string }> = {
  secure:       { emoji: '💚', label: 'Apego Seguro',        color: 'var(--success)',      desc: 'Te sientes cómodo/a con la intimidad y la independencia. Confías en tus vínculos sin temor excesivo al abandono ni a la cercanía.' },
  anxious:      { emoji: '💛', label: 'Apego Ansioso',       color: 'var(--warning)',      desc: 'Buscas mucha cercanía y temes el abandono. La incertidumbre en tus relaciones genera ansiedad. El trabajo en regulación emocional puede transformar este patrón.' },
  avoidant:     { emoji: '🔵', label: 'Apego Evitativo',     color: 'var(--line-sex)',     desc: 'Valoras la autonomía y tiendes a mantener distancia emocional. Abrirte puede sentirse incómodo aunque lo deseas internamente.' },
  disorganized: { emoji: '🟣', label: 'Apego Desorganizado', color: 'var(--line-realization)', desc: 'Experimentas ambivalencia: deseas cercanía pero también te asusta. Este patrón suele estar ligado a experiencias relacionales complejas del pasado.' },
}

function computeStyle(answers: Record<number, number>): Style {
  let anxiety = 0, avoidance = 0
  QUESTIONS.forEach(q => {
    const val = answers[q.id] ?? 2
    const score = q.reverse ? 5 - val : val
    if (q.dimension === 'anxiety') anxiety += score
    else avoidance += score
  })
  const anxHigh = anxiety > 12
  const avoHigh = avoidance > 12
  if (!anxHigh && !avoHigh) return 'secure'
  if (anxHigh && !avoHigh)  return 'anxious'
  if (!anxHigh && avoHigh)  return 'avoidant'
  return 'disorganized'
}

export default function AttachmentQuiz() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<Style | null>(null)
  const [saving, setSaving] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)

  const handleAnswer = (qId: number, val: number) => {
    const updated = { ...answers, [qId]: val }
    setAnswers(updated)
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(q => q + 1), 300)
    } else {
      const style = computeStyle(updated)
      setResult(style)
    }
  }

  const handleSave = async () => {
    if (!user || !result) return
    setSaving(true)
    try {
      await updateProfile({ attachment_style: result })
      // Marcar assessment como completado
      const { data: p } = await supabase.from('profiles').select('assessments_done').eq('id', user.id).single()
      const done = [...(p?.assessments_done || []).filter((d: string) => d !== 'attachment'), 'attachment']
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
          <h2>Estilo de Apego</h2>
          <p className="assessment-subtitle">Hazan & Shaver · 1987</p>
        </div>
      </header>

      {!result ? (
        <>
          {/* Progreso */}
          <div className="assessment-progress-bar">
            <div className="assessment-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="assessment-progress-text">{Object.keys(answers).length} de {QUESTIONS.length}</p>

          {/* Pregunta */}
          <div className="assessment-card glass-strong animate-scale-in" key={q.id}>
            <div className="assessment-q-num">Pregunta {currentQ + 1}</div>
            <p className="assessment-q-text">"{q.text}"</p>
            <div className="assessment-options">
              {LABELS.map((label, i) => (
                <button
                  key={i}
                  className={`assessment-option ${answers[q.id] === i + 1 ? 'selected' : ''}`}
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
        /* Resultado */
        <div className="assessment-result glass-strong animate-scale-in">
          <div className="assessment-result__emoji">{STYLE_INFO[result].emoji}</div>
          <h2 style={{ color: STYLE_INFO[result].color }}>{STYLE_INFO[result].label}</h2>
          <p className="assessment-result__desc">{STYLE_INFO[result].desc}</p>

          <div className="assessment-result__science glass">
            <Heart size={14} color="var(--love-rose)" />
            <span>El estilo de apego se forma en la infancia y es modificable con autoconocimiento y terapia.</span>
          </div>

          <div className="assessment-result__impact">
            <h4>¿Cómo afecta tu compatibilidad?</h4>
            <p>Tu estilo de apego ahora forma parte de tu <strong>Gráfica Relacional</strong> y mejora la precisión de tus matches en un <strong>25%</strong>.</p>
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
