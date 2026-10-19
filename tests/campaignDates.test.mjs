import test from 'node:test'
import assert from 'node:assert/strict'
import { isFreeAccessPeriod, isHalloweenCampaign, mexicoCityDate } from '../src/lib/campaignDates.ts'

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
