import { useEffect, useRef, useState } from 'react'
import './PwaUpdatePrompt.css'

export default function PwaUpdatePrompt() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)
  const updateRequested = useRef(false)
  const [reloadAvailable, setReloadAvailable] = useState(false)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || import.meta.env.DEV) return

    let active = true
    let registration: ServiceWorkerRegistration | null = null
    let installing: ServiceWorker | null = null
    let hadController = !!navigator.serviceWorker.controller
    let lastCheck = 0

    const onInstalled = () => {
      if (active && installing?.state === 'installed' && navigator.serviceWorker.controller) {
        setWaiting(installing)
      }
    }
    const onUpdateFound = () => {
      installing?.removeEventListener('statechange', onInstalled)
      installing = registration?.installing ?? null
      installing?.addEventListener('statechange', onInstalled)
    }
    const onControllerChange = () => {
      if (updateRequested.current) window.location.reload()
      else if (hadController) { setWaiting(null); setReloadAvailable(true) }
      hadController = true
    }
    const checkForUpdate = () => {
      if (document.visibilityState !== 'visible' || !navigator.onLine || Date.now() - lastCheck < 30_000) return
      lastCheck = Date.now()
      void registration?.update().then(() => {
        if (active && registration?.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting)
      }).catch(() => undefined)
    }
    const onOnline = () => { lastCheck = 0; checkForUpdate() }
    const register = async () => {
      try {
        const result = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
        if (!active) return
        registration = result
        if (result.waiting && navigator.serviceWorker.controller) setWaiting(result.waiting)
        result.addEventListener('updatefound', onUpdateFound)
        checkForUpdate()
      } catch {
        // La aplicación web sigue disponible aunque falle el modo sin conexión.
      }
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    document.addEventListener('visibilitychange', checkForUpdate)
    window.addEventListener('online', onOnline)
    window.addEventListener('focus', checkForUpdate)
    const timer = window.setInterval(checkForUpdate, 15 * 60 * 1000)
    if (document.readyState === 'complete') void register()
    else window.addEventListener('load', register, { once: true })

    return () => {
      active = false
      window.removeEventListener('load', register)
      document.removeEventListener('visibilitychange', checkForUpdate)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('focus', checkForUpdate)
      window.clearInterval(timer)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      registration?.removeEventListener('updatefound', onUpdateFound)
      installing?.removeEventListener('statechange', onInstalled)
    }
  }, [])

  if (!waiting && !reloadAvailable) return null

  return (
    <div className="pwa-update" role="status" aria-live="polite">
      <span>Hay una versión nueva de LovIA. Guarda lo que estés escribiendo antes de actualizar.</span>
      <div className="pwa-update__actions">
        <button type="button" disabled={switching} onClick={() => { setWaiting(null); setReloadAvailable(false) }}>Más tarde</button>
        <button type="button" disabled={switching} onClick={() => {
          if (reloadAvailable) { window.location.reload(); return }
          updateRequested.current = true
          setSwitching(true)
          waiting?.postMessage({ type: 'SKIP_WAITING' })
        }}>{switching ? 'Actualizando…' : 'Actualizar'}</button>
      </div>
    </div>
  )
}
