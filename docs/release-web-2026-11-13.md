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

El commit, deploy e identificación pública se añaden después de verificar la publicación. Un build local no acredita despliegue.
