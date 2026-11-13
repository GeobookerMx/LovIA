# Eliminación de cuenta: estado y procedimiento

Actualizado el 13 de noviembre de 2026. La RPC de solicitudes y sus permisos ya están aplicados y verificados en producción. Registrar una solicitud **no ejecuta ni confirma un borrado completo**. La Edge Function `delete-account` sigue sin desplegar y no es requisito del cliente nuevo. Véase [el registro actualizado](release-web-2026-11-13.md).

## Inicio dentro de la app

Perfil → Configuración → Eliminar mi cuenta → escribir ELIMINAR → Confirmar solicitud.

La RPC `public.request_account_deletion(text)` usa la identidad autenticada, comprueba que la cuenta exista y registra una única solicitud por usuario. Reintentar conserva la fecha original. La función privilegiada reside en `lovia_private`, con búsqueda fija, sin aceptar un ID objetivo ni permitir ejecución anónima; el wrapper público es `SECURITY INVOKER`.

El usuario ve la fecha y el estado pendiente/en revisión. La cuenta permanece activa mientras se atiende. Si la RPC falla o devuelve una respuesta inesperada, no se confirma el registro ni se cierra sesión: se informa el error y se ofrece soporte. El usuario puede cancelar antes de enviar.

La cola `account_deletion_requests` permite SELECT propio o de administrador verificado por servidor; el cliente no puede insertar, cambiar estados o borrar filas directamente. El dashboard de Usuarios muestra hasta las 100 solicitudes más antiguas y distingue una cola vacía de un fallo de carga.

El endpoint heredado `supabase/functions/delete-account/index.ts` también queda contenido: solo POST autenticado y confirmación explícita, responde 202 con `deleted: false` tras registrar la solicitud. No utiliza una clave de servicio ni borra cuentas. La app llama directamente a la RPC; desplegar este endpoint no es requisito.

## Dependencia de publicación

La migración `20261113135116_lovia_privacidad_finanzas_y_ubicacion.sql` debe estar aplicada y verificada antes de publicar esta pantalla. No ejecutar en bloque el historial antiguo no reconciliado. La migración no elimina cuentas, archivos ni respuestas y tampoco activa borrado automático.

Pruebas locales: anónimo denegado, confirmación incorrecta denegada, JWT de cuenta inexistente denegado, solicitudes idempotentes, A no ve B, admin puede leer la cola y ningún cliente puede alterar su estado. Se usa una base desechable con datos inventados; faltan las pruebas de integración del servicio remoto y dispositivos.

## Atención operativa que falta validar

1. Asignar un responsable que revise la cola y el correo `clienteslovia@gmail.com`, verifique titularidad cuando sea necesario y comunique recepción y plazo. No se configuró un notificador, un SLA ni un trabajador automático.
2. Inventariar datos y archivos de esa cuenta sin acceder innecesariamente a contenido íntimo. Revisar retención aplicable y referencias de moderación/auditoría antes de decidir su tratamiento.
3. Revocar sesiones y la autorización del proveedor; Sign in with Apple necesita su revocación específica. Borrar una fila de Auth no invalida inmediatamente todos los JWT emitidos. No confirmar revocación sin comprobarla.
4. Resolver archivos propios mediante la API de Storage. No borrar solo filas de `storage.objects`: eso no garantiza retirar los bytes. No borrar archivos compartidos de libros u otros negocios por pertenecer al mismo proyecto.
5. Resolver las referencias `NO ACTION` verificadas en `audit_log`, `reports`, `verification_steps` y `crisis_alerts` conforme al tratamiento acordado; no convertirlas todas a cascada.
6. Ejecutar el borrado desde un servicio autorizado y comprobar datos vinculados, acceso posterior, Storage y reintentos ante fallos parciales. Probar primero una cuenta desechable con avatar, diario, finanzas y referencias.
7. Confirmar al usuario el resultado real y cualquier retención explicada. La solicitud desaparece en cascada al eliminar la cuenta de Auth; definir por separado la evidencia operativa mínima y su retención sin conservar contenido íntimo innecesario.

Este procedimiento aún no está automatizado ni probado de extremo a extremo. El registro de solicitudes y el correo son vías de inicio; **no bastan para declarar terminada la eliminación ni aprobadas las reglas de las tiendas**.

## Vía web

`https://lovia.com.mx/delete-account` explica cómo solicitar la baja desde el correo de la cuenta, incluso sin app instalada. No pedir contraseñas ni documentos en el primer mensaje. Comprobar que el equipo puede recibir y atender ese correo; esta sesión no envió mensajes.

Fuentes: [Supabase: datos y eliminación de usuarios](https://supabase.com/docs/guides/auth/managing-user-data), [Supabase: eliminación de objetos](https://supabase.com/docs/guides/storage/management/delete-objects), [Apple: eliminación de cuenta](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [Google Play: eliminación de cuentas](https://support.google.com/googleplay/android-developer/answer/13327111).

Revisión general: [auditoría previa a builds](revision-prebuild-experiencia-seguridad-2026-11-12.md). Implementación: [mapa y contenciones](mapa-demo-y-correcciones-2026-11-12.md).
