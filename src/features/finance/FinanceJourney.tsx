import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookHeart, MessageCircle, RefreshCcw, ShieldCheck, Wallet } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { financeQuestionGroups, financeScenarios } from './financeContent'
import { allFinanceQuestions, financeBlocks, NEXT_STEP_KEY, nextStepOptions } from './financeQuestions'
import {
  deleteFinanceAnswers, isFinanceSaveEnabled, loadFinanceAnswers, saveFinanceAnswer,
  SKIP_PRIVATE, SKIP_UNSURE, type FinanceAnswer,
} from './financeStorage'
import './FinanceJourney.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'
const emptyAnswer: FinanceAnswer = { values: [], text: '' }
const isSkip = (value: string) => value === SKIP_UNSURE || value === SKIP_PRIVATE
const realValues = (answer?: FinanceAnswer) => (answer?.values ?? []).filter((value) => !isSkip(value))

export default function FinanceJourney() {
  const navigate = useNavigate()
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const [answers, setAnswers] = useState<Record<string, FinanceAnswer>>({})
  const [activeBlock, setActiveBlock] = useState<string | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [scenarioChoices, setScenarioChoices] = useState<Record<number, number>>({})
  const [saveEnabled, setSaveEnabled] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const block = financeBlocks.find((item) => item.id === activeBlock) ?? null
  const question = block ? block.questions[qIndex] : null
  const current = question ? (answers[question.key] ?? emptyAnswer) : emptyAnswer
  const reviewedCount = Object.keys(answers).filter((key) => allFinanceQuestions.some((q) => q.key === key)).length

  // Interruptor y reanudación. Al cambiar de cuenta o cerrar sesión se descarta todo
  // el estado privado en memoria antes de consultar al servidor.
  useEffect(() => {
    let active = true
    setAnswers({})
    setActiveBlock(null)
    setQIndex(0)
    setSaveState('idle')
    setSaveEnabled(false)
    if (!userId) return
    void isFinanceSaveEnabled().then(async (enabled) => {
      if (!active || !enabled) return
      setSaveEnabled(true)
      try {
        const saved = await loadFinanceAnswers()
        if (active) setAnswers(saved)
      } catch {
        // Sin lectura no se bloquea el recorrido; sólo se empieza vacío.
      }
    })
    return () => { active = false }
  }, [userId])

  const openBlock = (id: string) => {
    const target = financeBlocks.find((item) => item.id === id)
    if (!target) return
    const firstPending = target.questions.findIndex((q) => !answers[q.key])
    setQIndex(firstPending === -1 ? 0 : firstPending)
    setActiveBlock(id)
    setSaveState('idle')
  }

  const setCurrent = (next: FinanceAnswer) => {
    if (!question) return
    setSaveState('idle')
    setAnswers((all) => ({ ...all, [question.key]: next }))
  }

  const choose = (option: string) => {
    if (!question) return
    if (isSkip(option)) return setCurrent({ values: [option], text: '' })
    if (question.type === 'single' || question.type === 'scale') return setCurrent({ values: [option], text: current.text })
    const clean = current.values.filter((value) => !isSkip(value))
    const next = clean.includes(option)
      ? clean.filter((value) => value !== option)
      : clean.length < (question.maxSelections ?? 1) ? [...clean, option] : clean
    setCurrent({ values: next, text: current.text })
  }

  const writeText = (text: string) => {
    if (!question) return
    setCurrent({ values: current.values.filter((value) => !isSkip(value)), text: text.slice(0, 1000) })
  }

  const canContinue = current.values.length > 0 || current.text.trim() !== ''

  const persist = async (key: string, answer: FinanceAnswer): Promise<boolean> => {
    if (!saveEnabled || !userId) return true
    if (saveState === 'saving') return false
    setSaveState('saving')
    try {
      await saveFinanceAnswer(userId, key, answer)
      setSaveState('saved')
      return true
    } catch {
      setSaveState('error')
      return false
    }
  }

  const advance = async () => {
    if (!block || !question || !canContinue) return
    if (!(await persist(question.key, current))) return
    if (qIndex === block.questions.length - 1) setActiveBlock(null)
    else setQIndex(qIndex + 1)
  }

  const chooseNextStep = async (option: string) => {
    const answer: FinanceAnswer = { values: [option], text: '' }
    setAnswers((all) => ({ ...all, [NEXT_STEP_KEY]: answer }))
    await persist(NEXT_STEP_KEY, answer)
  }

  const reset = () => {
    setAnswers({})
    setActiveBlock(null)
    setQIndex(0)
    setSaveState('idle')
  }

  const clearSaved = async (): Promise<boolean> => {
    if (!saveEnabled || !userId) return false
    try {
      await deleteFinanceAnswers(userId)
      setSaveState('idle')
      return true
    } catch {
      setSaveState('error')
      return false
    }
  }

  const options = question?.options ?? []
  const skipOptions = question ? (question.allowUnsure ? [SKIP_UNSURE, SKIP_PRIVATE] : [SKIP_PRIVATE]) : []
  const topics = [...realValues(answers.q15), ...realValues(answers.q17)]

  return (
    <main className="finance-page">
      <header className="finance-page__header">
        <button type="button" className="finance-page__back" onClick={() => navigate('/modules')} aria-label="Volver a la Guía"><ArrowLeft size={20} /></button>
        <span>Guía LovIA</span>
      </header>

      <section className="finance-page__hero" aria-labelledby="finance-title">
        <span className="finance-page__eyebrow"><Wallet size={18} aria-hidden="true" /> Dinero y proyecto de vida</span>
        <h1 id="finance-title">Conoce tus prioridades. Conversa con más claridad.</h1>
        <p>Tu proyecto de vida merece acuerdos claros. Explora qué significa el dinero para ti y cómo quieres compartir responsabilidades.</p>
        <div className="finance-page__hero-note"><ShieldCheck size={18} aria-hidden="true" /> Actividad opcional para personas adultas. No mide compatibilidad ni pide tus ingresos.</div>
      </section>

      <section className="finance-page__panel" aria-labelledby="finance-exercise-title">
        <div className="finance-page__section-heading">
          <div><span className="finance-page__eyebrow">Me conozco</span><h2 id="finance-exercise-title">Cuatro sesiones cortas</h2></div>
          <span className="finance-page__time">{reviewedCount} de {allFinanceQuestions.length} revisadas</span>
        </div>
        <p className="finance-page__privacy">{saveEnabled
          ? 'Tus elecciones se guardan en tu cuenta para que puedas continuar después. Son privadas: nadie más las ve, ni se envían a otra persona. Puedes borrarlas cuando quieras.'
          : 'Tus elecciones sólo viven en esta pantalla. No se guardan en LovIA ni se envían a otra persona; al salir se borran.'}</p>

        {!block && (
          <div className="finance-page__blocks">
            {financeBlocks.map((item) => {
              const done = item.questions.filter((q) => answers[q.key]).length
              return (
                <article key={item.id} className="finance-page__block">
                  <h3>{item.title}</h3>
                  <p>{item.intro}</p>
                  <p className="finance-page__block-meta">{done} de {item.questions.length} · unos {Math.max(2, item.questions.length)} minutos</p>
                  <button type="button" className="finance-page__primary" onClick={() => openBlock(item.id)}>
                    {done === 0 ? 'Empezar' : done === item.questions.length ? 'Revisar' : 'Continuar'} <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </article>
              )
            })}
          </div>
        )}

        {block && question && (
          <div className="finance-page__activity">
            <p className="finance-page__step">{block.title} · pregunta {qIndex + 1} de {block.questions.length}</p>
            <progress max={block.questions.length} value={qIndex + 1} aria-label="Progreso de esta sesión" />
            <fieldset>
              <legend>{question.text}</legend>
              {question.hint && <p>{question.hint}</p>}
              {question.type !== 'text' && (
                <div className="finance-page__options">
                  {options.map((option) => (
                    <button key={option} type="button" aria-pressed={current.values.includes(option)} className={current.values.includes(option) ? 'finance-page__option finance-page__option--selected' : 'finance-page__option'} onClick={() => choose(option)}>{option}</button>
                  ))}
                </div>
              )}
              {(question.type === 'text' || question.optionalText) && (
                <label className="finance-page__textfield">
                  <span>{question.optionalText ?? 'Tu reflexión (opcional)'}</span>
                  <textarea rows={4} maxLength={1000} value={current.text} onChange={(event) => writeText(event.target.value)} />
                  <small>{current.text.length} / 1000 · Es privado.</small>
                </label>
              )}
              <div className="finance-page__options finance-page__options--skip">
                {skipOptions.map((option) => (
                  <button key={option} type="button" aria-pressed={current.values.includes(option)} className={current.values.includes(option) ? 'finance-page__option finance-page__option--selected' : 'finance-page__option'} onClick={() => choose(option)}>{option}</button>
                ))}
              </div>
            </fieldset>
            {saveState === 'error' && <p role="alert" className="finance-page__privacy">No pudimos guardar tu respuesta. Sigue en pantalla; revisa tu conexión y vuelve a pulsar Continuar para reintentar.</p>}
            {saveState === 'saved' && <p role="status" className="finance-page__privacy">Guardado en tu cuenta.</p>}
            <div className="finance-page__controls">
              <button type="button" onClick={() => (qIndex === 0 ? setActiveBlock(null) : setQIndex(qIndex - 1))}>{qIndex === 0 ? 'Salir de la sesión' : 'Atrás'}</button>
              <button type="button" className="finance-page__primary" disabled={!canContinue || saveState === 'saving'} onClick={() => void advance()}>
                {saveState === 'saving' ? 'Guardando…' : qIndex === block.questions.length - 1 ? 'Terminar sesión' : 'Continuar'} <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {!block && reviewedCount > 0 && (
          <div className="finance-page__summary" role="region" aria-label="Lo que elegiste">
            <h3>Lo que elegiste hasta ahora</h3>
            <dl>
              <div><dt>Mis prioridades</dt><dd>{realValues(answers.q01).join(', ') || 'Aún por explorar'}</dd></div>
              <div><dt>Temas que quiero conversar</dt><dd>{topics.length ? Array.from(new Set(topics)).join(', ') : 'Aún por explorar'}</dd></div>
            </dl>
            <fieldset className="finance-page__next">
              <legend>¿Qué paso pequeño eliges para seguir?</legend>
              <div className="finance-page__options">
                {nextStepOptions.map((option) => {
                  const picked = answers[NEXT_STEP_KEY]?.values[0] === option
                  return <button key={option} type="button" aria-pressed={picked} className={picked ? 'finance-page__option finance-page__option--selected' : 'finance-page__option'} onClick={() => void chooseNextStep(option)}>{option}</button>
                })}
              </div>
            </fieldset>
            {saveState === 'error' && <p role="alert" className="finance-page__privacy">No pudimos guardar tu elección. Vuelve a tocarla para reintentar.</p>}
            {saveState === 'saved' && <p role="status" className="finance-page__privacy">Guardado en tu cuenta.</p>}
            <p>Estas elecciones describen lo que marcaste; no son una evaluación de ti ni de tu relación.</p>
            <div className="finance-page__controls">
              <button type="button" onClick={reset}><RefreshCcw size={17} aria-hidden="true" /> Empezar de nuevo en pantalla</button>
              {saveEnabled && <button type="button" onClick={() => void clearSaved().then((ok) => { if (ok) reset() })}>Borrar mis respuestas guardadas</button>}
            </div>
            <button type="button" className="finance-page__journal" onClick={() => navigate('/profile/journal')}><BookHeart size={18} aria-hidden="true" /> Si quieres conservar una idea, escríbela tú en Mi Diario <ArrowRight size={16} aria-hidden="true" /></button>
          </div>
        )}
      </section>

      <section className="finance-page__panel" aria-labelledby="finance-scenarios-title">
        <span className="finance-page__eyebrow">Nos conocemos</span>
        <h2 id="finance-scenarios-title">Tres situaciones para conversar</h2>
        <p>Úsalas sólo si ambas personas quieren hablar del tema. Tus elecciones aquí no se envían ni se comparten en la app.</p>
        <div className="finance-page__scenarios">
          {financeScenarios.map((scenario, scenarioIndex) => (
            <article key={scenario.title} className="finance-page__scenario">
              <h3>{scenario.title}</h3>
              <p>{scenario.context}</p>
              <div className="finance-page__options" role="group" aria-label={`Opciones para ${scenario.title}`}>
                {scenario.choices.map((choice, choiceIndex) => <button key={choice.label} type="button" className={scenarioChoices[scenarioIndex] === choiceIndex ? 'finance-page__option finance-page__option--selected' : 'finance-page__option'} aria-pressed={scenarioChoices[scenarioIndex] === choiceIndex} onClick={() => setScenarioChoices((chosen) => ({ ...chosen, [scenarioIndex]: choiceIndex }))}>{choice.label}</button>)}
              </div>
              {scenarioChoices[scenarioIndex] !== undefined && <p className="finance-page__reflection"><MessageCircle size={17} aria-hidden="true" /> {scenario.choices[scenarioChoices[scenarioIndex]].reflection}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="finance-page__panel" aria-labelledby="finance-more-title">
        <span className="finance-page__eyebrow">Construimos acuerdos</span>
        <h2 id="finance-more-title">Preguntas para volver a ellas</h2>
        <p>Elige un tema, escucha la respuesta y acuerden cuándo revisarlo. Los cuidados y el tiempo también cuentan. No es necesario compartir cifras.</p>
        <div className="finance-page__groups">
          {financeQuestionGroups.map((group) => (
            <details key={group.title}>
              <summary>{group.title} <span>{group.questions.length} preguntas</span></summary>
              <ol>{group.questions.map((item) => <li key={item}>{item}</li>)}</ol>
            </details>
          ))}
        </div>
      </section>

      <footer className="finance-page__footer">
        <p>Contenido educativo original de LovIA, no una escala psicológica o financiera validada. No sustituye asesoría profesional.</p>
        <p>Contexto para profundizar: <a href="https://www.inegi.org.mx/programas/enigh/nc/2024/" target="_blank" rel="noopener noreferrer">ENIGH 2024</a> y <a href="https://www.inegi.org.mx/programas/ensafi/2023/" target="_blank" rel="noopener noreferrer">ENSAFI 2023</a>. Estas fuentes no avalan LovIA.</p>
      </footer>
    </main>
  )
}
