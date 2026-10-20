# Registro de publicación web/PWA de LovIA

Fecha: 19 de octubre de 2026. Publicación solicitada expresamente sin pruebas. Alcance: web/PWA; Android e iOS quedan fuera de este encargo.

## Destino y recuperación

- Repositorio: `GeobookerMx/LovIA`, rama `main`.
- Sitio Netlify declarado por el propietario: `elaborate-pavlova-7ebdc9`, site ID `68efa1d5-8ec7-46d9-8706-0f8e78d3d735`; el mismo ID figura en `.netlify/state.json`.
- Dominio: `https://lovia.com.mx`.
- Supabase producción: `nbpidjpkanwynlhdxowx`. La configuración local `.env.production` apunta a ese proyecto; la clave pública quedó excluida de Git.
- Código previo: `622adbb218835b1392f2698b136c9be9549ac836`, conservado en la etiqueta `lovia/web-before-2026-10-19`.
- Referencia pública previa: HTML SHA-256 `d22026e4cea26b04d46213cc64050a3032d0c5293f44af1e6473b6d493634c51`, asset principal `/assets/index-D9lG1oNY.js`, ETag `"c90ae0ea792e04c51eafd609ef052a19-ssl"`. Esto no sustituye el ID del despliegue de Netlify, que requiere acceso autenticado al panel o API.

## Alcance técnico

- `main` local incorporó la rama `feature/lovia-seguridad-y-entornos` mediante fast-forward, sin descartar commits.
- `npm run build` de producción completó con `VITE_APP_ENV=production`, referencia Supabase esperada y checkout/pantalla radar desactivados.
- La PWA generó `dist/sw.js`. `dist` queda fuera de Git; se debe publicar como directorio de salida de Netlify.
- No hay migraciones nuevas en `supabase/migrations`. No se aplicará SQL histórico ni se repetirá `20261019155934_lovia_contencion_a_permisos`; su existencia remota fue informada por la auditoría anterior, sin acceso directo al historial en esta sesión.
- No se ejecutaron pruebas funcionales, de permisos ni de dispositivos por instrucción del propietario. La compilación sólo confirma que el paquete se generó.

## Riesgos pendientes de servidor

- La auditoría aportada documenta permisos de actualización sobre campos de confianza y sanción. La web deja de simular verificaciones y oculta acciones administrativas no verificadas, pero esas restricciones requieren migraciones y pruebas de RLS.
- `run-matching` queda bloqueado por código local con respuesta 503; la versión remota desplegada puede ser distinta hasta que se verifique y despliegue la función.
- No declarar estables builds móviles ni flujos de verificación, sanción, pago o borrado de cuenta con esta publicación web.

## Resultado de publicación

Pendiente de completar tras el envío a `main` y confirmación en el dominio. Registrar aquí commit publicado, nuevo asset y estado observable.
