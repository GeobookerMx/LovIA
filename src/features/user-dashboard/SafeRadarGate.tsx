import { Link } from 'react-router-dom'

/** Temporary safety gate until server-side approximate discovery passes staging tests. */
export default function SafeRadarGate() {
  return (
    <section className="radar-page flex-center" style={{ minHeight: '70vh', padding: '2rem', textAlign: 'center' }}>
      <div className="glass-strong" style={{ maxWidth: 440, padding: '2rem', borderRadius: 20 }}>
        <h1>Explorar con privacidad</h1>
        <p>Estamos preparando el mapa para mostrar zonas aproximadas y respetar tus bloqueos y preferencias de visibilidad.</p>
        <p>Por ahora puedes revisar tus conexiones disponibles sin compartir tu ubicación.</p>
        <Link className="btn btn-primary" to="/matches">Ver mis conexiones</Link>
      </div>
    </section>
  )
}
