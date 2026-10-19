import { supabase } from './supabase'
import { sanitizeAnalyticsProperties } from './analyticsPolicy'
import type { AnalyticsEvent } from './analyticsPolicy'
import { useSettingsStore } from '../stores/settingsStore'

export async function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>): Promise<void> {
  if (!useSettingsStore.getState().anonymousData) return
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    // Anonymous analytics needs a rate-limited server endpoint; until then it is off.
    if (authError || !user) return

    const { error } = await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: event,
      properties: sanitizeAnalyticsProperties(properties),
    })

    if (error && import.meta.env.DEV) console.warn('[Analytics] No se pudo registrar el evento.')
  } catch {
    if (import.meta.env.DEV) console.warn('[Analytics] Evento omitido.')
  }
}
