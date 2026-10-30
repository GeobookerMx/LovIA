export const financeQuestionGroups = [
  {
    title: 'Mis prioridades',
    questions: [
      '¿Qué significa para ti sentirte realizado económicamente?',
      '¿Qué tan importante es para ti que una pareja tenga ingresos regulares?',
      '¿Qué esperas que el dinero permita en tu vida?',
      '¿Qué decisiones económicas deseas conservar de forma individual?',
    ],
  },
  {
    title: 'Mi situación',
    questions: [
      '¿Cómo describirías tus ingresos actualmente: regulares, variables, combinados o temporalmente sin ingresos?',
      '¿Qué tan previsible es lo que recibirás el próximo mes?',
      'En los últimos tres meses, ¿con qué frecuencia tus recursos alcanzaron para gastos esenciales?',
      'Si surgiera un gasto imprevisto, ¿qué alternativas tendrías?',
    ],
  },
  {
    title: 'Hábitos y responsabilidades',
    questions: [
      '¿Cómo llevas el control de ingresos y gastos?',
      '¿Tienes obligaciones económicas con hijos, familiares u otras personas? No necesitas decir quiénes son.',
      '¿Qué tan cómodo te resulta conversar sobre deudas u obligaciones que afectarían un proyecto compartido?',
      '¿Qué aportaciones, además del dinero, consideras importantes en una relación?',
    ],
  },
  {
    title: 'Vida en pareja',
    questions: [
      '¿Qué forma de repartir gastos te gustaría explorar?',
      'Si una persona reduce su trabajo remunerado para cuidar, ¿qué acuerdo te parecería justo?',
      '¿Qué metas te gustaría conversar antes de compartir vivienda?',
      '¿Cómo te gustaría revisar los acuerdos económicos?',
      'Ante un desacuerdo sobre dinero, ¿qué necesitas para poder conversar?',
      '¿Qué tema económico te gustaría comprender mejor de ti?',
    ],
  },
] as const

export interface FinanceScenario {
  title: string
  context: string
  choices: { label: string; reflection: string }[]
}

export const financeScenarios: FinanceScenario[] = [
  {
    title: 'Un mes con menos ingresos',
    context: 'Una persona recibió menos de lo habitual. Quieren cuidar los gastos esenciales sin suponer que la situación será permanente.',
    choices: [
      { label: 'Ajustar aportaciones por ahora', reflection: '¿Qué gastos mantendrían y cuándo revisarían el reparto?' },
      { label: 'Revisar el presupuesto juntos', reflection: '¿Qué información desea compartir cada persona y qué prefiere mantener privada?' },
      { label: 'Pedir tiempo para pensar', reflection: '¿Cuándo volverían a conversar y qué necesitan para hacerlo con calma?' },
    ],
  },
  {
    title: 'Vivienda o estudios',
    context: 'Una persona quiere ahorrar para vivienda; la otra prioriza estudiar. Ambas metas importan.',
    choices: [
      { label: 'Explorar plazos distintos', reflection: '¿Qué plazo sería realista para cada meta y cuándo lo revisarían?' },
      { label: 'Buscar una meta intermedia', reflection: '¿Qué decisión pequeña podrían tomar sin renunciar a ninguna prioridad?' },
      { label: 'Conservar metas individuales', reflection: '¿Qué gastos serían compartidos y cuáles seguirían siendo personales?' },
    ],
  },
  {
    title: 'Tiempo para cuidar',
    context: 'Una persona propone reducir temporalmente su empleo para asumir cuidados. El tiempo y el trabajo no remunerado también cuentan.',
    choices: [
      { label: 'Repartir cuidados y gastos', reflection: '¿Cómo reconocerían el tiempo de cuidado sin ponerle un precio inventado?' },
      { label: 'Definir un periodo de prueba', reflection: '¿Cuánto duraría, qué apoyos existen y cuándo revisarían el acuerdo?' },
      { label: 'Buscar otras opciones', reflection: '¿Qué apoyos o ajustes permitirían repartir mejor las responsabilidades?' },
    ],
  },
]
