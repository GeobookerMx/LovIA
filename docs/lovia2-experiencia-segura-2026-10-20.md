# LovIA 2.0 — bloque de experiencia y comunicación segura

Fecha: 20 de octubre de 2026
Alcance: cliente web/PWA. Sin SQL, migraciones, despliegue de funciones ni cambios de datos remotos.

## Matriz de entrega

| Requisito | Implementación | Evidencia | Verificación | Pendiente |
|---|---|---|---|---|
| Entrada simple | Onboarding de una pantalla con tres objetivos modificables: conocer personas, comprenderse y cuidar una relación | `src/features/onboarding/OnboardingFlow.tsx`, `src/lib/loviaGoals.ts` | TypeScript, ESLint y build de producción | Prueba funcional con cuentas ficticias |
| Inicio intuitivo | Una acción principal por objetivo, reflexión breve y accesos directos a guía, diario, perfil y conexiones | `src/features/user-dashboard/Home.tsx` | TypeScript, ESLint y build | Medir comprensión y abandono sin usar patrones manipuladores |
| Actividades voluntarias | Módulos y lecciones dejan de depender de `readiness_score`; las rachas no prometen acceso ni afinidad | `ModulesList.tsx`, `ModuleDetail.tsx`, `SparkPage.tsx` | TypeScript, ESLint y build | Revisar derechos y fuentes de cada lección almacenada en base de datos |
| Instrumentos responsables | Apego, Big Five y módulos dejan de prometer porcentajes de mejora, compatibilidad o puntos de readiness | `AttachmentQuiz.tsx`, `BigFiveQuiz.tsx`, `AxisModulePage.tsx` | TypeScript, ESLint y build | Revisión profesional, licencias, versión y población antes de presentarlos como instrumentos validados |
| Contenido honesto | Foro y blog simulados se sustituyen por preguntas originales y avisos de contenido en revisión | `ForumList.tsx`, `BlogList.tsx`, redirecciones de detalle | TypeScript, ESLint y build | Incorporar publicación real con moderación, permisos y trazabilidad editorial |
| Guía transparente | “Dr. LovIA” pasa a “Guía LovIA”; respuestas automáticas sin diagnóstico ni promesas de matching | `GuideChatbot.tsx`, `guideKnowledge.ts` | TypeScript, ESLint y build | Verificar directorio profesional y respuesta de soporte |
| Reflexión sin puntuaciones inventadas | Frecuencia, gráfica, factores y mejora se convierten en explicaciones y preguntas sin valores simulados | `FrequencyPage.tsx`, `GraphPage.tsx`, `FactorsPage.tsx`, `ImprovementPage.tsx` | TypeScript, ESLint y build | Definir contrato de afinidad explicable después de asegurar el servidor |
| Registro adulto | El aviso requiere confirmar 18 años; el consentimiento para datos sensibles es separado y opcional | `LegalModal.tsx`, `Register.tsx`, `authStore.ts` | TypeScript, ESLint y build | Persistencia autoritativa y verificación de edad/consentimiento en servidor; OAuth requiere evidencia remota |
| Privacidad coherente | Se retiran promesas técnicas, científicas y comerciales no comprobadas; se documenta gratuidad hasta el 31 de enero de 2027 | `public/privacy.html`, `PrivacyPolicyPage.tsx`, `LegalModal.tsx` | Búsqueda de afirmaciones contradictorias y build | Revisión jurídica final e identidad completa del responsable |
| Encuentros | El estado emocional genera una recomendación y deja de ser una barrera automática; se conserva la confirmación de medidas básicas | `DateReadinessCheck.tsx` | TypeScript, ESLint y build | Probar bloqueo, reporte y plan con usuarios A/B |
| PWA | Se corrige el tamaño declarado del icono 144 y se genera el service worker con caché de archivos públicos | `vite.config.ts`, `dist/manifest.webmanifest`, `dist/sw.js` | Build de producción exitoso | Prueba de instalación, actualización, cierre de sesión y caché privada en dispositivos reales |

## Verificaciones ejecutadas

- `npx tsc --project tsconfig.app.json --noEmit --incremental false`: correcto.
- ESLint sobre los archivos modificados: correcto.
- `git diff --check`: correcto; sólo se muestran avisos de normalización LF/CRLF.
- Build con `VITE_APP_ENV=production`, Supabase esperado `nbpidjpkanwynlhdxowx`, Radar desactivado y checkout desactivado: correcto.
- PWA generada con 176 entradas precargadas y aproximadamente 1.5 MiB.

## Límites antes de declarar LovIA 2.0 lista

1. Recuperar y conciliar el SQL exacto de `20261019155934_lovia_contencion_a_permisos` con un historial local único.
2. Verificar en Supabase remoto RLS, autorización administrativa, edad, consentimiento, visibilidad, bloqueos y preferencias recíprocas.
3. Probar login por correo, Google y Apple, recuperación, cambio de cuenta y limpieza de datos privados.
4. Probar diario, fotos, bloqueo, reporte, chat y administración con usuarios A/B, anónimo y administrador.
5. Revisar las fuentes, derechos y redacción de todo contenido educativo guardado en la base de datos.
6. Mantener Raven y otros instrumentos sin licencia o revisión suficiente fuera de publicación.

Este bloque no modifica migraciones ni servicios remotos y no acredita por sí solo la seguridad del backend.
