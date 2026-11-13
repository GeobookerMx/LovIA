import test from 'node:test'
import assert from 'node:assert/strict'
import { ownedAvatarPath } from '../src/lib/avatarStorage.ts'

const origin = 'https://example.supabase.co'
const url = `${origin}/storage/v1/object/public/avatars/user-a/avatar-123.jpg`
test('avatar cleanup accepts only an owned image in this project bucket', () => {
  assert.equal(ownedAvatarPath(url, 'user-a', origin), 'user-a/avatar-123.jpg')
  assert.equal(ownedAvatarPath(`${url}?cache=1`, 'user-a', origin), 'user-a/avatar-123.jpg')
  for (const value of [undefined, '', 'invalid', url.replace('user-a', 'user-b'), url.replace('avatars', 'books'), url.replace('example.supabase.co', 'external.invalid'), url.replace('avatar-123.jpg', 'nested%2Fimage.jpg'), url.replace('avatar-123.jpg', 'payload.svg'), url.replace('avatar-123.jpg', '%2e%2e%2Fother.jpg')]) {
    assert.equal(ownedAvatarPath(value, 'user-a', origin), null)
  }
})
