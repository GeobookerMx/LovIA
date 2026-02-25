import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
    initialized: boolean
    legalAccepted: boolean

    initialize: () => Promise<void>
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
    acceptLegal: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    legalAccepted: false,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            set({
                session,
                user: session?.user ?? null,
                loading: false,
                initialized: true,
                legalAccepted: !!session?.user,
            })

            // Listen for auth changes
            supabase.auth.onAuthStateChange((_event, session) => {
                set({
                    session,
                    user: session?.user ?? null,
                    legalAccepted: !!session?.user || get().legalAccepted,
                })
            })
        } catch {
            set({ loading: false, initialized: true })
        }
    },

    signUp: async (email, password, name) => {
        set({ loading: true })
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, avatar_url: '' },
            },
        })
        set({ loading: false })
        if (error) return { error: error.message }
        return { error: null }
    },

    signIn: async (email, password) => {
        set({ loading: true })
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        set({ loading: false })
        if (error) return { error: error.message }
        set({ user: data.user, session: data.session, legalAccepted: true })
        return { error: null }
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, legalAccepted: false })
    },

    acceptLegal: () => {
        set({ legalAccepted: true })
    },
}))
