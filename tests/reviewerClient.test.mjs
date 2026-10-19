import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { reviewerClient } = require('../scripts/reviewer-test-client.cjs')
const keys = [
  'LOVIA_ALLOW_TEST_ACCOUNT_WRITE', 'LOVIA_TEST_SUPABASE_URL',
  'LOVIA_TEST_SUPABASE_EXPECTED_REF', 'LOVIA_TEST_SUPABASE_PUBLISHABLE_KEY',
  'LOVIA_REVIEWER_EMAIL', 'LOVIA_REVIEWER_PASSWORD',
]

function withEnvironment(values, assertion) {
  const before = Object.fromEntries(keys.map(key => [key, process.env[key]]))
  try {
    for (const key of keys) delete process.env[key]
    Object.assign(process.env, values)
    assertion()
  } finally {
    for (const key of keys) {
      if (before[key] === undefined) delete process.env[key]
      else process.env[key] = before[key]
    }
  }
}

const base = {
  LOVIA_ALLOW_TEST_ACCOUNT_WRITE: '1',
  LOVIA_TEST_SUPABASE_EXPECTED_REF: 'abcdefghijklmnopqrst',
  LOVIA_TEST_SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co',
  LOVIA_TEST_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
  LOVIA_REVIEWER_EMAIL: 'reviewer@example.com',
  LOVIA_REVIEWER_PASSWORD: 'example-only-password',
}

test('reviewer script rejects the production project before creating a client', () => {
  withEnvironment({ ...base,
    LOVIA_TEST_SUPABASE_EXPECTED_REF: 'nbpidjpkanwynlhdxowx',
    LOVIA_TEST_SUPABASE_URL: 'https://nbpidjpkanwynlhdxowx.supabase.co',
  }, () => assert.throws(reviewerClient, /reservado para producción/))
})

test('reviewer script rejects a real email domain', () => {
  withEnvironment({ ...base, LOVIA_REVIEWER_EMAIL: 'reviewer@gmail.com' },
    () => assert.throws(reviewerClient, /dominio ficticio/))
})
