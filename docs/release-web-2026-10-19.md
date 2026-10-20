# Registro de publicación web/PWA de LovIA

Fecha: 19 de octubre de 2026. Publicación solicitada expresamente sin pruebas. Alcance: web/PWA; Android e iOS quedan fuera de este encargo.

## Destino y recuperación

- Repositorio: `GeobookerMx/LovIA`, rama `main`.
- Sitio Netlify verificado mediante API: `elaborate-pavlova-7ebdc9`, site ID real `a5ff2b62-8531-46f7-b7b7-1c9bdb136af8`. El ID inicialmente comunicado (`68efa1d5-8ec7-46d9-8706-0f8e78d3d735`) pertenece al sitio `shimmering-zabaione-1d3b44` sin dominio LovIA. `.netlify/state.json` local se corrigió al ID real y sigue excluido de Git.
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

## Estado de publicación comprobado después del envío

- `origin/main` (`GeobookerMx/LovIA`) llegó a `e7d9eb2`; el sitio siguió entregando `/assets/index-D9lG1oNY.js`.
- El panel Netlify mostró un nuevo despliegue *Published* de `main@622adbb` a las 21:58 y el mensaje «All files already uploaded by a previous deploy with the same commits».
- Una consulta read-only posterior a ambos remotos confirmó `origin/main=e7d9eb2` y `netlify/main=622adbb`. El remoto local llamado `netlify` apunta a `GeobookerMx/elaborate-pavlova-7ebdc9.git`, distinto del repositorio autorizado `GeobookerMx/LovIA`.
- La API confirmó que la fuente Git del sitio es `GeobookerMx/elaborate-pavlova-7ebdc9`, rama `main`, y que su deploy previo era `6ad6e6d77ba019e473ca61bf` desde `622adbb`. Es necesario cambiarla en **Project configuration → Build & deploy → Continuous deployment → Repository → Manage repository → Link to a different repository** a `GeobookerMx/LovIA`, rama `main`, conservando el mismo sitio y dominio. No enviar cambios al otro repositorio para resolverlo.
- Publicación directa autorizada mediante Netlify CLI, usando el paquete local `dist`, `--no-build` y `--site a5ff2b62-8531-46f7-b7b7-1c9bdb136af8`. Commit fuente `f946df56bf493b6cf284b57a9842304b25149c79`, presente en `GeobookerMx/LovIA/main`. Deploy ID `6ad6ebddaeb9797e3bb7dc37`, estado API `ready`, URL `https://lovia.com.mx`; asset público `/assets/index-tdCflfvn.js` (HTTP 200). Sin pruebas funcionales por instrucción del propietario.
- Hasta corregir la fuente Git, una nueva publicación automática desde el repositorio enlazado puede reemplazar esta versión con código antiguo. Repetir Trigger deploy sobre `622adbb` consume minutos y revierte el avance.
- El deploy `6ad6ebddaeb9797e3bb7dc37` se bloqueó temporalmente con `lockDeploy` (respuesta API `locked=true`) para impedir que el repositorio equivocado vuelva a publicarse automáticamente. Tras conectar `GeobookerMx/LovIA` y verificar un build del commit correcto, desbloquear la publicación automática desde Deploys.

## Actualización visual de Halloween y enlace Android

- Código publicado: `a73be836158c367161acd25cf9101a998e96cc47` en `GeobookerMx/LovIA/main`. El commit modifica el banner temporal y añade en la portada el enlace a la ficha pública de Google Play de `mx.lovia.app`.
- La ficha de Google Play confirma que la aplicación Android existe; esta publicación web no cambia el paquete Android instalado ni su versión en la tienda.
- Build de producción completado con `VITE_APP_ENV=production`, `VITE_SUPABASE_EXPECTED_REF=nbpidjpkanwynlhdxowx`, radar y checkout desactivados. No se ejecutaron pruebas funcionales por instrucción del propietario.
- Despliegue anterior recuperable: `6ad6ebddaeb9797e3bb7dc37`. El nuevo paquete se subió como deploy `6ad6ef7e7960070d8af0981b` y se publicó manualmente mediante `restoreSiteDeploy` sin desbloquear el sitio. La API confirma `state=ready`, `published_at` presente y `locked=true`.
- `https://lovia.com.mx` respondió HTTP 200 con `/assets/index-um6kDN3a.js`. El sitio conserva el dominio y la protección contra publicaciones automáticas desde el repositorio enlazado incorrectamente.
- Raven sigue fuera del producto: los prompts maestros lo condicionan a finalidad, licencia para la modalidad digital y revisión profesional. No se anuncia ni se presenta como prueba de estrés o afinidad.
