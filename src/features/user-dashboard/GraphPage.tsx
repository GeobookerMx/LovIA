import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BookHeart, BookOpen, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './ProfilePages.css'

interface Module { id: string; title: string }
interface Lesson { id: string; module_id: string }
interface Progress { lesson_id: string; completed: boolean; completed_at: string | null }
interface Answer { id: string; question_id: string; value: string; answered_at: string; question: string }
interface Journey { modules: Module[]; lessons: Lesson[]; progress: Progress[]; answers: Answer[]; lastSaved: string | null }

const dateLabel = (value: string | null) => value
  ? new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
  : 'Todavía no hay actividades guardadas'

export default function GraphPage() {
  const navigate = useNavigate()
  const userId = useAuthStore(state => state.user?.id)
  const [journey, setJourney] = useState<Journey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    setJourney(null)
    setLoading(true)
    setError(false)
    if (!userId) { setLoading(false); return }
    void (async () => {
      const [modules, lessons, progress, answers] = await Promise.all([
        supabase.from('growth_modules').select('id, title').order('order_index'),
        supabase.from('growth_module_lessons').select('id, module_id'),
        supabase.from('growth_progress').select('lesson_id, completed, completed_at').eq('user_id', userId),
        supabase.from('assessment_answers').select('id, question_id, value, answered_at').eq('user_id', userId).order('answered_at', { ascending: false }).limit(20),
      ])
      if (!active) return
      if (modules.error || lessons.error || progress.error || answers.error) { setError(true); setLoading(false); return }
      const questionIds = [...new Set((answers.data ?? []).map(answer => answer.question_id))]
      const questions = questionIds.length
        ? await supabase.from('assessment_questions').select('id, text').in('id', questionIds)
        : { data: [], error: null }
      if (!active) return
      if (questions.error) { setError(true); setLoading(false); return }
      const names = new Map((questions.data ?? []).map(question => [question.id, question.text]))
      const savedAnswers = (answers.data ?? []).map(answer => ({ ...answer, question: names.get(answer.question_id) ?? 'Pregunta de una versión anterior' }))
      const savedProgress = (progress.data ?? []) as Progress[]
      const lastSaved = [...savedProgress.map(item => item.completed_at), ...savedAnswers.map(item => item.answered_at)]
        .filter((value): value is string => Boolean(value)).sort((a, b) => b.localeCompare(a))[0] ?? null
      setJourney({ modules: modules.data ?? [], lessons: lessons.data ?? [], progress: savedProgress, answers: savedAnswers, lastSaved })
      setLoading(false)
    })()
    return () => { active = false }
  }, [userId])

  const completed = new Set(journey?.progress.filter(item => item.completed).map(item => item.lesson_id) ?? [])
  const completedCurrent = journey?.lessons.filter(lesson => completed.has(lesson.id)).length ?? 0
  const nextModule = journey?.modules.find(module => journey.lessons.some(lesson => lesson.module_id === module.id && !completed.has(lesson.id)))

  return <main className="profile-sub journey-page">
    <header className="profile-sub__header">
      <button type="button" className="profile-sub__back" onClick={() => navigate('/profile')} aria-label="Volver al perfil"><ArrowLeft size={20} /></button>
      <h1>Mi recorrido</h1>
    </header>
    <p className="profile-sub__subtitle">Tu aprendizaje y tus respuestas son privados. Las actividades son opcionales y no miden compatibilidad.</p>
    {loading && <div className="chart-card glass-strong" role="status"><Loader2 size={20} className="animate-spin" /> Cargando tu recorrido…</div>}
    {error && <div className="chart-card glass-strong" role="alert">No pudimos cargar tu recorrido. Comprueba la conexión y vuelve a abrir esta pantalla.</div>}
    {journey && !error && <>
      <section className="chart-card glass-strong" aria-labelledby="journey-progress-title">
        <h2 id="journey-progress-title">Dónde vas</h2>
        <p>{completedCurrent} de {journey.lessons.length} actividades educativas completadas</p>
        <p>Último guardado: {dateLabel(journey.lastSaved)}</p>
        <button type="button" onClick={() => navigate(nextModule ? `/modules/${nextModule.id}` : '/modules')}><BookOpen size={18} /> {nextModule ? `Continuar: ${nextModule.title}` : 'Abrir la Guía'} <ArrowRight size={17} /></button>
      </section>
      <section className="chart-card glass-strong" aria-labelledby="journey-modules-title">
        <h2 id="journey-modules-title">Módulos</h2>
        {journey.modules.length === 0 && <p>Aún no hay módulos disponibles.</p>}
        <ul style={{ paddingLeft: '1.2rem' }}>{journey.modules.map(module => {
          const lessons = journey.lessons.filter(lesson => lesson.module_id === module.id)
          return <li key={module.id} style={{ margin: '0.5rem 0' }}><button type="button" onClick={() => navigate(`/modules/${module.id}`)}>{module.title}: {lessons.filter(lesson => completed.has(lesson.id)).length} de {lessons.length} actividades <ArrowRight size={14} /></button></li>
        })}</ul>
      </section>
      <section className="chart-card glass-strong" aria-labelledby="journey-answers-title">
        <h2 id="journey-answers-title">Tus respuestas recientes</h2>
        <p>Se muestran hasta 20 respuestas guardadas, sólo para ti.</p>
        {journey.answers.length === 0 && <p>Todavía no has guardado respuestas.</p>}
        <ol style={{ paddingLeft: '1.2rem' }}>{journey.answers.map(answer => <li key={answer.id} style={{ marginBottom: '1rem' }}><strong>{answer.question}</strong><br /><span>{answer.value}</span><br /><small>{dateLabel(answer.answered_at)}</small></li>)}</ol>
      </section>
    </>}
    <button type="button" onClick={() => navigate('/profile/journal')}><BookHeart size={18} /> Mi Diario <ArrowRight size={17} /></button>
  </main>
}
