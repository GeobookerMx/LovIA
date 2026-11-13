import test from 'node:test'
import assert from 'node:assert/strict'
import { isFreeAccessPeriod, isHalloweenCampaign, isChristmasCampaign, mexicoCityDate } from '../src/lib/campaignDates.ts'

test('free access includes the full final day in Mexico City', () => {
  assert.equal(mexicoCityDate(new Date('2027-02-01T05:59:59Z')), '2027-01-31')
  assert.equal(isFreeAccessPeriod(new Date('2027-02-01T05:59:59Z')), true)
  assert.equal(isFreeAccessPeriod(new Date('2027-02-01T06:00:00Z')), false)
})

test('Halloween banner ends automatically after November 1 in Mexico City', () => {
  assert.equal(isHalloweenCampaign(new Date('2026-10-19T06:00:00Z')), true)
  assert.equal(isHalloweenCampaign(new Date('2026-11-02T05:59:59Z')), true)
  assert.equal(isHalloweenCampaign(new Date('2026-11-02T06:00:00Z')), false)
})

test('Christmas decorations start and end on the Mexico City campaign dates', () => {
  assert.equal(isChristmasCampaign(new Date('2026-11-12T05:59:59Z')), false)
  assert.equal(isChristmasCampaign(new Date('2026-11-12T06:00:00Z')), true)
  assert.equal(isChristmasCampaign(new Date('2027-01-07T05:59:59Z')), true)
  assert.equal(isChristmasCampaign(new Date('2027-01-07T06:00:00Z')), false)
})
