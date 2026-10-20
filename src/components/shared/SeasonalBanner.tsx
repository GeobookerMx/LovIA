import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { isHalloweenCampaign } from '../../lib/campaignDates'
import './SeasonalBanner.css'

const DISMISSED_KEY = 'lovia:halloween-2026:dismissed'

export default function SeasonalBanner() {
  const user = useAuthStore((state) => state.user)
  const [active, setActive] = useState(() => isHalloweenCampaign())
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(DISMISSED_KEY) === '1' } catch { return false }
  })

  useEffect(() => {
    const timer = window.setInterval(() => setActive(isHalloweenCampaign()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  if (import.meta.env.VITE_HALLOWEEN_2026 === 'false' || !active || dismissed) return null

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
          try { sessionStorage.setItem(DISMISSED_KEY, '1') } catch { /* storage unavailable */ }
          setDismissed(true)
        }}>×</button>
      </div>
    </aside>
  )
}
