# LovIA! — Fundamentos Científicos y Justificación Técnica

> Documento guía que explica la base científica, los instrumentos utilizados, las variables medidas y la lógica de scoring que fundamenta cada componente de la plataforma.

---

## 1. Modelo Triangular — Las 3 Líneas

### Origen
La Teoría Triangular del Amor de **Robert J. Sternberg (1986)** propone que el amor se compone de tres dimensiones interdependientes.

### Adaptación en LovIA!

| Línea | Base Sternberg | Qué mide en LovIA! | Peso |
|-------|---------------|---------------------|------|
| **❤️ Amor** | Intimidad | Apertura emocional, confianza, posibilidad de connexión profunda | **40%** |
| **🔥 Sexual** | Pasión | Prioridad de la intimidad física/sexual, atracción, deseo | **25%** |
| **⭐ Realización** | Compromiso | Estabilidad de vida, metas profesionales/personales, madurez | **35%** |

### Justificación de pesos
- **Amor 40%**: El meta-análisis de Aron et al. (2005) muestra que la intimidad emocional es el predictor más fuerte de satisfacción relacional a largo plazo.
- **Realización 35%**: Maslow (1954) y estudios de Hewitt (2020) demuestran que la autorrealización individual es prerequisito para relaciones saludables.
- **Sexual 25%**: Perel (2006) documenta que la pasión es esencial pero fluctúa más que las otras dimensiones.

### Referencia
```
Sternberg, R.J. (1986). A triangular theory of love.
    Psychological Review, 93(2), 119-135.
```

---

## 2. Frecuencia de Relación (Frequency Score)

### Concepto
Score compuesto (0-100) que representa la "preparación relacional" del usuario. No mide cuánto desea una relación, sino su capacidad actual multidimensional para sostener una.

### Fórmula

```
Frecuencia_bruta = Amor × 0.40 + Sexual × 0.25 + Realización × 0.35
Penalización_estrés = (PSS4_score / 16) × 15   [máx -15 pts]
Frecuencia_final = clamp(Frecuencia_bruta - Penalización_estrés, 10, 99)
```

### Niveles

| Rango | Nivel | Emoji | Interpretación |
|-------|-------|-------|----------------|
| 80-99 | Armonizador | 🌟 | Alta capacidad relacional, equilibrio entre las 3 dimensiones |
| 65-79 | Constructor | 🏗️ | Buena base, algunas áreas por fortalecer |
| 50-64 | Explorador | 🧭 | En proceso de descubrimiento, áreas de oportunidad |
| 35-49 | Buscador | 🔍 | Necesita trabajo en varias dimensiones antes del matching |
| 10-34 | Despertar | 🌅 | Se sugiere enfoque en crecimiento personal primero |

### Referencia de niveles
Inspirados en el Modelo Transteórico del Cambio de Prochaska & DiClemente (1983), adaptado al contexto relacional.

---

## 3. PSS-4 — Escala de Estrés Percibido

### Instrumento original
La **Perceived Stress Scale** (Cohen, Kamarck & Mermelstein, 1983) es uno de los instrumentos más validados globalmente para medir estrés percibido. La versión de 4 ítems (PSS-4) es una versión breve con confiabilidad aceptable (α ≈ 0.60-0.70).

### Ítems implementados

| # | Ítem | Reversed |
|---|------|----------|
| 1 | "¿Con qué frecuencia has sentido que no podías controlar las cosas importantes de tu vida?" | No |
| 2 | "¿Con qué frecuencia te has sentido seguro/a de tu capacidad para manejar tus problemas personales?" | **Sí** |
| 3 | "¿Con qué frecuencia has sentido que las cosas iban bien?" | **Sí** |
| 4 | "¿Con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?" | No |

### Escala de respuesta
0 = Nunca → 4 = Muy frecuentemente (5 puntos Likert)

### Scoring
- Ítems 2 y 3 se invierten: `(4 - respuesta)`
- Rango total: 0-16
- Clasificación: Bajo (0-4), Moderado (5-8), Alto (9-12), Muy alto (13-16)

### Por qué se usa como penalización
La investigación de Cohen (1994) muestra que el estrés elevado deteriora la capacidad de regulación emocional y comunicación en pareja. La penalización máxima de 15 puntos refleja que una persona bajo estrés severo puede temporalmente tener una capacidad relacional reducida, **no que sea incompatible**.

### Referencia
```
Cohen, S., Kamarck, T., & Mermelstein, R. (1983). A global measure
    of perceived stress. Journal of Health and Social Behavior, 24(4), 385-396.
```

---

## 4. ICI — Inventario de Creencias Irracionales (Tolerancia a la Frustración)

### Instrumento
Adaptación del **Irrational Beliefs Test** de Jones (1968), validado en población mexicana por investigadores de la **UNAM** (Guzmán-González et al.). La subescala utilizada mide específicamente la **Baja Tolerancia a la Frustración**.

### Ítems (4)

| # | Ítem | Qué mide |
|---|------|----------|
| 1 | "Cuando algo no sale como espero, siento que no puedo soportarlo." | Tolerancia al fracaso |
| 2 | "Si mi pareja cambia de planes, me resulta difícil adaptarme." | Flexibilidad cognitiva |
| 3 | "Necesito que las cosas funcionen como las planeo." | Control rígido |
| 4 | "Me resulta difícil aceptar lo que no puedo controlar." | Aceptación |

### Escala
1-5 Likert (Nunca → Siempre). Rango: 4-20.

### Scoring (invertido)
Score alto en el test = baja tolerancia. Se invierte para la interpretación:
```
Score_interpretado = 24 - Score_bruto   [rango efectivo: 4-20]
≥16: 🟢 Alta tolerancia
11-15: 🟡 Media
6-10: 🟠 Baja
<6: 🔴 Muy baja — se sugiere apoyo profesional
```

### Por qué es relevante
Gottman (1994) identificó que la incapacidad de tolerar frustración en pareja es uno de los precursores de los "4 Jinetes" (criticismo, desprecio, actitud defensiva, evasión). Medir esto permite dirigir a usuarios hacia recursos antes de que patrones destructivos se instalen.

---

## 5. ERQ — Cuestionario de Regulación Emocional

### Instrumento original
El **Emotion Regulation Questionnaire** (Gross & John, 2003) mide dos estrategias de regulación emocional:

| Estrategia | Subescala | # Ítems | Qué mide |
|-----------|-----------|---------|----------|
| **Reevaluación Cognitiva** (CR) | erq_1 a erq_5 | 5 | Capacidad de cambiar la perspectiva sobre una situación emocional |
| **Supresión Expresiva** (ES) | erq_6, erq_9 + 2 más | 4 | Tendencia a inhibir la expresión emocional |

### Escala
1-7 Likert (Totalmente en desacuerdo → Totalmente de acuerdo)

### Interpretación
- **CR alto + ES bajo** = regulación saludable (ideal para relaciones)
- **CR bajo + ES alto** = regulación problemática (riesgo de comunicación deficiente)
- **Ambos altos o bajos** = perfiles mixtos que requieren análisis individual

### Por qué es relevante
Gross (2002) demostró que las personas que usan reevaluación cognitiva tienen mejores relaciones interpersonales y mayor satisfacción relacional. La supresión, en contraste, se asocia con menor satisfacción de pareja (Butler et al., 2003).

### Referencia
```
Gross, J.R. & John, O.P. (2003). Individual differences in two
    emotion regulation processes. Journal of Personality and Social
    Psychology, 85(2), 348-362.
```

---

## 6. Test Stroop — Control Cognitivo (Gate Nivel 2)

### Instrumento original
El **Stroop Color-Word Test** (Stroop, 1935) es el estándar de oro para medir atención selectiva y control inhibitorio.

### Implementación en LovIA!

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| Total ensayos | 12 | Balance entre confiabilidad y fatiga (MacLeod, 1991) |
| % Incongruente | 70% | Proporciona suficientes ensayos diagnósticos (Miyake et al., 2000) |
| Variables medidas | RT + Accuracy | Doble métrica evita artefactos de speed-accuracy trade-off |
| Scoring | 60% accuracy + 40% speed | Prioriza precisión sobre velocidad (Conway et al., 2005) |

### Fórmula de scoring
```
speed_score = clamp((3000ms - avg_RT) / 2500ms, 0, 1)
combined_score = round((accuracy × 0.60 + speed_score × 0.40) × 100)
```

### ¿Por qué 70% incongruente?
En un test Stroop estándar, los ensayos incongruentes (palabra ≠ color tinta) son los que producen **interferencia** — el fenómeno que se está midiendo. El 30% de ensayos congruentes sirve como baseline de comparación. Miyake et al. (2000) y Kane & Engle (2003) recomiendan mayoría incongruente para maximizar la señal diagnóstica.

### Niveles
| Score | Nivel | Color |
|-------|-------|-------|
| ≥80 | 🟢 Alto control cognitivo | Verde |
| 60-79 | 🟡 Control adecuado | Amarillo |
| 40-59 | 🟠 Control en desarrollo | Naranja |
| <40 | 🔴 Requiere fortalecimiento | Rojo |

### Relevancia relacional
El control inhibitorio predice la capacidad de **no reaccionar impulsivamente** durante conflictos de pareja. Finkel et al. (2009) demostraron que las personas con mejor control inhibitorio reportan menos agresión en relaciones íntimas.

### Referencias
```
Stroop, J.R. (1935). Studies of interference in serial verbal reactions.
    Journal of Experimental Psychology, 18(6), 643-662.

Miyake, A., Friedman, N.P., Emerson, M.J., Witzki, A.H., Howerter, A., & Wager, T.D. (2000).
    The unity and diversity of executive functions and their contributions to complex
    "frontal lobe" tasks. Cognitive Psychology, 41, 49-100.

Finkel, E.J., DeWall, C.N., Slotter, E.B., Oaten, M., & Foshee, V.A. (2009).
    Self-regulatory failure and intimate partner violence perpetration.
    Journal of Personality and Social Psychology, 97(3), 483-499.
```

---

## 7. Digit Span — Memoria de Trabajo (Gate Nivel 3)

### Instrumento original
Subtest de la **Wechsler Adult Intelligence Scale (WAIS-IV)** (Wechsler, 2008). Mide la capacidad de **memoria de trabajo** (working memory).

### Implementación en LovIA!

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| Span inicial | 3 dígitos | Piso fácil para reducir ansiedad de evaluación |
| Span máximo | 9 dígitos | Techo basado en "7 ± 2" de Miller (1956) |
| Criterio de fin | 2 fallos consecutivos | Estándar WAIS-IV |
| Exposición por dígito | 800ms | Estándar neuropsicológico (Woods et al., 2011) |
| Pausa entre dígitos | 300ms | Evita agrupamiento (chunking) |

### Normas de referencia (adultos)

| Span | Interpretación | Percentil aprox. |
|------|---------------|-----------------|
| ≥7 | 🟢 Alta | >75 |
| 5-6 | 🟡 Normal | 25-75 |
| 4 | 🟠 Bajo normal | 10-25 |
| ≤3 | 🔴 Deficiente | <10 |

### Por qué memoria de trabajo importa en relaciones
**Engle (2002)** demostró que la capacidad de working memory predice la capacidad de:
1. **Mantener múltiples perspectivas** durante un conflicto
2. **Inhibir respuestas automáticas** (similar al Stroop pero a nivel de contenido)
3. **Actualizar información** sobre el estado emocional de la pareja

Baddeley (2003) argumentó que el working memory es el "espacio de trabajo mental" donde se procesan las emociones complejas de una relación.

### Referencias
```
Wechsler, D. (2008). WAIS-IV Administration and Scoring Manual.
    Pearson.

Baddeley, A. (2003). Working memory: Looking back and looking forward.
    Nature Reviews Neuroscience, 4, 829-839.

Engle, R.W. (2002). Working memory capacity as executive attention.
    Current Directions in Psychological Science, 11(1), 19-23.

Miller, G.A. (1956). The magical number seven, plus or minus two.
    Psychological Review, 63(2), 81-97.
```

---

## 8. Motor de Matching — Pipeline de Compatibilidad

### Arquitectura
El matching usa un pipeline de 5 etapas, donde cada etapa filtra o puntúa:

```
Candidatos → [Geo] → [Edad] → [Frecuencia ±15] → [Factores] → [Riesgo] → Score Final
```

### Pesos del score final

| Componente | Peso | Método | Justificación |
|-----------|------|--------|---------------|
| Frecuencia | 30% | `1 - |freq_A - freq_B| / tolerance` | Personas con Frecuencia similar → similitud en preparación relacional |
| Factores | 50% | Similaridad coseno en vectores de factores | Gottman (1999): compatibilidad de valores y comunicación > atracción |
| Riesgo | 10% | Overlap en factores negativos (codependencia, etc.) | Penalización por factores de riesgo compartidos |
| Confianza | 10% | Nivel de verificación + completitud de perfil | Incentiva verificación y perfiles completos |

### Factores medidos (27 total)

#### Factores Comunes (matching por similitud)
| Factor | Base científica |
|--------|----------------|
| Valores compartidos | Schwartz (1992) — Teoría de Valores Básicos |
| Lenguaje del afecto | Chapman (2015) — 5 Love Languages |
| Intención relacional | Gottman (1999) — Metas compartidas |
| Visión de familia | Bradbury & Karney (2010) |

#### Factores Positivos (predictores de éxito)
| Factor | Base científica |
|--------|----------------|
| Inteligencia emocional | Salovey & Mayer (1990) |
| Comunicación asertiva | Rosenberg (2015) — CNV |
| Regulación emocional | Gross & John (2003) — ERQ |
| Empatía | Gottman (1999) |
| Resolución de conflictos | Gottman (1999) — 4 Jinetes |
| Mentalidad de crecimiento | Dweck (2006) |

#### Factores Negativos (señales de riesgo)
| Factor | Base científica |
|--------|----------------|
| Codependencia | Beattie (1986) |
| Autocrítica excesiva | Gilbert & Procter (2006) |
| Control rígido | Jones (1968) — ICI |
| Evasión de conflictos | Gottman (1994) — El cuarto jinete |

### Filtros pre-scoring

| Filtro | Parámetro | Justificación |
|--------|-----------|---------------|
| Geografía | Haversine ≤ max_km (o relocatable) | Practicidad logística |
| Edad | ±range (flexible si `age_flexible=true`) | Respetar preferencia del usuario |
| Frecuencia | ±15 puntos de tolerancia | Evitar matches entre perfiles muy disímiles |
| Frecuencia mínima | ≥40 para acceder a matching | Asegurar preparación relacional mínima |

---

## 9. Sistema de Levels (5 niveles de progressión)

### Estructura

| Level | Contenido | Cooldown | Gate |
|-------|----------|----------|------|
| 1 | Chat texto + Audio | — | Onboarding Level 1 completado |
| 2 | Videollamada | 24h desde Level 1 | Test Stroop (control cognitivo) |
| 3 | Plan de encuentro | 48h desde Level 2 | Digit Span (working memory) |
| 4 | Encuentro presencial | 72h desde Level 3 | — |
| 5 | Post-encuentro review | Post-encuentro | — |

### Justificación de cooldowns
Los cooldowns están basados en la investigación de **Aron et al. (1997)** sobre la "expansión del self" — las conexiones más duraderas se construyen con exposición gradual, no instantánea. Los intervalos de 24-48-72 horas permiten reflexión y reducen decisiones impulsivas.

### Expiración: 30 días
Un match expira a los 30 días sin actividad. Basado en la "paradoja de la elección" de **Schwartz (2004)**: demasiadas opciones abiertas generan parálisis y reducción en la calidad de decisión.

---

## 10. Daily Spark — Bienestar Emocional

### Concepto
Un check-in diario breve que registra el estado emocional del usuario y proporciona micro-consejos personalizados.

### Base científica
- **Fredrickson (2001)** — Broaden-and-Build Theory: emociones positivas expanden el repertorio cognitivo
- **Lyubomirsky (2005)** — Actividades intencionales contribuyen ~40% a la felicidad habitual
- **Seligman (2011)** — PERMA model: Positive emotions, Engagement, Relationships, Meaning, Accomplishment

---

## 11. Disclaimer Legal y Ético

> **⚠️ IMPORTANTE**: LovIA! es una herramienta de orientación y autoconocimiento. **NO** sustituye:
> - Diagnóstico psicológico profesional
> - Terapia de pareja o individual
> - Evaluación psiquiátrica
>
> Los tests implementados son screenings validados que **orientan** hacia recursos cuando se detectan indicadores. Cuando los resultados sugieren niveles críticos, la app dirije activamente al usuario hacia el directorio de profesionales verificados.

### Cumplimiento regulatorio
- **LFPDPPP (México)** — Art. 16: Transparencia algorítmica
- **Derechos ARCO** — Acceso, Rectificación, Cancelación, Oposición
- **GDPR** (preparación para expansión) — Consentimiento informado

---

## Bibliografía Completa

1. Aron, A., Fisher, H., Mashek, D.J., Strong, G., Li, H., & Brown, L.L. (2005). Reward, motivation, and emotion systems associated with early-stage intense romantic love. *Journal of Neurophysiology, 94*(1), 327-337.
2. Aron, A., Melinat, E., Aron, E.N., Vallone, R.D., & Bator, R.J. (1997). The experimental generation of interpersonal closeness. *Personality and Social Psychology Bulletin, 23*(4), 363-377.
3. Baddeley, A. (2003). Working memory: Looking back and looking forward. *Nature Reviews Neuroscience, 4*, 829-839.
4. Beattie, M. (1986). *Codependent No More*. Hazelden Foundation.
5. Bowlby, J. (1969). *Attachment and Loss, Vol. 1*. Basic Books.
6. Bradbury, T.N., & Karney, B.R. (2010). *Intimate Relationships*. W.W. Norton.
7. Butler, E.A., Egloff, B., Wilhelm, F.H., Smith, N.C., Erickson, E.A., & Gross, J.J. (2003). The social consequences of expressive suppression. *Emotion, 3*(1), 48-67.
8. Chapman, G. (2015). *The 5 Love Languages*. Northfield Publishing.
9. Cohen, S., Kamarck, T., & Mermelstein, R. (1983). A global measure of perceived stress. *Journal of Health and Social Behavior, 24*(4), 385-396.
10. Conway, A.R.A., Kane, M.J., Bunting, M.F., Hambrick, D.Z., Wilhelm, O., & Engle, R.W. (2005). Working memory span tasks: A methodological review. *Psychonomic Bulletin & Review, 12*(5), 769-786.
11. Dweck, C.S. (2006). *Mindset: The New Psychology of Success*. Random House.
12. Engle, R.W. (2002). Working memory capacity as executive attention. *Current Directions in Psychological Science, 11*(1), 19-23.
13. Finkel, E.J., DeWall, C.N., Slotter, E.B., Oaten, M., & Foshee, V.A. (2009). Self-regulatory failure and intimate partner violence perpetration. *Journal of Personality and Social Psychology, 97*(3), 483-499.
14. Fredrickson, B.L. (2001). The role of positive emotions in positive psychology. *American Psychologist, 56*(3), 218-226.
15. Gilbert, P., & Procter, S. (2006). Compassionate mind training for people with high shame and self-criticism. *Clinical Psychology & Psychotherapy, 13*(6), 353-379.
16. Gottman, J.M. (1994). *What Predicts Divorce?* Lawrence Erlbaum Associates.
17. Gottman, J.M. (1999). *The Seven Principles for Making Marriage Work*. Crown.
18. Gross, J.J. (2002). Emotion regulation: Affective, cognitive, and social consequences. *Psychophysiology, 39*(3), 281-291.
19. Gross, J.J., & John, O.P. (2003). Individual differences in two emotion regulation processes. *Journal of Personality and Social Psychology, 85*(2), 348-362.
20. Jones, R.G. (1968). *A factored measure of Ellis' Irrational Belief System*. Test Systems.
21. Kane, M.J., & Engle, R.W. (2003). Working-memory capacity and the control of attention. *Journal of Experimental Psychology: General, 132*(1), 47-70.
22. Lyubomirsky, S. (2005). *The How of Happiness*. Penguin Press.
23. MacLeod, C.M. (1991). Half a century of research on the Stroop effect. *Psychological Bulletin, 109*(2), 163-203.
24. Maslow, A.H. (1954). *Motivation and Personality*. Harper & Row.
25. Miller, G.A. (1956). The magical number seven, plus or minus two. *Psychological Review, 63*(2), 81-97.
26. Miyake, A., et al. (2000). The unity and diversity of executive functions. *Cognitive Psychology, 41*, 49-100.
27. Perel, E. (2006). *Mating in Captivity*. HarperCollins.
28. Prochaska, J.O., & DiClemente, C.C. (1983). Stages and processes of self-change of smoking. *Journal of Consulting and Clinical Psychology, 51*(3), 390-395.
29. Rosenberg, M.B. (2015). *Nonviolent Communication*. PuddleDancer Press.
30. Salovey, P., & Mayer, J.D. (1990). Emotional intelligence. *Imagination, Cognition, and Personality, 9*(3), 185-211.
31. Schwartz, B. (2004). *The Paradox of Choice*. Ecco.
32. Schwartz, S.H. (1992). Universals in the content and structure of values. *Advances in Experimental Social Psychology, 25*, 1-65.
33. Seligman, M.E.P. (2011). *Flourish*. Free Press.
34. Sternberg, R.J. (1986). A triangular theory of love. *Psychological Review, 93*(2), 119-135.
35. Stroop, J.R. (1935). Studies of interference in serial verbal reactions. *Journal of Experimental Psychology, 18*(6), 643-662.
36. Wechsler, D. (2008). *WAIS-IV Administration and Scoring Manual*. Pearson.
37. Woods, D.L., Kishiyama, M.M., Yund, E.W., Herron, T.J., Edwards, B., Poliva, O., ... & Reed, B. (2011). Improving digit span assessment of short-term verbal memory. *Journal of Clinical and Experimental Neuropsychology, 33*(1), 101-111.
