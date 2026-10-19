export const ANALYTICS_EVENTS = [
  'signup_started', 'signup_completed', 'profile_saved',
  'doctor_application_submitted', 'selfie_started', 'selfie_uploaded',
  'test_completed', 'readiness_generated', 'radar_unlocked',
  'module_started', 'module_completed', 'improvement_plan_opened',
  'chat_opened', 'error_submit', 'error_camera', 'error_profile_save',
] as const

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[number]

// No event properties are approved yet. The SQL draft also enforces {}.
export function sanitizeAnalyticsProperties(_properties?: Record<string, unknown>): Record<string, never> {
  return {}
}
