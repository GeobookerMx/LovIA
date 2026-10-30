# LovIA: estado de migraciones financieras (30-10-2026)

Destino comprobado: Supabase `nbpidjpkanwynlhdxowx` (producción).

## Estado observado

- Historial remoto versionado antes de la contención: cinco migraciones, hasta `20261021034527`.
- Los objetos `finance_answers`, `finance_share_links`, `finance_accept_invite` y `finance_answers_admin_summary` ya existían, aunque las migraciones locales de finanzas `20261029210500`, `20261029220000` y `20261029221500` no figuraban en el historial remoto.
- Antes de corregir: 0 respuestas financieras, 0 enlaces compartidos; `finance_private_save=true`. Una política permitía a Admin leer todas las respuestas y la vista de conteos tenía `SELECT` para cualquier usuario autenticado.
- Contención aplicada y versionada en remoto como `20261030133953_lovia_finanzas_contencion_privacidad_20261030`: guardado apagado; sin política de lectura Admin ni compartida; vista sin permiso para `authenticated`; enlace y función de invitación sin acceso de cliente. Se verificaron flag, políticas y privilegios después de aplicar. No se borraron tablas ni respuestas.

## Riesgo de historial y siguiente paso

**No ejecutar `supabase db push` todavía.** Los archivos anteriores ausentes del historial remoto podrían repetirse después de esta contención y reabrir permisos si una ejecución se interrumpe. Antes de cualquier migración nueva hay que comparar cada objeto remoto con las migraciones locales de `20261028` y `20261029`, registrar de forma justificada las ya aplicadas y probar en una rama de Supabase. El SQL de la contención está en `supabase/migrations/20261030133953_lovia_finanzas_contencion_privacidad_20261030.sql`.

Para habilitar guardado o recomendaciones futuras se requieren pruebas con A, B, anónimo y Admin. Las respuestas financieras deben permanecer privadas hasta que cada persona autorice un resumen concreto y ambas acepten una propuesta de conexión. No usar ingresos, patrimonio o deudas como calificación de valor personal ni como criterio automático de match.
