/** Editorial drafts supplied by the author. P numbers are DOCX XML paragraphs, not print pages. */
export interface BookCardDraft {
  id: string
  status: 'draft'
  work: string
  sourceFile: string
  section: string
  paragraph: string
  citation: string
  exercise: string
  editorialReview: 'pending'
  rightsReview: 'pending'
}

export const bookCardDrafts: BookCardDraft[] = [
  {
    id: 'JP-P986', status: 'draft', work: 'Evolución de las Relaciones de Pareja',
    sourceFile: 'FINAL Evolucion 2023.docx', section: 'Tolerancia', paragraph: 'P986',
    citation: 'Hay que tener presente que la tolerancia no es aguantar lo inaguantable, ni ceder hasta un punto de no reconocernos ya que todo tiene un límite.',
    exercise: 'Completa: para sentirme respetado/a necesito…',
    editorialReview: 'pending', rightsReview: 'pending',
  },
  {
    id: 'JP-P991', status: 'draft', work: 'Evolución de las Relaciones de Pareja',
    sourceFile: 'FINAL Evolucion 2023.docx', section: 'Construcción continua de la confianza', paragraph: 'P991',
    citation: 'La confianza debe renovarse continuamente sin que necesariamente se haya presentado un conflicto',
    exercise: 'Elige una acción pequeña y realista con la que quieras cuidar la confianza esta semana.',
    editorialReview: 'pending', rightsReview: 'pending',
  },
  {
    id: 'JP-P980', status: 'draft', work: 'Evolución de las Relaciones de Pareja',
    sourceFile: 'FINAL Evolucion 2023.docx', section: 'Flexibilidad, antes de Tolerancia', paragraph: 'P980',
    citation: 'Nuestra vida sería más sencilla si fuéramos consientes de la riqueza que guarda cada persona, cada ambiente, cada nuevo conocimiento y experiencia, sin aferrarnos a nuestro propio juicio, experiencias y opinión.',
    exercise: 'Piensa en un desacuerdo reciente: ¿qué información te faltaba sobre la perspectiva de la otra persona?',
    editorialReview: 'pending', rightsReview: 'pending',
  },
]
