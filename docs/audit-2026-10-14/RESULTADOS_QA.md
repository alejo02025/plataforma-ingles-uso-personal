# Resultados de QA

Fecha de cierre: 15/10/2026. Rama `audit/integral-2026-10-14`. Build estático final `2026-10-15T12:24:08.581Z`. **Publicado en GitHub Pages tras la autorización del usuario «publicar».** Se usaron perfiles y bases temporales, no datos personales existentes.

## Informes y evidencia

[Auditoría integral](AUDITORIA_COMPLETA.md) · [Inglés](AUDITORIA_INGLES.md) · [Portugués](AUDITORIA_PORTUGUES.md) · [Visual](AUDITORIA_VISUAL.md) · [Plan](PLAN_IMPLEMENTACION.md) · [Diseño](DESIGN_SYSTEM.md). [Comparación visual](../../artifacts/audit/COMPARACION.md), [registro de verificación](../../artifacts/audit/verification.json) y [salida resumida](../../artifacts/audit/verification.txt).

## Comprobaciones ejecutadas

| Comando / ámbito                                                                  | Resultado observado                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `npm test` tras integrar guardado durable                                         | **102/102** unitarias aprobadas, sin omitidas                 |
| `npm run typecheck`                                                               | Aprobado; además ambos builds ejecutaron TypeScript           |
| `npm run build:pages`                                                             | Exportaciones English OS y Português OS aprobadas             |
| Regresión completa actual `npm run test:pages -- --timeout=30000 --reporter=line` | **66/66** casos aprobados en Chromium, sin omitidos           |
| `npm run build` y `npm run test:e2e`                                              | Build Node aprobado y **1/1** recorrido con servidor aprobado |

La suite completa actual reúne 66 casos, incluidos los ocho nuevos de persistencia y los cuatro de tiempo diario. Las tandas anteriores de 54, 20 y 23 casos pertenecen a revisiones anteriores; no se suman a los 66. El seguimiento por tiempo disponible de la revisión anterior se conserva como historial más abajo.

## Seguimiento: tiempo disponible y actividad pausada

En el build `2026-10-15T12:06:24.060Z`:

- **102/102** unitarias del proyecto. Las ocho pruebas nuevas del motor también pasaron con `NEXT_PUBLIC_STUDY_LANGUAGE=pt`; no son ocho casos distintos adicionales.
- **22/22** recorridos Chromium de clases, guía diaria, refuerzos, rutina y auditoría integral. Se repitieron después los **4/4** casos de `study-time.spec.ts`, incorporando el cambio de día: tres se solapan con los 22 anteriores; **23 casos de páginas distintos** en este seguimiento.
- TypeScript, exportaciones EN/PT, build Node y **1/1** recorrido de servidor aprobados.
- Nueva captura de inicio por idioma y ancho, más dos estados de pausa corta; el total conservado es 44 capturas. Mediciones locales posteriores regeneradas sobre este build.

Se ejecutó: elegir cinco minutos → contestar la primera pregunta → pausar → cambiar a veinte minutos → modificar el tiempo del otro perfil → volver → recargar sin conexión → retomar la segunda pregunta → terminar → comprobar que el inicio ofrece la clase y no repite la rutina completada. Ambos idiomas conservaron respuestas y preferencias independientes.

Se verificaron preferencia corrupta, fallo simulado de escritura en almacenamiento y cambio al siguiente día de estudio. El ajuste de ayer no se aplica al nuevo día; la lectura pendiente mantiene su prioridad. Ninguna sugerencia modifica el plan existente ni desbloquea clases.

En las primeras ejecuciones se corrigieron dos supuestos de prueba: el selector inexistente `.lesson-detail` y esperar una clase nueva cuando al cambiar de día corresponde retomar lectura pendiente. Una ejecución simultánea de las suites Node y estática produjo colisión en el directorio compartido `test-results`; ambas se repitieron por separado y pasaron. Un intento adicional no llegó a ejecutar pruebas porque seguía abierto el servidor temporal de capturas; se detuvo ese proceso propio antes de repetir. Esas ejecuciones no cuentan como aprobadas.

## Seguimiento P0: confirmación del guardado

Build `2026-10-15T12:24:08.581Z`: **102/102** unitarias, **66/66** páginas y compilaciones EN/PT/Node aprobadas. La suite completa de páginas terminó en 6,7 minutos.

El seguimiento de persistencia agregó ocho recorridos sobre IndexedDB real: aborto en la segunda escritura y excepción síncrona de `put` en ambos idiomas, fallo del commit inicial recuperado sin recargar, apertura transitoria fallida y merge remoto con commit local fallido. Los ocho pasaron en una ejecución específica y después dentro de la regresión completa de 66 casos; no son 74 casos distintos. También se completó de nuevo el recorrido Node (1/1). Se comparan hash SHA-256 de la base, manifiesto y dispositivo antes/después del fallo, y se reintenta la misma respuesta diagnóstica antes de recargar. La prueba de GitHub usa respuesta/token sintéticos; no acredita acceso a una cuenta real.

La primera tanda específica pasó cinco casos y falló tres por selectores de test: alerta de Next adicional y nombre portugués del botón de preferencias en otra región. Se corrigió el alcance de esos selectores sin eliminar comprobaciones. TypeScript detectó además un argumento de mensaje colocado en `toEqual` en vez de `expect`; se corrigió antes de la ejecución aprobada.

## Matriz solicitada

| Escenario                          | Evidencia ejecutada                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Estudiante nuevo de inglés         | Inicio A2 de consolidación, tutorial, diagnóstico, recomendaciones y cuatro anchos                                              |
| Inglés B1 con errores gramaticales | Fixture SQLite legítimo de hitos anteriores; dos intentos bajos; refuerzo y bloqueo coherentes                                  |
| Inglés B2                          | Hitos previos preservados; nivel activo B2 en recorrido y clases                                                                |
| Portugués nuevo                    | A1, contenido brasileño, tutorial, diagnóstico y cuatro anchos                                                                  |
| Portugués A2                       | Fixture con A1 completado; A2 conservado al cambiar vistas                                                                      |
| Abandona y retoma clase            | Primera respuesta confirmada, etapa y texto personal retenidos tras recarga; siguiente clase tiene otro ID                      |
| Carga varios PDFs                  | Archivos sintéticos con texto, pestañas, borradores por sección, papelera, restauración y original descargable                  |
| Sin conexión                       | Reapertura EN/PT, vocabulario, PDFs, nueva importación local y borradores conservados; actualización rechazada sin borrar datos |
| Error de sincronización            | GitHub simulado: 401, fallo de red, conflicto y respaldo inválido; token no persistido y datos locales conservados              |
| Cambia de idioma                   | Bases y carpetas independientes, persistencia y actualización compartida de espacios inactivos                                  |

Los fixtures B1/B2/A2 usan contextos desechables, validan `PRAGMA integrity_check` y no desbloquean a los estudiantes reales. El diagnóstico nuevo no cambia su curso automáticamente.

## Oral y comprensión auditiva

Chromium con dispositivo de audio sintético: se ejecutó MediaRecorder, se produjo un contenedor de audio real, se guardó el Blob y se reabrió tras recarga y sin conexión. Se comprobaron notas/transcripción manual, historial y resultados de dos preguntas con transcripción visible marcados como práctica con ayuda. No se afirma haber evaluado voz humana o pronunciación.

Se probó permiso de micrófono pendiente/denegado, bloqueo de navegación y de una actualización iniciada antes de solicitar permiso. La interfaz recupera la actividad sin atribuir una nota ni anunciar una versión nueva solo por bloquear la actualización.

El gráfico y el calendario muestran la grabación y la escucha como registros de práctica legibles, sin exponer JSON. Suman solo duración técnica registrada. Una grabación no crea resultados de gramática, escritura o pronunciación; la escucha con ayuda no entra en precisión independiente.

## Pantallas, accesibilidad y rendimiento local

- EN/PT a **375, 390, 768 y 1440 px**, inicio, PDF y primera actividad de clase; móvil y escritorio en rutina/oral. Se conservaron **46 capturas** entre antes y después.
- Ocho capturas iniciales sobre los archivos publicados existentes, ocho posteriores de inicio en la misma situación y estados adicionales de clases, PDF, rutina, oral, fallos de guardado y temas oscuros. Las capturas adicionales de módulos no tienen un «antes» que no se haya tomado.
- Ausencia de overflow horizontal y excepciones JavaScript en los recorridos que lo verifican; nombres de controles, tabulación básica, ayuda por teclado, selección/retoma y formularios ejercitados. No es una certificación WCAG.
- Contraste de texto principal/secundario contra superficie medido en estilos computados EN/PT claro/oscuro: umbral **4,5:1** superado. No se extrapola a todas las imágenes, estados o combinaciones posibles.
- Baseline local: ready visual 678–823 ms, DOMContentLoaded 38–114 ms, load 116–182 ms. Después: ready **784–943 ms**, DOMContentLoaded **35–65 ms**, load **113–219 ms**. Ready incluye espera visual/captura. Son muestras locales sin throttling, no Lighthouse, LCP, Core Web Vitals ni mediciones de teléfono físico; no se declara una mejora de rendimiento a partir de ellas.

La primera métrica provisional de nombres usó `innerText` y contó cuatro controles dentro de detalles cerrados. Inspección confirmó nombres existentes; la medición posterior usa `textContent` y da cero controles sin texto/aria-label/title. No se presenta el conteo inicial como un defecto accesible confirmado.

## Fallos encontrados y resueltos durante la intervención

- Reanudación que sustituía la actividad elegida, repetición al continuar y guardado de primeras respuestas: edición de banco, borradores por tarea e idempotencia.
- Localización y cantidades antiguas: explicaciones PT corregidas, apoyo bilingüe y diagnóstico de 24 ítems con conservación de sesiones históricas.
- Colisión de tokens heredados: identidad efectiva y contraste verificados.
- Audio frente a actualización/navegación: protección durante permisos, grabación y persistencia; recuperación de rechazo.
- Registro oral presentado como mensaje técnico o ausente del calendario: resumen compartido y duración conectada a constancia.
- Pruebas antiguas dependían de varias preguntas simultáneas, nombres anteriores, contador fijo de nueve/doce y panel de lectura siempre visible. Se adaptaron a la nueva interacción manteniendo comprobaciones de resultado y persistencia. El cálculo de contraste inicial no expandía colores hex abreviados; se corrigió la medición.

Hubo tandas fallidas e interrumpidas mientras se ajustaba la implementación y las pruebas; no se contabilizan como aprobadas. Los resultados positivos anteriores corresponden a las ejecuciones completas identificadas.

## Inventario y límites pendientes

Inventario estructural completo: 262 clases /428 comprobaciones, IDs únicos, índices válidos, opciones distintas y corrección/explicación presentes. Banco inicial de 12 preguntas por idioma ampliado a 24; los diagnósticos históricos cerrados de nueve/doce se conservan. La revisión estructural y los tests **no certifican alineación MCER ni calidad de producción libre**.

Pendientes: validación psicométrica del diagnóstico, revisión pedagógica externa del banco avanzado, evaluación fiable de escritura/pronunciación/fluidez, audios naturales amplios, iPhone/Safari físico, comportamiento bajo expulsión real de almacenamiento y sincronización privada con credenciales reales. El intento de consultar el Companion Volume oficial obtuvo `403 CONNECT`; no hubo descarga ni contraste primario en esta ejecución.

PDFs escaneados requieren OCR no implementado. El primer uso offline necesita una carga completa; las voces offline dependen del dispositivo. Los respaldos conservan notas/metadatos orales, **no los archivos de audio**, que se pueden descargar. Guardado local automático no equivale a sincronización entre dispositivos sin configurar autorización privada. El motor adaptativo usa reglas explicables; no es un modelo estadístico calibrado de dominio.

No se cambiaron dependencias ni se realizaron migraciones destructivas. Los archivos publicados de raíz y el sitio público permanecen intactos.

## Publicación autorizada

El 15/10/2026 se publicó el commit `487265b93becf204fb761b4e80844f535e5ce80d`, conservando la compilación probada y las dos actualizaciones RSS que habían llegado a main. GitHub Pages confirmó `built`. Ambos HTML, 34 recursos referenciados y el service worker se descargaron por HTTPS y coincidieron con los archivos preparados. El marcador público devolvió `2026-10-15T12:24:08.581Z`.

Los 66 recorridos funcionales se ejecutaron localmente sobre esa compilación. El intento adicional de navegador público no se completó porque Chromium no confía en el certificado del proxy de este entorno, incluso al preparar un almacén de confianza temporal. No se desactivó TLS ni se atribuye ese fallo al certificado público del sitio. La comprobación HTTPS de archivos sí se completó con validación de certificados.

Enlaces y registro: [PUBLICACION.md](PUBLICACION.md) y [deployment.json](../../artifacts/audit/deployment.json). Las menciones anteriores a una rama sin publicar describen la fase de auditoría, previa a esa autorización.
