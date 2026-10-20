export type LoviaGoal = 'meet' | 'understand' | 'care'

export interface GoalOption {
  id: LoviaGoal
  icon: string
  title: string
  description: string
  firstStep: string
  route: string
  reflection: string
}

export const LOVIA_GOALS: GoalOption[] = [
  {
    id: 'meet',
    icon: '💞',
    title: 'Quiero conocer personas',
    description: 'Aclara lo que buscas y prepara un perfil que te represente.',
    firstStep: 'Preparar mi perfil',
    route: '/profile/edit',
    reflection: '¿Qué te gustaría conocer de alguien antes de decidir si quieres conversar?',
  },
  {
    id: 'understand',
    icon: '🪞',
    title: 'Quiero comprenderme mejor',
    description: 'Explora tus valores, emociones y formas de relacionarte a tu ritmo.',
    firstStep: 'Responder una Chispa',
    route: '/spark',
    reflection: '¿Qué necesitas sentir para estar a gusto en una relación?',
  },
  {
    id: 'care',
    icon: '🌱',
    title: 'Quiero cuidar mi relación',
    description: 'Encuentra ideas para conversar, escuchar y expresar tus límites.',
    firstStep: 'Abrir la Guía',
    route: '/modules',
    reflection: '¿Qué conversación te gustaría tener con más calma?',
  },
]

export function readLoviaGoal(metadata: unknown): LoviaGoal | null {
  if (!metadata || typeof metadata !== 'object') return null
  const value = (metadata as Record<string, unknown>).lovia_goal
  return value === 'meet' || value === 'understand' || value === 'care' ? value : null
}
