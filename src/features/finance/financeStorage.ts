import { supabase } from '../../lib/supabase'

/** Versión del catálogo de preguntas (financeQuestions.ts). Súbela al cambiar texto u opciones. */
export const FINANCE_CATALOG_VERSION = 'v2'
export const SKIP_UNSURE = 'Todavía no lo sé'
export const SKIP_PRIVATE = 'Prefiero no responder'

const FLAG_KEY = 'finance_private_save'

export type FinanceStatus = 'answered' | 'unsure' | 'skipped'

/** Respuesta en memoria: opciones elegidas y texto libre opcional. */
export interface FinanceAnswer {
  values: string[]
  text: string
}

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
export async function loadFinanceAnswers(): Promise<Record<string, FinanceAnswer>> {
  const { data, error } = await supabase
    .from('finance_answers')
    .select('question_key, status, selected, free_text')
    .eq('catalog_version', FINANCE_CATALOG_VERSION)
  if (error) throw error
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

/**
 * Guarda una respuesta de forma idempotente (un doble toque actualiza la misma fila).
 * Lanza un error si el servidor no confirma; quien llama decide cómo reintentar.
 */
export async function saveFinanceAnswer(userId: string, questionKey: string, answer: FinanceAnswer): Promise<void> {
  const unsure = answer.values.includes(SKIP_UNSURE)
  const skipped = answer.values.includes(SKIP_PRIVATE)
  const status: FinanceStatus = unsure ? 'unsure' : skipped ? 'skipped' : 'answered'
  const answered = status === 'answered'
  const text = answered ? answer.text.trim().slice(0, 1000) : ''
  const { error } = await supabase.from('finance_answers').upsert(
    {
      user_id: userId,
      catalog_version: FINANCE_CATALOG_VERSION,
      question_key: questionKey,
      status,
      selected: answered ? answer.values : [],
      free_text: text === '' ? null : text,
    },
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
