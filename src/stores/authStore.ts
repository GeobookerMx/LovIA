import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useEvaluationStore } from './evaluationStore'
import { useSubscriptionStore } from './subscriptionStore'
import { useCheckInStore } from './checkInStore'
import { useSettingsStore } from './settingsStore'
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
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
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

function clearPrivateState() {
    useEvaluationStore.getState().resetAll()
    useSubscriptionStore.getState().reset()
    useCheckInStore.getState().reset()
    useSettingsStore.getState().reset()
}

const privateOwnerKey = 'lovia-private-state-owner'
function bindPrivateState(ownerId: string | null) {
    try {
        const previousOwner = localStorage.getItem(privateOwnerKey)
        if (!ownerId || previousOwner !== ownerId) clearPrivateState()
        if (ownerId) localStorage.setItem(privateOwnerKey, ownerId)
        else localStorage.removeItem(privateOwnerKey)
    } catch {
        clearPrivateState()
    }
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

            bindPrivateState(session?.user?.id ?? null)
            set({
                session,
                user: session?.user ?? null,
                loading: false,
                initialized: true,
                legalAccepted: !!session?.user,
            })
            clearTimeout(safetyTimer)
            console.log('[LovIA] AuthStore: inicializado.')

            if (session?.user) {
                get().loadProfile()
                loadServerData()
            }

            if (!globalAuthSubscription) {
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    console.log('[LovIA] onAuthStateChange:', event)
                    if (get().user?.id !== session?.user?.id) {
                        bindPrivateState(session?.user?.id ?? null)
                        set({ profile: null })
                    }
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
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { alias: name, full_name: name, avatar_url: '' },
            },
        })
        set({ loading: false })
        if (error) return { error: error.message, needsEmailConfirmation: false }
        return { error: null, needsEmailConfirmation: !data.session }
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
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        bindPrivateState(null)
        set({ user: null, session: null, profile: null, legalAccepted: false })
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

            if (!error && !data) console.warn('[AuthStore] Falta el perfil creado por el servidor.')

            if (data && get().user?.id === user.id) {
                (set as any)({ profile: data as PublicProfile })
                
                // Actualizar la última fecha de actividad (last_seen_at) en segundo plano
                (async () => {
                    try {
                        await supabase
                            .from('profiles')
                            .update({ last_seen_at: new Date().toISOString() })
                            .eq('id', user.id)
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
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single()

            if (error) return { error: error.message }
            if (!data || get().user?.id !== user.id) return { error: 'La sesión cambió antes de confirmar el guardado.' }

            set({ profile: data as PublicProfile })

            return { error: null }
        } catch (err) {
            return { error: String(err) }
        }
    },
}))
