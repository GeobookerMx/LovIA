import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookHeart, MessageCircle, RefreshCcw, ShieldCheck, Wallet } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { financeQuestionGroups, financeScenarios } from './financeContent'
import { deleteFinanceAnswers, isFinanceSaveEnabled, loadFinanceAnswers, saveFinanceAnswer } from './financeStorage'
import './FinanceJourney.css'

interface ShortQuestion {
  id: string
  text: string
  options: string[]
  multiple?: boolean
  maxSelections?: number
}

const skipOptions = ['Todavía no lo sé', 'Prefiero no responder']

const shortQuestions: ShortQuestion[] = [
  {
    id: 'prioridades',
    text: '¿Qué te gustaría que el dinero hiciera posible en tu vida?',
    options: ['Tranquilidad', 'Autonomía', 'Tiempo libre', 'Aprender', 'Apoyar a mi familia', 'Vivienda', 'Experiencias', 'Emprender'],
    multiple: true,
    maxSelections: 3,
  },
  {
    id: 'autonomia',
    text: '¿Qué decisión te gustaría conservar de forma individual?',
    options: ['Mis gastos personales', 'Mis metas de estudio o trabajo', 'El apoyo que doy a mi familia', 'Mis ahorros personales'],
  },
  {
    id: 'aportes',
    text: '¿Qué aportaciones, además del dinero, quieres reconocer?',
    options: ['Cuidados', 'Tareas cotidianas', 'Organización', 'Apoyo emocional'],
    multiple: true,
    maxSelections: 3,
  },
  {
    id: 'conversacion',
    text: '¿Qué te gustaría conversar antes de compartir un proyecto de vida?',
    options: ['Reparto de gastos', 'Metas y plazos', 'Cuidados y tiempo', 'Obligaciones que nos afectarían'],
  },
  {
    id: 'accion',
    text: '¿Qué paso pequeño eliges para seguir?',
    options: ['Pensar en mis prioridades', 'Hacer una pregunta con calma', 'Escuchar la perspectiva de otra persona', 'Volver a este ejercicio después'],
  },
]

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function FinanceJourney() {
  const navigate = useNavigate()
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [scenarioChoices, setScenarioChoices] = useState<Record<number, number>>({})
  const [saveEnabled, setSaveEnabled] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const question = shortQuestions[step]
  const selected = answers[question.id] ?? []

  // Interruptor y reanudación. Al cambiar de cuenta o cerrar sesión se descarta todo
  // el estado privado en memoria antes de consultar al servidor.
  useEffect(() => {
    let active = true
    setAnswers({})
    setStep(0)
    setStarted(false)
    setFinished(false)
    setSaveState('idle')
    setSaveEnabled(false)
    if (!userId) return
    void isFinanceSaveEnabled().then(async (enabled) => {
      if (!active || !enabled) return
      setSaveEnabled(true)
      try {
        const saved = await loadFinanceAnswers()
        if (!active || Object.keys(saved).length === 0) return
        setAnswers(saved)
        const next = shortQuestions.findIndex((item) => !saved[item.id])
        setStep(next === -1 ? shortQuestions.length - 1 : next)
      } catch {
        // Sin lectura no se bloquea el recorrido; sólo se empieza vacío.
      }
    })
    return () => { active = false }
  }, [userId])

  const advance = async () => {
    const last = step === shortQuestions.length - 1
    if (saveEnabled && userId) {
      if (saveState === 'saving') return
      setSaveState('saving')
      try {
        await saveFinanceAnswer(userId, question.id, selected)
        setSaveState('saved')
      } catch {
        setSaveState('error')
        return
      }
    }
    if (last) setFinished(true)
    else setStep(step + 1)
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

  const choose = (option: string) => {
    setSaveState('idle')
    setAnswers((current) => {
      const previous = current[question.id] ?? []
      if (!question.multiple || skipOptions.includes(option)) return { ...current, [question.id]: [option] }
      const clean = previous.filter((value) => !skipOptions.includes(value))
      const next = clean.includes(option)
        ? clean.filter((value) => value !== option)
        : clean.length < (question.maxSelections ?? 1) ? [...clean, option] : clean
      return { ...current, [question.id]: next }
    })
  }

  const reset = () => {
    setAnswers({})
    setStep(0)
    setFinished(false)
    setStarted(false)
    setSaveState('idle')
  }

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
          <div><span className="finance-page__eyebrow">Me conozco</span><h2 id="finance-exercise-title">Cinco preguntas para empezar</h2></div>
          <span className="finance-page__time">Unos 3 minutos</span>
        </div>
        <p className="finance-page__privacy">{saveEnabled
          ? 'Tus elecciones se guardan en tu cuenta para que puedas continuar después. Son privadas: nadie más las ve, ni se envían a otra persona. Puedes borrarlas cuando quieras.'
          : 'Tus elecciones sólo viven en esta pantalla. No se guardan en LovIA ni se envían a otra persona; al salir se borran.'}</p>
        {!started && <button type="button" className="finance-page__primary" onClick={() => setStarted(true)}>Explorar mis prioridades <ArrowRight size={18} aria-hidden="true" /></button>}
        {started && !finished && (
          <div className="finance-page__activity">
            <p className="finance-page__step">Pregunta {step + 1} de {shortQuestions.length}</p>
            <progress max={shortQuestions.length} value={step + 1} aria-label="Progreso de esta sesión" />
            <fieldset>
              <legend>{question.text}</legend>
              {question.multiple && <p>Elige hasta {question.maxSelections}. No hay respuestas correctas.</p>}
              <div className="finance-page__options">
                {[...question.options, ...skipOptions].map((option) => (
                  <button key={option} type="button" aria-pressed={selected.includes(option)} className={selected.includes(option) ? 'finance-page__option finance-page__option--selected' : 'finance-page__option'} onClick={() => choose(option)}>{option}</button>
                ))}
              </div>
            </fieldset>
            {saveState === 'error' && <p role="alert" className="finance-page__privacy">No pudimos guardar tu respuesta. Sigue en pantalla; revisa tu conexión y vuelve a pulsar Continuar para reintentar.</p>}
            {saveState === 'saved' && <p role="status" className="finance-page__privacy">Guardado en tu cuenta.</p>}
            <div className="finance-page__controls">
              <button type="button" onClick={() => step === 0 ? reset() : setStep(step - 1)}>Atrás</button>
              <button type="button" className="finance-page__primary" disabled={selected.length === 0 || saveState === 'saving'} onClick={() => void advance()}>{saveState === 'saving' ? 'Guardando…' : step === shortQuestions.length - 1 ? 'Ver mi reflexión' : 'Continuar'} <ArrowRight size={17} aria-hidden="true" /></button>
            </div>
          </div>
        )}
        {finished && (
          <div className="finance-page__summary" role="region" aria-label="Tu reflexión de esta sesión">
            <h3>Lo que elegiste hoy</h3>
            <dl>
              <div><dt>Prioridades</dt><dd>{answers.prioridades?.filter((item) => !skipOptions.includes(item)).join(', ') || 'Aún por explorar'}</dd></div>
              <div><dt>Una conversación posible</dt><dd>{answers.conversacion?.filter((item) => !skipOptions.includes(item)).join(', ') || 'Aún por explorar'}</dd></div>
              <div><dt>Tu siguiente paso</dt><dd>{answers.accion?.filter((item) => !skipOptions.includes(item)).join(', ') || 'Tú eliges cuándo continuar'}</dd></div>
            </dl>
            <p>Estas elecciones describen lo que marcaste; no son una evaluación de ti ni de tu relación.</p>
            <div className="finance-page__controls">
              <button type="button" onClick={() => { setFinished(false); setStep(shortQuestions.length - 1) }}>Cambiar una respuesta</button>
              <button type="button" onClick={reset}><RefreshCcw size={17} aria-hidden="true" /> Empezar de nuevo</button>
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
                {scenario.choices.map((choice, choiceIndex) => <button key={choice.label} type="button" className={scenarioChoices[scenarioIndex] === choiceIndex ? 'finance-page__option finance-page__option--selected' : 'finance-page__option'} aria-pressed={scenarioChoices[scenarioIndex] === choiceIndex} onClick={() => setScenarioChoices((current) => ({ ...current, [scenarioIndex]: choiceIndex }))}>{choice.label}</button>)}
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
