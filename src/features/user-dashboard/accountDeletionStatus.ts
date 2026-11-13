export interface DeletionRequestReceipt {
  status: 'pending' | 'processing'
  requested_at: string
}

/** A queued request must never be interpreted as completed account deletion. */
export function parseDeletionRequestReceipt(value: unknown): DeletionRequestReceipt {
  if (typeof value !== 'object' || value === null) throw new Error('Solicitud no confirmada')
  const record = value as Record<string, unknown>
  if ((record.status !== 'pending' && record.status !== 'processing') ||
    typeof record.requested_at !== 'string' || !Number.isFinite(Date.parse(record.requested_at))) {
    throw new Error('Solicitud no confirmada')
  }
  return { status: record.status, requested_at: record.requested_at }
}
