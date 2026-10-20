/** Answers shown by the rule-based LovIA guide. No clinical or matching claims. */
export interface QuickReply {
  label: string
  intent: string
}

export interface BotMessage {
  text: string
  richContent?: RichContent
  quickReplies?: QuickReply[]
}

export interface RichContent {
  type: 'card' | 'list' | 'citation' | 'specialist' | 'steps'
  title?: string
  items?: string[]
  steps?: { n: number; title: string; desc: string }[]
}

export const INTENTS: Record<string, BotMessage> = {
  welcome: {
    text: '¡Hola! Soy la **Guía automática de LovIA**. Puedo orientarte por la app y sugerirte actividades de reflexión. Mis respuestas son información general, no una evaluación profesional.',
    quickReplies: [
      { label: '¿Cómo empiezo?', intent: 'step_guide' },
      { label: 'Conocer personas', intent: 'how_matches' },
      { label: 'Privacidad y seguridad', intent: 'safety' },
      { label: 'Especialistas', intent: 'specialists' },
    ],
  },
  how_it_works: {
    text: 'LovIA ofrece tres caminos que puedes cambiar cuando quieras: **conocer personas**, **comprenderte mejor** y **cuidar una relación**. Puedes usar la Guía, una Chispa breve o Mi Diario sin convertir esas actividades en una calificación sobre ti.',
    quickReplies: [
      { label: 'Pasos para empezar', intent: 'step_guide' },
      { label: '¿Cómo se usan los resultados?', intent: 'scoring' },
    ],
  },
  step_guide: {
    text: 'Un recorrido sencillo para empezar a tu ritmo:',
    richContent: {
      type: 'steps',
      steps: [
        { n: 1, title: 'Elige tu objetivo', desc: 'Selecciona lo que te interesa hoy. Puedes cambiarlo en Inicio.' },
        { n: 2, title: 'Prueba una reflexión', desc: 'Responde una Chispa o escribe en Mi Diario si te resulta útil.' },
        { n: 3, title: 'Prepara tu perfil', desc: 'Decide qué información deseas compartir. Tu objetivo personal no activa tu visibilidad.' },
        { n: 4, title: 'Consulta tus conexiones', desc: 'Revisa Mensajes para ver conexiones existentes. Las sugerencias nuevas dependen de controles de seguridad del servidor.' },
      ],
    },
    quickReplies: [
      { label: 'Conocer personas', intent: 'how_matches' },
      { label: 'Actividades voluntarias', intent: 'unlocks' },
    ],
  },
  unlocks: {
    text: 'El acceso a LovIA es **gratuito hasta el 31 de enero de 2027 inclusive**. No se inicia un cobro automático al terminar ese periodo. Las actividades de reflexión son voluntarias y no desbloquean personas ni mensajes.',
    richContent: {
      type: 'list',
      items: [
        '🪞 **Mi Diario y Chispas**: para pensar a tu ritmo; sus respuestas son personales.',
        '📚 **Guía**: ideas y ejercicios; no es una prueba clínica.',
        '💬 **Mensajes**: consulta tus conexiones existentes.',
        '🛡️ **Seguridad**: reportar y bloquear nunca debe depender de completar ejercicios.',
      ],
    },
    quickReplies: [{ label: '¿Cómo empiezo?', intent: 'step_guide' }],
  },
  science: {
    text: 'El libro *Evolución de las Relaciones de Pareja* de Juan Pablo Peña García inspira parte del lenguaje educativo de LovIA. Amor, Sexualidad y Realización son temas del marco del autor. En la teoría de Sternberg se distinguen intimidad, pasión y compromiso; no son equivalencias exactas. Una bibliografía no valida por sí sola una puntuación o una predicción de pareja.',
    quickReplies: [
      { label: '¿Qué significan las puntuaciones?', intent: 'scoring' },
      { label: 'Actividades voluntarias', intent: 'unlocks' },
    ],
  },
  scoring: {
    text: 'El progreso que aparece en LovIA indica actividades realizadas. **No es una medida de tu valor, preparación emocional ni probabilidad de éxito con otra persona.** Una respuesta de estrés o un juego de atención tampoco determina a quién puedes conocer. Las evaluaciones pendientes de revisión deben interpretarse con cautela.',
    quickReplies: [
      { label: 'Base y límites', intent: 'science' },
      { label: 'Conocer personas', intent: 'how_matches' },
    ],
  },
  specialists: {
    text: 'Puedes consultar el Directorio desde Comunidad. Confirma directamente la cédula, especialidad, disponibilidad y condiciones de atención de cada profesional antes de contratar un servicio.',
    richContent: { type: 'specialist', items: ['__DYNAMIC__'] },
    quickReplies: [{ label: 'Abrir directorio', intent: 'go_directory' }],
  },
  support_trigger: {
    text: 'Puedes buscar apoyo humano cuando lo necesites desde el Directorio. LovIA no usa un resultado de estrés para diagnosticarte ni para decidir si mereces ayuda.',
    quickReplies: [{ label: 'Abrir directorio', intent: 'go_directory' }],
  },
  safety: {
    text: 'Decide con cuidado qué compartes en tu perfil y en las conversaciones. Puedes revisar las opciones de bloqueo y reporte desde las pantallas donde estén disponibles. Si una herramienta de seguridad falla o necesitas ayuda con tu cuenta, escribe a **evosocial@hotmail.com**. La ubicación precisa no debe considerarse pública.',
    quickReplies: [
      { label: 'Privacidad', intent: 'privacy_block' },
      { label: 'Buscar apoyo', intent: 'support_trigger' },
    ],
  },
  security_block: {
    text: 'Esta Guía no puede proporcionar contraseñas, claves ni acceso administrativo. Para una duda sobre la seguridad de tu cuenta, escribe a **evosocial@hotmail.com**.',
  },
  privacy_block: {
    text: 'Esta Guía no muestra datos de otras cuentas. Tus respuestas personales no deben compartirse con otros usuarios sin una acción y permiso claros. Para consultar el aviso completo, abre Privacidad desde tu perfil.',
  },
  go_directory: { text: 'Abre **Comunidad → Directorio** para consultar profesionales y sus datos disponibles.' },
  how_matches: {
    text: 'En **Mensajes** puedes consultar conexiones que ya existan. Las nuevas sugerencias necesitan comprobar edad, consentimiento, visibilidad, bloqueos y preferencias recíprocas en el servidor. Completar pruebas o acumular puntos no debe ser un requisito para conocer personas.',
    quickReplies: [
      { label: 'Preparar mi perfil', intent: 'step_guide' },
      { label: 'Seguridad', intent: 'safety' },
    ],
  },
}

const KEYWORD_MAP: [string[], string][] = [
  [['contraseña admin', 'clave secreta', 'service role', 'api key', 'credencial de administrador'], 'security_block'],
  [['datos de otro', 'perfil de otro', 'contraseña de otro', 'correo de otro', 'email de otro'], 'privacy_block'],
  [['hola', 'buenas', 'saludo'], 'welcome'],
  [['cómo funciona', 'como funciona', 'qué es', 'que es', 'para qué', 'para que'], 'how_it_works'],
  [['precio', 'costo', 'pagar', 'plan', 'gratis', 'desbloquear', 'suscripción', 'suscripcion'], 'unlocks'],
  [['ciencia', 'científica', 'libro', 'autor', 'fuente', 'teoría', 'bibliografía'], 'science'],
  [['puntuación', 'score', 'readiness', 'calificación', 'compatibilidad'], 'scoring'],
  [['especialista', 'psicólogo', 'psicologo', 'terapeuta', 'directorio'], 'specialists'],
  [['ayuda profesional', 'apoyo humano', 'necesito apoyo'], 'support_trigger'],
  [['seguridad', 'bloquear', 'reportar', 'ubicación', 'ubicacion', 'privacidad'], 'safety'],
  [['match', 'matches', 'conectar', 'perfiles', 'conocer personas', 'mensajes'], 'how_matches'],
  [['guía', 'guia', 'pasos', 'recorrido', 'empezar'], 'step_guide'],
]

export function detectIntent(input: string): string {
  const lower = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const [keywords, intent] of KEYWORD_MAP) {
    if (keywords.some((keyword) => lower.includes(keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) return intent
  }
  return 'fallback'
}

export const FALLBACK: BotMessage = {
  text: 'No encontré una respuesta precisa para eso. Puedo orientarte con estos temas o puedes escribir a **evosocial@hotmail.com** si necesitas ayuda con tu cuenta.',
  quickReplies: [
    { label: '¿Cómo empiezo?', intent: 'step_guide' },
    { label: 'Conocer personas', intent: 'how_matches' },
    { label: 'Privacidad y seguridad', intent: 'safety' },
    { label: 'Especialistas', intent: 'specialists' },
  ],
}
