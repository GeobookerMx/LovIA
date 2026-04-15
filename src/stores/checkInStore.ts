import { create } from 'zustand'
import { supabase } from '../lib/supabase'

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
    loadFromServer: () => Promise<void>
}

export const useCheckInStore = create<CheckInState>((set, get) => ({
    history: [],
    showCheckIn: false,
    currentContext: 'weekly',

    addEntry: async (entry) => {
        const timestamp = new Date().toISOString()
        
        // Optimistic update
        set((s) => ({
            history: [...s.history, { ...entry, timestamp }],
            showCheckIn: false,
        }))

        // Persist to Supabase
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            await supabase.from('emotional_logs').insert({
                user_id: user.id,
                mood: entry.mood,
                score: entry.score,
                context: entry.context,
                // Supabase inserta created_at automáticamente, no necesitas pasarlo aquí explícitamente, pero si tienes notas:
                notes: null
            })
        } catch (err) {
            console.warn('[CheckInStore] Failed to sync to server:', err)
        }
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

    loadFromServer: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('emotional_logs')
                .select('mood, score, context, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })

            if (!error && data) {
                const historyStr = data.map(row => ({
                    mood: row.mood,
                    score: row.score,
                    context: row.context,
                    timestamp: row.created_at
                }))
                set({ history: historyStr })
            }
        } catch (err) {
            console.warn('[CheckInStore] Server load failed:', err)
        }
    },
}))
