import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useEvaluationStore } from './evaluationStore'
import { useSubscriptionStore } from './subscriptionStore'
import { useCheckInStore } from './checkInStore'
import type { User, Session } from '@supabase/supabase-js'
import type { PublicProfile } from '../lib/database.types'

interface AuthState {
    user: User | null
    session: Session | null
    profile: PublicProfile | null
    loading: boolean
    initialized: boolean
    legalAccepted: boolean

    initialize: () => Promise<void>
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
    acceptLegal: () => void
    loadProfile: () => Promise<void>
    updateProfile: (updates: Partial<PublicProfile>) => Promise<{ error: string | null }>
}

async function loadServerData() {
    await Promise.all([
        useEvaluationStore.getState().loadFromServer(),
        useSubscriptionStore.getState().loadFromServer(),
        useCheckInStore.getState().loadFromServer(),
    ])
}

let globalAuthSubscription: { unsubscribe: () => void } | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false,
    legalAccepted: false,

    initialize: async () => {
        if (get().initialized) return // Evita ejecutar dos veces (React Strict Mode bug)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            set({
                session,
                user: session?.user ?? null,
                loading: false,
                initialized: true,
                legalAccepted: !!session?.user,
            })

            if (session?.user) {
                get().loadProfile()
                loadServerData()
            }

            if (!globalAuthSubscription) {
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
                    set({
                        session,
                        user: session?.user ?? null,
                        legalAccepted: !!session?.user || get().legalAccepted,
                    })

                if (session?.user) {
                    get().loadProfile()
                    loadServerData()
                } else {
                    set({ profile: null })
                }
            })
            globalAuthSubscription = subscription
        }
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
                data: { alias: name, full_name: name, avatar_url: '' },
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
        // ✅ Load profile and server data immediately after sign-in
        // (don't wait for the async onAuthStateChange event)
        get().loadProfile()
        loadServerData()
        return { error: null }
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, profile: null, legalAccepted: false })
        useEvaluationStore.getState().resetAll()
    },

    acceptLegal: () => {
        set({ legalAccepted: true })
    },

    loadProfile: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle()

            if (!error && data) {
                set({ profile: data as PublicProfile })
            }
        } catch (err) {
            console.warn('[AuthStore] Profile load failed:', err)
        }
    },

    updateProfile: async (updates) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return { error: 'No user logged in' }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (error) return { error: error.message }

            set((s) => ({
                profile: s.profile ? { ...s.profile, ...updates } : null,
            }))

            return { error: null }
        } catch (err) {
            return { error: String(err) }
        }
    },
}))
