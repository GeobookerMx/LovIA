import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [status, setStatus] = useState<'online' | 'offline' | 'reconnected'>(navigator.onLine ? 'online' : 'offline')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    const handleOffline = () => {
      if (timer) clearTimeout(timer)
      setStatus('offline')
    }

    const handleOnline = () => {
      if (timer) clearTimeout(timer)
      setStatus(previous => previous === 'offline' ? 'reconnected' : 'online')
      timer = setTimeout(() => setStatus('online'), 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (status === 'online') return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 0px)',
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: 500,
        backgroundColor: status === 'reconnected' ? '#166534' : '#7f1d1d',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'background-color 0.3s ease',
      }}
    >
      {status === 'reconnected' ? (
        <>
          <span style={{ fontSize: '16px' }}>✓</span>
          Conexión restaurada
        </>
      ) : (
        <>
          <span style={{ fontSize: '16px' }}>⚡</span>
          Sin conexión — algunas funciones no estarán disponibles
        </>
      )}
    </div>
  )
}
