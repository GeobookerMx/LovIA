import { supabase } from './supabase'

const reasons = new Set(['fake_profile', 'abusive', 'spam', 'fraud', 'other'])

export function chooseReportReason(): string | null {
  const answer = window.prompt('Motivo del reporte: fake_profile, abusive, spam, fraud u other')
  if (answer === null) return null
  return reasons.has(answer.trim()) ? answer.trim() : 'other'
}

/** Each result is reported separately: client operations are not an atomic safety guarantee. */
export async function reportAndBlock(reporterId: string, reportedId: string, matchId: string, reason: string) {
  const { error: blockError } = await supabase.from('blocks').insert({
    blocker_id: reporterId, blocked_id: reportedId,
  })
  const blocked = !blockError || blockError.code === '23505'

  const { error: reportError } = await supabase.from('reports').insert({
    reporter_id: reporterId, reported_id: reportedId, reason,
  })
  const reported = !reportError

  let hidden = false
  if (blocked) {
    const { error: matchError } = await supabase.from('matches')
      .update({ status: 'declined' }).eq('id', matchId)
    hidden = !matchError
  }
  return { blocked, reported, hidden }
}
