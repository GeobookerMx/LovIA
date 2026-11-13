# Eliminación de cuenta — Estado y guía de despliegue

## ¿Qué hace la función?

La Edge Function `supabase/functions/delete-account/index.ts` permite que un usuario autenticado elimine su propia cuenta de forma segura desde la PWA de LovIA.

### Flujo completo

1. **Frontend** (`SettingsPage.tsx`) invoca la función con `supabase.functions.invoke('delete-account')` usando el token JWT del usuario activo.
2. **Edge Function** valida el token con el cliente anon (SUPABASE_ANON_KEY) para identificar al usuario.
3. **Admin client** (inicializado con `SUPABASE_SERVICE_ROLE_KEY`) llama a `supabaseAdmin.auth.admin.deleteUser(user.id)`.
4. Supabase elimina el registro en `auth.users`, y si las FK están configuradas con `ON DELETE CASCADE`, los datos relacionados se borran en cascada.
5. El frontend cierra sesión y redirige al inicio.

### UI — Doble confirmación (implementada)

| Paso | Qué ve el usuario |
|------|-------------------|
| 0 | Botón "Eliminar cuenta y todos mis datos" (rojo) |
| 1 | Panel de advertencia con lista detallada de datos a eliminar + botón rojo de confirmación + enlace fallback manual |
| — | En caso de error: `alert` con instrucciones + enlace a `lovia.com.mx/delete-account` |

---

## Variables de entorno necesarias

| Variable | Uso |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Validar el JWT del usuario (cliente de usuario) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cliente admin para borrar el usuario (nunca exponer en frontend) |

> [!CAUTION]
> **Nunca uses `SUPABASE_SERVICE_ROLE_KEY` en el frontend.** Solo debe vivir en variables de entorno del servidor / Edge Function.

---

## Cómo desplegar

```bash
# Desde la raíz del proyecto
supabase functions deploy delete-account
```

Si es la primera vez, asegúrate de tener el CLI de Supabase instalado y sesión activa:

```bash
supabase login
supabase link --project-ref <TU_PROJECT_REF>
supabase functions deploy delete-account
```

### Variables en producción

Si las variables no están configuradas en Supabase Dashboard → Settings → Edge Functions, agrégalas:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<valor>
```

---

## Qué falta verificar / probar

### Cascadas en base de datos

> [!IMPORTANT]
> La función borra el usuario de `auth.users`. Los datos en tablas públicas **solo se borran si tienen `ON DELETE CASCADE`** en su FK hacia `auth.users.id`.

Tablas que deben auditarse:

- [ ] `public.profiles` — FK `user_id → auth.users.id ON DELETE CASCADE`
- [ ] `public.matches` — FK `user_id / partner_id`
- [ ] `public.evaluaciones` — FK `user_id`
- [ ] `public.diary_entries` — FK `user_id` (diario de pareja)
- [ ] `public.finances` — FK `user_id`

### Storage (fotos de perfil)

> [!WARNING]
> Supabase Storage **NO** elimina archivos automáticamente al borrar un usuario. Las fotos de perfil deben eliminarse explícitamente.

Opciones:
- Llamar a `supabaseAdmin.storage.from('avatars').remove([...])` **antes** de `deleteUser()` en la Edge Function.
- Crear un trigger en la base de datos que llame a una función de limpieza.

### Pruebas pendientes

- [ ] Desplegar la función con `supabase functions deploy delete-account`
- [ ] Probar el flujo completo en staging: login → Configuración → Eliminar cuenta → confirmación → cierre de sesión
- [ ] Verificar que los datos en todas las tablas sean eliminados
- [ ] Verificar que la foto de perfil sea eliminada de Storage
- [ ] Probar el caso de error (función caída) → confirmar que el `alert` con enlace fallback aparece
- [ ] Revisar logs de la Edge Function en Supabase Dashboard → Functions → Logs

---

## Fallback manual

Si la eliminación automática falla, el usuario puede solicitar la eliminación manualmente en:

**https://lovia.com.mx/delete-account**

O escribir a: **clienteslovia@gmail.com**

---

*Última actualización: activación de `accountDeletionAvailable = true` en SettingsPage.tsx*
