# LovIA 2.0: continuación de login, Admin, fotos, perfiles y diario

Fecha: 19 de octubre de 2026. Alcance exclusivo: `GeobookerMx/LovIA`, rama `feature/lovia-seguridad-y-entornos`.

## Conciliación de migraciones y entornos

| Elemento | Estado comprobado | Acción |
| --- | --- | --- |
| `20261019155934_lovia_contencion_a_permisos` | La auditoría adjunta informa que figura aplicada en producción `nbpidjpkanwynlhdxowx`. No existe archivo equivalente en el historial local ni acceso de lectura al historial remoto en esta sesión. | No repetir. Recuperar el SQL exacto y conciliarlo con `supabase_migrations.schema_migrations` antes de crear otra migración. |
| Staging Supabase | No hay project_ref, credenciales publicables ni datos ficticios verificados. | Crear/verificar proyecto separado; confirmar ref antes de cualquier operación. |
| Netlify staging | Sin sitio, URL ni variables verificadas. | Asociar staging al proyecto de pruebas; validar contexto, variables y distintivo. |
| SQL nuevo | Ninguno preparado, probado ni aplicado. Los SQL históricos permanecen como antecedentes. | Instalar o exponer CLI Supabase, conciliar esquema efectivo y generar un único historial versionado. Probar sobre staging antes de producción. |

El build local usó una referencia ficticia de 20 caracteres y una clave de prueba; no constituye conexión a staging. No se hizo escritura remota, despliegue ni sincronización nativa.

## Hallazgos A01–A11 contrastados con la rama

| ID | Estado local y evidencia | Brecha / prueba siguiente |
| --- | --- | --- |
| A01 | **P0 pendiente.** La auditoría remota documenta UPDATE del cliente sobre campos de confianza y `verification_steps`. La interfaz ya no autoaprueba selfies. | Revocar privilegios de tabla incompatibles, definir columnas editables, proteger estados con función/RLS de servidor. Probar A/B/anon/admin por API en staging. La UI sola no cierra esta vulnerabilidad. |
| A02 | **Contención local.** `SelfieVerification` y `VerificationFlow` ya no capturan, suben ni simulan aprobación o badges. | Bucket privado, retención, revisión autorizada y pruebas negativas antes de reactivar. |
| A03 | **Corregido en código.** `EditProfilePage` deja de enviar `bio`; envía campos vacíos editables. `updateProfile` hace UPDATE de fila propia y exige resultado. | Confirmar columnas reales y guardar/vaciar/recargar en staging. Biografía pública requiere decisión de esquema y migración. |
| A04 | **Parcial.** Avatar acepta JPG/PNG/WebP, normaliza a JPEG por canvas, conserva foto anterior hasta confirmar perfil y retira nuevo objeto si falla UPDATE. | Límite MIME/tamaño en bucket, orientación/HEIC en dispositivo, privacidad del bucket público y limpieza histórica en staging. |
| A05 | **Contención local.** `AdminGuard` elimina lista de correos y `user_roles` del cliente; exige `getUser`, `app_metadata.role=admin` e `is_admin()`; reevalúa al cambiar sesión. | Unificar fuente de verdad y permisos por acción en servidor; probar acceso y revocación de admin en staging. Revisar definición efectiva de `is_admin()`. |
| A06 | **Contención local.** Moderación y usuarios dejan la sanción inactiva; descartar reporte exige fila confirmada. `run-matching` responde 503 por código aunque alguien active su variable: el contrato actual no es seguro. | Implementar operación atómica/autorizada/auditable y efecto en discovery, matching y chat; probar en staging. La función desplegada puede diferir del archivo local y debe verificarse antes del lanzamiento. |
| A07 | **Contención local.** Contenido, sistema y finanzas ya no anuncian publicación, guardado o ingresos basados en datos estáticos. | Backend editorial, parámetros persistentes y cobros conciliados antes de habilitar controles. |
| A08 | **Parcial.** Diario separa error de vacío, normaliza tags NULL, inserta con ID fijo por borrador, confirma fila, recupera reintento, borra con confirmación y pagina de 20. Borra vista al cambiar cuenta y avisa sobre borrador al salir/recargar. | Probar persistencia/reinicio/A-B/anon/red lenta, navegación interna fuera del botón Volver, y edición si se decide incluir. No se creó UPDATE RLS innecesario. |
| A09 | **Contención local.** Eliminación automática desactivada y canal de solicitud visible; función local no está desplegada según auditoría remota. | Revisar borrado de Storage, dependencias y retención; probar función con ficticios y desplegar sólo después. |
| A10 | **Parcial.** Recuperación `/recover` y OAuth web por origen ya estaban en la rama. Deep link nativo ahora valida esquema/host/path y atiende arranque en frío; manifiesto Android limita el intent. | Probar correo/Google/Apple en web, PWA, Android e iOS; redirects, PKCE, cancelación, correo oculto y cuenta existente. iOS no está en este árbol. |
| A11 | **Parcial.** Cierre/cambio de cuenta limpia evaluaciones, suscripción, check-in y preferencias; cargas consultan identidad antes de aceptar respuestas. Diario descarta respuestas de generación anterior. | Prueba A→salir→B con red lenta, caches PWA y otras consultas privadas. |

## Inventario de recorridos y evidencia requerida

| Pantalla / acción | Handler y recurso | Estado | Evidencia pendiente |
| --- | --- | --- | --- |
| Login correo/Google/Apple | Supabase Auth, `socialAuth.ts` | Código presente | Sesiones ficticias y redirects por plataforma. |
| Recuperación | Supabase Auth, `/recover` | Código presente | Enlace válido/vencido, cambio y reutilización. |
| Salir/cambiar cuenta | `authStore.signOut`, stores privados | Corregido local | A/B con red lenta y PWA instalada. |
| Foto subir/reemplazar | Storage `avatars`, `profiles.avatar_url` | Parcial | MIME servidor, referencia recargada, fallo de segundo paso, dispositivo HEIC. |
| Perfil editar/vaciar | UPDATE `profiles` | Corregido local | Resultado tras recarga, permisos de columnas. |
| Selfie/identidad | Pantalla de espera | Bloqueado a propósito | Revisión real y permisos negativos. |
| Diario guardar/historial/borrar | `journal_entries` | Parcial | Persistencia y privacidad A/B/anon tras reinicio. |
| Admin acceso | `getUser` + `is_admin()` | Parcial | Roles, revocación y URL directa. |
| Admin sancionar/aprobar/publicar/guardar | Controles desactivados | Bloqueado a propósito | API por acción, auditoría, RLS, staging. |
| Admin descartar reporte | UPDATE `moderation_reports` | Parcial | Prueba de permiso y fila confirmada. |
| Cuenta eliminar | Función local no desplegada | Bloqueado a propósito | Borrado integral ficticio. |

## Verificación local

- `npx tsc --project tsconfig.app.json --noEmit --incremental false`: pasó.
- 10 pruebas locales: pasaron (campaña, entorno, analítica y reviewer).
- `npm run build:staging`: pasó con variables ficticias. `npm run verify:env`: referencia ficticia encontrada. El JS de `dist/assets` no contiene la URL API de producción. `dist/sw.js` generado. `dist` es artefacto ignorado, no staging publicado.

## Condiciones antes del candidato y lanzamiento

1. Conciliar la migración existente y el esquema efectivo; preparar y probar migraciones de privilegios, RLS y proyección pública en staging.
2. Desplegar funciones autorizadas de sanción, verificación y borrado; mantener matching global apagado hasta implementar filtros de edad, consentimiento, visibilidad, bloques y ubicación aproximada en servidor.
3. Validar con cuentas ficticias A/B/anon/admin todos los recorridos de la tabla, incluyendo permisos negativos y PWA sin caché privada.
4. Verificar Netlify/Supabase de destino, rollback y artefactos. Android requiere instalación y pruebas de OAuth/cámara. Falta origen nativo iOS y Mac/Xcode; no declarar build iOS.

No publicar esta rama ni levantar el bloqueo de seguridad mientras A01 y A06 sigan pendientes.
