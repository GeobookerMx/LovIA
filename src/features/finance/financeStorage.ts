import { supabase } from '../../lib/supabase'

/** Versión del catálogo de preguntas del recorrido corto «Me conozco». */
export const FINANCE_CATALOG_VERSION = 'v1'
export const SKIP_UNSURE = 'Todavía no lo sé'
export const SKIP_PRIVATE = 'Prefiero no responder'

const FLAG_KEY = 'finance_private_save'

export type FinanceStatus = 'answered' | 'unsure' | 'skipped'

/** Devuelve true sólo si el servidor confirma que el guardado privado está activo. */
export async function isFinanceSaveEnabled(): Promise<boolean> {
  const { data, error } = await supabase
    .from('lovia_feature_flags')
    .select('enabled')
    .eq('key', FLAG_KEY)
    .maybeSingle()
  return !error && data?.enabled === true
}

/** Respuestas propias de esta versión; el servidor (RLS) sólo entrega las del usuario autenticado. */
export async function loadFinanceAnswers(): Promise<Record<string, string[]>> {
  const { data, error } = await supabase
    .from('finance_answers')
    .select('question_key, status, selected')
    .eq('catalog_version', FINANCE_CATALOG_VERSION)
  if (error) throw error
  const result: Record<string, string[]> = {}
  for (const row of data ?? []) {
    if (row.status === 'unsure') result[row.question_key] = [SKIP_UNSURE]
    else if (row.status === 'skipped') result[row.question_key] = [SKIP_PRIVATE]
    else result[row.question_key] = Array.isArray(row.selected) ? (row.selected as string[]) : []
  }
  return result
}

/**
 * Guarda una respuesta de forma idempotente (un doble toque actualiza la misma fila).
 * Lanza un error si el servidor no confirma; quien llama decide cómo reintentar.
 */
export async function saveFinanceAnswer(userId: string, questionKey: string, values: string[]): Promise<void> {
  const unsure = values.includes(SKIP_UNSURE)
  const skipped = values.includes(SKIP_PRIVATE)
  const status: FinanceStatus = unsure ? 'unsure' : skipped ? 'skipped' : 'answered'
  const selected = status === 'answered' ? values : []
  const { error } = await supabase.from('finance_answers').upsert(
    { user_id: userId, catalog_version: FINANCE_CATALOG_VERSION, question_key: questionKey, status, selected },
    { onConflict: 'user_id,catalog_version,question_key' },
  )
  if (error) throw error
}

/** Borra todas las respuestas propias de esta versión. */
export async function deleteFinanceAnswers(userId: string): Promise<void> {
  const { error } = await supabase
    .from('finance_answers')
    .delete()
    .eq('user_id', userId)
    .eq('catalog_version', FINANCE_CATALOG_VERSION)
  if (error) throw error
}
