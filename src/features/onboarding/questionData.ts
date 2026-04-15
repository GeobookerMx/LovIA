export interface QuestionOption {
    id: string
    text: string
    emoji: string
    scores: Record<string, number>
}

export interface Question {
    id: string
    text: string
    subtitle?: string
    category: 'logistics' | 'intent' | 'emotion' | 'attachment'
    categoryLabel: string
    emoji: string
    type: 'single' | 'slider' | 'multi'
    options?: QuestionOption[]
    sliderConfig?: { min: number; max: number; step: number; labels: [string, string] }
    factorKeys: string[]
}

// ── TEST 1: Mapa de Momento de Vida (MVP 1.2) ──
export const momentoDeVidaQuestions: Question[] = [
    {
        id: 'mv1_intent',
        text: '¿Qué buscas en este momento de tu vida?',
        subtitle: 'Sé honesto/a contigo mismo/a.',
        category: 'intent',
        categoryLabel: 'Intención Relacional',
        emoji: '🎯',
        type: 'single',
        factorKeys: ['readiness_intent'],
        options: [
            { id: 'a', text: 'Una relación estable a largo plazo', emoji: '💍', scores: { readiness_intent: 4 } },
            { id: 'b', text: 'Conocer gente sin prisa y ver qué pasa', emoji: '🌿', scores: { readiness_intent: 3 } },
            { id: 'c', text: 'Primero quiero entenderme mejor', emoji: '🧘', scores: { readiness_intent: 2 } }
        ],
    },
    {
        id: 'mv2_status',
        text: '¿Cuál es tu situación sentimental reciente?',
        category: 'emotion',
        categoryLabel: 'Contexto Emocional',
        emoji: '🕰️',
        type: 'single',
        factorKeys: ['readiness_status'],
        options: [
            { id: 'a', text: 'Llevo tiempo soltero/a y estoy muy en paz', emoji: '☀️', scores: { readiness_status: 4 } },
            { id: 'b', text: 'Terminé una relación hace unos meses, ya sano/a', emoji: '🌱', scores: { readiness_status: 3 } },
            { id: 'c', text: 'Separación/Ruptura reciente', emoji: '🌧️', scores: { readiness_status: 1 } },
            { id: 'd', text: 'Aún en proceso de un duelo fuerte', emoji: '🌪️', scores: { readiness_status: 0 } },
        ],
    },
    {
        id: 'mv3_time',
        text: 'Siendo muy realista, ¿qué tanta disponibilidad de tiempo tienes hoy para salir?',
        category: 'logistics',
        categoryLabel: 'Disponibilidad',
        emoji: '⏱️',
        type: 'single',
        factorKeys: ['readiness_time'],
        options: [
            { id: 'a', text: 'Tengo mis tardes/fines de semana libres', emoji: '✅', scores: { readiness_time: 4 } },
            { id: 'b', text: 'Estoy bastante activo/a, pero hago el tiempo', emoji: '🗓️', scores: { readiness_time: 3 } },
            { id: 'c', text: 'Mi trabajo/estudios me absorben casi al 100%', emoji: '💼', scores: { readiness_time: 1 } },
        ],
    },
    {
        id: 'mv4_dependents',
        text: '¿Tienes hijos o responsabilidades familiares fuertes?',
        subtitle: 'Esto nos ayuda a buscar personas con una logística compatible a la tuya.',
        category: 'logistics',
        categoryLabel: 'Cargas Familiares',
        emoji: '👨‍👩‍👧',
        type: 'single',
        factorKeys: ['readiness_dependents'],
        options: [
            { id: 'a', text: 'No, no tengo dependientes', emoji: '👤', scores: { readiness_dependents: 4 } },
            { id: 'b', text: 'Sí, pero tengo mi logística organizada', emoji: '🧩', scores: { readiness_dependents: 3 } },
            { id: 'c', text: 'Sí, y me demandan muchísimo tiempo', emoji: '⏳', scores: { readiness_dependents: 2 } },
        ],
    },
    {
        id: 'mv5_distance',
        text: '¿Qué distancia estás dispuesto/a a recorrer para ver a alguien recurrente?',
        category: 'logistics',
        categoryLabel: 'Movilidad',
        emoji: '🚗',
        type: 'single',
        factorKeys: ['readiness_mobility'],
        options: [
            { id: 'a', text: 'No tengo problema, puedo moverme por la ciudad', emoji: '🗺️', scores: { readiness_mobility: 4 } },
            { id: 'b', text: 'Prefiero que sea en mi misma zona', emoji: '📍', scores: { readiness_mobility: 2 } },
        ],
    }
]

// ── PSS-4 — Escala de Estrés Percibido (Cohen et al., 1983) ──
export interface PSS4Question {
    id: string
    text: string
    reversed: boolean
}

export const pss4Questions: PSS4Question[] = [
    {
        id: 'pss_1',
        text: '¿Con qué frecuencia has sentido que no podías controlar las cosas importantes de tu vida?',
        reversed: false,
    },
    {
        id: 'pss_2',
        text: '¿Con qué frecuencia te has sentido seguro/a de tu capacidad para manejar tus problemas personales?',
        reversed: true,
    },
    {
        id: 'pss_3',
        text: '¿Con qué frecuencia has sentido que las cosas iban bien?',
        reversed: true,
    },
    {
        id: 'pss_4',
        text: '¿Con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?',
        reversed: false,
    },
]

export const pss4Options = [
    { value: 0, label: 'Nunca' },
    { value: 1, label: 'Casi nunca' },
    { value: 2, label: 'A veces' },
    { value: 3, label: 'Bastante frecuente' },
    { value: 4, label: 'Muy frecuentemente' },
]

// ── TEST 2: Cómo te vinculas (MVP 1.3) ──
export const vinculoQuestions: Question[] = [
    {
        id: 'vin1_trust',
        text: '¿Qué tanta facilidad tienes para confiar en alguien nuevo?',
        category: 'attachment',
        categoryLabel: 'Confianza',
        emoji: '🤝',
        type: 'slider',
        factorKeys: ['attachment_trust'],
        sliderConfig: { min: 1, max: 10, step: 1, labels: ['Me cuesta mucho', 'Confío rápido'] },
    },
    {
        id: 'vin2_conflict',
        text: 'Cuando hay un desacuerdo fuerte con alguien que quieres, ¿cómo reaccionas?',
        category: 'emotion',
        categoryLabel: 'Manejo de Conflicto',
        emoji: '💬',
        type: 'single',
        factorKeys: ['emotion_conflict'],
        options: [
            { id: 'a', text: 'Busco hablarlo de inmediato para resolverlo', emoji: '🗣️', scores: { emotion_conflict: 4 } },
            { id: 'b', text: 'Pido tiempo a solas para pensar y luego hablo', emoji: '🧘', scores: { emotion_conflict: 3 } },
            { id: 'c', text: 'Prefiero evitar el tema para no discutir', emoji: '🤐', scores: { emotion_conflict: 1 } },
            { id: 'd', text: 'Me enojo mucho y tiendo a reaccionar fuerte', emoji: '🌋', scores: { emotion_conflict: 0 } },
        ]
    },
    {
        id: 'vin3_attachment',
        text: 'Si la persona que estás conociendo tarda días en responder, ¿cómo te sientes?',
        category: 'attachment',
        categoryLabel: 'Seguridad Afectiva',
        emoji: '📱',
        type: 'single',
        factorKeys: ['attachment_anxiety'],
        options: [
            { id: 'a', text: 'Normal, todos tenemos una vida ocupada', emoji: '☕', scores: { attachment_anxiety: 4 } },
            { id: 'b', text: 'Me genera un poco de duda, pero lo entiendo', emoji: '🤔', scores: { attachment_anxiety: 3 } },
            { id: 'c', text: 'Me genera muchísima ansiedad e inseguridad', emoji: '😟', scores: { attachment_anxiety: 0 } },
        ]
    }
]
