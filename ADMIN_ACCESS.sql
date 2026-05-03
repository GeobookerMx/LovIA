-- ═══════════════════════════════════════════════════════
-- ADMIN ACCESS — LovIA!
-- Ejecutar en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════

-- Paso 1: Ver tu user_id (copia el UUID que aparece)
SELECT id, email FROM auth.users WHERE email = 'juan.pablo.pg@hotmail.com';

-- Paso 2: Agregar rol admin en la tabla user_roles
-- (reemplaza TU_USER_ID con el UUID del paso 1)
INSERT INTO public.user_roles (user_id, role)
VALUES ('TU_USER_ID', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Paso 3: Verificar que quedó
SELECT * FROM public.user_roles WHERE role = 'admin';

-- ═══════════════════════════════════════════════════════
-- Para acceder al admin dashboard DESDE EL NAVEGADOR:
-- 1. Inicia sesión en https://www.lovia.com.mx
-- 2. Ve directamente a: https://www.lovia.com.mx/admin
-- (El botón en el perfil aparece solo si el JWT tiene role=admin)
-- (La ruta /admin funciona si tienes fila en user_roles)
-- ═══════════════════════════════════════════════════════
