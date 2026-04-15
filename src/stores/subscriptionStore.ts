import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export type Tier = 'free' | 'arquitecto' | 'ingeniero' | 'diamante'

export interface TierInfo {
    id: Tier
    name: string
    emoji: string
    price: string | null // null = free
    color: string
    features: string[]
}

export const TIERS: TierInfo[] = [
    {
        id: 'free',
        name: 'Explorador',
        emoji: '🆓',
        price: null,
        color: 'var(--text-secondary)',
        features: [
            'Cuestionario Nivel 1 + Frecuencia básica',
            'Daily Spark + Blog + Comunidad',
            'Selfie verificada (badge gratis)',
        ],
    },
    {
        id: 'arquitecto',
        name: 'Arquitecto',
        emoji: '🔵',
        price: '$99 MXN/mes',
        color: 'var(--love-rose)',
        features: [
            'Todo de Explorador',
            'Cuestionario Nivel 2 + Gráfica completa',
            'Matching 3/mes + Chat',
            'Historial de evolución emocional',
        ],
    },
    {
        id: 'ingeniero',
        name: 'Ingeniero',
        emoji: '🟣',
        price: '$249 MXN/mes',
        color: 'var(--line-sex)',
        features: [
            'Todo de Arquitecto',
            'Cuestionario Nivel 3',
            'Videollamadas + Plan de encuentro',
            'AI Coach + INE incluida',
            'Matching 10/mes',
        ],
    },
    {
        id: 'diamante',
        name: 'Diamante',
        emoji: '💎',
        price: '$399 MXN/mes',
        color: 'var(--line-realization)',
        features: [
            'Todo de Ingeniero',
            'Matching ilimitado',
            'Seguimiento multi-encuentro',
            'Módulos Perel/Johnson',
            'Predicción temporal + Badge Diamante',
        ],
    },
]

interface SubscriptionState {
    currentTier: Tier
    loading: boolean
    setTier: (tier: Tier) => void
    canAccess: (required: Tier) => boolean
    loadFromServer: () => Promise<void>
}

const tierOrder: Tier[] = ['free', 'arquitecto', 'ingeniero', 'diamante']

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    currentTier: 'free',
    loading: false,

    setTier: (tier) => set({ currentTier: tier }),

    canAccess: (required) => {
        const current = tierOrder.indexOf(get().currentTier)
        const req = tierOrder.indexOf(required)
        return current >= req
    },

    /**
     * Load subscription tier from Supabase (server = source of truth).
     * This prevents client-side tier manipulation.
     */
    loadFromServer: async () => {
        try {
            set({ loading: true })
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                set({ loading: false })
                return
            }

            const { data, error } = await supabase
                .from('subscriptions')
                .select('tier')
                .eq('user_id', user.id)
                .single()

            if (!error && data) {
                set({ currentTier: data.tier as Tier })
            }
        } catch (err) {
            console.warn('[SubscriptionStore] Server load failed:', err)
        } finally {
            set({ loading: false })
        }
    },
}))
