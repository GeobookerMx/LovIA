/**
 * financeShare.ts — Servicio de conversaciones compartidas con consentimiento.
 *
 * Flujo:
 *  1. Persona A genera un código (createShareInvite).
 *  2. Comparte el código con persona B por fuera de la app (WhatsApp, etc.).
 *  3. Persona B lo ingresa y acepta (acceptShareInvite).
 *  4. Ambas pueden ver las respuestas con share_consent=true (loadPartnerAnswers).
 *  5. Cualquiera puede revocar (revokeShareLink).
 *
 * Privacidad:
 *  - Solo respuestas marcadas share_consent=true son visibles para la pareja.
 *  - El código expira en 7 días si no se acepta.
 *  - RLS en el servidor impone todo esto; este módulo solo facilita la UI.
 */
import { supabase } from '../../lib/supabase'
import { FINANCE_CATALOG_VERSION, type FinanceAnswer, SKIP_PRIVATE, SKIP_UNSURE } from './financeStorage'

export type ShareStatus = 'none' | 'pending' | 'active' | 'revoked'

export interface ShareLink {
  id: string
  invite_code: string
  status: ShareStatus
  user_a: string
  user_b: string | null
  created_at: string
  accepted_at: string | null
  expires_at: string
}

/** Genera un código aleatorio de 8 caracteres (A-Z0-9). */
function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin O, 0, I, 1 para evitar confusión
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/** Devuelve el enlace activo o pendiente del usuario actual, o null si no existe. */
export async function getMyShareLink(): Promise<ShareLink | null> {
  const { data, error } = await supabase
    .from('finance_share_links')
    .select('*')
    .in('status', ['pending', 'active'])
    .maybeSingle()
  if (error) throw error
  return data as ShareLink | null
}

/** Crea una invitación nueva para el usuario actual. */
export async function createShareInvite(): Promise<ShareLink> {
  const code = randomCode()
  const { data, error } = await supabase
    .from('finance_share_links')
    .insert({ invite_code: code })
    .select()
    .single()
  if (error) throw error
  return data as ShareLink
}

/** Acepta la invitación con el código dado (llama a función SECURITY DEFINER). */
export async function acceptShareInvite(code: string): Promise<void> {
  const { error } = await supabase.rpc('finance_accept_invite', { p_code: code.trim().toUpperCase() })
  if (error) throw new Error(error.message)
}

/** Revoca el enlace del usuario actual (se borra tanto para A como para B). */
export async function revokeShareLink(linkId: string): Promise<void> {
  const { error } = await supabase
    .from('finance_share_links')
    .delete()
    .eq('id', linkId)
  if (error) throw error
}

/** Marca/desmarca share_consent para una respuesta concreta. */
export async function setShareConsent(
  userId: string,
  questionKey: string,
  consent: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('finance_answers')
    .update({ share_consent: consent })
    .eq('user_id', userId)
    .eq('question_key', questionKey)
    .eq('catalog_version', FINANCE_CATALOG_VERSION)
  if (error) throw error
}

/** Carga las respuestas de la pareja que tienen share_consent=true (RLS las filtra). */
export async function loadPartnerAnswers(): Promise<Record<string, FinanceAnswer>> {
  const { data, error } = await supabase
    .from('finance_answers')
    .select('question_key, status, selected, free_text')
    .eq('catalog_version', FINANCE_CATALOG_VERSION)
    .eq('share_consent', true)
  // Si error es de permisos significa que no hay enlace activo → devolvemos vacío.
  if (error) return {}
  const result: Record<string, FinanceAnswer> = {}
  for (const row of data ?? []) {
    if (row.status === 'unsure') result[row.question_key] = { values: [SKIP_UNSURE], text: '' }
    else if (row.status === 'skipped') result[row.question_key] = { values: [SKIP_PRIVATE], text: '' }
    else result[row.question_key] = {
      values: Array.isArray(row.selected) ? (row.selected as string[]) : [],
      text: row.free_text ?? '',
    }
  }
  return result
}

/** Carga el estado de share_consent de las respuestas propias. */
export async function loadMyShareConsents(): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('finance_answers')
    .select('question_key, share_consent')
    .eq('catalog_version', FINANCE_CATALOG_VERSION)
  if (error) return {}
  const result: Record<string, boolean> = {}
  for (const row of data ?? []) {
    result[row.question_key] = row.share_consent ?? false
  }
  return result
}
