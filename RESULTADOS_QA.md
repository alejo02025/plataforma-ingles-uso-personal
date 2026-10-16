# QA — Language Studio 3.0

Revisión del 16/10/2026, base `82c372d`, rama `feat/language-studio-3`, [PR #18](https://github.com/alejo02025/plataforma-ingles-uso-personal/pull/18). **Publicado y verificado contra GitHub Pages.** [Informes anteriores, conservados](docs/audit-before-os3/).

## Comprobaciones ejecutadas

| Comprobación                           | Resultado                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| TypeScript                             | Aprobado                                                                                                      |
| Unitarias                              | 122 aprobadas, 0 fallos, 0 omitidas                                                                           |
| Build estático EN y PT                 | Ambos aprobados, misma instantánea de fuente                                                                  |
| Build Node                             | Aprobado                                                                                                      |
| Regresión estática Playwright          | 91 aprobadas, 0 fallos, 0 omitidas                                                                            |
| Recorrido Node autenticado             | 1 aprobado, 0 fallos                                                                                          |
| Capturas anteriores públicas           | 252; cero errores de consola/excepciones JS y cero overflow en los estados capturados                         |
| Capturas candidatas                    | 252; cero errores de consola/excepciones JS y cero overflow                                                   |
| Interacciones del player/cuaderno      | 36 capturas originales adicionales                                                                            |
| Tema oscuro guardado desde Ajustes     | 4 capturas adicionales EN/PT, 390/1440 px                                                                     |
| Entrada en siete tamaños y dos idiomas | 14 casos: Start visible al entrar, contador despejado tras desplazar, sin overflow                            |
| Catálogo histórico                     | 262 clases y 428 comprobaciones sin defectos estructurales detectados; revisión manual limitada a 12 muestras |

[Registro local y commit probado](artifacts/redesign/os3-local-verification.json) · [logs y capturas](artifacts/redesign/os3-qa/) · [comparador](artifacts/redesign/os3-comparison.html).

## Recorridos funcionales

Las pruebas ejecutan: estudiantes nuevos de inglés/A2 y portugués/A1, perfiles B1 con errores y B2/PT A2 con checkpoints previos; clases abandonadas y retomadas; primeras respuestas, consulta de palabra y pistas registradas; rutinas históricas de edición 2; producción abierta pendiente sin errores inventados; borradores recuperados offline; día finalizado que sigue finalizado tras recarga; PDFs múltiples, posición, preguntas, eliminación y restauración; vocabulario, calendario, temas; errores de autorización/sincronización y reintentos de guardado; cambio visible de idioma y aislamiento; actualización de dos espacios con vocabularios diferentes; permisos de micrófono y grabación en contenedor real del navegador; voz sintética y resultados de listening separados.

Los dos recorridos nuevos de fondo comprueban movimiento efectivo, ausencia de interceptación de clics, pausa persistente y `prefers-reduced-motion`. El contraste se calcula con las paradas y opacidades CSS reales y sus combinaciones de solapamiento, en claro/oscuro y ambos idiomas: no se limita a tokens sobre una superficie plana.

Los casos de vocabulario verifican que tres respuestas abiertas desconocidas no se conviertan en tres errores confirmados: conservan 0/3 resultados objetivos y tres pendientes. Las ayudas no se presentan como un intento independiente ni borran aprobaciones históricas.

## Incidencias detectadas y resueltas

La primera regresión obtuvo 88/89: al expandir el motivo de un acierto en clase se duplicaba el modelo. Se quitó la duplicación y se conservó la prueba que la detectó. La suite final, ampliada a 91, pasa íntegramente. Se corrigieron también la descripción antigua de escritura, el acceso contextual a palabras desde la rutina iniciada fuera de `main`, la evaluación literal de alternativas abiertas y el contraste tras añadir movimiento.

Las capturas finales se toman desde arriba con desplazamiento instantáneo. Una captura durante el scroll suave podía dibujar elementos fijos fuera del viewport dentro del PNG completo; se corrigió el método de captura, sin ocultar el enlace accesible de salto ni modificar el contenido de la aplicación.

## Publicación y CI

El [PR #18](https://github.com/alejo02025/plataforma-ingles-uso-personal/pull/18) quedó integrado tras [CI aprobado](https://github.com/alejo02025/plataforma-ingles-uso-personal/actions/runs/38935706160). La [validación y publicación de main](https://github.com/alejo02025/plataforma-ingles-uso-personal/actions/runs/38937317892) también terminó aprobada. Exportación generada: `96f1812`, versión pública **`2026-10-16T17:15:32.067Z`**, anterior `2026-10-16T02:08:58.890Z`.

Se compararon bytes y SHA-256 de los **133 recursos** contra los archivos generados de main, además del HTML de ambos accesos y el worker. El código de aplicación coincide con `47b949d`, que pasó las pruebas. Antes del despliegue, el verificador rechazó deliberadamente la versión antigua; no basta con que cambie una fecha.

Se ejecutaron dos recorridos públicos: completar una clase desde Hoy, guardar, recargar, cambiar al otro idioma (sin heredar su resultado), volver y abrir una clase diferente. Ambos conservaron el contador y el avance guardado. También se capturaron las 252 pantallas principales y 14 estados del cuaderno público sin errores ni overflow.

[Registro de publicación](artifacts/redesign/os3-public-verification.json) · [recursos y hashes](artifacts/redesign/os3-public-assets.json) · [recorridos publicados](artifacts/redesign/os3-published-journey.json) · [capturas reales](artifacts/redesign/os3-published/observations.json) · [comparación interactiva](artifacts/redesign/os3-comparison.html).

El relay TLS ejecuta las respuestas públicas originales y no desactiva su verificación. Por ese mecanismo, el worker se bloquea en esos perfiles públicos; instalación activa, actualización, offline y conservación de datos se comprobaron por separado en la suite local. No se afirma una instalación física en iPhone.

El PR #17, anterior y todavía abierto, propone una variante de chrome mediante overrides. Se inspeccionó su diff; no contiene datos ni migraciones. No se fusiona automáticamente sobre el sistema nuevo ni se elimina su rama.

## Cobertura y límites

Chromium con viewports 320×700, 375×812, 390×844, 768×1024, 1024×768, 1280×800 y 1440×900. Sin iPhone físico ni Safari. Contraste, foco, teclado, etiquetas y estados comprobados no constituyen certificación WCAG. Los tiempos de entrada son de esta máquina, sin throttling; no son Core Web Vitals de usuarios reales.

El test nuevo de TTS simula voces y eventos: no escucha ni evalúa sonido humano. La prueba MediaRecorder usa el contenedor real de Chromium y un dispositivo de prueba; no acredita una grabación física en iPhone. No hay nota acústica de pronunciación, acento o fluidez. Escritura y respuestas abiertas no reconocidas se guardan con criterios o modelos, sin un corrector humano simulado.

La revisión semántica completa de las 262 clases y de todos los verbos sigue pendiente; resolución de traducciones y comprobación estructural no la sustituyen. Las 24 situaciones nuevas son contenido editorial de práctica, no un examen MCER validado externamente. Más límites específicos en [auditoría general](AUDITORIA_COMPLETA.md).

## Corrección posterior del estudio de gramática — 16 de octubre de 2026

- PR #20 integrado: conjugaciones pt-BR y estructuras del constructor EN/PT corregidas; protección preventiva del apoyo español durante la compilación.
- TypeScript, **127/127 unitarias**, **93/93 recorridos estáticos** y **1/1 recorrido de servidor** aprobados localmente, sin omisiones. Compilaciones EN/PT y servidor aprobadas. Validaciones de GitHub del PR y de main finalizadas con éxito.
- Publicación verificada: **2026-10-16T23:46:24.747Z**, exportación `3101327`. Ambos idiomas comprobados en el sitio real, con recarga y tamaños 375/390/1440 px. Cero errores de consola y cero desbordamientos en esos recorridos. 133 recursos y ambos HTML de entrada coinciden con la exportación generada; el service worker corresponde a la misma versión.
- Sin cambios de esquema, claves de borrador ni datos de curso. Las pruebas utilizan perfiles descartables; no se afirma haber exportado o inspeccionado el progreso real de los estudiantes.
- Detalles, cobertura y límites: [Corrección de gramática](docs/GRAMMAR_FIX_20261016.md). Evidencia: [Verificación de publicación](artifacts/grammar-fix/release-verification.json) y capturas en `artifacts/grammar-fix/`.
