import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, FlaskConical, Heart, MapPin, Share2, ShieldCheck, Sparkles } from 'lucide-react'
import { demoCandidates, explainDemoCandidate } from './radarDemoFixtures'
import './RadarDemo.css'

const shareUrl = 'https://lovia.com.mx/demo/mapa'

export default function RadarDemo() {
  const { pathname } = useLocation()
  const isPublic = pathname === '/demo/mapa'
  const [selectedId, setSelectedId] = useState(demoCandidates[0].id)
  const [radius, setRadius] = useState(10)
  const [shareMessage, setShareMessage] = useState('')
  const selected = demoCandidates.find(candidate => candidate.id === selectedId) ?? demoCandidates[0]
  const result = explainDemoCandidate(selected, radius)

  const shareDemo = async () => {
    try {
      const data = { title: 'Mapa de demostración de LovIA', text: 'Explora cómo funcionarán los filtros con cinco perfiles ficticios. Es una demostración, no personas disponibles.', url: shareUrl }
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(shareUrl); setShareMessage('Enlace de la demostración copiado.') }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return
      setShareMessage(`Puedes compartir este enlace: ${shareUrl}`)
    }
  }

  return (
    <main className="radar-demo">
      <header className="radar-demo__header">
        <Link to={isPublic ? '/' : '/home'} className="radar-demo__back" aria-label="Volver al inicio"><ArrowLeft size={21} /></Link>
        <div><span className="radar-demo__badge"><FlaskConical size={15} aria-hidden="true" /> DEMOSTRACIÓN · PERFILES FICTICIOS</span><h1>Explora el mapa de LovIA</h1></div>
      </header>
      <p className="radar-demo__intro">Prueba cinco ejemplos para entender los filtros y el interés mutuo. Estos perfiles y zonas son inventados; no representan personas conectadas ni actividad real.</p>
      <div className="radar-demo__privacy" role="note"><ShieldCheck size={21} aria-hidden="true" /><p>Esta demo no pide tu ubicación ni utiliza tu perfil. El mapa de personas reales aún está en preparación. No hay mensajes, citas ni matches reales aquí.</p></div>

      <section className="radar-demo__controls" aria-label="Preferencias de la demostración">
        <label htmlFor="demo-radius">Radio ilustrativo<select id="demo-radius" value={radius} onChange={event => setRadius(Number(event.target.value))}><option value={5}>5 km</option><option value={10}>10 km</option><option value={20}>20 km</option></select></label>
        <p>Preferencias del ejemplo: relación estable · 30–45 años. No son las preferencias de tu cuenta.</p>
      </section>

      <div className="radar-demo__layout">
        <section className="radar-demo__map-panel" aria-labelledby="demo-map-title">
          <h2 id="demo-map-title"><MapPin size={19} aria-hidden="true" /> Mapa ilustrativo</h2>
          <div className="radar-demo__map" role="group" aria-label="Cinco ubicaciones ficticias; también puedes seleccionarlas en la lista inferior">
            <svg className="radar-demo__geography" viewBox="0 0 800 520" preserveAspectRatio="none" aria-hidden="true">
              <defs><pattern id="demo-blocks" width="90" height="75" patternUnits="userSpaceOnUse"><rect x="9" y="9" width="67" height="52" rx="9" fill="#302343" stroke="#48345d" /></pattern></defs>
              <rect width="800" height="520" fill="#19182f" /><rect width="800" height="520" fill="url(#demo-blocks)" />
              <path d="M0 380 Q190 210 390 300 T800 200" stroke="#294e6a" strokeWidth="42" fill="none" />
              <path d="M120 0 310 520M490 0 670 520M0 140 800 430" stroke="#7e6c92" strokeWidth="12" fill="none" />
              <ellipse cx="390" cy="260" rx="230" ry="175" fill="#e999df0c" stroke="#edb3ee" strokeWidth="2" strokeDasharray="9 9" />
              <rect x="53" y="292" width="100" height="97" rx="32" fill="#315647" /><rect x="580" y="60" width="130" height="92" rx="35" fill="#315647" />
              <circle cx="390" cy="260" r="9" fill="#f9d685" /><text x="390" y="292" textAnchor="middle" fill="#fff1c6" fontSize="15">Punto ficticio</text>
            </svg>
            {demoCandidates.map((candidate, index) => <button key={candidate.id} type="button" className={`radar-demo__marker ${candidate.id === selectedId ? 'radar-demo__marker--selected' : ''}`} style={{ left: `${candidate.x}%`, top: `${candidate.y}%` }} onClick={() => setSelectedId(candidate.id)} aria-label={`${candidate.label}, ficticio, ${candidate.zone}`} aria-pressed={candidate.id === selectedId}><Heart size={23} aria-hidden="true" /><span>E{index + 1} · DEMO</span></button>)}
          </div>
          <p className="radar-demo__legend"><Sparkles size={17} aria-hidden="true" /> Corazones de ejemplo · Distancias inventadas · Sin GPS</p>
        </section>

        <section className="radar-demo__detail" aria-labelledby="demo-detail-title" aria-live="polite" aria-atomic="true">
          <span className="radar-demo__badge">PERFIL FICTICIO</span><h2 id="demo-detail-title">{selected.label}</h2>
          <p>{selected.age} años de ejemplo · {selected.zone}</p><p>{selected.distanceKm} km ilustrativos · {selected.intent === 'amistad' ? 'Amistad' : 'Relación estable'}</p>
          <div className="radar-demo__result"><h3>{result.title}</h3><p>{result.reason}</p></div>
          <p><strong>Sin match en esta demostración.</strong> No calculamos una compatibilidad real ni emitimos un juicio sobre una persona. «OK LovIA» no se concede por aparecer en un mapa.</p>
          <span className="radar-demo__no-contact"><Heart size={17} aria-hidden="true" /> Las acciones de contacto no están disponibles para ejemplos.</span>
        </section>
      </div>

      <section className="radar-demo__examples" aria-labelledby="demo-examples-title"><h2 id="demo-examples-title">Elige otro ejemplo</h2><div className="radar-demo__list">{demoCandidates.map((candidate, index) => <button key={candidate.id} type="button" onClick={() => setSelectedId(candidate.id)} aria-pressed={candidate.id === selectedId}><span className="radar-demo__avatar" aria-hidden="true">E{index + 1}</span><span><strong>{candidate.label}</strong><small>Ficticio · {explainDemoCandidate(candidate, radius).title}</small></span><ArrowRight size={18} aria-hidden="true" /></button>)}</div></section>
      <section className="radar-demo__next"><h2>Conoce qué puedes hacer hoy</h2><p>La Guía, Mi Diario y Economía de la relación están disponibles para explorar. Los ejemplos de este mapa no se suman a los usuarios ni a las conexiones de LovIA.</p><div><Link className="btn btn-primary" to={isPublic ? '/register' : '/modules'}>{isPublic ? 'Explorar LovIA' : 'Abrir la Guía'} <ArrowRight size={17} aria-hidden="true" /></Link><button type="button" className="btn btn-secondary" onClick={() => void shareDemo()}><Share2 size={17} aria-hidden="true" /> Compartir demo</button></div>{shareMessage && <p role="status">{shareMessage}</p>}</section>
    </main>
  )
}
