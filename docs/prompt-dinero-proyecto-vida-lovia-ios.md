# Prompt maestro revisado: Dinero y proyecto de vida en LovIA

**Fecha de revisión:** 29 de octubre de 2026. **Estado:** especificación de trabajo; este documento no afirma que el módulo esté implementado o publicado.

## Encargo y límites

Trabaja exclusivamente en LovIA, repositorio `https://github.com/GeobookerMx/LovIA`, Supabase `nbpidjpkanwynlhdxowx`, web `https://lovia.com.mx` y sitio Netlify de ese dominio. Verifica la identidad de cada destino antes de escribir. No mezcles código, datos, credenciales, recursos o migraciones de otros proyectos. Conserva todos los cambios existentes, incluidos los nativos hechos en la iMac. No hagas reset, limpieza ni sobrescrituras automáticas.

Implementa «Dinero y proyecto de vida» como herramienta educativa **opcional para personas de 18 años o más**. Ayudará a identificar prioridades, conversar sobre responsabilidades y revisar acuerdos. No diagnostica, no da asesoría financiera personalizada, no mide la calidad de una persona ni predice el éxito de una pareja. El acceso a LovIA sigue gratuito hasta el **31 de enero de 2027 inclusive**; este módulo no activa pagos ni renovaciones automáticas.

Divide el trabajo en entregas verificables. El módulo no debe bloquear el lanzamiento iOS por sus funciones futuras: puede permanecer desactivado hasta que su recorrido personal y sus permisos estén comprobados. El envío de iOS sí requiere resolver los bloqueos de seguridad y cuenta ya identificados para la app base.

## Fase 0: conciliar antes de programar

1. Revalida raíz Git, remoto, rama, commits locales y remotos, cambios sin commit y rutas reales de la app web y del proyecto Xcode. En Windows hay commits locales de experiencia iOS todavía no compartidos con la iMac; no asumas que `git pull` los lleva al Mac. Conserva los cambios nativos manuales de `ios/` antes de sincronizar Capacitor.
2. Inspecciona rutas, `growth_modules`, `growth_module_lessons`, `growth_progress`, catálogo de evaluaciones, diario, relaciones, bloqueos, roles de Admin, políticas RLS, grants y funciones reales. Reutiliza código sólo si sus permisos y datos son adecuados para respuestas financieras privadas. No guardes estas respuestas en `growth_progress.reflection_answer` sin comprobar antes su modelo de acceso.
3. Concílialas con el historial remoto de migraciones. Hay archivos locales de octubre de 2026 cuyos efectos pudieron aplicarse parcialmente de forma manual; verifica estado por objeto y por historial. No repitas ni marques una migración como aplicada por el nombre del archivo.
4. Comprueba que la configuración iOS utiliza el proyecto Supabase de LovIA, el Bundle ID `com.geobooker.lovia`, recursos web locales y el ícono aprobado. No copies `.env.production` ni secretos a Git.

Entrega una tabla breve «requisito / evidencia actual / decisión / pendiente» y continúa con las tareas locales independientes.

## Entrega 1: recorrido personal pequeño y útil

Publica primero un recorrido **«Me conozco»** de sesiones de 4 a 6 preguntas, con opción de explorar el catálogo completo de 18. Entrada desde `Mi recorrido` y la Guía existente; después de completar el perfil, muestra como máximo una invitación discreta y descartable. Texto sugerido: «Tu proyecto de vida merece acuerdos claros. Explora qué significa el dinero para ti y cómo quieres compartir responsabilidades».

Una pregunta por pantalla, botones cómodos para móvil, atrás, progreso claro, ejemplos cotidianos y reanudación. Todas las preguntas permiten «Prefiero no responder»; ofrece «Todavía no lo sé» cuando tenga sentido. La persona puede salir en cualquier momento. El progreso educativo nunca bloquea mapa, mensajes, conexiones ni otras funciones. No solicites montos de ingresos para iniciar. Evita cronómetros, presión, rachas o recompensas por ingresos o patrimonio.

El guardado debe ser idempotente por usuario, versión y pregunta; doble toque no crea duplicados. Muestra «Guardado» sólo tras confirmación del servidor. Si falla la red o caduca la sesión, conserva el borrador en la pantalla y ofrece reintento sin mostrar la respuesta a otra cuenta. Borra el estado privado en memoria al cerrar sesión o cambiar de usuario. Distingue respuesta contestada, «no sé», «prefiero no responder» y pendiente.

Los resultados personales muestran sólo prioridades elegidas explícitamente, temas que la persona marcó para conversar y una siguiente acción que ella seleccione. No calcules una nota global, compatibilidad financiera, madurez económica, solvencia o personalidad. El progreso de preguntas es distinto de cualquier medida de bienestar financiero.

### Catálogo inicial de contenido original LovIA

Conserva las 18 preguntas del encargo original como contenido educativo **no validado**. Editorialmente organízalas en bloques; ofrece una ruta corta para no imponerlas todas de una vez:

1. ¿Qué significa para ti sentirte realizado económicamente? Hasta tres: tranquilidad, autonomía, tiempo libre, aprender, apoyar a mi familia, vivienda, experiencias, emprender, otra.
2. ¿Qué tan importante es para ti que una pareja tenga ingresos regulares? Escala de 1 a 5; úsala para reflexión, jamás como filtro de personas.
3. ¿Qué esperas que el dinero permita en tu vida? Selección múltiple y texto opcional.
4. ¿Qué decisiones económicas deseas conservar de forma individual? Texto privado opcional.
5. ¿Cómo describirías tus ingresos actualmente? Regulares, variables, combinación, temporalmente sin ingresos, prefiero no responder. Sin importe.
6. ¿Qué tan previsible es lo que recibirás el próximo mes? Nada, poco, algo, bastante, mucho, no aplica.
7. En los últimos tres meses, ¿con qué frecuencia tus recursos alcanzaron para gastos esenciales? Nunca, pocas veces, algunas veces, casi siempre, siempre, no aplica.
8. Si surgiera un gasto imprevisto, ¿qué alternativas tendrías? Ahorro, ajustar gastos, apoyo disponible, crédito, no sé, otra. No jerarquices respuestas.
9. ¿Cómo llevas el control de ingresos y gastos? Registro habitual, revisión ocasional, mentalmente, todavía no lo hago, otra.
10. ¿Tienes obligaciones económicas con hijos, familiares u otras personas? Sí, no, prefiero no responder. No pidas identidades.
11. ¿Qué tan cómodo te resulta conversar sobre deudas u obligaciones que afectarían un proyecto compartido? Escala de 1 a 5.
12. ¿Qué aportaciones, además del dinero, consideras importantes en una relación? Cuidados, tareas, organización, apoyo emocional, otras.
13. ¿Qué forma de repartir gastos te gustaría explorar? Mitad y mitad, proporcional a recursos, por categorías, fondo común, depende de circunstancias, no sé.
14. Si una persona reduce trabajo remunerado para cuidar, ¿qué acuerdo te parecería justo? Texto opcional con ejemplos neutrales.
15. ¿Qué metas te gustaría conversar antes de compartir vivienda? Hijos, ubicación, estudios, trabajo, ahorro, deudas, cuidados, otras.
16. ¿Cómo te gustaría revisar acuerdos económicos? Mensualmente, cuando haya cambios, otra frecuencia, no sé.
17. Ante un desacuerdo sobre dinero, ¿qué necesitas para poder conversar? Tiempo, información clara, tranquilidad, escuchar opciones, otra.
18. ¿Qué tema económico te gustaría comprender mejor de ti? Reflexión privada opcional.

Revisa lenguaje, accesibilidad y posibles sesgos antes de publicar el catálogo. Una persona puede guardar **voluntariamente** una reflexión en Mi Diario; nunca copies allí respuestas por defecto.

Incluye tres escenarios educativos: caída temporal de ingresos; vivienda frente a estudios; reducción de empleo para cuidados. Permite varias respuestas y explica posibles consecuencias sin marcar una como «correcta». La devolución debe plantear preguntas conversables, no decir qué pareja elegir. Las insignias, si se usan, reconocen acciones privadas como «Exploré mis prioridades» y nunca revelan información financiera.

## Entrega 2: conversaciones compartidas con consentimiento

Activa «Nos conocemos» y «Construimos acuerdos» **sólo después** de verificar una relación elegible en servidor y la aceptación explícita de ambas personas. Un match por sí solo no concede lectura de respuestas. Cada persona elige qué resumen concreto compartir; las respuestas privadas y el diario permanecen privados. No permitas que una invitación revele retroactivamente respuestas anteriores ni que la publicación de una versión nueva reinterprete respuestas viejas.

Compara únicamente preguntas equivalentes de la misma versión. Explica coincidencias y diferencias de forma descriptiva, sin porcentajes ni penalización por omisiones. Una coincidencia no demuestra un acuerdo saludable; una diferencia invita a conversar, no a romper. Permite revocar el acceso futuro, abandonar el ejercicio y registrar acuerdos revisables. Bloquear, desvincular o eliminar la cuenta corta el acceso a los resúmenes y acuerdos según la política de retención; explica el límite de capturas o copias ya hechas por la otra persona.

## Entrega 3: herramientas opcionales basadas en fuentes

1. **Presupuesto educativo:** sólo si tiene propósito y revisión de privacidad aprobados. Simula recursos disponibles, gastos esenciales, obligaciones, metas y aportaciones de cuidados/tiempo sin ponerles precios inventados. Ningún dato se usa para recomendar crédito, inversión o posibles parejas. No definas una cifra universal para «vivir bien».
2. **Contexto INEGI:** tarjeta opcional con fuente, fecha, población, geografía, unidad y limitaciones. Distingue ingreso individual y del hogar, monetario y laboral, promedio y mediana, mensual y trimestral, valores nominales y actualizados. ENIGH 2024 y ENSAFI 2023 son fuentes distintas. No publiques «a tu edad deberías ganar…», percentiles improvisados ni datos estatales como nacionales.
3. **Escala publicada de bienestar financiero:** producto separado y desactivado hasta escoger una sola versión, idioma, derechos de uso, modalidad de aplicación, grupo de edad y algoritmo. La escala CFPB tiene versiones estándar y abreviada; su guía de tabulación requiere todas las respuestas para usar la tabla. ENSAFI adaptó redacción para México: no mezcles sus ítems ni puntuaciones con los originales CFPB. Verifica con ejemplos oficiales. No presentes el instrumento propio de LovIA como validado ni uses una puntuación individual para emparejar.

## Datos, seguridad y Admin

Diseña separadamente catálogo/versiones, sesiones/respuestas privadas, resultados privados, invitaciones y consentimientos, resúmenes elegidos para compartir y acuerdos. Si son necesarias tablas nuevas, aplica RLS y grants mínimos por operación; prueba autorización en servidor con usuario A, B, anónimo y rol editorial. Verifica SELECT y UPDATE, propiedad y cambio de propietario, revocación, bloqueos, doble toque, sesiones caducadas y cambio de cuenta. No uses `service_role` en cliente ni `user_metadata` para autorizar.

Ninguna respuesta, monto o resumen financiero va a perfiles públicos, mapa, URL, notificaciones, eventos de analítica, consola o archivos públicos. No crees bucket para este cuestionario. Define exportación, borrado y retención compatibles con la eliminación de cuenta de LovIA. El Admin gestiona preguntas y opciones versionadas, textos, escenarios, fuentes y estados borrador/publicado/archivado mediante un rol editorial; **no** obtiene lectura general de respuestas o diarios. Para métricas, publica sólo agregados con tamaño mínimo de grupo documentado y sin combinaciones que reidentifiquen.

Las migraciones deben ser versionadas, revisadas, ordenadas y comprobadas contra el historial real. Entrega SQL exacto, permisos, estrategia de reversión y estado «aplicado» o «pendiente». No ejecutes SQL históricos a granel ni apliques manualmente una migración que también ejecutará el pipeline. Un interruptor de interfaz no sustituye RLS ni permisos de servidor.

## Criterios de salida y entrega

Antes de activar cada entrega, verifica entrada, salida, regreso, reanudación, guardado confirmado, error de red, doble toque, cierre de sesión, cambio de cuenta, «no sé», «prefiero no responder», correspondencia de resultados con la versión, permisos de A/B/anónimo/Admin, consentimiento/revocación/bloqueo, accesibilidad con teclado/lector, PWA y Safari/iOS. Comprueba que login, perfil, mapa y diario no empeoren. No uses cuentas reales ajenas. Mantén el interruptor apagado si cualquiera de los controles de privacidad falla.

Para el build iOS, conserva el Bundle ID existente y el proyecto nativo de la iMac. Lleva primero los commits locales de LovIA de forma verificable, incorpora el icono de 1024 × 1024 sRGB opaco en `AppIcon`, compila y verifica en simulador y dispositivo el inicio de sesión, cámara, recuperación de cuenta y eliminación de cuenta. No declares listo TestFlight o App Store por una compilación web correcta. No anuncies el módulo como disponible hasta verificar el despliegue real.

Devuelve matriz «requisito → implementación → evidencia → prueba → pendiente», archivos, migraciones realmente aplicadas, commit, estado del despliegue, instrucciones de activación/reversión y un recorrido breve que yo pueda revisar. Distingue código local, build de iMac, TestFlight y publicación de App Store.

## Fuentes para revisar, sin atribuirles aval de LovIA

- [CFPB: escala y guía de tabulación](https://www.consumerfinance.gov/data-research/research-reports/financial-well-being-scale/)
- [INEGI: ENIGH 2024](https://www.inegi.org.mx/programas/enigh/nc/2024/)
- [INEGI: ENSAFI 2023](https://www.inegi.org.mx/programas/ensafi/2023/)
- [OCDE/INFE: Toolkit 2022](https://doi.org/10.1787/cbc4114f-en)
- [Olson y colaboradores: Common Cents](https://doi.org/10.1093/jcr/ucad020)
