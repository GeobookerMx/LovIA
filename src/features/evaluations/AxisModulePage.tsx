import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './AssessmentShared.css'

interface Question {
    id: string
    text: string
    type: 'scale' | 'multiple' | 'open'
    options: string[]
    order_index: number
}

const AXIS_META: Record<string, { name: string; icon: string; color: string; description: string }> = {
    amor:        { name: 'Amor y Vinculación',          icon: '💞', color: '#FF4D6D', description: 'Tu estilo de vinculación emocional e historial afectivo.' },
    intimidad:   { name: 'Intimidad y Sexualidad',      icon: '🔥', color: '#F59E0B', description: 'Límites, expectativas de intimidad y compatibilidad de deseos.' },
    realizacion: { name: 'Realización y Momento',       icon: '🌟', color: '#6366F1', description: 'Metas actuales, etapa de vida y disponibilidad real.' },
    seguridad:   { name: 'Seguridad y Autorregulación', icon: '🛡️', color: '#10B981', description: 'Patrones de conducta, autocrítica y tolerancia al conflicto.' },
}

const SCALE_LABELS = ['Nada', 'Poco', 'Algo', 'Bastante', 'Mucho']

export default function AxisModulePage() {
    const { axisName } = useParams<{ axisName: string }>()
    const navigate = useNavigate()
    const { user, updateProfile } = useAuthStore()

    const [questions, setQuestions] = useState<Question[]>([])
    const [moduleId, setModuleId] = useState<string | null>(null)
    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)

    const axis = axisName || 'amor'
    const meta = AXIS_META[axis] || AXIS_META.amor

    useEffect(() => {
        const load = async () => {
            // 1. Get module id for this axis
            const { data: mod } = await supabase
                .from('assessment_modules')
                .select('id')
                .eq('axis', axis)
                .limit(1)
                .maybeSingle()

            if (!mod) { setLoading(false); return }
            setModuleId(mod.id)

            // 2. Get questions for this module
            const { data: qs } = await supabase
                .from('assessment_questions')
                .select('id, text, type, options, order_index')
                .eq('module_id', mod.id)
                .order('order_index')

            setQuestions((qs || []) as Question[])
            setLoading(false)
        }
        load()
    }, [axis])

    const q = questions[current]
    const progress = questions.length > 0 ? ((current) / questions.length) * 100 : 0

    const handleAnswer = (value: string) => {
        if (!q) return
        setAnswers(prev => ({ ...prev, [q.id]: value }))
    }

    const handleNext = async () => {
        if (!q || !answers[q.id]) return

        if (current < questions.length - 1) {
            setCurrent(c => c + 1)
        } else {
            // Final — save all answers
            setSaving(true)
            try {
                const rows = Object.entries(answers).map(([question_id, value]) => ({
                    user_id: user!.id,
                    question_id,
                    module_id: moduleId,
                    value,
                }))
                await supabase.from('assessment_answers').insert(rows)

                // Update assessments_done in profiles
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('assessments_done')
                    .eq('id', user!.id)
                    .single()

                const done = profile?.assessments_done ?? []
                if (!done.includes(axis)) {
                    await supabase.from('profiles')
                        .update({ assessments_done: [...done, axis] })
                        .eq('id', user!.id)
                }

                setDone(true)
            } catch (e) {
                console.error('[AxisModule] Error saving:', e)
            } finally {
                setSaving(false)
            }
        }
    }

    // ── Done screen ────────────────────────────────────────────────────────
    if (done) {
        return (
            <div className="assessment-page">
                <div className="assessment-done animate-scale-in">
                    <div className="assessment-done__icon">{meta.icon}</div>
                    <h2>¡Módulo Completado!</h2>
                    <p className="assessment-done__desc">
                        Has completado el módulo de <strong>{meta.name}</strong>.<br />
                        Tus respuestas enriquecen tu Frecuencia de Relación.
                    </p>
                    <div className="assessment-done__badge">
                        <CheckCircle size={18} color="var(--success)" />
                        <span>+10 puntos a tu Readiness Score</span>
                    </div>
                    <p className="assessment-disclaimer">
                        Este no es un diagnóstico clínico. Es una heurística de orientación relacional.
                    </p>
                    <button className="assessment-submit-btn" onClick={() => navigate('/home')}>
                        Volver al inicio <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="assessment-page flex-center">
                <Loader2 size={40} className="animate-spin" color="var(--love-rose)" />
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="assessment-page flex-center" style={{ flexDirection: 'column', gap: 16, textAlign: 'center', padding: '2rem' }}>
                <span style={{ fontSize: 48 }}>{meta.icon}</span>
                <h2>{meta.name}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Este módulo aún está en preparación. ¡Vuelve pronto!</p>
                <button className="assessment-back-btn" onClick={() => navigate('/home')}>
                    <ArrowLeft size={16} /> Volver
                </button>
            </div>
        )
    }

    return (
        <div className="assessment-page">
            {/* Header */}
            <header className="assessment-header">
                <button className="assessment-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <p className="assessment-module-label">{meta.icon} {meta.name}</p>
                    <p className="assessment-question-count">{current + 1} de {questions.length}</p>
                </div>
            </header>

            {/* Progress bar */}
            <div className="assessment-progress-track">
                <div
                    className="assessment-progress-fill"
                    style={{ width: `${progress}%`, background: meta.color }}
                />
            </div>

            {/* Question card */}
            <div className="assessment-card glass animate-fade-in-up" key={q.id}>
                <p className="assessment-question">{q.text}</p>

                {/* Scale input (1-5) */}
                {q.type === 'scale' && (
                    <div className="assessment-scale">
                        {[1, 2, 3, 4, 5].map(val => (
                            <button
                                key={val}
                                className={`assessment-scale-btn ${answers[q.id] === String(val) ? 'assessment-scale-btn--active' : ''}`}
                                style={answers[q.id] === String(val) ? { borderColor: meta.color, background: meta.color + '22' } : {}}
                                onClick={() => handleAnswer(String(val))}
                            >
                                <span className="assessment-scale-num">{val}</span>
                                <span className="assessment-scale-label">{SCALE_LABELS[val - 1]}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Multiple choice */}
                {q.type === 'multiple' && (
                    <div className="assessment-options">
                        {(q.options?.length > 0 ? q.options : [
                            'Exploración y descubrimiento',
                            'Construcción y estabilidad',
                            'Consolidación y profundidad',
                            'Reinvención y cambio',
                        ]).map((opt: string) => (
                            <button
                                key={opt}
                                className={`assessment-option ${answers[q.id] === opt ? 'assessment-option--active' : ''}`}
                                style={answers[q.id] === opt ? { borderColor: meta.color, background: meta.color + '18' } : {}}
                                onClick={() => handleAnswer(opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Open text */}
                {q.type === 'open' && (
                    <textarea
                        className="assessment-textarea"
                        placeholder="Escribe tu respuesta aquí..."
                        value={answers[q.id] || ''}
                        onChange={e => handleAnswer(e.target.value)}
                        rows={4}
                    />
                )}
            </div>

            {/* Next button */}
            <button
                className="assessment-submit-btn"
                disabled={!answers[q.id] || saving}
                onClick={handleNext}
                style={{ background: meta.color }}
            >
                {saving ? (
                    <><Loader2 size={18} className="animate-spin" /> Guardando...</>
                ) : current < questions.length - 1 ? (
                    <>Siguiente <ChevronRight size={18} /></>
                ) : (
                    <>Completar módulo <CheckCircle size={18} /></>
                )}
            </button>

            <p className="assessment-disclaimer">
                Tus respuestas son privadas y protegidas por cifrado. No son un diagnóstico clínico.
            </p>
        </div>
    )
}
