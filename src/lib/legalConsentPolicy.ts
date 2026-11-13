export const LEGAL_VERSION = '2026-11-13'
export interface LegalAcceptance {
  legal_version: string
  age_confirmed_18: true
  sensitive_data_consent: boolean
  recorded_at: string
}

export function parseLegalAcceptance(value: unknown): LegalAcceptance {
  if (!value || typeof value !== 'object') throw new Error('Consentimiento no confirmado')
  const row = value as Record<string, unknown>
  if (row.legal_version !== LEGAL_VERSION || row.age_confirmed_18 !== true ||
    typeof row.sensitive_data_consent !== 'boolean' || typeof row.recorded_at !== 'string' ||
    !Number.isFinite(Date.parse(row.recorded_at))) throw new Error('Consentimiento no confirmado')
  return row as unknown as LegalAcceptance
}
