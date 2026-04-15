import { momentoDeVidaQuestions, vinculoQuestions } from './questionData'

export interface OnboardingResults {
    frequency: number
    level: string
    levelEmoji: string
    lines: {
        label: string
        score: number
        color: string
        emoji: string
    }[]
    stressLevel: number
    stressLabel: string
    insights: string[]
}

export interface ReadinessResults {
    readinessScore: number
    needsSupport: boolean
    narrative: string
    recommendations: string[]
}

export function calculateReadiness(
    answers: Record<string, string | number>
): ReadinessResults {
    const allQuestions = [...momentoDeVidaQuestions, ...vinculoQuestions]
    
    let totalScore = 0
    let maxPossible = 0
    let hasCriticalRedFlag = false

    const factors: Record<string, number> = {}

    for (const q of allQuestions) {
        const ans = answers[q.id]
        if (ans === undefined) continue

        if (q.type === 'single' && q.options) {
            const opt = q.options.find((o) => o.id === ans)
            if (opt) {
                for (const [key, score] of Object.entries(opt.scores)) {
                    factors[key] = score
                    totalScore += score
                    maxPossible += 4 // Max for every question is 4
                    
                    // Critical red flags that trigger support
                    if ((key === 'readiness_status' && score === 0) || 
                        (key === 'attachment_anxiety' && score === 0) ||
                        (key === 'emotion_conflict' && score === 0)) {
                        hasCriticalRedFlag = true
                    }
                }
            }
        } else if (q.type === 'slider') {
            const normalized = ((ans as number) / 10) * 4
            for (const key of q.factorKeys) {
                factors[key] = normalized
                totalScore += normalized
                maxPossible += 4
            }
        }
    }

    const readinessScore = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0
    const needsSupport = readinessScore < 50 || hasCriticalRedFlag

    // Construct Narrative
    let narrative = ""
    const recommendations: string[] = []

    if (needsSupport) {
        narrative = "Parece que estás atravesando un momento de alta carga emocional o logística."
        recommendations.push("Considera tomarte un tiempo para ti antes de buscar una relación.")
        recommendations.push("Geobooker puede conectarte con especialistas si necesitas apoyo.")
    } else if (readinessScore < 75) {
        narrative = "Estás abierto/a a conectar, pero tienes límites logísticos o emocionales marcados."
        recommendations.push("Ve despacio. Comunica tus límites logísticos desde el principio.")
    } else {
        narrative = "Te encuentras en un excelente momento de disponibilidad y apertura emocional."
        recommendations.push("Disfruta el proceso de conocer gente nueva.")
    }

    return {
        readinessScore,
        needsSupport,
        narrative,
        recommendations,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// calculateFrequency — Modelo Triangular de Sternberg + PSS-4 (Cohen, 1983)
//
// Fórmula (FUNDAMENTOS_CIENTIFICOS.md, secciones 1-3):
//   Frecuencia_bruta = Amor×0.40 + Sexual×0.25 + Realización×0.35
//   Penalización_estrés = (PSS4_score / 16) × 15   [máx −15 pts]
//   Frecuencia_final = clamp(Frecuencia_bruta − Penalización, 10, 99)
// ─────────────────────────────────────────────────────────────────────────────

// Mapa de option_id → score (0-4) para cada pregunta de opción única
const OPTION_SCORES: Record<string, Record<string, number>> = {
    mv1_intent:      { a: 4, b: 3, c: 2 },
    mv2_status:      { a: 4, b: 3, c: 1, d: 0 },
    mv3_time:        { a: 4, b: 3, c: 1 },
    mv4_dependents:  { a: 4, b: 3, c: 2 },
    mv5_distance:    { a: 4, b: 2 },
    vin2_conflict:   { a: 4, b: 3, c: 1, d: 0 },
    vin3_attachment: { a: 4, b: 3, c: 0 },
}

/** Extrae un score 0-4 de cualquier tipo de respuesta */
function score4(answers: Record<string, string | number>, qId: string): number {
    const val = answers[qId]
    if (val === undefined) return 2 // mid-range por defecto

    if (qId === 'vin1_trust' && typeof val === 'number') {
        return ((val - 1) / 9) * 4 // slider 1-10 → 0-4
    }

    const map = OPTION_SCORES[qId]
    return map?.[val as string] ?? 2
}

export function calculateFrequency(
    answers: Record<string, string | number>,
    pss4Answers: Record<string, number>
): OnboardingResults {
    // ── Línea Amor (intimidad emocional, confianza, apego) ──
    const trust    = score4(answers, 'vin1_trust')
    const conflict = score4(answers, 'vin2_conflict')
    const anxiety  = score4(answers, 'vin3_attachment')
    const amor_raw = ((trust / 4) * 0.35 + (conflict / 4) * 0.40 + (anxiety / 4) * 0.25) * 100

    // ── Línea Sexual (prioridad de intimidad física, disponibilidad pasional) ──
    // Derivada de intent + status mientras no haya preguntas dedicadas (v2.0)
    const intentSexualMap: Record<string, number> = {
        a: 0.70, // "Relación estable" → moderado-alto sexual
        b: 0.85, // "Conocer sin prisa" → abierto a la pasión
        c: 0.40, // "Entenderme mejor" → enfocado en sí mismo
    }
    const intentKey    = answers['mv1_intent'] as string ?? 'b'
    const statusScore  = score4(answers, 'mv2_status')
    const sexual_raw   = Math.min(100,
        ((intentSexualMap[intentKey] ?? 0.65) * 0.65 + (statusScore / 4) * 0.35) * 100
    )

    // ── Línea Realización (estabilidad de vida, metas, logística) ──
    const intent      = score4(answers, 'mv1_intent')
    const status      = score4(answers, 'mv2_status')
    const time        = score4(answers, 'mv3_time')
    const dependents  = score4(answers, 'mv4_dependents')
    const mobility    = score4(answers, 'mv5_distance')
    const realizacion_raw = (
        (intent / 4)     * 0.25 +
        (status / 4)     * 0.30 +
        (time / 4)       * 0.25 +
        (dependents / 4) * 0.12 +
        (mobility / 4)   * 0.08
    ) * 100

    // ── PSS-4 (Cohen et al., 1983) ──
    // Ítems 2 y 3 se invierten: (4 - respuesta)
    const pss4_score =
        (pss4Answers['pss_1'] ?? 0) +
        (4 - (pss4Answers['pss_2'] ?? 0)) +
        (4 - (pss4Answers['pss_3'] ?? 0)) +
        (pss4Answers['pss_4'] ?? 0)

    // ── Frecuencia Final ──
    const frecuencia_bruta   = amor_raw * 0.40 + sexual_raw * 0.25 + realizacion_raw * 0.35
    const penalizacion_estres = (pss4_score / 16) * 15
    const frecuencia_final   = Math.round(Math.max(10, Math.min(99, frecuencia_bruta - penalizacion_estres)))

    // ── Nivel (Prochaska & DiClemente, 1983 — adaptación relacional) ──
    let level: string
    let levelEmoji: string
    if (frecuencia_final >= 80)      { level = 'Armonizador'; levelEmoji = '🌟' }
    else if (frecuencia_final >= 65) { level = 'Constructor';  levelEmoji = '🏗️' }
    else if (frecuencia_final >= 50) { level = 'Explorador';   levelEmoji = '🧭' }
    else if (frecuencia_final >= 35) { level = 'Buscador';     levelEmoji = '🔍' }
    else                             { level = 'Despertar';    levelEmoji = '🌅' }

    // ── Clasificación de estrés ──
    const stressLabel =
        pss4_score <= 4  ? 'Bajo' :
        pss4_score <= 8  ? 'Moderado' :
        pss4_score <= 12 ? 'Alto' : 'Muy alto'

    // ── Insights personalizados ──
    const insights: string[] = []
    if (amor_raw < 50)
        insights.push('Tu línea de Amor muestra oportunidad: abrir la confianza es tu próximo gran paso.')
    if (sexual_raw < 50)
        insights.push('Tu disponibilidad para la pasión está en construcción — y eso es completamente válido.')
    if (realizacion_raw < 50)
        insights.push('Tu estabilidad vital es el cimiento que necesitas fortalecer antes de conectar.')
    if (pss4_score > 8)
        insights.push('El estrés percibido está reduciendo tu Frecuencia. Gestionar tu bienestar te abrirá nuevas posibilidades.')
    if (insights.length === 0)
        insights.push('Tus 3 líneas están equilibradas. Estás en un excelente momento para conectar con alguien.')

    return {
        frequency: frecuencia_final,
        level,
        levelEmoji,
        lines: [
            { label: 'Amor',         score: Math.round(amor_raw),        color: 'var(--line-love, #ff6b9d)',        emoji: '❤️' },
            { label: 'Sexual',       score: Math.round(sexual_raw),      color: 'var(--line-sex, #ff9d42)',         emoji: '🔥' },
            { label: 'Realización',  score: Math.round(realizacion_raw), color: 'var(--line-realization, #a78bfa)', emoji: '⭐' },
        ],
        stressLevel: pss4_score,
        stressLabel,
        insights,
    }
}
