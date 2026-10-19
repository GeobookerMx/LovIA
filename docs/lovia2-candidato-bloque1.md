# LovIA 2.0 · avance local del bloque 1

19 de octubre de 2026. Esta rama es una preparación local; no hay publicación ni pruebas funcionales en servicios reales.

| Requisito | Implementación local | Evidencia y prueba | Pendiente para candidato |
| --- | --- | --- | --- |
| Conservar trabajo | Rama `feature/lovia-seguridad-y-entornos`, base GitHub `main@622adbb`; resguardos ignorados en `.local-resguardos` | Git status y GitHub, sin reset, pull ni push | Revisar y organizar commits; confirmar conexiones de despliegue |
| Contención remota | Documento aportado reporta migración `20261019155934_lovia_contencion_a_permisos` aplicada | Metadatos antes/después en adjunto del usuario; no se duplicó SQL | Leer historial remoto directamente y conciliar con migraciones locales |
| Staging | Distintivo visible y validación de proyecto separado ya presentes | Compilación con referencia y clave ficticias; sin proyecto real | Netlify/Supabase staging, variables, cuentas ficticias y redirect URLs |
| Matching privilegiado | Cliente ya no lo invoca; función exige POST, secreto de trabajo y flags; límite 500 candidatos/1000 propuestas | Revisión de código; función deshabilitada por defecto | Lock global en BD, cron autorizado, nuevo contrato de elegibilidad/afinidad y prueba A/B/anon/admin antes de habilitar |
| Acceso gratuito | Tienda web oculta ofertas por defecto, dos funciones rechazan checkout hasta después del 31/01/2027 y sin flag explícita; entitlement cliente temporal | Prueba de cambio de día México; TypeScript | Verificar ventas existentes y activar control de derechos en servidor; desplegar protección para clientes antiguos |
| Libro | Fecha corregida; URL deriva del Supabase del entorno | Código y compilación de staging ficticio | Verificar PDF en staging, autoría/derechos y acceso de servidor |
| Halloween | Banner con SVG, cierre y activación por fecha México; off por configuración | Prueba límite 01/11/2026; sin animación o sonido | Prueba visual y de contraste en dispositivo |
| Radar | Ruta de mapa de precisión oculta por defecto; el código anterior se conserva | La ruta segura no solicita GPS | Nueva ubicación aproximada desde servidor, RLS y prueba de revocación; después activar mapa |
| Recuperación | Ruta `/recover` y enlace en login | TypeScript y build | Redirect allowlist de Supabase, email de prueba, nativo y vencimiento de enlace |
| Libro editorial | Tres tarjetas con ID, párrafo y estado `draft`; no visibles al usuario | `src/content/bookCardDrafts.ts` | Confirmación editorial y de derechos antes de publicar |
| PWA y nativo | Build web genera manifest y SW; no se cachean respuestas Supabase en reglas locales | Inspección de artefacto | Navegador/dispositivo: instalación, actualización, logout, offline; Android/iOS con staging real |

## Bloqueos de seguridad

No activar `LOVIA_MATCHING_ENABLED` ni `VITE_ENABLE_RADAR` aún. El motor conserva cálculo heredado que mezcla readiness con compatibilidad y la comprobación de concurrencia sólo cubre una instancia; faltan bloqueo distribuido, edad, consentimiento, visibilidad, bloqueos y límites de acceso en base. La protección de checkout sólo alcanza clientes antiguos tras desplegar las funciones nuevas; no implica que los endpoints hoy publicados ya estén protegidos.

El frontend no es fuente autoritativa de derechos de acceso. La migración remota reportada es evidencia aportada, todavía no contrastada desde este entorno. No se han consultado compras, usuarios o políticas reales.

## Secuencia siguiente

1. Acceso de lectura a Netlify/Supabase: verificar identidad, migraciones, funciones, Auth y compradores existentes sin extraer datos personales.
2. Staging aislado: esquema reconciliado, credenciales de prueba, redirects y cron; después pruebas A/B/anon/admin de RLS y flujos críticos.
3. Implementar descubrimiento seguro en servidor y sustituir el radar heredado; revisar moderación, chat y evaluaciones.
4. Pruebas de PWA y artefactos nativos; plan de despliegue gradual y reversión antes de publicar.
