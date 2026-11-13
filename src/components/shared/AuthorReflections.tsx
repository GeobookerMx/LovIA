import './AuthorReflections.css'

const reflections = [
  {
    author: 'Carl Gustav Jung',
    quote: 'Quien mira hacia afuera, sueña; quien mira hacia adentro, despierta.',
    work: 'Carta a Fanny Bowditch, 22 de octubre de 1916. Cartas, vol. 1, p. 33.',
    source: 'https://www.guichetdusavoir.org/question/voir/48508',
    sourceLabel: 'Referencia bibliográfica · Biblioteca Municipal de Lyon',
  },
  {
    author: 'Erich Fromm',
    quote: 'El amor es una actividad, no un afecto pasivo.',
    work: 'El arte de amar (1956). Fragmento citado por Rainer Funk.',
    source: 'https://fromm-online.org/wp-content/uploads/FUNK/Funk_R_1995c.pdf',
    sourceLabel: 'Referencia de la Sociedad Internacional Erich Fromm · PDF',
  },
]

export default function AuthorReflections() {
  return <section className="author-reflections" aria-label="Frases para reflexionar">
    <header><p className="author-reflections__eyebrow">Una pausa para ti</p><h2>Ideas para conocerte y cuidar tus vínculos</h2></header>
    <div className="author-reflections__grid">{reflections.map(item => <figure key={item.author} className="author-reflections__card">
      <blockquote cite={item.source}>«{item.quote}»</blockquote>
      <figcaption><strong>{item.author}</strong><cite>{item.work}</cite><small>Traducción de LovIA del fragmento citado.</small><a href={item.source} target="_blank" rel="noopener noreferrer">{item.sourceLabel}<span className="sr-only"> (abre otra pestaña)</span></a></figcaption>
    </figure>)}</div>
  </section>
}
