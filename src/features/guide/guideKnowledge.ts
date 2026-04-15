/**
 * LovIA! — Knowledge Base del Chatbot Guía
 * Base de conocimiento para el asistente "Dr. LovIA"
 * Sistema rule-based con intenciones + respuestas ricas.
 */

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

// ── Árbol de intenciones ──────────────────────────────────────────────────
export const INTENTS: Record<string, BotMessage> = {

    // ── Bienvenida ──
    welcome: {
        text: '¡Hola! 👋 Soy **Dr. LovIA**, tu guía dentro de la plataforma. Estoy aquí para explicarte cómo funciona la app, presentarte a nuestros especialistas, contarte la ciencia detrás y resolver tus preguntas sobre planes y costos.',
        quickReplies: [
            { label: '¿Cómo funciona LovIA?', intent: 'how_it_works' },
            { label: '🔬 Base científica', intent: 'science' },
            { label: '👩‍⚕️ Especialistas', intent: 'specialists' },
            { label: '💳 Costos y planes', intent: 'pricing' },
            { label: '📋 Guía paso a paso', intent: 'step_guide' },
        ],
    },

    // ── Cómo funciona ──
    how_it_works: {
        text: 'LovIA **no es una app de swipe**. Es una plataforma de **preparación relacional y compatibilidad gradual**. Antes de conectarte con alguien, la app te pregunta quién eres hoy, qué puedes ofrecer, qué buscas y qué tan listo estás para conocer a alguien.\n\nEstos datos alimentan tres motores internos:',
        richContent: {
            type: 'list',
            items: [
                '🟢 **Readiness** — ¿Estás listo emocionalmente para conocer a alguien?',
                '💜 **Compatibility** — ¿Con quién hace sentido un vínculo real?',
                '🔒 **Safety** — ¿Existen señales que ameriten pausar o redirigir tu experiencia?',
            ],
        },
        quickReplies: [
            { label: '📋 Ver guía paso a paso', intent: 'step_guide' },
            { label: '🔬 ¿En qué ciencia se basa?', intent: 'science' },
            { label: '🔓 ¿Qué se desbloquea cuándo?', intent: 'unlocks' },
        ],
    },

    // ── Guía paso a paso ──
    step_guide: {
        text: 'Aquí tienes el recorrido completo dentro de LovIA, de principio a fin:',
        richContent: {
            type: 'steps',
            steps: [
                { n: 1, title: 'Registro y consentimiento', desc: 'Creas tu cuenta (email, Google o Apple), confirmas tu mayoría de edad y aceptas los términos de privacidad. Todo queda trazado.' },
                { n: 2, title: 'Mapa de tu momento de vida', desc: 'Test de 5-7 min. Intenciones, disponibilidad, cargas familiares, horarios, distancia y apertura. No hay respuestas buenas o malas.' },
                { n: 3, title: 'Cómo te vinculas', desc: 'Test de 4-6 min. Estilo de apego, tolerancia al conflicto, ritmo de apertura emocional y confianza.' },
                { n: 4, title: 'Tu Readiness Score', desc: 'El sistema calcula internamente si estás listo para el siguiente paso. Tú ves una narrativa explicativa, no un número.' },
                { n: 5, title: 'Descubrimiento gradual', desc: 'Empiezas a ver perfiles. Según tu plan, las fotos pueden ser visibles, difuminadas o bloqueadas hasta el Date Readiness.' },
                { n: 6, title: 'Chat y prompts guiados', desc: 'Una vez hay match mutuo, abres el chat. La IA sugiere preguntas de calidad para romper el hielo sin rodeos.' },
                { n: 7, title: 'Voz y videollamada', desc: 'Disponible en los planes Arquitecto o superior. Todo dentro de la app, sin compartir número de teléfono.' },
                { n: 8, title: 'Date Readiness Gate', desc: 'Cuando ambos están listos, el sistema propone 3 lugares públicos seguros para la primera cita.' },
                { n: 9, title: 'Plan de cita segura', desc: 'Activas el Modo Cita Segura, registras hasta 2 contactos de confianza y haces check-in al llegar y check-out al salir.' },
                { n: 10, title: 'Insight post-cita', desc: 'La app te acompaña después: ¿cómo te sentiste? ¿Quieres ver al plan de nuevo? ¿Quieres apoyo de un especialista?' },
            ],
        },
        quickReplies: [
            { label: '🔓 ¿Qué incluye cada plan?', intent: 'pricing' },
            { label: '👩‍⚕️ Red de especialistas', intent: 'specialists' },
            { label: '🔒 ¿Cómo funcionan los desbloqueos?', intent: 'unlocks' },
        ],
    },

    // ── Desbloqueos ──
    unlocks: {
        text: 'LovIA libera funciones de forma progresiva. Las funciones críticas de **seguridad nunca están detrás de un paywall**:',
        richContent: {
            type: 'list',
            items: [
                '🆓 **Gratis para todos**: registro, tests completos, matching básico, chat inicial',
                '📸 **Foto completa**: disponible en plan Arquitecto o eligiendo el modo Clásico (verificación previa)',
                '🎙️ **Notas de voz**: requiere interacción mínima + plan Arquitecto',
                '📹 **Videollamada**: match mutuo sólido + plan Ingeniero o superior',
                '📍 **Cita segura completa**: disponible en todos los planes con contactos de confianza',
                '🚫 **Contacto externo (número/email)**: solo después de la primera cita con check-out confirmado',
            ],
        },
        quickReplies: [
            { label: '💳 Ver precios exactos', intent: 'pricing' },
            { label: '📋 Guía paso a paso', intent: 'step_guide' },
        ],
    },

    // ── Ciencia detrás ──
    science: {
        text: 'LovIA está fundamentada en investigación clínica y teoría de las relaciones de pareja. Estos son los marcos teóricos que sustentan el sistema de evaluación:',
        richContent: {
            type: 'citation',
            items: [
                '📖 **Juan Pablo Peña García** — *Evolución de las Relaciones de Pareja* (2023). Marco conceptual de los 4 ejes de análisis relacional: Amor/Vinculación, Sexualidad/Intimidad, Realización/Momento de vida y Seguridad/Autorregulación.',
                '🔬 **John Bowlby & Mary Ainsworth** — Teoría del Apego. Base del análisis de estilo vincular del Test 2 (Cómo te vinculas).',
                '💡 **John Gottman** — *The Seven Principles for Making Marriage Work* (1999). El concepto de "4 Jinetes del Apocalipsis" informa el análisis de conflicto.',
                '🧠 **Susan Johnson** — Terapia Focalizada en las Emociones (EFT). Marco del análisis de regulación emocional bajo estrés.',
                '📊 **Robert Sternberg** — Teoría Triangular del Amor (Pasión, Intimidad, Compromiso). Informa la estructura del matching de compatibilidad.',
                '🌡️ **Daniel J. Siegel** — Ventana de Tolerancia y Neurobiología del Apego. Base científica del PSS-4 y las escalas de autorregulación.',
                '📐 **J. W. Pennebaker & R. E. Booth** — PSS-4 (Perceived Stress Scale). Versión abreviada del test de estrés percibido.',
            ],
        },
        quickReplies: [
            { label: '🧪 ¿Cómo funciona el scoring?', intent: 'scoring' },
            { label: '📋 Ver flujo completo', intent: 'step_guide' },
            { label: '👩‍⚕️ Conocer especialistas', intent: 'specialists' },
        ],
    },

    // ── Scoring ──
    scoring: {
        text: 'LovIA tiene **tres tipos de calificación interna**, y ninguna se muestra como un número público a otros usuarios:',
        richContent: {
            type: 'list',
            items: [
                '📊 **Readiness Score** (Interno + tuyo): Determina a qué ritmo se abre tu experiencia. Tú lo ves como una narrativa personal: *"Estás en una etapa reflexiva con varias responsabilidades..."*',
                '💞 **Compatibility Score** (Solo el sistema): Calcula el ajuste entre dos perfiles. Tú lo ves como el orden y la calidad de tus matches sugeridos.',
                '🔒 **Safety Score** (Solo moderación): Detecta señales de riesgo o fraude. No es visible para nadie; solo activa límites o pausas protectoras.',
            ],
        },
        quickReplies: [
            { label: '🔬 Base científica completa', intent: 'science' },
            { label: '🔓 ¿Qué se desbloquea?', intent: 'unlocks' },
        ],
    },

    // ── Especialistas ──
    specialists: {
        text: 'En LovIA tenemos un directorio de **especialistas verificados** en terapia de pareja, psicología individual, sexología y más. Todos pasan por un proceso de verificación de cédula profesional antes de aparecer en la plataforma.',
        richContent: {
            type: 'specialist',
            items: ['__DYNAMIC__'],  // populated at runtime from Supabase
        },
        quickReplies: [
            { label: '📋 Ver directorio completo', intent: 'go_directory' },
            { label: '¿Cuándo se sugiere apoyo?', intent: 'support_trigger' },
            { label: '💳 Costos de consulta', intent: 'pricing' },
        ],
    },

    // ── Trigger de apoyo ──
    support_trigger: {
        text: 'Un especialista puede ser sugerido por la app de manera contextual en estos momentos, **siempre de forma opcional, nunca forzada**:',
        richContent: {
            type: 'list',
            items: [
                '📊 Si tu Readiness Score inicial es bajo (estás en un momento complejo de vida)',
                '😔 Después de vivir una experiencia difícil: ghosting fuerte, cita que no salió bien, o reportar a alguien',
                '⏸️ Si activas el modo pausa o expresas que no estás seguro de continuar',
                '💬 Si el chat detecta lenguaje asociado a crisis emocional o desesperación',
                '🤲 Si tú mismo buscas apoyo desde el menú de Comunidad → Directorio',
            ],
        },
        quickReplies: [
            { label: '👩‍⚕️ Ver especialistas ahora', intent: 'go_directory' },
            { label: '📋 Guía paso a paso', intent: 'step_guide' },
        ],
    },

    // ── Pricing ──
    pricing: {
        text: 'LovIA tiene 4 planes. Las funciones de seguridad y los tests completos **siempre son gratuitos**:',
        richContent: {
            type: 'list',
            items: [
                '🆓 **Explorador (Gratis)** — Tests completos, 3 matches/día, chat básico, modo cita segura, directorio de especialistas',
                '💗 **Arquitecto (~$99 MXN/mes)** — Matches ilimitados, foto gradual premium, notas de voz, insights avanzados, sin anuncios',
                '💜 **Ingeniero (~$179 MXN/mes)** — Todo Arquitecto + videollamada in-app, filtros avanzados, modo "Esencia" (foto al final), compatibilidad profunda detallada',
                '💎 **Diamante (~$299 MXN/mes)** — Todo Ingeniero + prioridad en matching, acceso anticipado a funciones, badge verificado visible, experiencias curadas',
            ],
        },
        quickReplies: [
            { label: '🔓 ¿Qué se desbloquea en cada plan?', intent: 'unlocks' },
            { label: '💳 Quiero actualizar mi plan', intent: 'go_pricing' },
            { label: '🆓 ¿Qué tengo con el plan gratis?', intent: 'free_plan' },
        ],
    },

    // ── Plan gratis ──
    free_plan: {
        text: 'Con el plan **Explorador (Gratis)** tienes acceso completo a la experiencia core de LovIA, sin límites en lo que importa:',
        richContent: {
            type: 'list',
            items: [
                '✅ Tests de momento de vida y vínculo completos',
                '✅ Tu Readiness Score y narrativa personal',
                '✅ Hasta 3 matches diarios con perfil textual',
                '✅ Chat in-app con tus matches',
                '✅ Modo Cita Segura (check-in/out, contactos de confianza)',
                '✅ Directorio de especialistas',
                '✅ Contenido científico y base literaria',
                '🔒 *Fotos, voz y videollamada son premium*',
                '🔒 *Matches ilimitados son premium*',
            ],
        },
        quickReplies: [
            { label: '💳 Ver planes premium', intent: 'pricing' },
            { label: '📋 Ver guía paso a paso', intent: 'step_guide' },
        ],
    },

    // ── Seguridad ──
    safety: {
        text: 'La seguridad en LovIA es un **flujo real, no un adorno**. Estos son los mecanismos de protección:',
        richContent: {
            type: 'list',
            items: [
                '🚫 **Bloqueo de contacto externo en chat**: El chat detecta números de teléfono, emails e Instagram e impide compartirlos fuera del proceso de cita segura',
                '📍 **Ubicación temporal**: Solo se comparte durante la cita, con expiración automática al hacer check-out',
                '👥 **Contactos de confianza**: Hasta 2 personas que reciben notificación al inicio y fin de la cita',
                '🔘 **Check-in / Check-out**: Si no hay check-out, el sistema envía un recordatorio y puede alertar al contacto de confianza',
                '🛡️ **Moderación activa**: Reportes revisados por el equipo de LovIA en 24-48 horas',
                '🔒 **Datos separados**: Tu perfil público y tus datos sensibles (tests, ubicación, hijos) están en tablas separadas con acceso estricto',
            ],
        },
        quickReplies: [
            { label: '📋 Modo cita segura', intent: 'step_guide' },
            { label: '🔬 Base científica', intent: 'science' },
        ],
    },

    // ── Navegación ──
    go_directory: { text: '📍 Navega a **Comunidad → Directorio** para ver todos los especialistas verificados, filtrar por ciudad o especialidad y contactar directamente.' },
    go_pricing: { text: '💳 Puedes ver y actualizar tu plan desde **Perfil → Mis Planes** en cualquier momento.' },
}

// ── Detección de intents por palabras clave ──────────────────────────────
const KEYWORD_MAP: [string[], string][] = [
    [['hola', 'buenos', 'inicio', 'empezar', 'saludo', 'hi', 'oye'], 'welcome'],
    [['cómo funciona', 'como funciona', 'qué es', 'que es', 'para qué', 'para que', 'explain'], 'how_it_works'],
    [['paso a paso', 'guía', 'pasos', 'flujo', 'proceso', 'recorrido'], 'step_guide'],
    [['ciencia', 'científica', 'libro', 'autor', 'fuente', 'investigación', 'evidencia', 'teoría', 'base', 'bibliografía'], 'science'],
    [['scoring', 'puntuación', 'score', 'calificación', 'número', 'cómo califica', 'readiness'], 'scoring'],
    [['especialista', 'psicólogo', 'terapeuta', 'médico', 'doctor', 'apoyo', 'ayuda profesional', 'directorio'], 'specialists'],
    [['cuándo sugiere', 'trigger', 'cuándo aparece apoyo', 'cuando me ayuda'], 'support_trigger'],
    [['precio', 'costo', 'plan', 'cobrar', 'mensualidad', 'cuánto vale', 'cuanto cuesta', 'tarifa', 'pesos', 'mxn', 'pagar'], 'pricing'],
    [['gratis', 'free', 'explorador', 'sin pagar', 'sin costo', 'qué incluye el gratis'], 'free_plan'],
    [['desbloqueo', 'desbloquear', 'cuándo puedo', 'foto', 'video', 'videollamada', 'voz', 'nota de voz'], 'unlocks'],
    [['seguridad', 'protección', 'seguro', 'bloquear', 'reportar', 'cita segura', 'check-in', 'ubicación'], 'safety'],
]

export function detectIntent(input: string): string {
    const lower = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    for (const [keywords, intent] of KEYWORD_MAP) {
        if (keywords.some(kw => lower.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
            return intent
        }
    }
    return 'fallback'
}

export const FALLBACK: BotMessage = {
    text: 'Hmm, no estoy seguro de entender tu pregunta. Puedo ayudarte con estos temas:',
    quickReplies: [
        { label: '📋 Guía paso a paso', intent: 'step_guide' },
        { label: '🔬 Base científica', intent: 'science' },
        { label: '👩‍⚕️ Especialistas', intent: 'specialists' },
        { label: '💳 Costos y planes', intent: 'pricing' },
        { label: '🔒 Seguridad', intent: 'safety' },
    ],
}
