import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeAnalyticsProperties } from '../src/lib/analyticsPolicy.ts'

test('selfie URLs, tokens and raw error messages are never retained', () => {
  const incoming = {
    url: 'https://example.invalid/private-selfie.jpg',
    token: 'example-token',
    error: 'Raw private error',
    moduleId: 'private-activity',
  }
  assert.deepEqual(sanitizeAnalyticsProperties(incoming), {})
})
