// Public pages are generated as HTML for both people and crawlers, without Auth or API calls.
const origin = 'https://lovia.com.mx'
const reviewedOn = '2026-11-12'

export const publicPages = [
  {
    path: '/como-funciona', fileName: 'como-funciona.html', language: 'es-MX', alternate: '/en/how-it-works',
    title: 'Cómo funciona LovIA: guía, diario y conexiones',
    description: 'Qué puedes hacer en LovIA, cómo empezar y qué significa una conexión. Información para personas adultas en México y de habla hispana.',
    heading: 'Cómo funciona LovIA', type: 'WebPage',
    body: `<p class="intro">LovIA reúne actividades educativas sobre relaciones de pareja, un diario personal y conversaciones con conexiones disponibles. Está dirigida a personas de 18 años o más; la aplicación interactiva está en español.</p>
    <section><h2>¿Por dónde empiezo?</h2><ol><li>Crea una cuenta con correo, Google o Apple y revisa el aviso de privacidad.</li><li>Completa tu perfil y elige qué quieres explorar: conocerte, cuidar tu relación o conocer personas.</li><li>Prueba una actividad de la Guía o una pregunta para tu diario. Puedes omitir preguntas y avanzar a tu ritmo.</li></ol></section>
    <section><h2>¿Tengo que buscar pareja para usar LovIA?</h2><p>No. Puedes utilizar las actividades de comunicación, valores, límites y acuerdos aunque ya tengas pareja o prefieras reflexionar por tu cuenta.</p></section>
    <section><h2>¿Cómo se ven las conexiones y el mapa?</h2><p>La sección Conexiones muestra las conversaciones activas que el servidor autoriza para tu cuenta. No muestra un catálogo de todos los usuarios. El mapa de personas reales todavía no está habilitado y no se desbloquea al completar evaluaciones. Puedes <a href="/demo/mapa">explorar una demostración con cinco perfiles ficticios</a>, sin GPS, mensajes ni matches reales.</p><p>Crear una cuenta no garantiza recibir candidatos o un match. El descubrimiento por ubicación requiere controles adicionales de consentimiento, bloqueos y ubicación aproximada antes de estar disponible.</p></section>
    <section><h2>¿Qué es Economía de la relación?</h2><p>Es un recorrido opcional sobre dinero, cuidados, autonomía y metas compartidas. Incluye cuatro sesiones breves; no exige revelar tus ingresos ni califica tu valor como persona.</p><p><a href="/recursos/dinero-y-proyecto-de-vida">Lee la guía de dinero y proyecto de vida sin registrarte</a>.</p></section>
    <section><h2>¿LovIA es terapia o una prueba de compatibilidad?</h2><p>Las actividades son educativas. No sustituyen atención profesional, no emiten diagnósticos ni demuestran que dos personas sean compatibles. Los resultados deben interpretarse con contexto.</p></section>
    <section><h2>¿Puedo revisar mis opciones de privacidad y solicitar la baja?</h2><p>Consulta el <a href="/privacy">aviso de privacidad</a> y las <a href="/delete-account">instrucciones para solicitar eliminación de cuenta y datos</a>. Revisa el alcance de cada opción antes de compartir información personal.</p></section>
    <section><h2>LovIA en México y para otras comunidades</h2><p>Los recursos en español pueden servir a personas de México y de otras comunidades hispanohablantes. Las guías en inglés permiten conocer el proyecto; la interfaz interactiva continúa en español. La disponibilidad de las tiendas puede variar por país.</p><p><a href="https://play.google.com/store/apps/details?id=mx.lovia.app">Consultar LovIA en Google Play</a> · <a href="/recursos/">Explorar recursos educativos</a></p></section>`,
  },
  {
    path: '/en/how-it-works', fileName: 'en/how-it-works.html', language: 'en', alternate: '/como-funciona',
    title: 'How LovIA works: relationship tools and connections',
    description: 'Learn what LovIA offers, how to get started and how connections work. Educational resources for adults; the interactive app is in Spanish.',
    heading: 'How LovIA works', type: 'WebPage',
    body: `<p class="intro">LovIA brings together educational relationship activities, a personal journal and conversations with available connections. It is for adults 18 and older. The interactive app is currently in Spanish.</p>
    <section><h2>How do I get started?</h2><ol><li>Create an account with email, Google or Apple and review the privacy notice.</li><li>Complete your profile and choose what you want to explore: yourself, your relationship or meeting people.</li><li>Try a guide activity or a journal prompt. You can skip questions and move at your own pace.</li></ol></section>
    <section><h2>Do I have to be looking for a partner?</h2><p>No. You can explore communication, values, boundaries and agreements while in a relationship or when reflecting on your own.</p></section>
    <section><h2>How do connections and the map work?</h2><p>The Connections section shows active conversations authorized by the server for your account. It does not list every user. The map of real people is not enabled yet; completing assessments does not unlock it. A <a href="/demo/mapa">Spanish-language demo uses five clearly labeled fictional profiles</a>, without GPS, messages or real matches.</p><p>Creating an account does not guarantee candidates or a match. Location discovery needs additional consent, blocking and approximate-location controls before it becomes available.</p></section>
    <section><h2>What is the money and life plans module?</h2><p>It is an optional four-session exercise about money, care, autonomy and shared goals. It does not require you to disclose your income or rate your worth.</p><p><a href="/en/resources/money-and-life-plans">Read the money and life plans guide without an account</a>.</p></section>
    <section><h2>Is LovIA therapy or a compatibility test?</h2><p>The activities are educational. They do not replace professional care, diagnose conditions or prove that two people are compatible. Interpret results in context.</p></section>
    <section><h2>Where can I review privacy or request account deletion?</h2><p>Read the <a href="/privacy">privacy notice</a> and the <a href="/delete-account">account and data deletion instructions</a>, currently in Spanish. Review each setting before sharing personal information.</p></section>
    <section><h2>Mexico and international readers</h2><p>Spanish resources serve adults in Mexico and other Spanish-speaking communities. English guides introduce the project; they do not indicate that the full app is available in English. Store availability may differ by country.</p><p><a href="https://play.google.com/store/apps/details?id=mx.lovia.app">View LovIA on Google Play</a> · <a href="/en/resources/">Explore educational resources</a></p></section>`,
  },
  {
    path: '/recursos/', fileName: 'recursos/index.html', language: 'es-MX', alternate: '/en/resources/',
    title: 'Recursos para relaciones de pareja y acuerdos | LovIA',
    description: 'Guías educativas de LovIA sobre comunicación, límites, dinero y proyecto de vida. Lecturas abiertas para personas adultas en México y de habla hispana.',
    heading: 'Recursos para tus relaciones', type: 'CollectionPage',
    body: `<p class="intro">Lecturas abiertas para pensar en tus relaciones, con preguntas que puedes usar a solas o conversar con tu pareja. No necesitas crear una cuenta para leer estas páginas.</p>
    <section class="card"><h2>Dinero y proyecto de vida</h2><p>Cuatro preguntas para conversar sobre autonomía, aportaciones, gastos y metas compartidas. Incluye un ejemplo cotidiano y fuentes de contexto de México.</p><a class="button" href="/recursos/dinero-y-proyecto-de-vida">Leer la guía de economía de la relación</a></section>
    <section><h2>Comunicación: empieza por una situación concreta</h2><p>Elige un momento reciente que quieras comprender. Describe lo que ocurrió sin atribuir intenciones y explica qué necesitas. Después pregunta cómo lo vivió la otra persona.</p><ul><li>¿Qué observé y qué estoy suponiendo?</li><li>¿Qué petición concreta puedo hacer?</li><li>¿Cuándo podemos revisar este acuerdo?</li></ul></section>
    <section><h2>Límites y acuerdos</h2><p>Un límite expresa qué puedes aceptar y cómo cuidarás tus decisiones. Un acuerdo requiere que ambas personas puedan elegir sin presión. Tener intereses distintos no obliga a abandonar tus límites.</p><ul><li>¿Qué quiero decidir de forma individual?</li><li>¿Qué tema necesita una decisión compartida?</li><li>¿Cómo podremos cambiar de opinión y volver a conversar?</li></ul></section>
    <section><h2>Fuentes, autoría y alcance</h2><p>Edición: equipo de LovIA. Estas preguntas son propuestas educativas de reflexión; no son citas atribuidas a especialistas ni instrumentos clínicos validados. La guía económica enlaza las fuentes del INEGI que utiliza como contexto, sin afirmar su aval.</p><p><a href="/como-funciona">Conoce cómo funciona LovIA y sus límites</a>. Las actividades no sustituyen terapia ni asesoría financiera personalizada.</p></section>`,
  },
  {
    path: '/en/resources/', fileName: 'en/resources/index.html', language: 'en', alternate: '/recursos/',
    title: 'Relationship communication and shared-goal resources | LovIA',
    description: 'Open LovIA resources about communication, boundaries, money and life plans for adults. Read educational guides without creating an account.',
    heading: 'Resources for your relationships', type: 'CollectionPage',
    body: `<p class="intro">Open readings and questions you can reflect on alone or discuss with a partner. You do not need a LovIA account to read these pages.</p>
    <section class="card"><h2>Money and life plans</h2><p>Four questions about independence, contributions, expenses and shared goals, with an everyday example and links to context from Mexico.</p><a class="button" href="/en/resources/money-and-life-plans">Read the money and life plans guide</a></section>
    <section><h2>Communication: start with a specific situation</h2><p>Choose a recent moment you want to understand. Describe what happened without assigning intentions, explain what you need and ask how the other person experienced it.</p><ul><li>What did I observe, and what am I assuming?</li><li>What specific request could I make?</li><li>When can we review this agreement?</li></ul></section>
    <section><h2>Boundaries and agreements</h2><p>A boundary expresses what you can accept and how you will act on your decisions. An agreement requires both people to choose without pressure. Different interests do not require you to abandon your boundaries.</p><ul><li>What do I want to decide independently?</li><li>What needs a shared decision?</li><li>How can we change our minds and return to the conversation?</li></ul></section>
    <section><h2>Sources, authorship and scope</h2><p>Edited by the LovIA team. These reflection questions are educational suggestions, not quotations attributed to specialists or validated clinical instruments. The money guide links to INEGI sources as context and does not claim their endorsement.</p><p><a href="/en/how-it-works">Learn how LovIA works and what its limits are</a>. These activities do not replace therapy or personalized financial advice. The interactive app is currently in Spanish.</p></section>`,
  },
]

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export function renderPublicPage(page) {
  const english = page.language === 'en'
  const spanishPath = english ? page.alternate : page.path
  const englishPath = english ? page.path : page.alternate
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'LovIA', url: `${origin}/`, logo: `${origin}/icons/icon-512.png` },
      { '@type': page.type, '@id': `${origin}${page.path}#page`, url: `${origin}${page.path}`, name: page.title, description: page.description, inLanguage: page.language, dateModified: reviewedOn, publisher: { '@id': `${origin}/#organization` } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: english ? 'Home' : 'Inicio', item: `${origin}${english ? '/en/' : '/'}` },
        { '@type': 'ListItem', position: 2, name: page.heading, item: `${origin}${page.path}` },
      ] },
    ],
  }
  return `<!doctype html>
<html lang="${page.language}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}">
<meta name="robots" content="max-image-preview:large">
<link rel="canonical" href="${origin}${page.path}">
<link rel="alternate" hreflang="es-MX" href="${origin}${spanishPath}">
<link rel="alternate" hreflang="es" href="${origin}${spanishPath}">
<link rel="alternate" hreflang="en" href="${origin}${englishPath}">
<link rel="alternate" hreflang="x-default" href="${origin}${spanishPath}">
<meta property="og:type" content="website"><meta property="og:site_name" content="LovIA">
<meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}">
<meta property="og:url" content="${origin}${page.path}"><meta property="og:locale" content="${english ? 'en_US' : 'es_MX'}">
<meta property="og:image" content="${origin}/icons/icon-512.png"><meta property="og:image:alt" content="LovIA">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHtml(page.title)}">
<meta name="twitter:description" content="${escapeHtml(page.description)}"><meta name="twitter:image" content="${origin}/icons/icon-512.png">
<meta name="theme-color" content="#0E0B2A"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/public-guides.css">
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>
</head><body>
<a class="skip" href="#content">${english ? 'Skip to content' : 'Ir al contenido'}</a>
<header><a class="brand" href="${english ? '/en/' : '/'}">LovIA!</a><nav aria-label="${english ? 'Public resources' : 'Recursos públicos'}"><a href="${english ? '/en/how-it-works' : '/como-funciona'}">${english ? 'How it works' : 'Cómo funciona'}</a><a href="${english ? '/en/resources/' : '/recursos/'}">${english ? 'Resources' : 'Recursos'}</a><a href="${page.alternate}" lang="${english ? 'es' : 'en'}">${english ? 'Español' : 'English'}</a></nav></header>
<main id="content"><p class="eyebrow">${english ? 'Educational resources · Adults 18+' : 'Recursos educativos · Mayores de 18 años'}</p><h1>${page.heading}</h1>${page.body}<p class="reviewed">${english ? 'LovIA editorial team · Reviewed November 12, 2026' : 'Equipo editorial de LovIA · Revisado el 12 de noviembre de 2026'}</p><a class="button" href="/register">${english ? 'Explore the app in Spanish' : 'Explorar la aplicación'}</a></main>
<footer><a href="/privacy">${english ? 'Privacy (Spanish)' : 'Privacidad'}</a> · <a href="/delete-account">${english ? 'Account deletion (Spanish)' : 'Eliminar cuenta'}</a> · <a href="mailto:clienteslovia@gmail.com">${english ? 'Contact LovIA' : 'Contactar con LovIA'}</a></footer>
</body></html>`
}

export function publicPagesPlugin() {
  return {
    name: 'lovia-public-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
        const page = publicPages.find(item => item.path === pathname || `/${item.fileName}` === pathname)
        if (!page) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(renderPublicPage(page))
      })
    },
    generateBundle() {
      for (const page of publicPages) this.emitFile({ type: 'asset', fileName: page.fileName, source: renderPublicPage(page) })
    },
  }
}
