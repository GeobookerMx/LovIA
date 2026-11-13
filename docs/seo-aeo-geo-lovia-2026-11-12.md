# LovIA: SEO y visibilidad en buscadores con IA

> Estado de publicación posterior: [registro del 13 de noviembre](release-web-2026-11-13.md). Este documento conserva la preparación inicial del día 12.

Fecha: 12 de noviembre de 2026, Ciudad de México.

Se interpreta «AGEO» como AEO/GEO: facilitar que buscadores y sistemas de respuesta puedan encontrar, entender y citar contenido útil de LovIA. Esta interpretación no equivale a geolocalizar usuarios ni a publicar sus perfiles.

## Implementado localmente

- Corregidos título, descripción, idioma `es-MX` y caracteres dañados de los datos estructurados de la portada.
- Identidad consistente mediante `Organization`, `WebSite` y `WebApplication`, sin valoraciones, resultados clínicos o avales inventados.
- Alternativas recíprocas `es-MX`, `es`, `en` y `x-default` en las páginas bilingües. El español general permite dirigir la misma versión a otras comunidades hispanohablantes sin inventar páginas por ciudad.
- Cuatro páginas HTML públicas generadas desde una plantilla compartida: `/como-funciona`, `/en/how-it-works`, `/recursos/` y `/en/resources/`. No dependen de una sesión, consultas a Supabase ni JavaScript del cliente para mostrar su contenido.
- Preguntas y respuestas sobre el producto, explicación real de las limitaciones del radar y enlaces a recursos, privacidad y eliminación. La versión inglesa declara que la aplicación interactiva continúa en español.
- Autoría editorial, fecha real de revisión y datos `Article` en las guías de dinero en español e inglés; no se presenta a INEGI como aval del producto.
- Enlaces de descubrimiento desde la portada React, la portada inglesa y las guías. Enlaces canónicos en privacidad y eliminación de cuenta.
- Sitemap con 10 URLs públicas, sin perfiles, conversaciones, API ni datos de cuentas; fechas actualizadas solo en páginas modificadas.
- Cabeceras `X-Robots-Tag: noindex` para login, registro y recuperación. Se permite rastrear esas tres pantallas públicas para que el buscador lea la instrucción; autenticación y RLS siguen siendo los controles de datos, independientemente de robots.
- Pruebas de URLs canónicas, idiomas recíprocos, JSON-LD, rutas de despliegue y enlaces de las páginas generadas (`npm run test:seo`).

Las páginas nuevas se emiten solo en el build **web** mediante `scripts/public-pages.mjs`; la app nativa conserva su proceso de build. El CSS público es compartido y los textos se mantienen en una sola plantilla bilingüe. No se agregó una biblioteca de SEO ni una herramienta de analítica externa.

La portada React conserva renderizado de cliente. Se añadió un resumen `noscript` con enlaces públicos, pero esto no es prerenderizado completo de la portada. Los recursos nuevos sí se entregan como HTML completo. La siguiente mejora de rendimiento de portada debe considerar prerenderizado real sin modificar el flujo autenticado ni el router nativo. [Google: JavaScript y renderizado](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Dominio y alcance territorial

Se comprobó mediante HTTP que `https://lovia.com.mx/` responde 200 y `https://www.lovia.com.mx/` redirige con 301 al dominio sin www. Se conservó ese destino en canonical y sitemap. No se cambió el dominio.

México es el foco explícito de `es-MX` y de los ejemplos pertinentes. La variante `es` cubre el mismo contenido en español para otras comunidades, y las páginas inglesas aportan contenido traducido real. No se añadió una red de páginas repetidas de ciudades o países ni se simuló una dirección física para obtener resultados locales. La terminación mexicana del dominio sigue siendo una señal regional; ampliar idiomas no convierte la app en un servicio operativo en todos los países. [Guía multirregional de Google](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [alternativas de idioma](https://developers.google.com/search/docs/specialty/international/localized-versions).

## AEO/GEO con contenido verificable

La implementación prioriza explicaciones breves que responden dudas reales, autoría visible, fuentes primarias, enlaces internos y HTML accesible. Google indica que sus funciones de IA usan las bases habituales de SEO y no necesitan un schema especial. No se prometen citas o posiciones garantizadas ni se añade un archivo «mágico» para conseguirlas. [Google: funciones de IA](https://developers.google.com/search/docs/appearance/ai-features).

Bing también relaciona las buenas prácticas SEO con la visibilidad en Copilot y sus respuestas fundamentadas. IndexNow puede avisar de cambios publicados; no sustituye las comprobaciones de calidad, el sitemap ni el control de acceso. No se enviaron URLs nuevas porque todavía no se han desplegado. [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a).

## Comprobación posterior al despliegue

1. Confirmar en Netlify el commit realmente publicado y abrir las cuatro páginas nuevas por su URL limpia. Comprobar 200, contenido HTML y canonical; una respuesta 200 que solo devuelve la SPA no es suficiente.
2. Comprobar sitemap y robots en producción, la redirección www y los enlaces entre idiomas; validar los datos estructurados y revisar duplicados `.html` mediante canonical.
3. En Google Search Console, usar la propiedad de dominio verificada, enviar `https://lovia.com.mx/sitemap.xml` e inspeccionar portada y páginas nuevas. No hay acceso confirmado a esa propiedad desde esta sesión, por lo que no se ha enviado ni solicitado indexación.
4. Registrar/verificar Bing Webmaster Tools y enviar el mismo sitemap. Evaluar IndexNow después de publicar y verificar su clave pública; no enviar rutas privadas ni datos de usuarios.
5. Revisar por país (México y otros), idioma, consulta y página: impresiones, clics, posiciones y acciones de registro. Medir rendimiento móvil real y errores de cobertura. No se han medido Core Web Vitals en campo ni se ha ejecutado Lighthouse en un dispositivo durante esta revisión.
6. Preparar fichas de App Store y Google Play coherentes con las funciones disponibles. SEO web, visibilidad en IA y búsqueda de tiendas son canales distintos; optimizar uno no prueba el estado del otro.

## Próxima línea editorial

Publicar contenido útil y revisado por intención: cómo iniciar conversaciones sobre dinero, límites, expectativas y cuidados. Cada página debe resolver una duda concreta con ejemplos, autoría y fuentes pertinentes, y llevar a una función realmente disponible. Las citas deben identificarse y verificarse; no atribuir preguntas originales a especialistas ni inventar estadísticas.

Para inglés, mantener traducciones completas y revisadas, no solo encabezados. Añadir otros países o idiomas únicamente con contenido diferenciado y capacidad real de atenderlos. Antes de ampliar tráfico, cerrar los hallazgos de privacidad y cuenta descritos en [la revisión previa al build](revision-prebuild-experiencia-seguridad-2026-11-12.md).

## Límites de esta entrega

Verificación local: TypeScript y las seis pruebas SEO pasan. La suite ampliada incluye 29 pruebas. El build web emite las cuatro páginas HTML, presentes también en la precarga de la PWA. El build nativo compila con el generador web deshabilitado. Se comprobó visualmente la demo del mapa en navegador a tamaño móvil, no en dispositivos físicos; no se realizó una auditoría visual completa de las páginas SEO.

Los cambios están preparados en el workspace. No se ha hecho commit, push, despliegue en Netlify ni envío a Google/Bing de estas modificaciones. Los informes de la otra conversación no se usan como confirmación de esos actos. La indexación y las menciones en IA se comprueban después de publicar, no por el resultado del compilador.
