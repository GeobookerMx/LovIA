import { create } from 'zustand'
import type { ActiveMatch, MatchCandidate, UserProfile, FilterConfig } from '../lib/matchingEngine'
import { runMatchingPipeline, canAccessMatching, canProgressLevel, isMatchExpired } from '../lib/matchingEngine'

interface MatchState {
    // Pool & discovery
    pool: MatchCandidate[]
    poolLoading: boolean

    // Active matches
    activeMatches: ActiveMatch[]
    selectedMatch: ActiveMatch | null

    // Filters
    filterConfig: FilterConfig

    // Actions
    setFilterConfig: (config: Partial<FilterConfig>) => void
    generatePool: (user: UserProfile, candidates: UserProfile[]) => void
    selectMatch: (match: ActiveMatch | null) => void
    createMatch: (userA: string, userB: string, score: number) => ActiveMatch
    acceptLevel: (matchId: string, userId: string) => void
    declineMatch: (matchId: string) => void
    archiveExpired: () => void
    checkEligibility: (user: UserProfile) => { eligible: boolean; reason?: string }
}

export const useMatchStore = create<MatchState>((set, get) => ({
    pool: [],
    poolLoading: false,
    activeMatches: [],
    selectedMatch: null,
    filterConfig: {
        max_distance_km: 50,
        age_range: [20, 45],
        age_flexible: true,
        frequency_tolerance: 15,
    },

    setFilterConfig: (partial) =>
        set((s) => ({ filterConfig: { ...s.filterConfig, ...partial } })),

    generatePool: (user, candidates) => {
        set({ poolLoading: true })
        const results = runMatchingPipeline(user, candidates, get().filterConfig)
        set({ pool: results, poolLoading: false })
    },

    selectMatch: (match) => set({ selectedMatch: match }),

    createMatch: (userA, userB, score) => {
        const now = new Date().toISOString()
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        const newMatch: ActiveMatch = {
            id: `match_${Date.now()}`,
            user_a_id: userA,
            user_b_id: userB,
            current_level: 1,
            user_a_accepted: true,
            user_b_accepted: false,
            compatibility_score: score,
            created_at: now,
            last_activity: now,
            expires_at: expires,
            status: 'active',
        }
        set((s) => ({ activeMatches: [...s.activeMatches, newMatch] }))
        return newMatch
    },

    acceptLevel: (matchId, userId) => {
        set((s) => ({
            activeMatches: s.activeMatches.map((m) => {
                if (m.id !== matchId) return m

                const progression = canProgressLevel(m)
                const isA = m.user_a_id === userId
                const updated = {
                    ...m,
                    user_a_accepted: isA ? true : m.user_a_accepted,
                    user_b_accepted: !isA ? true : m.user_b_accepted,
                    last_activity: new Date().toISOString(),
                }

                // Both accepted + cooldown passed → advance level
                if (updated.user_a_accepted && updated.user_b_accepted && progression.can && m.current_level < 5) {
                    updated.current_level = (m.current_level + 1) as 1 | 2 | 3 | 4 | 5
                    updated.user_a_accepted = false
                    updated.user_b_accepted = false
                }

                if (updated.current_level === 5 && updated.user_a_accepted && updated.user_b_accepted) {
                    updated.status = 'completed'
                }

                return updated
            }),
        }))
    },

    declineMatch: (matchId) => {
        set((s) => ({
            activeMatches: s.activeMatches.map((m) =>
                m.id === matchId ? { ...m, status: 'declined' as const } : m
            ),
        }))
    },

    archiveExpired: () => {
        set((s) => ({
            activeMatches: s.activeMatches.map((m) =>
                m.status === 'active' && isMatchExpired(m)
                    ? { ...m, status: 'archived' as const }
                    : m
            ),
        }))
    },

    checkEligibility: (user) => canAccessMatching(user),
}))
