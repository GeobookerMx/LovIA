import { ArrowRight, BookOpen, MessageCircle, Search, SlidersHorizontal } from 'lucide-react'

const steps = [
  { label: 'Conócete', detail: 'Nombra lo que valoras y necesitas.', icon: Search },
  { label: 'Define qué buscas', detail: 'Expresa tu intención con claridad.', icon: SlidersHorizontal },
  { label: 'Conversa', detail: 'Pregunta, escucha y respeta límites.', icon: MessageCircle },
  { label: 'Elige y revisa acuerdos', detail: 'Decide a tu ritmo y vuelve a conversar.', icon: BookOpen },
]

const useData = [
  { age: '18–29 años', ever: 51, current: 10 },
  { age: '30–49 años', ever: 53, current: 8 },
]

export default function RelationshipsContext() {
  return (
    <section className="landing__context" aria-labelledby="landing-context-title">
      <div className="landing__context-heading">
        <span className="landing__context-kicker">Relaciones en contexto</span>
        <h2 id="landing-context-title">Datos para pensar, ideas para conversar</h2>
        <p>Las cifras describen poblaciones concretas. No miden tu valor ni demuestran que LovIA mejore una relación.</p>
      </div>

      <div className="landing__context-grid">
        <article className="landing__context-card glass">
          <h3>Tu siguiente conexión en cuatro pasos</h3>
          <p>Ruta editorial de LovIA para reflexionar; no es una prueba psicológica validada.</p>
          <ol className="landing__steps">
            {steps.map(({ label, detail, icon: Icon }) => (
              <li key={label}>
                <span className="landing__step-icon" aria-hidden="true"><Icon size={20} /></span>
                <div><strong>{label}</strong><small>{detail}</small></div>
                <ArrowRight size={17} aria-hidden="true" />
              </li>
            ))}
          </ol>
        </article>

        <article className="landing__context-card glass">
          <h3>Usar alguna vez no es usar actualmente</h3>
          <p>Personas adultas en Estados Unidos, encuesta de enero de 2026. Eje común: 0–100%.</p>
          <div className="landing__chart-legend"><span><i className="landing__swatch landing__swatch--ever" /> Usó alguna vez</span><span><i className="landing__swatch landing__swatch--current" /> Usa actualmente</span></div>
          <div className="landing__bar-chart" role="img" aria-label="Estados Unidos, enero de 2026: 18 a 29 años, 51 por ciento usó citas digitales alguna vez y 10 por ciento las usa actualmente; 30 a 49 años, 53 y 8 por ciento respectivamente.">
            {useData.map(({ age, ever, current }) => (
              <div className="landing__bar-group" key={age}>
                <strong>{age}</strong>
                <div className="landing__bar-track"><span className="landing__bar landing__bar--ever" style={{ width: `${ever}%` }} /><b>{ever}%</b></div>
                <div className="landing__bar-track"><span className="landing__bar landing__bar--current" style={{ width: `${current}%` }} /><b>{current}%</b></div>
              </div>
            ))}
            <div className="landing__chart-axis"><span>0%</span><span>50%</span><span>100%</span></div>
          </div>
          <table className="landing__data-table">
            <caption>Datos de la infografía</caption>
            <thead><tr><th>Edad</th><th>Alguna vez</th><th>Actualmente</th></tr></thead>
            <tbody>{useData.map(({ age, ever, current }) => <tr key={age}><th>{age}</th><td>{ever}%</td><td>{current}%</td></tr>)}</tbody>
          </table>
          <p className="landing__source">Fuente: <a href="https://ssrs.com/insights/online-dating-2026/" target="_blank" rel="noopener noreferrer">SSRS, The Public and Online Dating 2026; metodología y muestra</a>. Muestra: 2,012 personas de 18 años o más en EE. UU.</p>
        </article>
      </div>

      <aside className="landing__context-note glass">
        <strong>68.7% de las personas de 15 a 29 años en México estaban solteras en 2023.</strong>
        <p>INEGI, ENADID 2023; comunicado de 2025. Incluye menores de edad. Estar soltero no significa buscar pareja y este dato no define a quién se dirige LovIA.</p>
        <a href="https://www.inegi.org.mx/contenidos/saladeprensa/aproposito/2025/EAP_AmoryAmistad25.pdf" target="_blank" rel="noopener noreferrer">Ver fuente y metodología de INEGI</a>
      </aside>
    </section>
  )
}
