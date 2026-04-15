import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      setShowReconnected(false)
    }

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        setShowReconnected(true)
        setTimeout(() => setShowReconnected(false), 3000)
      }
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [wasOffline])

  if (isOnline && !showReconnected) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
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
        backgroundColor: isOnline ? '#166534' : '#7f1d1d',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'background-color 0.3s ease',
      }}
    >
      {isOnline ? (
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
