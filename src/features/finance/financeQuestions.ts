/**
 * Catálogo v2 de «Dinero y proyecto de vida · Me conozco».
 * Contenido educativo original de LovIA; NO es una escala validada ni mide a la persona.
 * Cambiar texto u opciones de una pregunta ya publicada exige una versión nueva
 * (FINANCE_CATALOG_VERSION) para no reinterpretar respuestas anteriores.
 */
export type FinanceQuestionType = 'multi' | 'single' | 'scale' | 'text'

export interface FinanceQuestion {
  key: string
  type: FinanceQuestionType
  text: string
  hint?: string
  options?: string[]
  maxSelections?: number
  /** Ofrece «Todavía no lo sé» además de «Prefiero no responder». */
  allowUnsure: boolean
  /** Permite texto libre opcional además de las opciones. */
  optionalText?: string
}

export interface FinanceBlock {
  id: string
  title: string
  intro: string
  questions: FinanceQuestion[]
}

export const financeBlocks: FinanceBlock[] = [
  {
    id: 'A',
    title: 'Mis prioridades',
    intro: 'Qué significa el dinero para ti. No hay respuestas correctas.',
    questions: [
      { key: 'q01', type: 'multi', maxSelections: 3, allowUnsure: true,
        text: '¿Qué significa para ti sentirte realizado económicamente?',
        hint: 'Elige hasta tres.',
        options: ['Tranquilidad', 'Autonomía', 'Tiempo libre', 'Aprender', 'Apoyar a mi familia', 'Vivienda', 'Experiencias', 'Emprender', 'Otra'] },
      { key: 'q02', type: 'scale', allowUnsure: true,
        text: '¿Qué tan importante es para ti que una pareja tenga ingresos regulares?',
        hint: '1 es nada importante y 5 es muy importante. Es sólo para tu reflexión: no filtra ni califica a nadie.',
        options: ['1', '2', '3', '4', '5'] },
      { key: 'q03', type: 'multi', maxSelections: 4, allowUnsure: true,
        text: '¿Qué esperas que el dinero permita en tu vida?',
        hint: 'Elige hasta cuatro. Puedes añadir una idea con tus palabras.',
        options: ['Estabilidad', 'Libertad para decidir', 'Poder cuidar a otras personas', 'Disfrutar y viajar', 'Estudiar o capacitarme', 'Tener un hogar', 'Ahorrar para imprevistos', 'Otra'],
        optionalText: 'Tu idea (opcional)' },
      { key: 'q04', type: 'text', allowUnsure: true,
        text: '¿Qué decisiones económicas deseas conservar de forma individual?',
        hint: 'Por ejemplo: gastos personales, apoyo a tu familia o ahorros propios. Es privado y opcional.' },
    ],
  },
  {
    id: 'B',
    title: 'Mi situación',
    intro: 'Un panorama general, sin montos. Puedes omitir lo que prefieras.',
    questions: [
      { key: 'q05', type: 'single', allowUnsure: false,
        text: '¿Cómo describirías tus ingresos actualmente?',
        options: ['Regulares', 'Variables', 'Una combinación', 'Temporalmente sin ingresos'] },
      { key: 'q06', type: 'single', allowUnsure: false,
        text: '¿Qué tan previsible es lo que recibirás el próximo mes?',
        options: ['Nada', 'Poco', 'Algo', 'Bastante', 'Mucho', 'No aplica'] },
      { key: 'q07', type: 'single', allowUnsure: false,
        text: 'En los últimos tres meses, ¿con qué frecuencia tus recursos alcanzaron para tus gastos esenciales?',
        options: ['Nunca', 'Pocas veces', 'Algunas veces', 'Casi siempre', 'Siempre', 'No aplica'] },
      { key: 'q08', type: 'multi', maxSelections: 5, allowUnsure: true,
        text: 'Si surgiera un gasto imprevisto, ¿qué alternativas tendrías?',
        hint: 'Marca todas las que apliquen. No hay una mejor que otra.',
        options: ['Ahorro', 'Ajustar gastos', 'Apoyo disponible', 'Crédito', 'Otra'] },
    ],
  },
  {
    id: 'C',
    title: 'Hábitos y responsabilidades',
    intro: 'Cómo llevas tus cuentas y qué temas te cuesta más conversar.',
    questions: [
      { key: 'q09', type: 'single', allowUnsure: false,
        text: '¿Cómo llevas el control de tus ingresos y gastos?',
        options: ['Registro habitual', 'Revisión ocasional', 'Mentalmente', 'Todavía no lo hago', 'Otra'] },
      { key: 'q10', type: 'single', allowUnsure: false,
        text: '¿Tienes obligaciones económicas con hijos, familiares u otras personas?',
        hint: 'No necesitas decir quiénes son.',
        options: ['Sí', 'No'] },
      { key: 'q11', type: 'scale', allowUnsure: true,
        text: '¿Qué tan cómodo te resulta conversar sobre deudas u obligaciones que afectarían un proyecto compartido?',
        hint: '1 es nada cómodo y 5 es muy cómodo.',
        options: ['1', '2', '3', '4', '5'] },
      { key: 'q12', type: 'multi', maxSelections: 5, allowUnsure: true,
        text: '¿Qué aportaciones, además del dinero, consideras importantes en una relación?',
        hint: 'Marca todas las que apliquen.',
        options: ['Cuidados', 'Tareas cotidianas', 'Organización', 'Apoyo emocional', 'Otras'] },
    ],
  },
  {
    id: 'D',
    title: 'Vida en pareja',
    intro: 'Ideas para conversar con otra persona, si algún día quieres.',
    questions: [
      { key: 'q13', type: 'single', allowUnsure: true,
        text: '¿Qué forma de repartir gastos te gustaría explorar?',
        options: ['Mitad y mitad', 'Proporcional a los recursos de cada quien', 'Por categorías', 'Un fondo común', 'Depende de las circunstancias'] },
      { key: 'q14', type: 'text', allowUnsure: true,
        text: 'Si una persona reduce su trabajo remunerado para cuidar, ¿qué acuerdo te parecería justo?',
        hint: 'Piensa en ejemplos neutrales: el tiempo de cuidado también cuenta. Es privado y opcional.' },
      { key: 'q15', type: 'multi', maxSelections: 4, allowUnsure: true,
        text: '¿Qué metas te gustaría conversar antes de compartir vivienda?',
        hint: 'Elige hasta cuatro.',
        options: ['Hijos', 'Ubicación', 'Estudios', 'Trabajo', 'Ahorro', 'Deudas', 'Cuidados', 'Otras'] },
      { key: 'q16', type: 'single', allowUnsure: true,
        text: '¿Cómo te gustaría revisar los acuerdos económicos?',
        options: ['Mensualmente', 'Cuando haya cambios', 'Con otra frecuencia'] },
      { key: 'q17', type: 'multi', maxSelections: 3, allowUnsure: true,
        text: 'Ante un desacuerdo sobre dinero, ¿qué necesitas para poder conversar?',
        hint: 'Elige hasta tres.',
        options: ['Tiempo', 'Información clara', 'Tranquilidad', 'Escuchar opciones', 'Otra'] },
      { key: 'q18', type: 'text', allowUnsure: true,
        text: '¿Qué tema económico te gustaría comprender mejor de ti?',
        hint: 'Una reflexión privada. Si quieres conservarla, puedes escribirla tú en Mi Diario.' },
    ],
  },
]

/** Paso siguiente que la persona elige; no forma parte de las 18 preguntas. */
export const NEXT_STEP_KEY = 'accion'
export const nextStepOptions = [
  'Pensar en mis prioridades',
  'Hacer una pregunta con calma',
  'Escuchar la perspectiva de otra persona',
  'Volver a este ejercicio después',
]

export const allFinanceQuestions: FinanceQuestion[] = financeBlocks.flatMap((block) => block.questions)
