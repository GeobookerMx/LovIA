# LovIA: fase 1, resguardo y entornos (19 octubre 2026)

## Base y recuperación

- Carpeta y raíz Git: `C:\Users\juanpablo\APP PAREJAS`.
- Repositorio `origin`: `GeobookerMx/LovIA`; GitHub confirmó que `main` sigue en `622adbb218835b1392f2698b136c9be9549ac836` (0 commits de diferencia). El remoto llamado `netlify` apunta a otro repositorio y no se ha usado.
- Rama local: `feature/lovia-seguridad-y-entornos`, creada desde ese commit con los cambios preexistentes intactos. Ningún commit ni push.
- Antes de editar se copiaron los 15 archivos modificados y 4 nuevos a `.local-resguardos/fase1-20261019-093121/`. Contiene `manifest.json` con SHA-256 y `initial-working-tree.patch`; 19 hashes comprobados. La carpeta está ignorada por Git. No contiene `.env` ni archivos de firma.
- El trabajo previo de Apple Sign In, cámara, perfiles, módulos, progreso, mapa y analítica se conserva. Los cambios de esta fase son adicionales y se deben revisar por archivo antes de hacer un commit selectivo.

## Entornos y conexiones

| Entorno | Código, build y variables | Supabase | Netlify y servicios | Estado |
| --- | --- | --- | --- | --- |
| Local actual | Rama de fase 1; `.env` sigue con referencia reservada de producción, sin `VITE_APP_ENV` ni referencia esperada | `nbpidjpkanwynlhdxowx` en archivo local | No se inició la app | **Bloqueado a propósito** por validación; falta proyecto ficticio |
| Staging | `npm run build:staging` o `build:native:staging`, modo `staging`; `.env.staging.local` o variables de contexto | Referencia nueva, distinta de producción, aún no disponible | Sitio de staging / Deploy Preview, dominio, OAuth, correo, pagos, push y funciones pendientes | **Pendiente**; no hay recursos creados |
| Producción web | `npm run build`, modo `production`; `.env.production` local apunta a referencia reservada, pero carece de `VITE_APP_ENV` y referencia esperada | Referencia local `nbpidjpkanwynlhdxowx`; proyecto activo no confirmado por consola | `.netlify/state.json` tiene site ID `68efa1d5-8ec7-46d9-8706-0f8e78d3d735`; dominio, branch, commit desplegado, contextos y variables sin verificar | **Parcial**, no se hizo build ni deploy |
| Android | Recursos empaquetados bajo `android/app/src/main/assets/public`; `applicationId=mx.lovia.app`; `build:native` usa modo production por defecto | El recurso empaquetado existente requiere inspección de referencia sin revelar claves | OAuth/deep link, push, pagos y pruebas en dispositivo pendientes | **Pendiente**; no se sincronizó |
| iOS | `capacitor.config.ts` declara `com.geobooker.lovia`; no hay carpeta `ios` ni historial de `ios` en las referencias Git locales | Build nativo de pruebas requiere modo staging y proyecto separado | Requiere Mac, Xcode, identidad, OAuth y prueba; no se regeneró | **Pendiente** |

### Configuración local aplicada

- `src/lib/environment.ts`, `src/lib/supabase.ts` y `vite.config.ts`: referencia, modo y clave pública obligatorios; no hay URL/clave de respaldo. Desarrollo y staging rechazan la referencia de producción. Preview/branch deploy rechazan modo production. `VITE_DEV_BYPASS=true` y claves privilegiadas expuestas bajo `VITE_` se rechazan.
- `package.json` y `netlify.toml`: comandos explícitos de staging y previews configurados para ese modo. Una preview heredando variables de producción fallará hasta separar su contexto.
- `.env.example` y `.env.staging.example`: plantillas sin credenciales. El archivo real `.env` no se alteró ni copió. El badge visual de pruebas en `src/App.tsx` sólo indica contexto; la barrera real está en la validación del build y debe completarse con permisos del servidor.
- `scripts/verify-env.cjs` ya exige una referencia esperada en vez de dar por correcto el proyecto de producción. No se ejecutó contra un artefacto antiguo.

## Seguridad: alcance de lo confirmado

| Hallazgo | Estado | Tratamiento y pendiente |
| --- | --- | --- |
| Respaldo de Supabase embebido en cliente | Confirmado en código anterior | Retirado localmente; test de configuración sin fallback. Falta build de staging real y prueba en dispositivo. |
| Logs de URL OAuth, respuesta Apple, sesión y ruta local de selfie | Confirmado en código anterior | Eliminados o reducidos a mensajes sin datos; flujo de autenticación se conserva. Falta prueba nativa de OAuth. |
| Credenciales literales en `setup_reviewer.cjs` y `fix_demo.cjs` | Confirmado en archivos, validez real desconocida | Sustituidas por variables explícitas para proyecto ficticio y barrera contra referencia de producción. Si fueran credenciales vigentes, la rotación por canal seguro sigue pendiente. Eliminar el texto local no borra historia ni invalida una contraseña. |
| `set_admin_role(uuid)` con `SECURITY DEFINER` sin control visible | Sólo artefacto SQL local confirmado; despliegue desconocido | `SEGURIDAD_FIX_URGENTE.sql` quedó archivado como comentario. La consulta de metadatos está preparada. No se declara vulnerabilidad activa ni reparación remota. |
| Webhook HTTP y payload completo de `auth.users` | Sólo artefacto SQL local confirmado; actividad remota desconocida | `WEBHOOK_SQL.sql` quedó archivado como comentario. Antes de una migración se requieren destino HTTPS autenticado, datos mínimos, idempotencia y revisión de trigger/cron real. |
| RLS de perfiles, especialistas, bloques y otras tablas | Sin comprobar en base real | `RLS_FIX_3_TABLAS.sql` y `supabase_schema_base.sql` no se ejecutaron. Revisar todas las políticas, grants y firmas, incluida la discrepancia `specialists.user_id`/`owner_id`; probar A/B/anon en staging. Las políticas permisivas se combinan por OR. |
| Analítica con URL de selfie y errores completos; SQL permitía INSERT con `WITH CHECK (true)` | Confirmado en código/SQL local previo, aplicación remota desconocida | Propiedades descartadas, logs eliminados y opt-in local desactivado por defecto; evento anónimo desactivado. `analytics_events_schema.sql` es un borrador sólo para base aislada nueva: exige usuario propio, evento permitido y propiedades `{}`; aborta si la tabla ya existe. Aún faltan consentimiento versionado, límite de volumen y migración compatible con base existente. |
| Readiness, estrés y pruebas cognitivas condicionan descubrimiento; fórmulas distintas | Confirmado en clientes y Edge Function locales, despliegue remoto desconocido | **No se abrió el descubrimiento en esta fase**: `run-matching` todavía no acredita edad, bloqueos, consentimiento ni visibilidad en servidor. Separar progreso, perfil, afinidad y elegibilidad con contrato versionado y pruebas A/B antes de cambiar la puerta de acceso. |
| Ubicación exacta en Radar frente a aviso de privacidad de ubicación aproximada | Confirmado en código y aviso locales; efecto de RLS desconocido | Pendiente rediseño de datos y permisos en staging. No basta con difuminar coordenadas del lado cliente. |
| Visibilidad y notificaciones guardadas sólo en el dispositivo | Confirmado en `settingsStore.ts` | Se retiró el toggle que prometía ocultar el perfil y se desactivaron por defecto las preferencias de notificación/analítica, incluso al migrar el almacenamiento local. Falta implementación y prueba de servidor. |

**Contrato de readiness observado:** `evaluationStore.ts` escribe `profiles.readiness_score` con 20 puntos por Stroop aprobado, 20 por digit span, hasta 30 por tolerancia a frustración y hasta 30 por regulación emocional. `Home.tsx` muestra otra suma: hasta 25 por perfil, 30 por tres cuestionarios, 20 por evaluaciones, 15 por racha y 10 por ejes. `recalculate_readiness.sql` pretende replicar la segunda, pero el trigger de `evaluations` sólo modifica `updated_at` y el trigger de `profiles` escucha otras columnas, por lo que una evaluación por sí sola no dispara ese cálculo. El SQL termina con una actualización masiva de perfiles y no fue aplicado. `run-matching` promedia readiness para publicar un porcentaje de compatibilidad; no es afinidad entre dos personas. La especificación nueva debe mantener métricas educativas separadas de elegibilidad y afinidad.

## Cómo verificar servicios sin tocar datos reales

1. **GitHub:** comparar el commit `622adbb` con `main` de `GeobookerMx/LovIA`; ya se verificó igualdad por el conector. Antes de push, revisar configuración de Actions, reglas y conexiones de despliegue de la rama destino.
2. **Netlify:** abrir el site ID observado en consola autorizada; registrar nombre, dominio, repositorio conectado, rama de producción, SHA del deploy publicado, previews y nombres/ámbitos de variables por contexto. No copiar valores. Verificar si deploy-preview/branch-deploy tienen correo, pagos o webhooks activos y desactivarlos o sustituirlos por servicios de prueba.
3. **Supabase:** identificar si la referencia observada es producción; revisar Auth URL/redirects, funciones desplegadas, Storage y buckets, RLS, grants, triggers, cron, correo, claves y logs de auditoría. `docs/sql-inspeccion-readonly.sql` reúne consultas de **metadatos**; no extrae filas de usuarios ni invoca funciones. Examinar cuerpos de funciones y comandos cron sólo en consola autorizada, redactando secretos antes de compartir evidencia.
4. **Staging:** crear proyecto separado con cuentas ficticias y sitio Netlify privado/preview; cargar esquema mediante migraciones reconciliadas con baseline de metadatos, no con todos los SQL sueltos. Probar escenario nuevo y upgrade de uno representativo; registrar cada migración aplicada una sola vez.
5. **Nativo:** revisar `build-ios.sh` antes de usarlo: contiene `git pull` y `npm install`; además ejecuta build web. No usarlo para esta fase. Recuperar ubicación iOS autorizada antes de sincronizar; luego hacer build de pruebas con modo staging y verificar referencia en el artefacto.

## Pruebas locales y límites

- `tsc --project tsconfig.app.json --noEmit --incremental false`: pasó.
- Pruebas puras de configuración (5), sanitización (1) y bloqueo del script de revisión (2): pasaron. Se ejecutaron directamente; el runner que crea procesos falló por restricción `spawn EPERM` del sandbox.
- `vite build --mode staging` se detuvo antes de generar artefactos con `Falta VITE_APP_ENV`, comportamiento esperado con los `.env` actuales. No se inició la aplicación, no se aplicó SQL, no hubo deploy ni sync nativo.
- No hay comprobación funcional ni de seguridad de producción. No hay entorno staging verificado, migraciones aplicadas ni build móvil actual.
- Los `ts_errors*.log` son antecedentes históricos de marzo; la comprobación TypeScript actual pasó. `dist`, `.netlify` y recursos Android son generados. Los `sw.js`, `registersw.js`, Workbox y manifest de raíz requieren inventario de publicación antes de limpiar caché; no se borró almacenamiento ni service workers de ningún origen. El `dist` local y los recursos Android observados tienen fechas distintas, sin prueba sobre el artefacto distribuido.
- Diseño de caché propuesto: conservar `vite-plugin-pwa` sólo para web, verificar en staging que el `sw.js` generado y su manifest corresponden al mismo build, mantener `sw.js` sin caché larga (ya configurado en `netlify.toml`) y assets con hash inmutables. Si hace falta retirar un worker antiguo, limitar la acción al registro y scope de LovIA tras verificar el origen; no borrar todas las caches/sesiones del navegador. Capacitor sigue con PWA desactivado y recursos incluidos, sin copiar `dist` manualmente.

## Siguiente bloque de trabajo

Con acceso de lectura a Netlify y Supabase: confirmar identidades y objetos activos, crear staging aislado, obtener baseline sin datos personales y probar permisos con A/B/anon. Después preparar migraciones compatibles, corregir elegibilidad de descubrimiento y ubicación, y retomar el prompt maestro de onboarding, biblioteca, instrumentos, guía y builds. No publicar ni ejecutar SQL sobre datos reales desde esta rama.

Referencias técnicas consultadas: [tipos de claves Supabase](https://supabase.com/docs/guides/getting-started/api-keys), [funciones de base de datos](https://supabase.com/docs/guides/database/functions), [composición de políticas PostgreSQL](https://www.postgresql.org/docs/current/sql-createpolicy.html), [variables de Netlify](https://docs.netlify.com/build/environment-variables/overview/) y [Deploy Previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/).
