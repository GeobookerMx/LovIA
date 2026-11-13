# Publicación web/PWA de LovIA: 13 de noviembre de 2026

## Diagnóstico

Netlify confirmó sitio `elaborate-pavlova-7ebdc9`, dominio `lovia.com.mx`, repositorio correcto `GeobookerMx/LovIA`, rama `main`. El antecedente del repositorio equivocado ya no está vigente. Al iniciar se publicaba el deploy `6af67d4821005906fc72aebf`, commit `2d5d9280c43237cfe7b17d469f05af68ed771b45`, asset `/assets/index-DWuq-xZX.js`. Las mejoras del día 12 estaban sin commit ni push: la petición HTTP sin caché del navegador también recibía el paquete antiguo.

## Incluido

- Mapa demo con cinco perfiles claramente ficticios, corazones, filtros ilustrativos y sin GPS, mensajes, compatibilidad inventada o conteos falsos.
- Navegación estable, correcciones móviles, retirada del SOS y lugares falsamente verificados, carga/reintento de finanzas, solicitudes de baja con seguimiento y cola admin.
- Fotos públicas identificadas como tales; sin promesas de ocultamiento. MIME/tamaño restringidos y limpieza de avatar anterior limitada al propietario y proyecto.
- Registro de consentimiento con fecha del servidor, elección opcional separada, consulta y revocación. No se fabrican aceptaciones desde metadata o cuentas previas. La versión nueva respeta esa elección en sus formularios.
- HTML educativo público en español/inglés, canonical, idiomas, sitemap y datos estructurados. Sin promesas de indexación o posiciones garantizadas.
- `build-info.json` sin caché y versión identificable en Configuración; detección de actualizaciones al recuperar conexión/foco y periódicamente, sin recargar automáticamente un formulario.

## Supabase aplicado y verificado

- `20261113135116_lovia_privacidad_finanzas_y_ubicacion`: clientes sin acceso a la vista financiera; `security_invoker=true`; retirada lectura admin de respuestas completas; lugares sin coordenadas; avatar JPEG/PNG/WebP y 5 MB; solicitudes de baja con RLS.
- `20261113141715_lovia_consentimiento_registrado`: tablas nuevas `legal_acceptances` y `legal_acceptance_events`, RLS propio y RPC autenticadas de registro/revocación. Sin edición de evidencia por clientes ni cambios a escrituras de tablas existentes. Cero aceptaciones fabricadas.

No se ejecutó el historial antiguo no reconciliado ni se borraron cuentas, respuestas o archivos reales. Los nombres locales se alinean con las versiones remotas asignadas por MCP.

## Activación estricta pendiente

La revisión automática rechazó añadir restricciones de consentimiento a seis tablas antes de publicar el nuevo formulario: con cero aceptaciones, bloquearía las escrituras de clientes existentes. Se adoptó la alternativa de crear infraestructura nueva sin alterar esas escrituras.

La activación estricta **no está desplegada**: `docs/proposals/consent-sensitive-write-enforcement.sql` requiere revisar adopción, transición de clientes antiguos, impacto y aprobación. Sus pruebas son aisladas. No afirmar que la revocación impide hoy toda escritura desde clientes antiguos o llamadas directas.

## Validación

- 39 pruebas automatizadas de permisos, consentimiento/retirada, versión, avatar propio, SEO, entorno y pruebas previas.
- Edge con cuenta ficticia y solicitudes Supabase interceptadas: aceptación, rechazo opcional, autorización, revocación, diario sin nuevas escrituras y baja pendiente sin cerrar sesión. Ninguna escritura real de prueba.
- Dos paquetes PWA locales: worker nuevo detectado, borrador conservado antes y después de «Más tarde», recarga solo con «Actualizar» e identificador instalado coincidente con el paquete nuevo.
- TypeScript/lint enfocado correctos; lint global con deuda previa. Dependencias: 0 alertas de producción; 16 de desarrollo (14 moderadas, 2 bajas), sin altas/críticas.
- Contenido Capacitor compilado sin Service Worker; no equivale a Archive/IPA/AAB firmado.

## Pendientes móviles y operativos

Borrado completo/Storage/referencias/sesiones/Apple y atención de solicitudes; entrega autorizada para fotos privadas; activación gradual de restricciones; pruebas reales de proveedores/TestFlight/Play y artefactos firmados. Facebook no está implementado. Descubrimiento real desactivado.

## Resultado

- Commit publicado: `cbd042ff29bad61f2012a62f005699f69ff52ee5` (incluye implementación `69eccfc`). Enviado a `GeobookerMx/LovIA/main` y desplegado automáticamente por Netlify.
- Deploy `6af71cffd101fb7888f9547a`, estado `ready`, publicado el 13 de noviembre a las 08:22 de Ciudad de México (`2026-11-13T14:22:20.978Z`). Fuente correcta, sin bloqueo de publicación.
- Identificador público: `web-20261113T142213379Z-cbd042ff`. `https://lovia.com.mx/build-info.json` devuelve HTTP 200, JSON, `sourceDirty=false`, commit coincidente y `Cache-Control: no-store,max-age=0`.
- HTTP 200 confirmado para portada, demo y las cuatro páginas educativas nuevas. `/demo/mapa` devuelve `X-Robots-Tag: noindex`; las guías devuelven HTML con sus encabezados propios.
- Navegador nuevo sobre **producción**: cinco marcadores ficticios; selección del quinto ejemplo y cambio de radio funcionales; sin desbordamiento a 320, 390, 768 y 1280 px. Sin sesión ni escritura de datos reales.
- APIs reales comprobadas sin autenticación: vista financiera, evidencia de consentimiento y RPC de baja/consentimiento deniegan acceso (`42501`, HTTP 401). El advisor ya no informa el error de vista `SECURITY DEFINER`; continúan los avisos clasificados previos.
- Las aplicaciones ya instaladas necesitan aceptar el aviso de actualización: guardar borradores, cerrar y reabrir la PWA y pulsar «Actualizar» cuando aparezca. La versión instalada se consulta en Perfil → Configuración.

Este registro de evidencia se actualizó localmente después del despliegue; no se genera otro build por una nota documental. Las carpetas personales de imágenes, libro y capturas permanecen fuera de los commits.

## Ajuste posterior solicitado: mapa, Navidad y autores

El cintillo y el acceso público explican que los perfiles ficticios permiten probar la funcionalidad. Se recuperan adornos navideños en los cinco accesos inferiores, con nombres estables, y una etiqueta compacta de temporada en el mapa. Vigencia automática: 12/11/2026–06/01/2027, hora de Ciudad de México.

Inicio y portada muestran fragmentos breves de Carl Gustav Jung y Erich Fromm, con obra/referencia y traducción identificadas. Atribuciones contrastadas con [la Biblioteca Municipal de Lyon](https://www.guichetdusavoir.org/question/voir/48508) y [el texto de Rainer Funk en la Sociedad Internacional Erich Fromm](https://fromm-online.org/wp-content/uploads/FUNK/Funk_R_1995c.pdf).

Validación: build web, lint enfocado y tres pruebas de calendario correctos. Navegador con datos ficticios y solicitudes interceptadas: dos fichas de autores en `/home` y `/`, cinco distintivos de barra y la indicación de prueba/temporada del mapa; sin desbordamiento en 320, 390 y 1280 px. Sin cambios de backend.
