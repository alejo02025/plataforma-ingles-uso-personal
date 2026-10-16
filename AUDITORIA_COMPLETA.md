# English OS / Português OS — Language Studio 3.0

Revisión del 16/10/2026. Base inspeccionada `82c372d`; rama `feat/language-studio-3`. [Informes raíz anteriores, conservados](docs/audit-before-os3/). Este informe distingue código implementado, pruebas ejecutadas y límites pendientes.

## Inspección real

Se ejecutaron ambos espacios públicos antes de modificar y se capturaron 18 estados por idioma en siete viewports: 320×700, 375×812, 390×844, 768×1024, 1024×768, 1280×800 y 1440×900. Las 252 imágenes y medidas originales están en [os3-before](artifacts/redesign/os3-before/observations.json). Incluyen cinco áreas, Ajustes, herramientas de lectura, noticias, práctica, juegos, calendario, oralidad y los cuatro modos de la guía gramatical. Cero errores JavaScript y cero desbordamientos en esos estados; una captura no prueba guardado ni corrección semántica.

Se leyeron AGENTS.md, documentación instalada de Next 16.4 sobre exportación y fuentes, los componentes y bibliotecas solicitados y las pruebas relacionadas. [Hallazgos por pantalla, tipo, impacto, prioridad y validación](docs/OS3_AUDITORIA.md).

## Cambios implementados

| Problema confirmado                                        | Resultado concreto                                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portada decorativa y jerarquía que compite con estudiar    | Hoy compacto, acción principal y cola de hasta tres actividades; cinco destinos, sin cubierta ilustrada ni emojis decorativos                     |
| Player inconsistente, preguntas y feedback repetidos       | ExerciseFrame y LearningInsight compartidos; una pregunta por vez, explicación inline y teoría opcional                                           |
| Un único formato de construcción y comparación literal     | Cinco formatos de gramática y vocabulario con recuperación escrita; variantes explícitas; respuestas abiertas desconocidas pendientes de revisión |
| Ayuda no diferenciada de un intento independiente          | Registro de pistas, consulta contextual y teoría; el primer intento se conserva; nuevos intentos asistidos no acreditan desbloqueo independiente  |
| Apoyo español incompleto                                   | Pares editoriales para objetivos, ejemplos, producción y modelos de las 262 clases; consignas traducidas sin revelar la respuesta                 |
| Guía extensa y dispersa                                    | Constructor y modelo juntos, tres accesos, tiempos y patrones reunidos, borradores y selección conservados                                        |
| Autoevaluación de recuerdo acreditaba vocabulario objetivo | SRS conservado, pero ya no sustituye la evidencia objetiva de un bloque; checkpoints históricos preservados                                       |
| Errores aislados del historial posterior                   | Cuaderno derivado de respuestas reales, categorías, ayudas, reintentos y contexto nuevo; regla de repaso explícita                                |
| Escritura igual para todos los niveles                     | Consignas progresivas A1–C2 y rúbricas de autoevaluación; sin nota automática ficticia                                                            |
| Riesgo de dos builds con fuentes distintas                 | Exportaciones EN/PT derivadas de la misma instantánea de código                                                                                   |

La regresión detectó y permitió corregir un modelo duplicado al expandir el motivo de una respuesta correcta. Se conservó la comprobación que lo detectó. El registro adicional de [cobertura de explicaciones](artifacts/redesign/os3-explanation-coverage.json) distingue resolución editorial de validación semántica.

## Datos y actualización

Se conservan SQL.js, SQLite, IndexedDB, IDs, bases separadas, claves históricas, PDFs, audios, historial y sincronización opcional. No hay migración destructiva ni nuevas dependencias. Los metadatos nuevos viven en JSON opcional; las rutinas históricas de ediciones 1/2 siguen disponibles y las nuevas usan edición 3. Se prueban reanudación e idempotencia: reenviar un intento no reemplaza su primera respuesta.

El guardado local de Jazmín es automático y no requiere GitHub. La sincronización entre dispositivos sigue siendo opcional: no se promete una nube automática que el producto no tiene. La actualización de recursos de la aplicación es compartida; los datos de los idiomas siguen separados. No se borra caché de datos para forzar una actualización visual.

## Aprendizaje y evidencia

La agenda diaria conserva su finalización y usa tareas reales, pendientes, errores, vocabulario vencido y nivel guardado. El presupuesto no obliga a llenar minutos con actividades inventadas. Se preservan 15/20/30/45 minutos y valores históricos 5/40. Una grabación no equivale a pronunciación evaluada; una producción escrita guardada no equivale a escritura correcta; una clase aprobada no certifica MCER.

Inventario estructural reproducible: 262 clases y 428 comprobaciones, sin defectos estructurales detectados. Revisión manual del catálogo histórico: doce muestras, una por nivel e idioma. El banco nuevo tiene 24 situaciones originales revisadas al redactarlas, no un examen validado externamente. No se afirma auditoría semántica completa de 262 clases ni de todos los verbos. [Inventario y muestras](artifacts/redesign/os3-pedagogy.json).

El Companion Volume se utiliza como marco conceptual. La descarga oficial fue bloqueada por el proxy en la revisión previa; no se afirma haberla obtenido. Falta contrastación curricular exhaustiva con sus descriptores. [Consejo de Europa](https://www.coe.int/en/web/common-european-framework-reference-languages).

## Límites pendientes

- Producciones abiertas sin modelo reconocido quedan sin calificar; la escritura usa criterios y autoevaluación. No hay corrección humana automática.
- Oralidad conserva grabación, reproducción y transcripción manual; no hay evaluación acústica de nasales, acento, entonación o fluidez.
- Listening disponible usa voz sintética y un banco limitado por nivel. No equivale a comprensión de hablantes reales; Hoy no repite automáticamente una muestra ya guardada.
- IA local pequeña opcional: ayuda delimitada, no autoridad evaluadora. No se añadieron APIs pagas ni secretos en el navegador.
- PDFs escaneados requieren OCR no incluido. Noticias nuevas, descarga inicial del modelo y sincronización necesitan conexión.
- Falta revisión semántica exhaustiva, pruebas físicas en Safari/iPhone y auditoría WCAG completa. Chromium con tamaños simulados no las sustituye.

[Resultados ejecutados y publicación](RESULTADOS_QA.md) · [Sistema visual](DESIGN_SYSTEM.md) · [Plan y reversibilidad](PLAN_IMPLEMENTACION.md).
