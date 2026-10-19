/**
 * LovIA! — Settings Store
 *
 * Zustand store for user preferences: theme, language,
 * notification settings, privacy toggles.
 * Persisted to localStorage.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ToggleKey = 'pushEnabled' | 'weeklyEmail' | 'sparkReminder' | 'profileVisible' | 'anonymousData'

interface SettingsState {
    // Notifications
    pushEnabled: boolean
    weeklyEmail: boolean
    sparkReminder: boolean

    // Privacy
    profileVisible: boolean
    anonymousData: boolean

    // Appearance
    theme: 'dark' | 'light' | 'system'
    language: 'es' | 'en'

    // Actions
    toggle: (key: ToggleKey) => void
    setTheme: (theme: 'dark' | 'light' | 'system') => void
    setLanguage: (language: 'es' | 'en') => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Defaults
            pushEnabled: false,
            weeklyEmail: false,
            sparkReminder: false,
            profileVisible: true,
            anonymousData: false,
            theme: 'dark',
            language: 'es',

            // Actions
            toggle: (key) => set((state) => ({ [key]: !state[key] })),
            setTheme: (theme) => set({ theme }),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'lovia-settings',
            version: 1,
            migrate: (persisted) => ({
                ...(persisted as SettingsState),
                pushEnabled: false,
                weeklyEmail: false,
                sparkReminder: false,
                anonymousData: false,
            }),
        }
    )
)
