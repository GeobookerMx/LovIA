import { supabase } from './supabase'
import { LEGAL_VERSION, parseLegalAcceptance } from './legalConsentPolicy'

export async function loadLegalAcceptance(userId: string) {
  const { data, error } = await supabase.from('legal_acceptances')
    .select('legal_version, age_confirmed_18, sensitive_data_consent, recorded_at')
    .eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (!data || data.legal_version !== LEGAL_VERSION) return null
  return parseLegalAcceptance(data)
}

export async function recordLegalAcceptance(sensitiveData: boolean) {
  const { data, error } = await supabase.rpc('record_legal_acceptance', {
    p_version: LEGAL_VERSION, p_terms_accepted: true, p_age_confirmed: true, p_sensitive_data: sensitiveData,
  })
  if (error) throw error
  return parseLegalAcceptance(data)
}

export async function revokeSensitiveConsent() {
  const { data, error } = await supabase.rpc('set_sensitive_data_consent', { p_allowed: false })
  if (error) throw error
  return parseLegalAcceptance(data)
}
