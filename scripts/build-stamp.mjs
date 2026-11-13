import { execFileSync } from 'node:child_process'

export function createBuildStamp({ native = false, now = new Date(), commit = '', dirty = false } = {}) {
  const sourceCommit = /^[a-f0-9]{40}$/i.test(commit) ? commit : null
  const builtAt = now.toISOString()
  return { buildId: `${native ? 'native' : 'web'}-${builtAt.replace(/[-:.]/g, '')}-${sourceCommit?.slice(0, 8) ?? 'local'}`,
    builtAt, sourceCommit, sourceDirty: dirty, platform: native ? 'native' : 'web' }
}

export function readBuildStamp(native = false) {
  let commit = process.env.COMMIT_REF ?? ''
  let dirty = false
  try {
    if (!commit) commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim()
    const changed = execFileSync('git', ['status','--porcelain','--untracked-files=all','--','src','public','scripts','package.json','package-lock.json','index.html','vite.config.ts','netlify.toml'], { encoding:'utf8', stdio:['ignore','pipe','ignore'] })
    dirty = changed.trim() !== ''
  } catch { dirty = true }
  return createBuildStamp({ native, commit, dirty })
}

export function buildStampPlugin(stamp) {
  return {
    name: 'lovia-build-stamp',
    transformIndexHtml() { return [{ tag: 'meta', attrs: { name: 'lovia-build', content: stamp.buildId }, injectTo: 'head' }] },
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'build-info.json', source: JSON.stringify(stamp) }) },
  }
}
