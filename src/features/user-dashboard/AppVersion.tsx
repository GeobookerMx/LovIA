import { useState } from 'react'

export default function AppVersion() {
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')
  const check = async () => {
    setChecking(true)
    setMessage('')
    try {
      const response = await fetch('/build-info.json', { cache: 'no-store' })
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Version unavailable')
      const latest: unknown = await response.json()
      if (!latest || typeof latest !== 'object' || !('buildId' in latest) || typeof latest.buildId !== 'string') throw new Error('Version unavailable')
      setMessage(latest.buildId === __LOVIA_BUILD__.buildId ? 'Tienes la versión publicada más reciente.' : 'Hay una versión más reciente. Guarda lo que estés escribiendo; el aviso de actualización te permitirá instalarla.')
      if ('serviceWorker' in navigator) await (await navigator.serviceWorker.getRegistration())?.update()
    } catch { setMessage('No pudimos comprobar la versión publicada. Revisa la conexión y vuelve a intentarlo.') }
    finally { setChecking(false) }
  }
  return <section className="settings-section" style={{ overflowWrap: 'anywhere', lineHeight: 1.7 }} aria-label="Versión instalada">
    <h3>Versión de LovIA</h3><p><code>{__LOVIA_BUILD__.buildId}</code></p>
    <p>Compilada: {new Date(__LOVIA_BUILD__.builtAt).toLocaleString('es-MX')}.</p>
    {__LOVIA_BUILD__.platform === 'web' && <button type="button" className="btn btn-secondary" disabled={checking} onClick={() => void check()}>{checking ? 'Comprobando…' : 'Comprobar actualización'}</button>}
    {message && <p role="status">{message}</p>}
  </section>
}
