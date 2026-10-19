import { useEffect, useState } from 'react'
import { isHalloweenCampaign } from '../../lib/campaignDates'
import './SeasonalBanner.css'

const DISMISSED_KEY = 'lovia:halloween-2026:dismissed'

export default function SeasonalBanner() {
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
    <aside className="seasonal-banner" aria-label="Campaña temporal de LovIA">
      <svg className="seasonal-banner__icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M24 42C15 35 5 28 5 17a10 10 0 0 1 19-4 10 10 0 0 1 19 4c0 11-10 18-19 25Z" fill="#F97316" stroke="#FFF7ED" strokeWidth="2" />
        <path d="M24 13c-7 6-7 17 0 26m0-26c7 6 7 17 0 26M17 18c4-3 10-3 14 0" fill="none" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M24 12c1-4 3-5 6-5" fill="none" stroke="#86EFAC" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="seasonal-banner__copy">
        <strong>Conexiones que encantan 🎃</strong>
        <span>Conoce personas y descubre nuevas formas de conectar</span>
      </div>
      <button type="button" className="seasonal-banner__close" aria-label="Cerrar banner de Halloween" onClick={() => {
        try { sessionStorage.setItem(DISMISSED_KEY, '1') } catch { /* storage unavailable */ }
        setDismissed(true)
      }}>×</button>
    </aside>
  )
}
