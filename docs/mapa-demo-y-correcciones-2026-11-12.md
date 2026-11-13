# Mapa de demostración y correcciones de LovIA

> Estado actualizado: [registro del 13 de noviembre](release-web-2026-11-13.md). Este documento conserva el estado local de la revisión del día 12.

Fecha: 12 de noviembre de 2026, Ciudad de México. Cambios locales sobre `main`, base `2d5d928`. Sin commit, push ni publicación.

## Comportamiento del mapa

- Cinco perfiles y zonas ficticios en `/demo/mapa` sin login y en `/radar` dentro de la cuenta. Cada marcador y ficha se identifica como DEMO o ficticio.
- Corazones E1–E5, sin fotos de terceros, coordenadas geográficas, permisos GPS ni consultas a perfiles reales.
- Radio ilustrativo de 5, 10 o 20 km. Explica distancia, objetivos, edad, preferencias recíprocas y ausencia de interés mutuo. Pasar filtros no crea un match ni concede «OK LovIA».
- No se insertan candidatos en Supabase, no hay contacto ni porcentajes inventados de compatibilidad y no se cuentan los ejemplos como usuarios o actividad.
- Acceso desde portada y navegación, con enlace compartible. La demo ayuda a explicar el producto; **no crea tráfico por sí misma**. Medir visitantes reales y consentimiento cuando corresponda.
- `noindex` para la demo en Netlify, fuera del sitemap. El descubrimiento real y `run-matching` siguen inhabilitados.

## Seguridad y experiencia

1. **Encuentros:** retirados el SOS que simulaba enviar SMS/ubicación y los lugares, notas y patrocinios ficticios presentados como verificados. Se conserva una lista con casillas accesibles y orientación informativa sin prometer respuesta de emergencia.
2. **Finanzas:** lectura filtrada por propietario, carga/error/reintento y bloqueo de edición mientras se recuperan respuestas. Cambiar de identidad desmonta el estado privado. El error de red al consultar el interruptor tampoco se presenta como ausencia de respuestas.
3. **Permisos:** migración que retira lectura de respuestas ajenas por admin, revoca la vista heredada y activa `security_invoker`. El dashboard actual no consume esa vista; no se crea otro acceso a contenido íntimo.
4. **Ubicación:** la migración convierte `suggest_safe_venue` en respuesta nula con privilegios del invocador. No lee coordenadas ni entrega puntos medios reversibles o certificaciones inventadas.
5. **Fotos:** retirado el selector que prometía ocultar archivos públicos; se informa la limitación. Al reemplazar una foto se intenta retirar únicamente el archivo anterior del mismo propietario y proyecto; el fallo se comunica. La migración limita nuevas cargas de `avatars` a JPEG/PNG/WebP y 5 MB, sin modificar objetos existentes ni otros buckets. **El bucket continúa público**; falta la entrega autorizada para ofrecer fotos ocultas.
6. **Baja:** solicitud persistente con confirmación `ELIMINAR`, autorización propia y reintentos idempotentes. Seguimiento en Configuración y cola de lectura para admin. Operación privilegiada en `lovia_private` y wrapper público invocador. La Edge Function heredada ahora registra una solicitud HTTP 202 con `deleted: false`; no contiene un cliente de servicio ni borrado improvisado. La app usa la RPC directamente, sin necesitar desplegar esa función.
7. **Navegación:** nombres estables y «Mapa demo». Sin banner de campaña en el mapa. Marcadores/botones de al menos 44 px, lista alternativa, etiquetas y foco visibles.

## Verificación y límites

- `npm run build:native` y `npm run build` pasan. El contenido para Capacitor no incluye Service Worker; la PWA sí, junto con las páginas públicas generadas. `verify:env` pasa. Esto no equivale a un Archive de Xcode ni a un AAB firmado.
- Suite ampliada: 29 pruebas; permisos SQL con roles sobre PostgreSQL desechable, ejemplos de mapa, recibos de baja, propiedad de avatares, pruebas previas y SEO.
- PGlite usa PostgreSQL 18 y datos inventados sobre un esquema mínimo. No necesita Docker/dump y no sustituye la integración completa Supabase/Auth/Storage ni la versión del servidor de destino.
- Edge headless a 390 × 844: cinco marcadores, selección del quinto ejemplo y cambio de 10 a 5 km. Se corrigió el desbordamiento; ancho final del documento: 390 px. No es prueba en iPhone físico ni auditoría de accesibilidad completa.
- También se comprobaron anchos de 320, 768 y 1280 px sin desbordamiento. Lint enfocado de los archivos corregidos pasa; lint global conserva 41 errores y 1 aviso heredados. Sharp convierte una imagen en memoria correctamente tras actualizarse.
- Auditoría npm completa: 44 alertas iniciales; después de actualizaciones compatibles y de Capacitor Assets 4 / Sharp 0.35.5 quedan 16 de desarrollo (2 bajas, 14 moderadas). `npm audit --omit=dev`: 0. Capacitor core, CLI, iOS y Android alineados en 8.6.2.
- Sin `npm audit fix --force` ni overrides de mayores incompatibles para ocultar avisos. Quedan dependencias transitivas de `minimatch`, `glob`, `deepmerge` y `uuid` en lint/PWA/assets. Revisar actualizaciones upstream.

Referencias: [Capacitor Assets](https://github.com/ionic-team/capacitor-assets/releases), [Sharp](https://github.com/lovell/sharp/releases), [aviso de minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249).

## Publicación y pendientes

1. Revisar/aplicar **solo** `supabase/migrations/20261113135116_lovia_privacidad_finanzas_y_ubicacion.sql` en el entorno adecuado y verificar permisos/advisors. El historial remoto no está reconciliado: no ejecutar automáticamente las migraciones históricas pendientes. **La migración nueva aún no está aplicada en producción.**
2. Publicar primero backend verificado y después frontend. La pantalla de solicitudes depende de la migración; si falta, informa el error y ofrece soporte sin fingir registro ni borrado.
3. Completar y probar el borrado de una cuenta con archivos y referencias, revocación de sesiones/Apple, retención aplicable y atención operativa de la cola. Registrar solicitudes **no prueba por sí solo el cumplimiento de las tiendas**. Véase [el procedimiento de baja](delete-account-status.md).
4. Cerrar consentimiento y fotos privadas, probar correo/Google/Apple en dispositivos. Facebook no está implementado.
5. Publicar web y comprobar rutas/encabezados. Generar nuevos artefactos firmados, probar TestFlight/prueba interna y revisar fichas. No se generó ni envió un Archive/IPA/AAB nuevo.

Vista local: `npm run dev -- --mode production --host 127.0.0.1`, ruta `/demo/mapa`. Ese modo usa la configuración existente de producción; la demo no consulta ni escribe candidatos. Prueba SQL aislada: `npm run test:privacy`.

## Punto de continuidad para mañana

El usuario pidió conocer lo pendiente para descansar. Código y documentación guardados localmente; 29 pruebas pasan, builds web y contenido Capacitor pasan y lint enfocado pasa. No hay commit, push, cambio de producción ni publicación. Retomar desde Publicación y pendientes, sin volver a instalar pg_dump ni crear otra rama de pago por defecto. No sobrescribir el directorio `ios/` existente en la iMac. Permanecen por resolver las 16 alertas de herramientas, los 41 errores y 1 aviso del lint global, privacidad de fotos, consentimiento, borrado completo/Apple y pruebas reales de login y tiendas.
