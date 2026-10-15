# Resultados de QA: reconstrucción definitiva

Fecha: 15/10/2026. Rama `redesign/study-first-2026-10-15`, base `4d78acf`. Estado de publicación: **publicado y verificado contra GitHub Pages**. [QA de la revisión anterior, archivada](docs/audit-2026-10-14/RESULTADOS_QA.md).

## Evidencia ejecutada

- 92 capturas de las dos aplicaciones públicas anteriores en cinco viewports. Sin excepciones JavaScript ni overflow en esas visitas. Método y medidas: [observations.json](artifacts/redesign/before/observations.json).
- TypeScript aprobado y exportaciones EN/PT compiladas tras la reconstrucción.
- 111 pruebas unitarias aprobadas, sin omitidas, incluidas agendas finitas, evidencia real, cambio de tiempo, repaso futuro, reconstrucción no destructiva y planes de 15 minutos.
- La primera regresión completa ejecutó 73 casos: 63 aprobados y 10 fallidos. Se corrigieron acceso a colección guardada, ayuda fuera del viewport, texto accesible visible a 320 px, espacios en etiquetas y recorridos que todavía buscaban controles retirados. Esa pasada no se presenta como aprobada.
- **77/77** casos aprobados en la regresión completa posterior, sin omitidos. [Salida](artifacts/redesign/qa/static-regression.log).
- Build de servidor aprobado y **1/1** recorrido autenticado aprobado, incluidos agenda idempotente, rechazo de duración inválida, diagnóstico, PDFs, lectura, exportación y persistencia. Se detectó y corrigió antes una doble lectura del cuerpo del nuevo endpoint; ese intento fallido no cuenta como aprobado. [Salida](artifacts/redesign/qa/server-regression.log).
- Build estático del candidato: `2026-10-15T20:24:28.129Z`. [Compilación EN/PT](artifacts/redesign/qa/build-pages.log) y [servidor](artifacts/redesign/qa/build-server.log).
- **92 capturas posteriores** de las áreas y herramientas, sin errores JavaScript ni overflow. [Registro](artifacts/redesign/after/observations.json).
- En los diez casos idioma×viewport, Start quedó completamente dentro de la primera pantalla. Tras desplazar la página, el contador quedó libre de la barra inferior. La medición usa desplazamiento instantáneo para no tomar un fotograma intermedio de una animación. [Medidas](artifacts/redesign/interaction-metrics.json).
- Verificación estructural de 262 clases/428 comprobaciones sin incidencias de estructura; revisión semántica manual limitada a doce muestras. [pedagogy.json](artifacts/redesign/pedagogy.json).

## Qué se prueba

Ambos espacios nuevos; inglés B1 con errores y B2 con checkpoints; portugués A2 con checkpoints; clases pausadas; primeros intentos; rutina con variantes; lectura, escritura, palabras y ayudas; múltiples PDFs, borrado/restauración; sincronización entre dispositivos simulados; autorización fallida; rollback de IndexedDB; arranque con fallo recuperable; offline; grabación del navegador; escucha con apoyo; actualización compartida y caché; controles y estados en móvil/escritorio.

Se añadieron dos regresiones específicas para recuperar borradores de práctica de un nivel anterior después de avanzar: inglés A2→B1 y portugués A1→A2. Ambas se ejecutaron por separado y dentro de la batería completa.

Las pruebas de audio usan un dispositivo simulado de Chromium para ejecutar MediaRecorder y comprobar contenedores y persistencia. No se realizó evaluación acústica ni prueba de un micrófono físico. Los servicios GitHub de sincronización se simulan en QA; la publicación del repositorio se verifica por separado contra GitHub real.

## Límites

No hay certificación WCAG ni MCER. Se miden contraste de tokens y recorridos concretos, no todos los estados posibles. Los viewports no equivalen a hardware Safari/iPhone real. El tiempo de actividades es estimativo y los resultados de ejercicios no acreditan competencia global. Las pruebas usan bases temporales, no datos privados existentes.

Los intentos de descargar el Companion Volume y el buscador oficial fueron bloqueados por el proxy con 403; no se declara esa lectura como realizada. La revisión pedagógica distingue contraste conceptual, inventario automático y muestras inspeccionadas.

## Publicación comprobada

PR [#6](https://github.com/alejo02025/plataforma-ingles-uso-personal/pull/6) integrado después de la verificación completa; PR [#7](https://github.com/alejo02025/plataforma-ingles-uso-personal/pull/7) corrige la referencia del publicador frente a actualizaciones RSS concurrentes. El primer intento de release se canceló de forma deliberada y fue reemplazado; no se registra como despliegue exitoso.

El [workflow final](https://github.com/alejo02025/plataforma-ingles-uso-personal/actions/runs/38804119301) aprobó verificación y publicación. Pages construyó el commit `7b059bb81a882cc6e8d45b6ab2b7a30a72a34bc9`. Versión realmente servida: `2026-10-15T20:50:09.219Z`, diferente de `2026-10-15T18:10:11.952Z`. El `RELEASE` del worker coincide. Se descargaron con TLS verificado los 122 archivos de su lista offline y los dos HTML de entrada, todos con respuesta correcta y referencias estáticas presentes. [Prueba de recursos](artifacts/redesign/published-assets.json).

Se ejecutaron **92 capturas sobre la web pública nueva** en los cinco tamaños, sin excepciones JavaScript ni overflow en esas visitas. [Observaciones](artifacts/redesign/published/observations.json) · [Comparador anterior/publicado](artifacts/redesign/comparison.html). Además, dos recorridos públicos completaron una clase real desde Hoy, comprobaron el contador, recargaron, cambiaron de idioma y confirmaron aislamiento y recuperación. El siguiente acceso abrió otra clase. [Resultados de los recorridos](artifacts/redesign/published-journey.json).

Durante las capturas y recorridos públicos el worker permanece bloqueado para permitir el relay TLS del entorno. La disponibilidad de sus archivos sí se verifica contra la web pública; instalación, offline y actualización activa se ejecutaron en los tests locales de Chromium. No se afirma una instalación física de PWA o una evaluación acústica. [Registro de CI](artifacts/redesign/ci-release.json).
