/** Educational fixtures only. Never send these IDs to matching, messaging or analytics as people. */
export interface DemoCandidate {
  id: `demo-${number}`
  fictional: true
  label: string
  age: number
  zone: string
  distanceKm: number
  intent: 'relacion_estable' | 'amistad'
  reciprocalPreferences: boolean
  mutualInterest: false
  x: number
  y: number
}

export const demoCandidates: readonly DemoCandidate[] = [
  { id: 'demo-1', fictional: true, label: 'Perfil ejemplo 1', age: 34, zone: 'Zona norte ilustrativa', distanceKm: 18, intent: 'relacion_estable', reciprocalPreferences: true, mutualInterest: false, x: 24, y: 22 },
  { id: 'demo-2', fictional: true, label: 'Perfil ejemplo 2', age: 37, zone: 'Zona centro ilustrativa', distanceKm: 4, intent: 'amistad', reciprocalPreferences: true, mutualInterest: false, x: 48, y: 35 },
  { id: 'demo-3', fictional: true, label: 'Perfil ejemplo 3', age: 25, zone: 'Zona este ilustrativa', distanceKm: 7, intent: 'relacion_estable', reciprocalPreferences: true, mutualInterest: false, x: 77, y: 30 },
  { id: 'demo-4', fictional: true, label: 'Perfil ejemplo 4', age: 35, zone: 'Zona sur ilustrativa', distanceKm: 6, intent: 'relacion_estable', reciprocalPreferences: false, mutualInterest: false, x: 34, y: 73 },
  { id: 'demo-5', fictional: true, label: 'Perfil ejemplo 5', age: 39, zone: 'Zona oeste ilustrativa', distanceKm: 9, intent: 'relacion_estable', reciprocalPreferences: true, mutualInterest: false, x: 71, y: 70 },
]

export function explainDemoCandidate(candidate: DemoCandidate, radiusKm: number) {
  if (!candidate.fictional || !candidate.id.startsWith('demo-')) throw new Error('Este recorrido admite solo ejemplos ficticios.')
  if (candidate.distanceKm > radiusKm) return { status: 'outside_filters' as const, title: 'Fuera del radio del ejemplo', reason: `Está a ${candidate.distanceKm} km ilustrativos; el radio elegido es ${radiusKm} km.` }
  if (candidate.intent !== 'relacion_estable') return { status: 'outside_filters' as const, title: 'Objetivos distintos en el ejemplo', reason: 'Este perfil busca amistad. La preferencia de esta demostración es una relación estable.' }
  if (candidate.age < 30 || candidate.age > 45) return { status: 'outside_filters' as const, title: 'Fuera del rango del ejemplo', reason: 'La preferencia ilustrativa es de 30 a 45 años. No es una valoración de la persona.' }
  if (!candidate.reciprocalPreferences) return { status: 'outside_filters' as const, title: 'Preferencias no recíprocas', reason: 'Las preferencias de ambas partes deben coincidir. Que una persona aparezca en un ejemplo no significa que haya una conexión.' }
  return { status: 'mutual_interest_required' as const, title: 'Falta interés mutuo', reason: 'Pasar los filtros no crea un match. En una conexión real ambas personas deben elegir continuar. En esta demo no se crean conexiones.' }
}
