# LovIA: revisión previa a builds de iOS, Android y PWA

> Las correcciones y verificaciones posteriores se registran en [la actualización del 13 de noviembre](release-web-2026-11-13.md). Este documento conserva el diagnóstico del día 12.

Fecha: 12 de noviembre de 2026, hora de Ciudad de México.
Base revisada: `main`, commit `2d5d928`, y conversación adjunta aportada por el usuario.

**Actualización:** los hallazgos siguientes describen el estado inspeccionado. Después se implementaron localmente la demo, contenciones y solicitudes de baja con seguimiento; véase [el detalle de cambios y pendientes](mapa-demo-y-correcciones-2026-11-12.md). La migración nueva aún no está aplicada ni el frontend publicado. Los riesgos remotos siguen pendientes de contención.

## Dictamen y alcance

El código compila, pero la evidencia **no permite considerar terminados los flujos de eliminación, privacidad de finanzas ni descubrimiento de personas**. La conversación adjunta mezcla cambios locales, instrucciones pendientes y afirmaciones de despliegue. Cada estado siguiente procede de código o de una consulta actual de producción; no se asume que una instrucción anterior se haya ejecutado.

Se revisaron archivos y metadatos/agregados del proyecto Supabase `nbpidjpkanwynlhdxowx`. No se leyeron respuestas íntimas ni se borraron cuentas, archivos o filas. No se cambió producción ni se desplegaron funciones. No se realizó una prueba de penetración ni una prueba en dispositivos reales. La implementación posterior incluye una comprobación visual en navegador a tamaño móvil.

## Hallazgos que condicionan la salida

| Prioridad | Hallazgo y evidencia | Corrección y criterio de aceptación |
| --- | --- | --- |
| Alta: privacidad | `finance_answers_admin_summary` pertenece a `postgres`, no tiene `security_invoker`, concede SELECT a `authenticated` y no comprueba admin. Su definición puede revelar UUID, conteos y fechas de actividad de otras cuentas a cualquier cuenta autenticada. Supabase lo señala como `security_definer_view`. | Sustituir por una consulta de agregados con autorización efectiva de admin; probar anónimo, usuario A, B y admin. Ningún usuario normal puede consultar métricas ajenas. No basta con ocultar el dashboard. |
| Alta: privacidad | La política `Finanzas: admin lee conteos` es SELECT sobre **toda la tabla** `finance_answers`, con `USING (is_admin())`. Autoriza contenido, no solo conteos. `loadFinanceAnswers()` tampoco filtra por usuario y confía en RLS, de modo que una cuenta admin puede cargar respuestas ajenas en su recorrido personal. El flag de guardado está activo. | Separar las métricas del contenido. El acceso admin de métricas no debe otorgar lectura de `selected` o `free_text`. Añadir filtro explícito de propietario en el recorrido como protección adicional, manteniendo autorización en servidor. |
| Alta: flujo roto | `SettingsPage.tsx` activa `accountDeletionAvailable = true` y afirma que el servicio funciona; la lista actual de funciones desplegadas solo incluye `run-matching` y `stripe-webhook`. `delete-account` no está desplegada. | Completar y probar el servicio antes de prometer borrado inmediato. Un usuario de prueba debe poder eliminar su cuenta, recibir confirmación real y perder el acceso. El fallo debe permitir reintento y una solicitud manual funcional. |
| Alta: eliminación incompleta | La función local de borrado llama únicamente a `auth.admin.deleteUser`. No borra objetos de Storage ni implementa revocación de Apple. Hay 8 avatares y los 8 tienen propietario. Existen FK `NO ACTION` desde `audit_log`, `reports`, `verification_steps` y `crisis_alerts`, que pueden bloquear la baja de cuentas referenciadas. | Definir el ciclo de baja, limpieza de Storage mediante su API, revocación de sesiones/proveedores y tratamiento de referencias de auditoría/moderación. No convertir todas las FK a CASCADE indiscriminadamente. Probar cuenta con avatar, finanzas, diario, chat y referencias; documentar cualquier retención justificada. |
| Alta: promesa de privacidad | `avatars` es público y no restringe MIME en el bucket; límite 5 MB. `ProfilePage.tsx` obtiene URL pública, mientras los textos de visibilidad gradual/esencia prometen ocultar la foto. Difuminarla con CSS no impide abrir su URL. El reemplazo exitoso tampoco retira el avatar anterior. | Si se promete ocultamiento, usar entrega autorizada desde servidor y bucket privado; las URLs originales no deben revelar una foto oculta a un tercero. Restringir tipos/tamaño en servidor y retirar versiones anteriores con un proceso controlado. |
| Alta antes de habilitar matches: ubicación | La RPC de producción `suggest_safe_venue(uuid)` comprueba que quien llama pertenezca al match activo, pero devuelve el **punto medio exacto** de las coordenadas privadas de ambas personas. Con la coordenada propia y ese punto medio se puede deducir la de la otra persona: B = 2 × punto medio − A. Además, devuelve una calificación 5 y un supuesto entorno «certificado» sin consultar un establecimiento real. Hoy no hay matches que habiliten ese recorrido. | Entregar lugares públicos concretos y verificados sin revelar una función reversible de coordenadas privadas. No llamar certificado o seguro a un punto calculado. Probar que un participante no pueda inferir la ubicación del otro antes de activar matches. |
| Alta: producto | Radar bloqueado por `isRadarAvailable = false`. El código **desplegado** de `run-matching` tiene `MATCHING_CONTRACT_READY = false` y retorna 503 antes de crear matches. Producción registra 0 matches y 0 `public_profiles`. | Implementar primero el descubrimiento autorizado y el suministro de perfiles elegibles. Crear una cuenta o completar tests no activa el mapa ni genera coincidencias hoy. Las fichas de tiendas y la web deben describir esta disponibilidad con precisión. |
| Alta: consentimiento | `consent_logs` sigue con 0 filas. De 47 cuentas, solo 1 contiene versión legal y confirmación de mayoría de edad en metadata. El registro social recoge aceptación en estado del cliente, sin evidencia persistida equivalente a la del correo. | Registrar aceptación de forma verificable en servidor: usuario, versión, fecha del servidor y elecciones. Definir el recorrido de cuentas existentes sin inventar consentimientos anteriores. No usar metadata editable como autorización. |

La vista de finanzas no expone las respuestas en su propia proyección; expone metadatos. La lectura de respuestas completas por admin procede de otra política distinta. No se comprobó que alguien haya explotado estas vías. [Seguridad de vistas y RLS](https://supabase.com/docs/guides/database/postgres/row-level-security#views).

Supabase advierte que un usuario propietario de objetos en Storage no puede eliminarse sin resolverlos y que borrar la cuenta no invalida inmediatamente todos los JWT ya emitidos. El servicio necesita gestionar ambos aspectos. [Administración y eliminación de usuarios](https://supabase.com/docs/guides/auth/managing-user-data). Las fotos públicas tienen acceso por URL sin autenticación. [Buckets públicos y privados](https://supabase.com/docs/guides/storage/buckets/fundamentals).

Apple requiere un recorrido para iniciar la eliminación dentro de la app y contempla la revocación de tokens de Sign in with Apple. Google Play exige una vía dentro de la app y una vía web accesible. El simple botón o un enlace de contingencia no prueba el funcionamiento del proceso. [Apple](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [Google Play](https://support.google.com/googleplay/android-developer/answer/13327111).

### Otros avisos de Supabase

La consulta actual devuelve 14 funciones con `search_path` mutable, 9 funciones `SECURITY DEFINER` ejecutables por anónimo y 12 por autenticados; varias son triggers o APIs intencionales. Cada firma necesita revisar autorización y finalidad, no una revocación global. Por ejemplo, `suggest_safe_venue` sí comprueba pertenencia al match, pero su salida presenta el riesgo de ubicación explicado arriba.

También siguen desactivada la protección contra contraseñas filtradas, `pg_net` instalado en `public` y una tabla de respaldo con RLS sin políticas. RLS sin políticas no demuestra una filtración: normalmente deniega a clientes sin bypass. Confirmar su aislamiento y retención. [Avisos y remediación de Supabase](https://supabase.com/docs/guides/database/database-linter), [protección de contraseñas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Qué sí cambió desde la auditoría del 4 de noviembre

- `on_auth_user_welcome` ya no está entre los triggers activos inspeccionados.
- `update_user_streak(uuid)` y `has_role(uuid,text)` ya exigen la identidad propia, tienen `search_path` fijo y no permiten ejecución a `anon`.
- Los dos triggers `zz_lovia_guard_*` existen y están habilitados. Esto confirma instalación, no sustituye una prueba de escritura con roles reales.
- `has_role(uuid,app_role)` sigue siendo otra sobrecarga, `SECURITY INVOKER`, con acceso de ejecución público. Debe revisarse aparte; no equivale al antiguo fallo de la sobrecarga `text` con privilegios elevados.
- El acceso visible a eliminar cuenta, la tarjeta permanente de economía y los distintivos de temporada están en el código. La existencia de controles no demuestra que sus servicios estén listos.

No deben copiarse y repetirse los cuatro SQL de la conversación como paso automático. Dos correcciones anteriores ya existen; la vista/política de finanzas creada por otro bloque introduce el riesgo descrito arriba. `CREATE OR REPLACE` soluciona una colisión de nombres, pero no valida permisos ni seguridad.

## Mejoras de experiencia concretas

1. **Inicio con una acción principal.** Hay spotlight, tarjeta permanente y acceso de herramientas para finanzas, con nombres diferentes. Mantener una tarjeta visible llamada «Economía de la relación» y una entrada de herramientas coherente; aprovechar el espacio para explicar el siguiente paso del usuario.
2. **Navegación estable.** En Navidad «Conexiones» cambia a «Matches ✨». Mantener nombres constantes; expresar la temporada mediante un distintivo decorativo, sin cambiar el significado del destino. El cálculo estacional de la barra se hace al cargar el módulo y no cambia durante una sesión abierta al cruzar de fecha.
3. **Eliminar cuenta con un destino claro.** El acceso nuevo de Perfil lleva a Configuración, no directamente a la confirmación como se afirmó en el chat. Crear un destino de eliminación reconocible, con alcance real, estado de proceso, cancelación previa al envío y mensaje de resultado. Usar errores dentro de la página, evitando depender de `alert()`.
4. **Finanzas sin perder progreso.** Si falla la lectura inicial, `FinanceJourney` comienza vacío silenciosamente. Informar el fallo y ofrecer reintento; no confundir «no hay respuestas» con «no pudieron cargarse». Avisar al salir con cambios pendientes y preservar la versión guardada.
5. **Mapa y lista vacía explicados.** Mostrar disponibilidad real del descubrimiento y un siguiente paso útil. No pedir más evaluaciones como supuesto desbloqueo de una función inhabilitada. Evitar promesas de una cifra mínima de candidatos.
6. **Autoría visible y verificable.** El enlace de autor está presente. Las preguntas diarias se leen como `question` sin atribución de autor en ese componente. Distinguir las preguntas originales de citas externas, y mostrar autor y fuente cuando una cita lo requiera. Los nuevos recursos públicos identifican al equipo editorial sin inventar avales.
7. **Accesibilidad móvil.** Verificar teclado, VoiceOver/TalkBack, tamaños de texto, foco, contraste y safe areas en iPhone pequeño, iPad y Android. La revisión actual es de código; no hay todavía evidencia de una sesión visual en esos dispositivos.

### Descubrimiento real propuesto, todavía sin implementar

Flujo propuesto: perfil elegible → consentimiento para aparecer → preferencias y radio → consulta del servidor → zonas aproximadas → tarjeta de candidato → interés mutuo → conexión/conversación.

La consulta debe excluir la cuenta propia, bloqueos en ambos sentidos, cuentas sancionadas o dadas de baja y personas sin consentimiento. La ubicación exacta nunca debe viajar al dispositivo de otra persona. No basta con desplazar coordenadas en JavaScript: consultas repetidas pueden volver a inferir una posición si el diseño del servidor no lo evita.

El umbral de evaluaciones no está decidido como criterio de elegibilidad. Cualquier criterio deberá explicarse y probarse; no se deben presentar puntuaciones como garantías clínicas o de compatibilidad.

Icono propuesto: un corazón o una chispa con identidad LovIA sobre una **zona**, no un pin que sugiera domicilio preciso. La leyenda distinguiría «zona aproximada» de «conexión mutua». La demo local usa corazones con etiqueta DEMO; los marcadores de personas reales siguen pendientes.

## Validación de código y artefactos

| Comprobación | Resultado de esta sesión |
| --- | --- |
| `npm audit --json` | La primera consulta restringida devolvía 0 y se descarta como evidencia. La consulta completa detectó 44 alertas; tras actualizar quedan 16 de desarrollo (2 bajas y 14 moderadas), ninguna alta/crítica. `--omit=dev`: 0. No certifica la seguridad de la app. |
| Pruebas unitarias existentes | 10/10 pasan; cubren entorno, política de analítica, algunas fechas y protección del cliente de pruebas. No cubren los recorridos completos. |
| Pruebas SEO añadidas | 6/6 pasan; suite ampliada: 29 pruebas, incluyendo demo, propiedad de avatares y aislamiento SQL. Validan sitemap público, reciprocidad de idiomas, JSON-LD, rutas de publicación, enlaces y noindex de acceso. |
| TypeScript y build nativo | Pasan. Se comprobó que el build nativo no emitió `sw.js` ni `registerSW.js`. |
| Build web/PWA | Pasa; genera Service Worker y manifiesto. Los cambios SEO posteriores se validan además en su informe específico. |
| ESLint sobre `src` y funciones | 41 errores y 1 aviso en el código completo; mayormente tipos `any`, hooks y variables sin uso. Los archivos nuevos y corregidos del mapa, perfil, finanzas, cola y configuración pasan el lint enfocado. Los errores restantes no equivalen a vulnerabilidades, pero el gate global sigue fallando. |
| AAB existente | El archivo `android/app/release/app-release.aab` tiene fecha local 30/10 y nombres de assets distintos a la compilación nativa actual. No se considera un AAB de estas mejoras. |
| iOS | El proyecto nativo no está en este workspace. En la iMac se reportaron `ios/App/App.xcodeproj` y Xcode 27.1; faltan revisar firma, URL scheme, permisos y ejecutar Archive de la revisión exacta a entregar. |
| Android | `versionCode 22`, `versionName 1.2.3`; no se comprobó si 22 ya está usado en Play. La función de videollamada solicita audio y video, mientras el manifiesto fuente solo declara INTERNET/CAMERA. Hay que revisar el manifiesto fusionado y el permiso de micrófono si esa función se ofrece. |

El keystore sigue a cargo del usuario. No se generaron ni subieron un nuevo AAB, Archive o IPA en esta revisión.

## Pruebas de aceptación antes del envío

| Recorrido | Evidencia que hace falta |
| --- | --- |
| Correo, Google y Apple | Registro, acceso, cancelación del proveedor, error de red, reapertura, callback con app cerrada/abierta y recuperación. Facebook no está implementado: no anunciarlo como disponible. |
| Borrado | Cuenta de prueba con avatar y datos relacionados; eliminación completa o retención documentada, revocación y bloqueo de acceso posterior. Incluir errores parciales y reintento. |
| Permisos | Anónimo, usuario A, usuario B y admin; lectura/escritura propias, denegación cruzada, imposibilidad de asignar plan/verificaciones y acceso admin limitado. |
| Finanzas | Reanudar sin sobrescribir, error de lectura distinguible, A no ve B, admin solo recibe las métricas autorizadas y no texto privado. |
| Fotos | Carga, cambio, limpieza de anteriores, MIME/tamaño rechazados por servidor, URL de foto oculta inaccesible para terceros. |
| Descubrimiento | Consentimiento, ubicación aproximada estable, bloqueos, preferencias, retirada de visibilidad y eliminación de cuenta. No habilitar el mapa por un flag sin ese contrato. |
| PWA | Actualización durante un formulario sin pérdida de datos, red intermitente y contenido público accesible sin login. |
| Tiendas | Artefacto nuevo firmado, versión/build únicos, ficha y declaraciones de datos que coincidan con el comportamiento real, pruebas en TestFlight y prueba interna de Play. |

## Sobre las afirmaciones de posicionamiento del adjunto

No se encontraron pruebas para asegurar «10 veces más peso», «indexación inmediata» o un umbral de instalaciones que garantice aparecer primero. Tampoco se debe organizar una campaña de reseñas de cinco estrellas con frases prefijadas: solicitar experiencias honestas y seguir las reglas de Google. [Política de valoraciones, reseñas e instalaciones](https://support.google.com/googleplay/android-developer/answer/9898684).

## Orden de trabajo propuesto

1. Cerrar privacidad de finanzas y diseñar/probar el borrado real.
2. Resolver las promesas de fotos ocultas y la persistencia del consentimiento.
3. Definir y probar el contrato de descubrimiento si el próximo lanzamiento va a ofrecer candidatos/matches.
4. Ajustar los recorridos de Inicio, errores y navegación y probar en dispositivos.
5. Generar artefactos nuevos y validar la ficha de cada tienda. Las mejoras SEO se pueden preparar localmente en paralelo; su despliegue y su indexación requieren verificación aparte.
