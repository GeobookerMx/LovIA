/**
 * LovIA! — Level 1 Questionnaire Data
 *
 * 10 questions covering the 3 Lines and key factors.
 * Each question maps to specific factors and lines for initial scoring.
 */

export interface QuestionOption {
    id: string
    text: string
    emoji: string
    /** Score impact: which factor/line and how much (0-4) */
    scores: Record<string, number>
}

export interface Question {
    id: string
    text: string
    subtitle?: string
    category: 'love' | 'sexual' | 'realization' | 'common' | 'positive' | 'negative'
    categoryLabel: string
    emoji: string
    type: 'single' | 'slider' | 'multi'
    options?: QuestionOption[]
    sliderConfig?: { min: number; max: number; step: number; labels: [string, string] }
    factorKeys: string[]
}

export interface PSS4Question {
    id: string
    text: string
    reversed: boolean
}

// ── PSS-4 (Perceived Stress Scale — 4 items) ──
export const pss4Questions: PSS4Question[] = [
    { id: 'pss1', text: 'En el último mes, ¿con qué frecuencia has sentido que no podías controlar las cosas importantes de tu vida?', reversed: false },
    { id: 'pss2', text: 'En el último mes, ¿con qué frecuencia te has sentido seguro/a de tu capacidad para manejar tus problemas personales?', reversed: true },
    { id: 'pss3', text: 'En el último mes, ¿con qué frecuencia has sentido que las cosas te salían bien?', reversed: true },
    { id: 'pss4', text: 'En el último mes, ¿con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?', reversed: false },
]

// PSS-4 response options (0-4 Likert)
export const pss4Options = [
    { value: 0, label: 'Nunca' },
    { value: 1, label: 'Casi nunca' },
    { value: 2, label: 'A veces' },
    { value: 3, label: 'Frecuentemente' },
    { value: 4, label: 'Muy frecuentemente' },
]

// ── Level 1 Questions (10 questions) ──
export const level1Questions: Question[] = [
    // Q1: Love Line — Emotional openness
    {
        id: 'q1_love_openness',
        text: '¿Cómo describirías tu disposición actual a enamorarte?',
        subtitle: 'No hay respuestas correctas — sé honesto/a contigo',
        category: 'love',
        categoryLabel: 'Línea del Amor',
        emoji: '❤️',
        type: 'single',
        factorKeys: ['love_line', 'emotional_openness'],
        options: [
            { id: 'a', text: 'Totalmente abierto/a, listo/a para conectar', emoji: '💕', scores: { love_line: 4, emotional_openness: 4 } },
            { id: 'b', text: 'Abierto/a pero con precaución saludable', emoji: '🌱', scores: { love_line: 3, emotional_openness: 3 } },
            { id: 'c', text: 'Algo cerrado/a por experiencias pasadas', emoji: '🛡️', scores: { love_line: 2, emotional_openness: 2 } },
            { id: 'd', text: 'Prefiero enfocarme en mí por ahora', emoji: '🧘', scores: { love_line: 1, emotional_openness: 1 } },
        ],
    },

    // Q2: Common Factor — Values
    {
        id: 'q2_values',
        text: '¿Qué valor es más importante para ti en una relación?',
        category: 'common',
        categoryLabel: 'Valores',
        emoji: '⚖️',
        type: 'single',
        factorKeys: ['values'],
        options: [
            { id: 'a', text: 'Honestidad y transparencia', emoji: '🪞', scores: { values: 4 } },
            { id: 'b', text: 'Lealtad y compromiso', emoji: '🤝', scores: { values: 4 } },
            { id: 'c', text: 'Respeto e independencia', emoji: '🦅', scores: { values: 3 } },
            { id: 'd', text: 'Diversión y espontaneidad', emoji: '🎉', scores: { values: 2 } },
        ],
    },

    // Q3: Positive Factor — Emotional Intelligence
    {
        id: 'q3_emotional_intelligence',
        text: 'Cuando tu pareja tiene un mal día, ¿qué haces normalmente?',
        subtitle: 'Piensa en cómo reaccionas en la vida real',
        category: 'positive',
        categoryLabel: 'Inteligencia Emocional',
        emoji: '🧠',
        type: 'single',
        factorKeys: ['emotional_intelligence', 'empathy'],
        options: [
            { id: 'a', text: 'Escucho sin juzgar y pregunto cómo apoyar', emoji: '👂', scores: { emotional_intelligence: 4, empathy: 4 } },
            { id: 'b', text: 'Intento dar soluciones para que se sienta mejor', emoji: '💡', scores: { emotional_intelligence: 3, empathy: 2 } },
            { id: 'c', text: 'Le doy su espacio hasta que se calme', emoji: '🚪', scores: { emotional_intelligence: 2, empathy: 2 } },
            { id: 'd', text: 'Me cuesta saber qué hacer en esos momentos', emoji: '😶', scores: { emotional_intelligence: 1, empathy: 1 } },
        ],
    },

    // Q4: Common Factor — Affection Language
    {
        id: 'q4_affection',
        text: '¿Cómo prefieres que te demuestren cariño?',
        category: 'common',
        categoryLabel: 'Lenguaje del Afecto',
        emoji: '💝',
        type: 'single',
        factorKeys: ['affection', 'love_language'],
        options: [
            { id: 'a', text: 'Palabras de afirmación y cumplidos', emoji: '💬', scores: { affection: 3, love_language: 1 } },
            { id: 'b', text: 'Tiempo de calidad juntos', emoji: '⏰', scores: { affection: 3, love_language: 2 } },
            { id: 'c', text: 'Contacto físico y cercanía', emoji: '🤗', scores: { affection: 3, love_language: 3 } },
            { id: 'd', text: 'Actos de servicio y detalles', emoji: '🎁', scores: { affection: 3, love_language: 4 } },
        ],
    },

    // Q5: Sexual Line — Priority
    {
        id: 'q5_sexual_priority',
        text: '¿Qué tan importante es la intimidad física en una relación para ti?',
        category: 'sexual',
        categoryLabel: 'Línea Sexual',
        emoji: '🔥',
        type: 'slider',
        factorKeys: ['sexual_line', 'intimacy_priority'],
        sliderConfig: { min: 1, max: 10, step: 1, labels: ['Poco importante', 'Muy importante'] },
    },

    // Q6: Negative Factor — Codependency detection
    {
        id: 'q6_independence',
        text: '¿Qué mejor describe tu relación con la soledad?',
        category: 'negative',
        categoryLabel: 'Independencia Emocional',
        emoji: '🌊',
        type: 'single',
        factorKeys: ['codependency', 'independence'],
        options: [
            { id: 'a', text: 'Disfruto mi tiempo a solas, me recarga', emoji: '✨', scores: { codependency: 0, independence: 4 } },
            { id: 'b', text: 'Estoy bien solo/a pero prefiero compañía', emoji: '☀️', scores: { codependency: 1, independence: 3 } },
            { id: 'c', text: 'Me cuesta estar solo/a mucho tiempo', emoji: '🌧️', scores: { codependency: 3, independence: 1 } },
            { id: 'd', text: 'La soledad me genera ansiedad', emoji: '😟', scores: { codependency: 4, independence: 0 } },
        ],
    },

    // Q7: Realization Line — Life goals
    {
        id: 'q7_realization',
        text: '¿En qué etapa de tu vida profesional/personal te encuentras?',
        category: 'realization',
        categoryLabel: 'Línea de Realización',
        emoji: '⭐',
        type: 'single',
        factorKeys: ['realization_line', 'life_stage'],
        options: [
            { id: 'a', text: 'Explorando opciones, descubriendo mi camino', emoji: '🔍', scores: { realization_line: 2, life_stage: 1 } },
            { id: 'b', text: 'Construyendo activamente mi carrera/metas', emoji: '🏗️', scores: { realization_line: 3, life_stage: 2 } },
            { id: 'c', text: 'Consolidado/a, enfocado/a en crecer', emoji: '🚀', scores: { realization_line: 4, life_stage: 3 } },
            { id: 'd', text: 'Reinventándome después de un cambio importante', emoji: '🔄', scores: { realization_line: 2, life_stage: 4 } },
        ],
    },

    // Q8: Positive Factor — Communication
    {
        id: 'q8_communication',
        text: 'Cuando hay un desacuerdo con tu pareja, ¿cómo lo manejas?',
        subtitle: 'Piensa en tu patrón más frecuente',
        category: 'positive',
        categoryLabel: 'Comunicación',
        emoji: '💬',
        type: 'single',
        factorKeys: ['communication', 'conflict_resolution'],
        options: [
            { id: 'a', text: 'Hablo con calma y busco entender su punto', emoji: '🤝', scores: { communication: 4, conflict_resolution: 4 } },
            { id: 'b', text: 'Expreso lo que siento aunque cueste', emoji: '💪', scores: { communication: 3, conflict_resolution: 3 } },
            { id: 'c', text: 'Me callo y espero a que pase', emoji: '🤐', scores: { communication: 1, conflict_resolution: 1 } },
            { id: 'd', text: 'Tiendo a ser reactivo/a en el momento', emoji: '🌋', scores: { communication: 2, conflict_resolution: 2 } },
        ],
    },

    // Q9: Common Factor — Family
    {
        id: 'q9_relationship_intent',
        text: '¿Qué tipo de relación buscas?',
        category: 'common',
        categoryLabel: 'Intención Relacional',
        emoji: '🎯',
        type: 'single',
        factorKeys: ['relationship_intent'],
        options: [
            { id: 'a', text: 'Pareja estable a largo plazo', emoji: '💍', scores: { relationship_intent: 4 } },
            { id: 'b', text: 'Conocer gente, ver qué pasa', emoji: '🌿', scores: { relationship_intent: 2 } },
            { id: 'c', text: 'Amistad primero, relación después', emoji: '🤝', scores: { relationship_intent: 3 } },
            { id: 'd', text: 'Autoconocimiento, no busco pareja ahora', emoji: '🧘', scores: { relationship_intent: 1 } },
        ],
    },

    // Q10: Positive Factor — Self-criticism / Growth
    {
        id: 'q10_growth',
        text: '¿Qué tan dispuesto/a estás a trabajar en ti para mejorar tus relaciones?',
        category: 'positive',
        categoryLabel: 'Crecimiento Personal',
        emoji: '🌱',
        type: 'slider',
        factorKeys: ['self_criticism', 'growth_mindset'],
        sliderConfig: { min: 1, max: 10, step: 1, labels: ['Poco dispuesto/a', 'Totalmente dispuesto/a'] },
    },
]
