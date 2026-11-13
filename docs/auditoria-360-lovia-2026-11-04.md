# Auditoría 360 de LovIA — 4 de noviembre de 2026

## Alcance y criterio

Revisión del código React/Capacitor, autenticación, panel admin, funciones Edge, migraciones, Storage, PWA y configuración de build. Se consultaron **solo metadatos y agregados** del proyecto Supabase de producción `nbpidjpkanwynlhdxowx`; no se modificaron datos, esquema, usuarios ni archivos remotos. Los números de usuarios pueden incluir cuentas de prueba.

**Estado de publicación: detenido.** Los builds web y nativo compilan, pero los hallazgos P0 requieren corrección y prueba antes de subir otra versión iOS o ampliar la distribución.

## P0 — corregir antes de publicar

| Hallazgo confirmado | Evidencia | Corrección y prueba requerida |
| --- | --- | --- |
| Una cuenta autenticada puede actualizar columnas privilegiadas de su propia fila de `profiles` y `private_profiles`, incluidas `tier`, `status`, `verified_ine` y `account_status`. | RLS limita la fila propia, pero los privilegios de columna `UPDATE` están activos y los triggers `zz_lovia_guard_*` no existen en producción. La migración local `20261028141402_lovia_proteger_campos_privilegiados_y_roles.sql` no consta en el historial remoto. | Conciliar y probar esa migración en un entorno separado con usuario A, usuario B, anónimo y admin. Después aplicar a producción y repetir pruebas de lectura/escritura. No basta con ocultar campos en React. |
| El trigger `on_auth_user_welcome` intenta enviar `row_to_json(NEW)` de `auth.users` por HTTP a `TU_IP_DE_CONTABO:3002`. | Definición activa del trigger y de `public.trigger_welcome_email()` en producción. | Retirar ese trigger y, si se necesita correo de bienvenida, reemplazarlo por un flujo HTTPS que transmita solo los campos mínimos. Probar registro con correo, Google y Apple. Hay una migración local preparada, aún sin aplicar. |
| `public.update_user_streak(p_user_id uuid)` es `SECURITY DEFINER`, acepta cualquier ID y puede ejecutarse por `anon` y `authenticated`. `has_role(_user_id, _role)` también permite consultar roles de IDs arbitrarios. | ACL y definiciones de funciones en producción; la app llama a `update_user_streak` desde `SparkPage.tsx`. | En `update_user_streak`, exigir `auth.uid() = p_user_id`, revocar `anon`, fijar `search_path` y probar la llamada legítima. Restringir `has_role` al uso necesario y revocar acceso público. La migración local `20261105031546_lovia_cerrar_rpc_y_trigger_welcome.sql` prepara estos cambios, pero no se ha aplicado. Revisar además las demás funciones `SECURITY DEFINER`. |
| No hay evidencia persistida del consentimiento de alta ni de la confirmación de mayoría de edad para las cuentas existentes. | `consent_logs` tiene 0 filas; 0 de 45 cuentas tienen `legal_consent_version` o `age_confirmed_18` en `auth.users`. Entre las altas desde 20/10, 0 de 2 tienen esos campos. El modal de registro guarda la aceptación en estado local antes de OAuth. | Definir registro de consentimiento en servidor para correo y proveedores sociales, con versión, fecha, usuario y elección sobre datos sensibles. Bloquear el uso de funciones que requieren consentimiento hasta registrarlo. Probar cuentas nuevas y migración de cuentas actuales sin asumir aceptación previa. |

Los avisos de Supabase confirman 12 funciones privilegiadas ejecutables por `anon`, 13 por `authenticated` y 15 funciones con `search_path` mutable. Parte de las funciones son triggers o APIs intencionales; hay que clasificarlas antes de revocar permisos. [Avisos y remediación de Supabase](https://supabase.com/docs/guides/database/database-linter).

El cliente ahora limita `updateProfile` a los campos editables que usa la app. Es defensa contra errores del propio código; **no corrige** la escalada de privilegios mientras la base de datos conserve permisos de actualización amplios.

## Acceso, cuentas y flujos

- El código implementa correo/contraseña, Google y Apple. En producción hay 37 identidades Google, 4 Apple y 4 correo; esto prueba uso histórico, **no** el funcionamiento actual en cada iPhone. Facebook no tiene flujo de login ni botón. Sus referencias actuales son enlaces sociales y filtros de chat. Para añadirlo faltan app de Meta, configuración del proveedor en Supabase, URI de retorno, revisión de permisos y pruebas. [Configuración oficial de Facebook en Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-facebook).
- El flujo iOS de Apple usa token de identidad y nonce; Google vuelve por `lovia://auth/callback`. Falta el proyecto `ios/` en este repositorio, por lo que no se pudo verificar URL scheme, capacidad Sign in with Apple, firma ni permisos del dispositivo. Los redirects deben estar permitidos en Supabase y probados en dispositivo. [Deep links móviles](https://supabase.com/docs/guides/auth/native-mobile-deep-linking), [Sign in with Apple](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple).
- Se eliminó la implementación duplicada y sin referencias de `socialAuth.ts`; los tres puntos de acceso usan `src/lib/socialAuth.ts`. El retorno OAuth de `lovia.com.mx` y `www.lovia.com.mx` sigue pendiente de prueba real porque un cambio de dominio puede afectar PKCE.
- Recuperación de contraseña en nativo requiere `VITE_RECOVERY_WEB_ORIGIN` HTTPS y su URL autorizada en Supabase. Se corrigió el bloqueo del botón ante errores de red, pero falta prueba del correo de recuperación hasta el cambio efectivo de contraseña.
- Matriz mínima antes de publicar: registro y acceso con correo, Google y Apple; cancelación y error del proveedor; sesión tras cerrar/reabrir la app; cambio de cuenta; recuperación; callback frío y app ya abierta; cuenta sin perfil; conexión lenta/sin red; Apple y Google en iPhone real y web. Facebook se evalúa después de configurar el proveedor.

## Buckets, datos y permisos

- El radar heredado estaba desactivado por una pantalla segura. Su código intentaba pedir `last_lat`/`last_lng` exactos de otros perfiles y aplicaba el desplazamiento en el cliente; además pedía `last_seen_at`, columna ausente. Las políticas de producción solo permiten leer el perfil propio, así que ese flujo tampoco podía funcionar. Se retiró el módulo y `/radar` conserva la pantalla segura. Para reintroducirlo se necesita una consulta o RPC del servidor que entregue zonas aproximadas, aplique bloqueos/visibilidad y nunca entregue coordenadas precisas de terceros.
- `avatars` es público, con límite de 5 MB pero sin tipos MIME restringidos en el bucket. La app convierte la imagen a JPEG, pero eso es control de cliente. Toda URL de un bucket público puede abrirse sin sesión: no usar esta configuración para fotos cuya visibilidad se prometa gradual o privada. Migrar a bucket privado y URLs firmadas, o dejar claro que el avatar es público. [Modelo de buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals).
- `books` también es público y sin límite de tamaño ni MIME. Si los dos archivos son material público, documentarlo y limitar formatos/tamaño de futuras cargas.
- `storage.objects` contiene políticas duplicadas de lectura y subida de avatares. Revisar con pruebas A/B/anónimo antes de simplificar. `public_profiles` tiene política de lectura para todos los autenticados, aunque hoy registra 0 filas.
- La migración local de aislamiento de `backup_onboarding_20261020` tampoco aparece en el historial remoto. La tabla tiene 35 filas y RLS sin políticas; confirmar además que no conserva permisos API directos antes de exponerla.

## Admin, funciones y operación

- `AdminGuard` verifica `is_admin()` en servidor y las políticas de `book_cards`/`lovia_feature_flags` usan ese control. Se corrigieron excepciones de red y la llamada a Supabase dentro de `onAuthStateChange`. Falta probar permisos reales con una cuenta admin, otra normal y una sesión caducada.
- Las sanciones de usuarios, especialistas y moderación muestran controles desactivados; no presentarlas como operación disponible. `ContentManager` sí escribe `book_cards`; probar alta, edición, publicación, orden y borrado con permisos reales.
- Hay 13 archivos de migración locales, incluida la nueva migración preparada, y 6 entradas de migración remota. Solo `run-matching` y `stripe-webhook` figuran desplegadas; el repositorio también contiene `delete-account`, `create-mp-preference`, `mp-webhook` y `create-checkout-session`. No aplicar todas las migraciones ni desplegar funciones en bloque: primero reconciliar el estado real y los flags. El compartir finanzas está revocado intencionalmente en producción mientras se valida la privacidad; la UI aún intenta invocar `finance_accept_invite`.
- El endpoint de borrado automático de cuenta no figura desplegado y está desactivado en Configuración; el usuario recibe el enlace público de solicitud. Ese procedimiento debe probarse de extremo a extremo antes de prometer borrado automático.

## PWA, iOS y calidad de código

- Se corrigió el manifiesto estático: apuntaba a iconos `.webp` inexistentes y declaraba MIME PNG. El build web genera su propio manifiesto válido, `sw.js` y una precarga de 186 recursos (~2.57 MB); el build nativo usa rutas relativas y no incluye Service Worker. La PWA no precachea respuestas de la API según `vite.config.ts`.
- Se sustituyó la actualización automática por un aviso web con acciones **Más tarde** y **Actualizar**. El aviso pide guardar lo que se está escribiendo antes de recargar; el Service Worker sigue fuera del build nativo. Falta comprobar el aviso en un navegador real durante diario, onboarding y chat, especialmente con cambios sin guardar.
- La CSP de Netlify permite `unsafe-inline` para scripts y estilos. Revisar la necesidad real y endurecerla sin romper PWA/OAuth. No se detectó uso de `dangerouslySetInnerHTML` en `src`, pero esto no sustituye una prueba de seguridad dinámica.
- `npm audit` informa **0 vulnerabilidades conocidas** en dependencias instaladas. TypeScript, build web y build nativo pasan; 10 pruebas unitarias existentes pasan. `eslint` sigue con **53 errores y 1 aviso** en 31 archivos, incluidos hooks, tipos `any` y código Edge. La cobertura actual no prueba login, Storage, RLS, admin ni iOS en dispositivo.
- `build-ios.sh` se cambió para usar `npm ci` y `npm run build:native`, comprobar herramientas y exigir un proyecto iOS existente. Ya no ejecuta `git pull` ni compila PWA para el paquete nativo. Aún falta verificar el proyecto, la firma y el Archive en la iMac remota.

## Distribución y crecimiento medible

La base registra 45 perfiles, 44 con onboarding marcado y 3 altas en los últimos 30 días. `funnel_events` y `analytics_events` tienen 0 eventos. Esto impide atribuir adquisición, caída de login o retención desde la app; el volumen también puede incluir pruebas.

1. Definir eventos mínimos y respetuosos con la privacidad: visita, inicio de registro, error de proveedor por categoría, cuenta creada, onboarding terminado, primera actividad y retorno D1/D7. No enviar respuestas íntimas, tokens, emails ni contenido del chat.
2. Revisar fuentes web/PWA y enlaces de campaña; cruzar visitas, instalación, registro y activación con métricas agregadas. Para App Store, usar las métricas de adquisición y fuente de [App Store Connect](https://developer.apple.com/help/app-store-connect-analytics/acquisition/acquisition).
3. Tras estabilizar el producto, probar mensajes y capturas por intención en [páginas personalizadas de App Store](https://developer.apple.com/app-store/custom-product-pages/) y [experimentos de ficha en Google Play](https://support.google.com/googleplay/android-developer/answer/12053285?hl=en). Una campaña de pago antes de medir activación y retención tendría resultados difíciles de interpretar.

## Secuencia de salida recomendada

1. Reconstruir una migración inicial reproducible del esquema real y conciliarla con el historial remoto. La rama de staging creada el 5/11/2026 falló al ejecutar la primera migración y se eliminó para detener el costo; sus registros muestran `No se encontró la función esperada; detener revisión` en `20261019155934_lovia_contencion_a_permisos.sql`, que depende de `public.set_admin_role(uuid)` ausente en la base nueva. No se modificó producción. Supabase crea la rama repitiendo migraciones sobre una base vacía; el historial actual empieza con contención y carece del esquema base. Una vez reparado y probado el historial, crear staging aislado y reconciliar funciones remotas.
2. Corregir los cuatro P0, verificar RLS/funciones con A/B/anónimo/admin y repetir avisos de Supabase.
3. Probar login y consentimiento en web y iPhone real; luego Storage, admin, borrado, pagos y PWA con red intermitente.
4. Limpiar errores de lint y añadir pruebas de integración de los flujos críticos. Verificar artefactos nativos y web por separado.
5. Recuperar y revisar el proyecto `ios/` de la iMac, firma, URL scheme, capacidades y número de build. Solo entonces generar Archive, enviar a TestFlight y revisar resultados antes de App Store.

### Recuperación del entorno de pruebas

La rama fallida `audit-360-security-20261104` (`dvpxvsjxitgeeistzixz`) se eliminó y se comprobó que Supabase vuelve a listar solo `main`. No conviene repetir la creación sin corregir primero el historial. El archivo `supabase/full_schema_v2.sql` tampoco sirve como migración inicial: empieza con `ALTER TABLE public.profiles`, por lo que presupone un esquema anterior.

1. Obtener una exportación **solo de esquema** de producción mediante un entorno Supabase CLI vinculado de forma segura; revisar el SQL para excluir datos y secretos incrustados. [Guía de Supabase para ramas vacías](https://supabase.com/kb/troubleshooting/new-branch-doesnt-copy-database).
2. Reconstruir una línea base que reproduzca el estado anterior a las migraciones de contención, o consolidar el esquema actual en una nueva línea base y reconciliar cuidadosamente el historial remoto. La primera migración exige `public.set_admin_role(uuid)` y otras tablas/políticas ya existentes; agregar simplemente una exportación actual con fecha posterior no resolvería ese orden.
3. Probar el historial completo desde cero en un entorno local desechable, revisar los avisos de seguridad y solo entonces volver a crear una rama de staging. [Diagnóstico oficial de `MIGRATIONS_FAILED`](https://supabase.com/kb/troubleshooting/branch-in-migrations-failed-status).
4. Ejecutar en staging las pruebas A/B/anónimo/admin de columnas privilegiadas, RPC, registro/consentimiento, Storage y funciones Edge antes de cualquier cambio en producción.

## Cambios locales en esta auditoría

Se corrigieron: build nativo para iMac, manifiesto estático, actualización de PWA con aviso, navegación inferior y posición de desplazamiento, aviso de red sin conexión, recuperación de errores sin exponer detalles técnicos en producción, errores de red en registro y recuperación, manejo de acceso admin, duplicación de login social y textos de privacidad/seguridad que prometían más de lo comprobado. Se preparó la migración de contención del trigger y dos RPC. Ningún cambio local fue publicado ni aplicado a la base de datos.
