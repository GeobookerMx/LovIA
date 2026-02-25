import { create } from 'zustand'

export interface CheckInEntry {
    timestamp: string
    mood: string       // emoji
    score: number      // 1-10
    context: string    // 'weekly' | 'pre_questionnaire' | 'post_match' | 'pre_video' | 'post_encounter' | 'monthly'
}

interface CheckInState {
    history: CheckInEntry[]
    showCheckIn: boolean
    currentContext: string
    addEntry: (entry: Omit<CheckInEntry, 'timestamp'>) => void
    openCheckIn: (context: string) => void
    closeCheckIn: () => void
    getLastEntry: () => CheckInEntry | null
    getTrend: () => 'improving' | 'stable' | 'declining' | null
}

export const useCheckInStore = create<CheckInState>((set, get) => ({
    history: [],
    showCheckIn: false,
    currentContext: 'weekly',

    addEntry: (entry) => {
        set((s) => ({
            history: [...s.history, { ...entry, timestamp: new Date().toISOString() }],
            showCheckIn: false,
        }))
    },

    openCheckIn: (context) => set({ showCheckIn: true, currentContext: context }),
    closeCheckIn: () => set({ showCheckIn: false }),

    getLastEntry: () => {
        const h = get().history
        return h.length > 0 ? h[h.length - 1] : null
    },

    getTrend: () => {
        const h = get().history
        if (h.length < 2) return null
        const recent = h.slice(-3)
        const avg = recent.reduce((s, e) => s + e.score, 0) / recent.length
        const prevAvg = h.slice(-6, -3).reduce((s, e) => s + e.score, 0) / Math.max(1, h.slice(-6, -3).length)
        if (avg > prevAvg + 0.5) return 'improving'
        if (avg < prevAvg - 0.5) return 'declining'
        return 'stable'
    },
}))
