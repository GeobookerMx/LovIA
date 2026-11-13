import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { isHalloweenCampaign, isChristmasCampaign } from '../../lib/campaignDates'
import './SeasonalBanner.css'

const DISMISSED_HALLOWEEN_KEY = 'lovia:halloween-2026:dismissed'
const DISMISSED_XMAS_KEY = 'lovia:xmas-2026:dismissed'

export default function SeasonalBanner() {
  const { pathname } = useLocation()
  const user = useAuthStore((state) => state.user)
  const [isXmas, setIsXmas] = useState(() => isChristmasCampaign())
  const [isHalloween, setIsHalloween] = useState(() => isHalloweenCampaign())

  const [dismissedXmas, setDismissedXmas] = useState(() => {
    try { return sessionStorage.getItem(DISMISSED_XMAS_KEY) === '1' } catch { return false }
  })
  const [dismissedHalloween, setDismissedHalloween] = useState(() => {
    try { return sessionStorage.getItem(DISMISSED_HALLOWEEN_KEY) === '1' } catch { return false }
  })

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsXmas(isChristmasCampaign())
      setIsHalloween(isHalloweenCampaign())
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  // El recorrido del mapa necesita espacio para sus avisos y controles.
  if (pathname === '/radar' || pathname === '/demo/mapa') return null

  // 1. Banner Navideño 2026
  if (isXmas && !dismissedXmas) {
    return (
      <aside className="seasonal-banner seasonal-banner--christmas" aria-label="Campaña navideña 2026 de LovIA" style={{
        background: 'linear-gradient(135deg, rgba(20, 8, 38, 0.95) 0%, rgba(138, 28, 56, 0.9) 50%, rgba(26, 74, 38, 0.95) 100%)',
        borderBottom: '1px solid rgba(255, 215, 0, 0.35)',
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.15)'
      }}>
        <div className="seasonal-banner__inner">
          <div className="seasonal-banner__art" aria-hidden="true" style={{ fontSize: '2.2rem' }}>
            🎄✨
          </div>
          <div className="seasonal-banner__copy">
            <span className="seasonal-banner__eyebrow" style={{ color: '#FDE047', fontWeight: 600 }}>
              Edición Especial · Navidad 2026 ❄️
            </span>
            <strong style={{ color: '#FFF' }}>Esta Navidad, cultiva la relación que sueñas 🎁</strong>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>Descubre afinidades profundas, acuerdos y propósitos compartidos</span>
          </div>
          <Link className="seasonal-banner__action" to={user ? '/home' : '/register'} style={{
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            color: '#FFF',
            border: 'none',
            fontWeight: 700
          }}>
            Explorar LovIA <span aria-hidden="true">→</span>
          </Link>
          <button type="button" className="seasonal-banner__close" aria-label="Cerrar banner navideño" onClick={() => {
            try { sessionStorage.setItem(DISMISSED_XMAS_KEY, '1') } catch { /* storage unavailable */ }
            setDismissedXmas(true)
          }}>×</button>
        </div>
      </aside>
    )
  }

  // 2. Banner Halloween (retrocompatible si la fecha coincide)
  if (import.meta.env.VITE_HALLOWEEN_2026 !== 'false' && isHalloween && !dismissedHalloween) {
    return (
      <aside className="seasonal-banner" aria-label="Campaña temporal de Halloween de LovIA">
        <div className="seasonal-banner__inner">
          <div className="seasonal-banner__art" aria-hidden="true">
            <svg className="seasonal-banner__icon" viewBox="0 0 112 112" focusable="false">
              <circle cx="56" cy="56" r="52" fill="#521882" stroke="#D8B4FE" strokeWidth="2" />
              <path d="M56 94C39 80 18 64 18 43a20 20 0 0 1 38-8 20 20 0 0 1 38 8c0 21-21 37-38 51Z" fill="#FB923C" stroke="#FFF7ED" strokeWidth="3" />
              <path d="M56 35c-13 10-14 34 0 54m0-54c13 10 14 34 0 54M42 44c9-6 19-6 28 0" fill="none" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M56 34c2-7 6-10 13-10" fill="none" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" />
              <path d="m42 58 6-3m16 0 6 3M47 70c6 4 12 4 18 0" fill="none" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
              <path d="m18 12 2 5 5 2-5 2-2 5-2-5-5-2 5-2Zm80 66 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" fill="#FDE68A" />
            </svg>
          </div>
          <div className="seasonal-banner__copy">
            <span className="seasonal-banner__eyebrow">Edición especial · Halloween</span>
            <strong>Conexiones que encantan 🎃</strong>
            <span>Conoce personas y descubre nuevas formas de conectar</span>
          </div>
          <Link className="seasonal-banner__action" to={user ? '/home' : '/register'}>
            Explorar gratis <span aria-hidden="true">→</span>
          </Link>
          <button type="button" className="seasonal-banner__close" aria-label="Cerrar banner de Halloween" onClick={() => {
            try { sessionStorage.setItem(DISMISSED_HALLOWEEN_KEY, '1') } catch { /* storage unavailable */ }
            setDismissedHalloween(true)
          }}>×</button>
        </div>
      </aside>
    )
  }

  return null
}
