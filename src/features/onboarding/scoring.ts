/**
 * LovIA! — Scoring Engine (Level 1)
 *
 * Calculates initial Frequency Score and 3-line breakdown
 * from Level 1 questionnaire + PSS-4 answers.
 */

import { level1Questions, pss4Questions } from './questionData'

export interface LineScore {
    label: string
    emoji: string
    score: number       // 0-100
    color: string
}

export interface OnboardingResults {
    frequency: number        // 0-100 composite
    level: string            // Nivel descriptivo
    levelEmoji: string
    lines: LineScore[]
    stressLevel: number      // PSS-4 score (0-16)
    stressLabel: string
    insights: string[]
}

export function calculateFrequency(
    answers: Record<string, string | number>,
    pssAnswers: Record<string, number>,
): OnboardingResults {

    // ── 1. Calculate PSS-4 Score ──
    let pssTotal = 0
    for (const q of pss4Questions) {
        const raw = pssAnswers[q.id] ?? 0
        pssTotal += q.reversed ? (4 - raw) : raw
    }
    // pssTotal range: 0-16 (lower = less stress)

    const stressLabel =
        pssTotal <= 4 ? 'Bajo' :
            pssTotal <= 8 ? 'Moderado' :
                pssTotal <= 12 ? 'Alto' :
                    'Muy alto'

    // ── 2. Calculate Line Scores ──
    const lineAccum: Record<string, number[]> = {
        love_line: [],
        sexual_line: [],
        realization_line: [],
    }

    // Accumulate factor scores
    const factorAccum: Record<string, number[]> = {}

    for (const q of level1Questions) {
        const ans = answers[q.id]
        if (ans === undefined) continue

        if (q.type === 'single' && q.options) {
            const opt = q.options.find((o) => o.id === ans)
            if (opt) {
                for (const [key, score] of Object.entries(opt.scores)) {
                    if (key in lineAccum) {
                        lineAccum[key].push(score)
                    }
                    if (!factorAccum[key]) factorAccum[key] = []
                    factorAccum[key].push(score)
                }
            }
        } else if (q.type === 'slider') {
            // Slider value (1-10): normalize to 0-4 factor scale
            const normalized = ((ans as number) / 10) * 4
            for (const key of q.factorKeys) {
                if (key in lineAccum) {
                    lineAccum[key].push(normalized)
                }
                if (!factorAccum[key]) factorAccum[key] = []
                factorAccum[key].push(normalized)
            }
        }
    }

    // Average each line (0-4 → 0-100)
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 2
    const normalize = (v: number) => Math.round((v / 4) * 100)

    const loveScore = normalize(avg(lineAccum.love_line))
    const sexScore = normalize(avg(lineAccum.sexual_line))
    const realScore = normalize(avg(lineAccum.realization_line))

    // ── 3. Composite Frequency ──
    // Weighted: Love 40%, Sexual 25%, Realization 35%
    // Stress penalty: up to -15 points for high stress
    const stressPenalty = Math.round((pssTotal / 16) * 15)
    const rawFrequency = Math.round(
        loveScore * 0.40 +
        sexScore * 0.25 +
        realScore * 0.35
    )
    const frequency = Math.max(10, Math.min(99, rawFrequency - stressPenalty))

    // ── 4. Level ──
    const { level, emoji } =
        frequency >= 80 ? { level: 'Armonizador', emoji: '🌟' } :
            frequency >= 65 ? { level: 'Constructor', emoji: '🏗️' } :
                frequency >= 50 ? { level: 'Explorador', emoji: '🧭' } :
                    frequency >= 35 ? { level: 'Buscador', emoji: '🔍' } :
                        { level: 'Despertar', emoji: '🌅' }

    // ── 5. Insights ──
    const insights: string[] = []

    if (loveScore >= 75) insights.push('Tu apertura emocional es alta — estás en un buen momento para conectar.')
    else if (loveScore < 50) insights.push('Podrías beneficiarte de trabajar en tu apertura emocional antes de buscar pareja.')

    if (sexScore >= 75) insights.push('La intimidad es una prioridad importante para ti — busca alguien que comparta eso.')
    else if (sexScore < 40) insights.push('La intimidad no es tu prioridad principal ahora, y está bien.')

    if (realScore >= 75) insights.push('Tu camino profesional/personal está sólido — eso aporta estabilidad.')
    else if (realScore < 50) insights.push('Estás en un momento de transición — las relaciones pueden crecer junto con tus metas.')

    const codep = factorAccum['codependency']
    if (codep && avg(codep) >= 3) {
        insights.push('Detectamos señales de dependencia emocional — el autoconocimiento es clave aquí.')
    }

    if (pssTotal > 8) {
        insights.push('Tu nivel de estrés es elevado — considera prácticas de bienestar antes de entrar al matching.')
    }

    // At least 2 insights
    if (insights.length < 2) {
        insights.push('Tu perfil muestra un balance saludable entre las 3 dimensiones.')
    }

    return {
        frequency,
        level,
        levelEmoji: emoji,
        lines: [
            { label: 'Amor', emoji: '❤️', score: loveScore, color: 'var(--line-love)' },
            { label: 'Sexual', emoji: '🔥', score: sexScore, color: 'var(--line-sex)' },
            { label: 'Realización', emoji: '⭐', score: realScore, color: 'var(--line-realization)' },
        ],
        stressLevel: pssTotal,
        stressLabel,
        insights,
    }
}
