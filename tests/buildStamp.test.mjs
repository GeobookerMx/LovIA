import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createBuildStamp, buildStampPlugin } from '../scripts/build-stamp.mjs'

test('build metadata has a unique public identifier and no credentials or private configuration', () => {
  const now = new Date('2026-11-13T14:00:00.000Z')
  const stamp = createBuildStamp({ now, commit: 'a'.repeat(40) })
  assert.equal(stamp.platform,'web')
  assert.equal(stamp.sourceCommit,'a'.repeat(40))
  assert.match(stamp.buildId,/^web-20261113T140000000Z-aaaaaaaa$/)
  assert.notEqual(stamp.buildId,createBuildStamp({now:new Date(now.getTime()+1),commit:'a'.repeat(40)}).buildId)
  assert.equal(createBuildStamp({commit:'not-a-commit-or-credential'}).sourceCommit,null)
  assert.deepEqual(Object.keys(stamp).sort(),['buildId','builtAt','platform','sourceCommit','sourceDirty'].sort())
})

test('public build JSON matches the installed HTML marker and bypasses stale metadata caches', () => {
  const stamp = createBuildStamp()
  const emitted=[]
  const plugin=buildStampPlugin(stamp)
  plugin.generateBundle.call({emitFile:asset=>emitted.push(asset)})
  assert.equal(emitted[0].fileName,'build-info.json')
  assert.deepEqual(JSON.parse(emitted[0].source),stamp)
  assert.equal(plugin.transformIndexHtml()[0].attrs.content,stamp.buildId)
  const netlify=readFileSync(new URL('../netlify.toml',import.meta.url),'utf8')
  const block=netlify.split('[[headers]]').find(part=>part.includes('for = "/build-info.json"'))
  assert.ok(block.includes('no-store'))
  assert.ok(block.includes('noindex'))
})
