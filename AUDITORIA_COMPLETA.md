# Auditoría y reconstrucción de la experiencia

Revisión: 15/10/2026. Base real inspeccionada: `4d78acf`, obtenida de `origin/main` antes de modificar. Rama: `redesign/study-first-2026-10-15`. Esta revisión reemplaza el diseño de inicio anterior; [los informes previos se conservan como historial](docs/audit-2026-10-14/RESULTADOS_QA.md).

## Alcance verificado

Se ejecutaron ambas aplicaciones públicas, con perfiles temporales, a 1440×900, 1280×800, 768×1024, 390×844 y 375×812. Se visitaron todos los destinos anteriores; las herramientas secundarias también se recorrieron en escritorio y móvil. Las **92 capturas anteriores** y sus observaciones están en [artifacts/redesign/before](artifacts/redesign/before/observations.json).

No se usaron datos privados de los estudiantes. Las medidas de pantalla son Chromium con viewports configurados, no pruebas sobre un iPhone físico.

## Hallazgos confirmados y respuesta implementada

| Hallazgo observado                                                               | Cambio de producto                                                                                           |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Trece destinos en el menú, más navegación inferior y un menú móvil adicional     | Cinco áreas reales; herramientas agrupadas mediante pestañas internas. Sin hamburger                         |
| Biblioteca dividida entre PDFs, materiales y lecturas                            | Biblioteca contiene Archivos, Lecturas y Noticias. Un solo importador de PDFs; importación de texto separada |
| Inicio mezclaba la recomendación con un contador de otro conjunto de actividades | Agenda diaria persistente con referencias a tareas reales; el contador usa esas mismas tareas                |
| La recomendación se podía renovar indefinidamente                                | Día finito, finalización estable, dos acciones secundarias al terminar                                       |
| Catálogo de Clases de unos 18.000 px en un móvil nuevo de inglés                 | Un bloque de cuatro clases, selector de bloque y siguiente clase destacada                                   |
| Referencia gramatical duplicada dentro y fuera de Clases                         | Una guía siempre desbloqueada dentro de Clases                                                               |
| Siete hojas de estilos acumuladas, además de `classes.css`                       | Dos hojas con responsabilidades distintas: base compartida y herramientas de estudio                         |
| Información técnica competía con estudiar                                        | Ajustes reúne tiempo habitual, tema, diagnóstico, sincronización, estado offline y actualización             |

El [registro detallado de inspección](docs/REDISENO_DEFINITIVO.md) distingue observaciones previas y decisiones. Las capturas no prueban por sí solas persistencia, accesibilidad ni corrección pedagógica: esos aspectos tienen pruebas separadas.

## Arquitectura conservada

Next.js, React y TypeScript; exportación estática EN/PT; API de servidor autenticada; SQLite/SQL.js; IndexedDB; PDFs y archivos originales; vocabulario; sesiones y resultados; respaldo privado opcional; modelo local opcional; service worker compartido. No se incorporan dependencias ni claves en el frontend.

Las bases `english-os-private-v1` y `portuguese-os-private-v1` conservan sus nombres y esquemas. Las claves de borradores también se conservan. La agenda se añade al `payload` de una actividad opcional identificada por fecha, sin sesión, resultado o crédito académico artificial. Participa del respaldo privado existente. Una agenda dañada se reconstruye conservando el payload anterior; no se restablece la base.

## Organización del aprendizaje

Hoy recupera una agenda estable. Al crearla considera lecturas inconclusas, refuerzos registrados, rutina pausada, palabras realmente vencidas y la siguiente clase disponible. El inicio promueve una rutina pausada que pertenece a su agenda. No cambia el nivel de estudio ni relaja requisitos.

El tiempo elegido es un presupuesto estimativo; las tareas suman como máximo ese presupuesto y no se agregan ejercicios para llenarlo artificialmente. Hay 15, 20, 30 y 45 minutos; se respetan ajustes históricos de 5 y 40. Cambiar tiempo conserva trabajo terminado; el día ya terminado no se reabre. La preferencia habitual se aplica a días nuevos.

Completar una tarea significa guardar práctica. Aprobarla significa cumplir su criterio objetivo. Ninguna de esas dos cosas certifica una competencia MCER. Un intento incorrecto cuenta como estudio, mientras los requisitos de refuerzo y avance siguen vigentes.

## Correcciones encontradas durante la reconstrucción

- Identificadores de áreas separados de las etiquetas traducidas: la localización dejaba sin pestañas internas a portugués.
- Actualización compartida aplazada mientras una preferencia está modificada, aunque el formulario ya no sea modal.
- Enlaces de idioma conservan la versión compartida; cada idioma conserva su propia base.
- Nombres accesibles explícitos en selectores; texto para lectores de pantalla oculto visualmente.
- Nube de palabras situada dentro del viewport al abrirla desde el encabezado.
- Colección completa de palabras disponible también en el nuevo Repaso.
- Un repaso futuro dentro del mismo día no genera una tarea vacía.
- Planes de 15 minutos con vocabulario pendiente conservan duraciones positivas para lectura, gramática y escritura.
- El diagnóstico no elimina una agenda diaria preservada al terminar.
- Repaso conserva el acceso a borradores de bloques y niveles anteriores; avanzar no oculta una práctica pendiente.

## Auditoría pedagógica: límites de la revisión

Se comprobaron estructuralmente **262 clases y 428 comprobaciones** y se inspeccionaron manualmente doce muestras, una por nivel e idioma. Se verificaron objetivos, ejemplos, respuestas, distractores y feedback de esas muestras; no se afirma una revisión semántica exhaustiva del banco. [Inventario reproducible](artifacts/redesign/pedagogy.json).

Los ejercicios iniciales revisados son correctos como práctica de estructuras. Dos opciones múltiples no demuestran producción espontánea. Las muestras C1/C2 tienen una discriminación limitada para acreditar esos niveles: conservan valor como práctica de matiz, no como examen avanzado. Se requieren tareas extensas y evaluación válida para una conclusión superior.

El Companion Volume se usa como marco conceptual, no como acreditación del curso. Se intentó consultar directamente el PDF y el buscador oficiales del Consejo de Europa; el proxy respondió 403. No se presenta esa descarga como realizada. [Fuente oficial para contrastación adicional](https://www.coe.int/en/web/common-european-framework-reference-languages).

## Riesgos y límites que permanecen

- Persistencia automática en este navegador; respaldo entre dispositivos opcional. No se promete una nube automática sin configurar un servicio.
- La práctica oral guarda audio real y transcripción manual. No evalúa acústicamente pronunciación, acento o fluidez.
- Listening usa voz sintética y preguntas objetivas; no acredita comprensión de hablantes reales.
- Escritura y reflexiones se guardan sin una nota fiable de calidad.
- La IA pequeña puede equivocarse; la ayuda guiada cita el documento y la generación local continúa opcional y delimitada.
- PDFs de imagen necesitan OCR, aún no incluido. Noticias externas necesitan conexión; la lista descargada conserva fecha y fuente.
- No hay certificación WCAG, MCER ni validación clínica o educativa del producto completo.

[Resultados ejecutados y estado de publicación](RESULTADOS_QA.md) · [Sistema de diseño](DESIGN_SYSTEM.md) · [Auditoría visual](AUDITORIA_VISUAL.md).
