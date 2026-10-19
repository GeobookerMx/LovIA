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

        // Safety timeout: si Supabase no responde en 10s (ej: red lenta en lab de Apple Review),
        // dejamos que la app arranque en estado "no autenticado" en lugar de mostrar spinner infinito.
        const safetyTimer = setTimeout(() => {
            if (!get().initialized) {
                console.warn('[LovIA] initialize() timeout — Supabase no respondió en 10s. Arrancando sin sesión.')
                set({ loading: false, initialized: true })
            }
        }, 10_000)

        try {
            console.log('[LovIA] AuthStore: inicializando...')
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.warn('[LovIA] AuthStore getSession error:', error.message)
            }

            set({
                session,
                user: session?.user ?? null,
                loading: false,
                initialized: true,
                legalAccepted: !!session?.user,
            })
            clearTimeout(safetyTimer)
            console.log('[LovIA] AuthStore: inicializado. User:', session?.user?.id ?? 'null')

            if (session?.user) {
                get().loadProfile()
                loadServerData()
            }

            if (!globalAuthSubscription) {
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    console.log('[LovIA] onAuthStateChange:', event, session?.user?.id ?? 'null')
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
        } catch (err) {
            console.error('[LovIA] AuthStore initialize error:', err)
            clearTimeout(safetyTimer)
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

            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle()

            if (error) {
                console.warn('[AuthStore] Error fetching profile:', error.message)
            }

            // Si el perfil no existe, creamos una fila por defecto (upsert robusto)
            if (!error && !data) {
                console.log('[AuthStore] Perfil no encontrado, creando perfil por defecto...')
                const defaultProfile = {
                    id: user.id,
                    email: user.email,
                    alias: user.user_metadata?.alias || user.user_metadata?.full_name || 'Usuario LovIA',
                    full_name: user.user_metadata?.full_name || '',
                    onboarding_completed: false,
                    readiness_score: 0,
                    assessments_done: [],
                    last_seen_at: new Date().toISOString()
                }
                
                const { data: inserted, error: insertError } = await supabase
                    .from('profiles')
                    .upsert(defaultProfile)
                    .select()
                    .single()

                if (insertError) {
                    console.error('[AuthStore] Error insertando perfil por defecto:', insertError.message)
                } else {
                    data = inserted
                }
            }

            if (data) {
                (set as any)({ profile: data as PublicProfile })
                
                // Actualizar la última fecha de actividad (last_seen_at) en segundo plano
                (async () => {
                    try {
                        await supabase
                            .from('profiles')
                            .update({ last_seen_at: new Date().toISOString() })
                            .eq('id', user.id)
                        console.log('[AuthStore] last_seen_at actualizado ✅')
                    } catch (err) {
                        console.warn('[AuthStore] Error actualizando last_seen_at:', err)
                    }
                })()
            }
        } catch (err) {
            console.warn('[AuthStore] loadProfile failed:', err)
        }
    },

    updateProfile: async (updates) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return { error: 'No user logged in' }

            // Cambiamos a upsert para evitar fallos si la fila no existe en la BD
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) return { error: error.message }

            set({ profile: data as PublicProfile })

            return { error: null }
        } catch (err) {
            return { error: String(err) }
        }
    },
}))
