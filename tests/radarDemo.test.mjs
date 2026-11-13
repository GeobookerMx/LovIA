import test from 'node:test'
import assert from 'node:assert/strict'
import { demoCandidates, explainDemoCandidate } from '../src/features/user-dashboard/radarDemoFixtures.ts'
import { parseDeletionRequestReceipt } from '../src/features/user-dashboard/accountDeletionStatus.ts'

test('five fictional examples have unique demo IDs and no GPS or account identifiers', () => {
  assert.equal(demoCandidates.length, 5)
  assert.equal(new Set(demoCandidates.map(candidate => candidate.id)).size, 5)
  for (const candidate of demoCandidates) {
    assert.equal(candidate.fictional, true)
    assert.match(candidate.id, /^demo-\d$/)
    assert.equal(candidate.mutualInterest, false)
    for (const field of ['lat', 'lng', 'latitude', 'longitude', 'user_id', 'avatar_url', 'compatibility']) assert.equal(field in candidate, false)
  }
})

test('examples illustrate distance, intention, age and reciprocal preferences', () => {
  for (const candidate of demoCandidates.slice(0, 4)) assert.equal(explainDemoCandidate(candidate, 10).status, 'outside_filters')
  assert.match(explainDemoCandidate(demoCandidates[0], 10).reason, /18.*10/)
  assert.match(explainDemoCandidate(demoCandidates[1], 10).reason, /amistad/)
  assert.match(explainDemoCandidate(demoCandidates[2], 10).reason, /30 a 45/)
  assert.match(explainDemoCandidate(demoCandidates[3], 10).reason, /ambas partes/)
})

test('passing all sample filters still requires mutual interest and creates no match', () => {
  for (const radius of [5, 10, 20]) for (const candidate of demoCandidates) {
    assert.ok(['outside_filters', 'mutual_interest_required'].includes(explainDemoCandidate(candidate, radius).status))
  }
  assert.equal(explainDemoCandidate(demoCandidates[0], 20).status, 'mutual_interest_required')
  assert.equal(explainDemoCandidate(demoCandidates[4], 10).status, 'mutual_interest_required')
  assert.throws(() => explainDemoCandidate({ ...demoCandidates[0], fictional: false }, 10))
  assert.throws(() => explainDemoCandidate({ ...demoCandidates[0], id: 'real-user' }, 10))
})

test('deletion receipt accepts only a confirmed pending request, never fake completion', () => {
  const receipt = { status: 'pending', requested_at: '2026-11-12T12:00:00Z' }
  assert.deepEqual(parseDeletionRequestReceipt(receipt), receipt)
  for (const value of [null, {}, { success: true }, { ...receipt, status: 'deleted' }, { ...receipt, requested_at: 'invalid' }]) {
    assert.throws(() => parseDeletionRequestReceipt(value))
  }
})
