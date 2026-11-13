import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useEvaluationStore } from './evaluationStore'
import { useSubscriptionStore } from './subscriptionStore'
import { useCheckInStore } from './checkInStore'
import { useSettingsStore } from './settingsStore'
import { recordLegalAcceptance } from '../lib/legalConsent'
import type { User, Session } from '@supabase/supabase-js'
import type { PublicProfile } from '../lib/database.types'

interface AuthState {
    user: User | null
    session: Session | null
    profile: PublicProfile | null
    loading: boolean
    initialized: boolean
    sensitiveConsent: boolean | null

    initialize: () => Promise<void>
    signUp: (email: string, password: string, name: string, consent: { version: string; acceptedAt: string; sensitiveDataAccepted: boolean }) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
    setSensitiveConsent: (userId: string, allowed: boolean) => void
    loadProfile: () => Promise<void>
    updateProfile: (updates: EditableProfilePatch) => Promise<{ error: string | null }>
}

type EditableProfilePatch = Partial<Pick<PublicProfile,
    'alias' | 'full_name' | 'city' | 'avatar_url' | 'visibility_mode' |
    'attachment_style' | 'ocean_scores' | 'core_values' | 'onboarding_completed'
>>

const editableProfileFields = [
    'alias', 'full_name', 'city', 'avatar_url', 'visibility_mode',
    'attachment_style', 'ocean_scores', 'core_values', 'onboarding_completed',
] as const

async function loadServerData() {
    await Promise.allSettled([
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
    sensitiveConsent: null,

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
                sensitiveConsent: null,
            })
            clearTimeout(safetyTimer)
            console.log('[LovIA] AuthStore: inicializado.')

            if (session?.user) {
                get().loadProfile()
                loadServerData()
            }

            if (!globalAuthSubscription) {
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    console.log('[LovIA] onAuthStateChange:', event)
                    if (get().user?.id !== session?.user?.id) {
                        bindPrivateState(session?.user?.id ?? null)
                        set({ profile: null })
                    }
                    set({
                        session,
                        user: session?.user ?? null,
                        sensitiveConsent: session?.user?.id === get().user?.id ? get().sensitiveConsent : null,
                    })

                if (session?.user) {
                    const ownerId = session.user.id
                    // Las llamadas a Supabase dentro de onAuthStateChange pueden
                    // bloquear el intercambio de código OAuth. Ejecutarlas después.
                    setTimeout(() => {
                        if (get().user?.id !== ownerId) return
                        void get().loadProfile()
                        void loadServerData()
                    }, 0)
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

    signUp: async (email, password, name, consent) => {
        set({ loading: true })
        try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    alias: name,
                    full_name: name,
                    avatar_url: '',
                    age_confirmed_18: true,
                    legal_consent_version: consent.version,
                    legal_consent_accepted_at: consent.acceptedAt,
                    sensitive_data_consent: consent.sensitiveDataAccepted,
                },
            },
        })
        if (error) return { error: error.message, needsEmailConfirmation: false }
        if (data.session && consent.version) {
            // Reutiliza la elección explícita del formulario; el servidor identifica
            // la cuenta y la versión. Si falla, el gate permite reintentar al entrar.
            await recordLegalAcceptance(consent.sensitiveDataAccepted).catch(() => undefined)
        }
        return { error: null, needsEmailConfirmation: !data.session }
        } finally {
            set({ loading: false })
        }
    },

    signIn: async (email, password) => {
        set({ loading: true })
        try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) return { error: error.message }
        set({ user: data.user, session: data.session, sensitiveConsent: null })
        // ✅ Load profile and server data immediately after sign-in
        // (don't wait for the async onAuthStateChange event)
        void get().loadProfile()
        void loadServerData()
        return { error: null }
        } finally {
            set({ loading: false })
        }
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        bindPrivateState(null)
        set({ user: null, session: null, profile: null, sensitiveConsent: null })
    },

    setSensitiveConsent: (userId, allowed) => {
        if (get().user?.id === userId) set({ sensitiveConsent: allowed })
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

            if (error) {
                console.warn('[AuthStore] Error fetching profile:', error.message)
            }

            if (!error && !data) console.warn('[AuthStore] Falta el perfil creado por el servidor.')

            if (data && get().user?.id === user.id) {
                set({ profile: data as PublicProfile })
            }
        } catch (err) {
            console.warn('[AuthStore] loadProfile failed:', err)
        }
    },

    updateProfile: async (updates) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return { error: 'No user logged in' }

            // Aceptar solo campos editables; las columnas privilegiadas se protegen
            // además con permisos y triggers de base de datos.
            const allowedUpdates = Object.fromEntries(
                editableProfileFields
                    .filter(field => updates[field] !== undefined)
                    .map(field => [field, updates[field]])
            )
            if (Object.keys(allowedUpdates).length === 0) return { error: 'No hay cambios de perfil válidos.' }

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...allowedUpdates,
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
