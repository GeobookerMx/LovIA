import { useEffect, useRef, useState } from 'react'
import './PwaUpdatePrompt.css'

export default function PwaUpdatePrompt() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)
  const updateRequested = useRef(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || import.meta.env.DEV) return

    let active = true
    let registration: ServiceWorkerRegistration | null = null
    let installing: ServiceWorker | null = null

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
    }
    const checkForUpdate = () => {
      if (document.visibilityState === 'visible') void registration?.update().catch(() => undefined)
    }
    const register = async () => {
      try {
        const result = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
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
    if (document.readyState === 'complete') void register()
    else window.addEventListener('load', register, { once: true })

    return () => {
      active = false
      window.removeEventListener('load', register)
      document.removeEventListener('visibilitychange', checkForUpdate)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      registration?.removeEventListener('updatefound', onUpdateFound)
      installing?.removeEventListener('statechange', onInstalled)
    }
  }, [])

  if (!waiting) return null

  return (
    <div className="pwa-update" role="status" aria-live="polite">
      <span>Hay una versión nueva de LovIA. Guarda lo que estés escribiendo antes de actualizar.</span>
      <div className="pwa-update__actions">
        <button type="button" onClick={() => setWaiting(null)}>Más tarde</button>
        <button type="button" onClick={() => {
          updateRequested.current = true
          waiting.postMessage({ type: 'SKIP_WAITING' })
        }}>Actualizar</button>
      </div>
    </div>
  )
}
