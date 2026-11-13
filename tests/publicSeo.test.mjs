import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { publicPages, publicPagesPlugin, renderPublicPage } from '../scripts/public-pages.mjs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8').replaceAll('\r\n', '\n')
const origin = 'https://lovia.com.mx'
const existing = new Map([
  ['/', read('index.html')],
  ['/en/', read('public/en/index.html')],
  ['/recursos/dinero-y-proyecto-de-vida', read('public/recursos/dinero-y-proyecto-de-vida.html')],
  ['/en/resources/money-and-life-plans', read('public/en/resources/money-and-life-plans.html')],
  ['/privacy', read('public/privacy.html')],
  ['/delete-account', read('public/delete-account.html')],
])
const pages = new Map([...existing, ...publicPages.map(page => [page.path, renderPublicPage(page)])])
const canonical = html => html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1]
const alternates = html => [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi)]
  .map(([, language, href]) => ({ language, href }))

test('sitemap contains unique public URLs that exist and self-canonicalize', () => {
  const urls = [...read('public/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
  assert.equal(new Set(urls).size, urls.length)
  assert.equal(urls.length, pages.size)
  for (const href of urls) {
    const url = new URL(href)
    assert.equal(url.origin, origin)
    assert.ok(!/^\/(admin|auth|profile|matches|guide|onboarding|login|register)(\/|$)/.test(url.pathname))
    const html = pages.get(url.pathname)
    assert.ok(html, `${href} must resolve to public HTML`)
    assert.equal(canonical(html), href)
  }
})

test('language alternatives are reciprocal for Mexico, generic Spanish and English', () => {
  for (const [path, html] of pages) {
    const links = alternates(html)
    if (!links.length) continue
    for (const language of ['es-MX', 'es', 'en', 'x-default']) {
      assert.ok(links.some(link => link.language === language), `${path}: missing ${language}`)
    }
    for (const link of links) {
      const target = pages.get(new URL(link.href).pathname)
      assert.ok(target, `${path}: missing alternative ${link.href}`)
      assert.ok(alternates(target).some(back => back.href === `${origin}${path}`), `${path}: missing return link`)
    }
  }
})

test('structured data is valid JSON and does not invent customer ratings', () => {
  for (const [path, html] of pages) {
    for (const [, source] of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
      const graph = JSON.parse(source)
      assert.equal(graph['@context'], 'https://schema.org', path)
      assert.ok(!source.includes('aggregateRating'), `${path}: ratings need verified evidence`)
    }
  }
  const homeGraph = JSON.parse(existing.get('/').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
  assert.ok(homeGraph['@graph'].some(item => item['@type'] === 'WebApplication' && item.description.includes('comunicación')))
})

test('public guides have content without client JavaScript and working internal links', () => {
  const allowedPaths = new Set([...pages.keys(), '/register', '/demo/mapa', '/public-guides.css', '/favicon.svg'])
  const disallowed = read('public/robots.txt').split('\n').filter(line => line.startsWith('Disallow: ')).map(line => line.slice(10).trim())
  const titles = new Set()
  for (const page of publicPages) {
    const html = renderPublicPage(page)
    assert.equal((html.match(/<h1>/g) ?? []).length, 1)
    assert.ok(html.includes('<main id="content">'))
    assert.ok(html.includes('2026-11-12') || html.includes('November 12, 2026'))
    assert.ok(!/<script[^>]+src=/i.test(html), `${page.path}: content must not need app JavaScript`)
    assert.ok(!titles.has(page.title))
    titles.add(page.title)
    assert.ok(!disallowed.some(prefix => prefix && page.path.startsWith(prefix)))
    for (const [, href] of html.matchAll(/href="(\/[^"#]*)"/g)) assert.ok(allowedPaths.has(href), `${page.path}: broken link ${href}`)
  }
})

test('build emits each guide and Netlify resolves its clean URL before the SPA fallback', () => {
  const assets = []
  publicPagesPlugin().generateBundle.call({ emitFile: asset => assets.push(asset) })
  const rules = read('netlify.toml')
  for (const page of publicPages) {
    assert.ok(assets.some(asset => asset.fileName === page.fileName && canonical(asset.source) === `${origin}${page.path}`))
    if (page.fileName.endsWith('/index.html')) continue // Static directories are served directly by Netlify.
    const from = rules.indexOf(`from   = "${page.path}"`)
    assert.ok(from >= 0 && from < rules.indexOf('from   = "/*"'), `${page.path}: must precede SPA fallback`)
    assert.ok(rules.slice(from).startsWith(`from   = "${page.path}"\n  to     = "/${page.fileName}"`))
  }
})

test('public account entry pages expose noindex without a robots crawl block', () => {
  const rules = read('netlify.toml')
  const robots = read('public/robots.txt')
  for (const path of ['/login', '/register', '/recover', '/demo/mapa']) {
    const block = rules.split('[[headers]]').find(part => part.includes(`for = "${path}"`))
    assert.ok(block?.includes('X-Robots-Tag = "noindex"'), `${path}: needs server noindex`)
    assert.ok(!robots.includes(`Disallow: ${path}`), `${path}: crawler must be able to see noindex`)
    assert.ok(!read('public/sitemap.xml').includes(`${origin}${path}</loc>`))
  }
})
