import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePublicEnvironment, PRODUCTION_SUPABASE_REF } from '../src/lib/environment.ts'

const TEST_REF = 'abcdefghijklmnopqrst'
const staging = {
  mode: 'staging',
  appEnvironment: 'staging',
  supabaseUrl: `https://${TEST_REF}.supabase.co`,
  expectedRef: TEST_REF,
  publishableKey: 'sb_publishable_test_only_1234567890',
  devBypass: 'false',
}

test('an isolated staging configuration passes', () => {
  assert.equal(validatePublicEnvironment(staging).projectRef, TEST_REF)
})

test('missing configuration never falls back to production', () => {
  assert.throws(() => validatePublicEnvironment({ mode: 'staging' }), /VITE_APP_ENV/)
})

test('staging rejects the reserved production project', () => {
  assert.throws(() => validatePublicEnvironment({
    ...staging,
    expectedRef: PRODUCTION_SUPABASE_REF,
    supabaseUrl: `https://${PRODUCTION_SUPABASE_REF}.supabase.co`,
  }), /reservado de producción/)
})

test('a Netlify preview rejects production configuration', () => {
  assert.throws(() => validatePublicEnvironment({
    ...staging,
    mode: 'production',
    appEnvironment: 'production',
    expectedRef: PRODUCTION_SUPABASE_REF,
    supabaseUrl: `https://${PRODUCTION_SUPABASE_REF}.supabase.co`,
    netlifyContext: 'deploy-preview',
  }), /Netlify de pruebas/)
})

test('a privileged key and development bypass are rejected', () => {
  assert.throws(() => validatePublicEnvironment({ ...staging, publishableKey: 'sb_secret_example' }), /clave privilegiada/)
  assert.throws(() => validatePublicEnvironment({ ...staging, devBypass: 'true' }), /VITE_DEV_BYPASS/)
})
