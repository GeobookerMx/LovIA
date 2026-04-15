import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

/**
 * LovIA! — Evaluation Results Store
 *
 * Tracks cognitive test results for gate-level progression.
 * Persists to both localStorage (offline support) AND Supabase (server truth).
 *
 * Gate Requirements:
 * - Level 2: Stroop Test (Stroop, 1935) — score ≥ 60
 * - Level 3: Digit Span (WAIS-IV; Baddeley, 2003) — maxSpan ≥ 5
 */

interface TestResult {
    score: number
    passed: boolean
    date: string
    details?: Record<string, number | string>
}

interface EvaluationState {
    stroop: TestResult | null
    digitSpan: TestResult | null
    frustrationTolerance: TestResult | null
    emotionalRegulation: TestResult | null

    // Computed
    canAccessLevel2: () => boolean
    canAccessLevel3: () => boolean

    // Actions
    setStroopResult: (score: number, details?: Record<string, number | string>) => void
    setDigitSpanResult: (score: number, maxSpan: number) => void
    setFrustrationResult: (score: number) => void
    setEmotionalRegulationResult: (score: number, reappraisal: number, suppression: number) => void
    resetAll: () => void
    loadFromServer: () => Promise<void>
}

const STROOP_PASS_THRESHOLD = 60
const DIGIT_SPAN_PASS_THRESHOLD = 5

// ── Dev Mode Bypass ──────────────────────────────────────────────────────────
// Set VITE_DEV_BYPASS=false in .env before any production deploy!
const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === 'true'

/**
 * Persist evaluation result to Supabase.
 * Uses UPSERT so retaking a test overwrites the old result.
 */
async function persistToServer(
    testType: string,
    score: number,
    passed: boolean,
    details: Record<string, number | string> = {},
) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('evaluations')
            .upsert({
                user_id: user.id,
                test_type: testType,
                score,
                passed,
                details,
            }, {
                onConflict: 'user_id,test_type',
            })
    } catch (err) {
        console.warn('[EvaluationStore] Server sync failed, data saved locally:', err)
    }
}

export const useEvaluationStore = create<EvaluationState>()(
    persist(
        (set, get) => ({
            stroop: null,
            digitSpan: null,
            frustrationTolerance: null,
            emotionalRegulation: null,

            canAccessLevel2: () => {
                if (DEV_BYPASS) return true  // 🚧 Dev bypass activo
                const s = get().stroop
                return s !== null && s.passed
            },

            canAccessLevel3: () => {
                if (DEV_BYPASS) return true  // 🚧 Dev bypass activo
                const s = get().stroop
                const d = get().digitSpan
                return (s !== null && s.passed) && (d !== null && d.passed)
            },

            setStroopResult: (score, details) => {
                const passed = score >= STROOP_PASS_THRESHOLD
                set({
                    stroop: {
                        score,
                        passed,
                        date: new Date().toISOString(),
                        details,
                    },
                })
                persistToServer('stroop', score, passed, details)
            },

            setDigitSpanResult: (score, maxSpan) => {
                const passed = maxSpan >= DIGIT_SPAN_PASS_THRESHOLD
                set({
                    digitSpan: {
                        score,
                        passed,
                        date: new Date().toISOString(),
                        details: { maxSpan },
                    },
                })
                persistToServer('digit_span', score, passed, { maxSpan })
            },

            setFrustrationResult: (score) => {
                set({
                    frustrationTolerance: {
                        score,
                        passed: true,
                        date: new Date().toISOString(),
                    },
                })
                persistToServer('frustration_tolerance', score, true)
            },

            setEmotionalRegulationResult: (score, reappraisal, suppression) => {
                set({
                    emotionalRegulation: {
                        score,
                        passed: true,
                        date: new Date().toISOString(),
                        details: { reappraisal, suppression },
                    },
                })
                persistToServer('emotional_regulation', score, true, { reappraisal, suppression })
            },

            resetAll: () => set({
                stroop: null,
                digitSpan: null,
                frustrationTolerance: null,
                emotionalRegulation: null,
            }),

            /**
             * Load evaluation results from Supabase (server = source of truth).
             * Called on app init after auth is ready.
             */
            loadFromServer: async () => {
                try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) return

                    const { data, error } = await supabase
                        .from('evaluations')
                        .select('*')
                        .eq('user_id', user.id)

                    if (error || !data) return

                    const state: Partial<EvaluationState> = {}

                    for (const row of data) {
                        const result: TestResult = {
                            score: Number(row.score),
                            passed: row.passed,
                            date: row.completed_at,
                            details: (row.details as Record<string, number | string>) ?? undefined,
                        }

                        switch (row.test_type) {
                            case 'stroop':
                                state.stroop = result
                                break
                            case 'digit_span':
                                state.digitSpan = result
                                break
                            case 'frustration_tolerance':
                                state.frustrationTolerance = result
                                break
                            case 'emotional_regulation':
                                state.emotionalRegulation = result
                                break
                        }
                    }

                    set(state)
                } catch (err) {
                    console.warn('[EvaluationStore] Server load failed, using local data:', err)
                }
            },
        }),
        { name: 'lovia-evaluations' }
    )
)
