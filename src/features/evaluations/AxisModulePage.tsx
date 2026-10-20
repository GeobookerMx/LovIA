import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './AssessmentShared.css'

interface Question {
    id: string
    module_id: string
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
    const { user } = useAuthStore()

    const [questions, setQuestions] = useState<Question[]>([])
    const [moduleId, setModuleId] = useState<string | null>(null)
    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    const [loadError, setLoadError] = useState(false)
    const [saveError, setSaveError] = useState(false)
    const [completionWarning, setCompletionWarning] = useState(false)

    const axis = axisName || 'amor'
    const meta = AXIS_META[axis] || AXIS_META.amor

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setLoadError(false)
        setQuestions([])
        setModuleId(null)
        setCurrent(0)
        setAnswers({})
        setDone(false)
        setSaveError(false)
        setCompletionWarning(false)
        const load = async () => {
            // Existing data has duplicate modules for each axis. Pick the module
            // with the most questions, preferring the newest on a tie.
            const { data: modules, error: modulesError } = await supabase
                .from('assessment_modules')
                .select('id, created_at')
                .eq('axis', axis)
                .order('created_at', { ascending: false })
                .order('id', { ascending: false })

            if (cancelled) return
            if (modulesError) {
                setLoadError(true)
                setLoading(false)
                return
            }
            if (!modules?.length) { setLoading(false); return }

            const { data: allQuestions, error: questionsError } = await supabase
                .from('assessment_questions')
                .select('id, module_id, text, type, options, order_index')
                .in('module_id', modules.map(module => module.id))
                .order('order_index')

            if (cancelled) return
            if (questionsError) {
                setLoadError(true)
                setLoading(false)
                return
            }
            const grouped = new Map<string, Question[]>()
            for (const question of (allQuestions || []) as Question[]) {
                const group = grouped.get(question.module_id) || []
                group.push(question)
                grouped.set(question.module_id, group)
            }
            const selected = [...modules].sort((a, b) =>
                (grouped.get(b.id)?.length || 0) - (grouped.get(a.id)?.length || 0)
            )[0]
            setModuleId(selected.id)
            setQuestions(grouped.get(selected.id) || [])
            setLoading(false)
        }
        void load()
        return () => { cancelled = true }
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
            setSaveError(false)
            setCompletionWarning(false)
            setSaving(true)
            try {
                if (!user || !moduleId) throw new Error('Sesión o módulo no disponible')
                const rows = Object.entries(answers).map(([question_id, value]) => ({
                    user_id: user.id,
                    question_id,
                    module_id: moduleId,
                    value,
                }))
                const { error: answersError } = await supabase.from('assessment_answers').insert(rows)
                if (answersError) throw answersError

                // Update assessments_done in profiles
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('assessments_done')
                    .eq('id', user.id)
                    .single()

                if (profileError) {
                    setCompletionWarning(true)
                } else {
                    const completed = profile?.assessments_done ?? []
                    if (!completed.includes(axis)) {
                        const { error: progressError } = await supabase.from('profiles')
                            .update({ assessments_done: [...completed, axis] })
                            .eq('id', user.id)
                        if (progressError) setCompletionWarning(true)
                    }
                }

                setDone(true)
            } catch (e) {
                console.error('[AxisModule] Error saving:', e)
                setSaveError(true)
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
                        Tus respuestas quedan como parte de tu recorrido personal.
                    </p>
                    <div className="assessment-done__badge">
                        <CheckCircle size={18} color="var(--success)" />
                        <span>Actividad guardada</span>
                    </div>
                    {completionWarning && <p role="alert">Tus respuestas se guardaron, pero no pudimos actualizar el progreso. Puedes volver más tarde.</p>}
                    <p className="assessment-disclaimer">
                        Esta actividad es educativa y voluntaria. No produce un diagnóstico ni determina tu acceso.
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
                <p style={{ color: 'var(--text-secondary)' }} role={loadError ? 'alert' : undefined}>
                    {loadError ? 'No pudimos cargar las preguntas. Comprueba tu conexión e inténtalo más tarde.' : 'Este módulo aún está en preparación. ¡Vuelve pronto!'}
                </p>
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
                        {Array.isArray(q.options) && q.options.length > 0 ? q.options.map((opt: string) => (
                            <button
                                key={opt}
                                className={`assessment-option ${answers[q.id] === opt ? 'assessment-option--active' : ''}`}
                                style={answers[q.id] === opt ? { borderColor: meta.color, background: meta.color + '18' } : {}}
                                onClick={() => handleAnswer(opt)}
                            >
                                {opt}
                            </button>
                        )) : (
                            <textarea
                                className="assessment-textarea"
                                placeholder="Escribe tu respuesta con tus propias palabras..."
                                aria-label="Tu respuesta"
                                value={answers[q.id] || ''}
                                onChange={e => handleAnswer(e.target.value)}
                                rows={3}
                            />
                        )}
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
            {saveError && <p role="alert">No pudimos guardar tus respuestas. Revisa tu conexión e inténtalo de nuevo.</p>}

            <p className="assessment-disclaimer">
                Evita incluir datos que no quieras guardar. Esta actividad no ofrece un diagnóstico clínico.
            </p>
        </div>
    )
}
