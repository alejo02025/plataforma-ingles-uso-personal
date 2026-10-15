# Auditoría integral — English OS y Português OS

Fecha: 14–15 de octubre de 2026. Rama de trabajo: `audit/integral-2026-10-14`.

## Alcance y evidencia

Se inspeccionaron arquitectura, almacenamiento, sincronización, motores de ejercicios, progresión, diagnóstico, feedback, PDF y componentes visuales. Se ejecutó un inventario estructural de **todas las 262 clases y sus 428 comprobaciones**. Esto verifica campos, identificadores, opciones y referencias; **no equivale a una validación pedagógica externa de cada descriptor o de cada ítem**. Las revisiones lingüísticas y los cambios se detallan en los informes por idioma.

La referencia primaria es el [MCER Companion Volume, Consejo de Europa, 2020](https://rm.coe.int/common-european-framework-of-reference-for-languages-learning-teaching/16809ea0d4). El intento de acceso desde este entorno obtuvo `403 CONNECT tunnel failed`. No se afirma haber descargado o contrastado directamente el documento en esta ejecución. El contraste pedagógico utiliza las distinciones conocidas entre recepción, producción, interacción y mediación; una alineación validada exige revisión independiente de los ítems y estudio con estudiantes reales.

## Hechos verificados en la versión inicial

| Área           | Hallazgo                                                                                | Riesgo / decisión                                                                                         |
| -------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Arquitectura   | Next 16.4, React 19, TypeScript; API local y exportación estática dual                  | Conservar la arquitectura; no reescribir desde cero                                                       |
| Persistencia   | SQL.js en IndexedDB, dos bases distintas y claves de borrador separadas                 | Mantener nombres, claves, IDs de intentos y migraciones                                                   |
| Sincronización | GitHub opcional; token en memoria; exige repositorio privado con permiso de escritura   | No afirmar sincronización entre dispositivos sin autorización; fallo remoto no debe perder guardado local |
| Recorrido      | Clases ≥80 %, lectura objetiva, vocabulario independiente y escritura de ≥30 caracteres | Esas reglas habilitan contenidos; no certifican competencia ni calidad de escritura                       |
| Diagnóstico    | 12 ítems por idioma, A1–B2; tres competencias; clasificación por bandas                 | Muestra pequeña, incertidumbre alta; no cambia el recorrido automáticamente                               |
| Clases         | 131 por idioma; 214 comprobaciones por idioma; IDs únicos e índices válidos             | Numerosas clases tienen dos ítems: un resultado alto es evidencia muy limitada                            |
| Rutina         | Actividades deterministas; borrador único retomado antes de otra actividad              | El botón de otra tarea puede parecer repetir la anterior; aclarar y controlar reanudación                 |
| Speaking       | El chat oral no aparece en navegación; existen datos y utilidades de voz heredados      | Mantener historial y no presentar transcripción como evaluación de pronunciación                          |
| IA local       | SmolLM2 pequeño, descarga opcional verificada con SHA-256, respuestas vinculadas al PDF | Guía orientativa; no docente acreditado ni evaluador validado                                             |
| Offline        | Service worker guarda aplicación y recursos; PDFs/progreso en IndexedDB                 | Requiere una primera carga completa; modelo y voces tienen requisitos separados                           |
| Documentación  | README aún decía nueve preguntas; banco real tiene doce                                 | Corregir cantidades y describir diagnóstico por versión                                                   |
| Idiomas        | Explicaciones en español estaban mezcladas con interfaz nativa                          | Idioma de estudio primero; español debajo, claramente marcado                                             |

## Apoyo bilingüe revisado

La rama contiene traducciones nativas escritas para las 262 definiciones de clases: 476 campos explicación/tip/why por idioma, además de bases de nivel, usos de tiempos, reglas del constructor y requisitos dinámicos del recorrido. El inventario y las pruebas del módulo no encontraron entradas faltantes en ese conjunto. **Esto no significa traducción automática de PDFs o textos propios**: el contenido del alumno conserva su idioma original. La comprobación visual de entradas faltantes en los recorridos ejecutados se registra en QA.

## Distinciones que debe conservar el producto

1. **Constancia:** días, sesiones y tiempo realmente registrado; la racha no mide habilidad.
2. **Actividad completada:** se guardó un intento o una producción; no implica corrección.
3. **Resultado objetivo:** aciertos sobre un número concreto de ítems, fecha, nivel de la tarea y ayudas.
4. **Habilidad observada:** evidencia limitada a una tarea y condiciones determinadas.
5. **Nivel orientativo:** estimación parcial, con incertidumbre; no certificación MCER.
6. **Competencia demostrada:** requiere evidencia suficiente en contextos variados y evaluación válida. No inventar un porcentaje global de dominio.

## Seguridad y conservación de datos

El código rechaza sincronizar datos privados al repositorio público de la aplicación, valida el formato de los respaldos y distingue espacios `en`/`pt`. No se encontraron claves de proveedor embebidas en las rutas inspeccionadas. Esto es una revisión de código, no una auditoría de penetración ni garantía universal de seguridad.

Se conservan las tablas existentes y los hitos monotónicos. No se autoriza borrar datos, cambiar el punto de partida existente a B1 automáticamente, publicar o fusionar la rama. La preferencia actual de English OS sigue siendo A2 como recorrido de consolidación, aunque la meta personal sea B2 y el diagnóstico pueda orientar a B1.

## Correcciones pedagógicas implementadas en la rama

- Diagnóstico ampliado de 12 a **24 ítems** por idioma: seis por banda A1–B2, dos por competencia y banda. Se conservan los IDs antiguos y los diagnósticos ya cerrados de nueve/doce preguntas. La regla nueva exige al menos cinco de seis por banda; conserva el criterio histórico para sesiones antiguas.
- Nuevos contextos de decisiones, logística, recibos/reembolsos, posesivos, rutinas/acciones actuales y relaciones causales; no se mide escritura/listening/speaking con este diagnóstico.
- Correcciones editoriales PT y aclaración de contrafactuales pasados en B2; explicación inglesa del tercer condicional corregida.
- El banco inicial concentraba la respuesta correcta en la primera opción: 148/214 EN y 150/214 PT. Se modifica el orden **visual** de opciones sin cambiar índices persistidos, IDs ni revisión histórica.
- Clase centrada en una pregunta, feedback de la primera respuesta, aplicación personal sin nota inventada, resumen y repaso/próxima clase con ID real.

## Límites pendientes

- PDFs escaneados sin texto: no se implementa OCR; las pruebas usan PDFs sintéticos con texto extraíble.
- Evaluación externa de escritura y pronunciación; no hay rúbrica validada aplicada por evaluadores humanos.
- Validez psicométrica del diagnóstico y equivalencia MCER de los bancos.
- Safari/iPhone físico, voces regionales y políticas reales de expulsión de almacenamiento.
- Sincronización privada real con credenciales de usuario: los recorridos automatizados usan un servicio GitHub simulado, nunca tokens reales.
- Una revisión completa del Companion Volume requiere acceso a la fuente oficial y revisión externa.

Los resultados ejecutados, capturas y fallos están en `RESULTADOS_QA.md`; las recomendaciones no ejecutadas se mantienen identificadas allí.

## Integración final implementada

- Inicio reorganizado: recomendación accionable y motivo, semana resumida, habilidades medidas o pendientes, accesos y recorrido. El tutorial de primera visita se conserva visible después de la acción principal; la sugerencia extendida queda disponible en un desplegable.
- Edición 2 de rutinas con seis ítems contextualizados, ilustraciones SVG originales y secuencias alternativas explícitas para reforzar. La edición 1, las primeras respuestas y los resultados anteriores permanecen reproducibles. Cada tarea conserva su propio borrador; «siguiente» busca el próximo paso pendiente.
- PDF Studio conserva varios documentos, historial y papelera; añade dos paneles en escritorio, pestañas móviles y borradores por sección/ronda. No se añade OCR.
- Analítica y vocabulario separan recuerdo autorreportado, ayuda utilizada y resultado objetivo. Escritura guardada y rachas no producen notas de competencia.
- Práctica oral: audio local reproducible, notas/transcripción **manual**, reflexión y tareas auditivas breves con voz sintética. Solo las preguntas auditivas sin transcripción visible entran como resultado objetivo limitado; pronunciación, fluidez y calidad de contenido oral siguen sin evaluación. No se reintroduce charla oral con IA.
- Audio pendiente: navegación y actualización se detienen mientras se solicita permiso, graba o termina de guardar; el micrófono se libera si falla la inicialización. Las actualizaciones revisan nuevamente ese estado antes de recargar.
- La instrucción del modelo PDF respeta English/Brazilian Portuguese y evita presentarse como evaluador acreditado; conserva los controles de citas y de nombres ajenos a la fuente. Sus respuestas siguen siendo orientativas.

## Almacenamiento de audio y límites de respaldo

No se agrega una migración ni se sustituyen tablas. El gráfico y el calendario muestran registros orales legibles y suman solo su duración técnica, sin exponer JSON ni inventar notas. Los metadatos `oral-v1` usan mensajes existentes; los Blob se guardan en IndexedDB del espacio correspondiente. El respaldo de progreso conserva metadatos y notas, **no los archivos de audio**. La descarga permite guardar una copia externa. Al borrar almacenamiento del navegador se pueden perder datos locales; no se promete sincronización automática entre dispositivos sin el respaldo privado configurado. Una grabación en curso no es un guardado confirmado hasta detenerla.

## Archivos y responsabilidades

| Grupo                       | Archivos principales                                                                                                                     | Cambio                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Inicio y sistema visual     | `dashboard.tsx`, `daily-guide.tsx`, `daily-rewards.tsx`, `audit-design.css`, `layout.tsx`                                                | Jerarquía, recomendación, idiomas, temas y foco                       |
| Rutina y continuidad        | `routine.ts`, `routine-store.ts`, `routine-draft.ts`, `home-routine.tsx`, `routine-session.tsx`, `routine-scene.tsx`, bancos `routine-*` | Edición contextual, borradores separados, siguiente paso y reintentos |
| Clases y diagnóstico        | `classes.tsx`, `classes.css`, `placement.ts`, `diagnostic.tsx`, `lesson-store.ts`, `content.ts`, `pt-BR/content.ts`                      | Una pregunta, primera respuesta, localización, 24 ítems, persistencia |
| Apoyo bilingüe              | `study-copy.tsx`, `study-copy.ts`, `native-*.json`, `answer-feedback.ts`, `correction.tsx` y puntos de uso                               | Nativo primero y español después; diccionario editorial cerrado       |
| PDF/vocabulario/juegos      | `pdf-studio.tsx`, `audit-studio.css`, `reader.tsx`, `vocabulary.tsx`, `games.tsx`                                                        | Dos paneles, móvil, borradores, recuperación activa y feedback        |
| Evidencia y progreso        | `evidence-summary.ts`, `analytics.tsx`, `progress-path.tsx`, `momentum-chart.tsx`                                                        | Constancia, resultados y competencias separados                       |
| Práctica oral               | `oral-practice.tsx`, `oral-practice.ts`, `oral-store.ts`, `oral-scenarios.ts`, `oral-practice.css`                                       | Grabaciones, notas, escucha limitada y ausencia de notas inventadas   |
| Integración y actualización | `english-app.tsx`, `app-update.tsx`, API de navegador y servidor, `local-ai.ts`                                                          | Navegación, audio pendiente, guardado seguro e idioma del tutor PDF   |
| Verificación                | Nuevas pruebas de evidencia/copia/oral, suites de páginas y servidor, `artifacts/audit/`                                                 | Recorridos, regresión, capturas y límites                             |

No se cambian dependencias ni archivos publicados de raíz. Los cambios de las fuentes no se copian a GitHub Pages durante esta intervención.
