# Resultados de QA: reconstrucción definitiva

Fecha: 15/10/2026. Rama `redesign/study-first-2026-10-15`, base `4d78acf`. Estado de publicación: **pendiente de la verificación final**. [QA de la revisión anterior, archivada](docs/audit-2026-10-14/RESULTADOS_QA.md).

## Evidencia ejecutada

- 92 capturas de las dos aplicaciones públicas anteriores en cinco viewports. Sin excepciones JavaScript ni overflow en esas visitas. Método y medidas: [observations.json](artifacts/redesign/before/observations.json).
- TypeScript aprobado y exportaciones EN/PT compiladas tras la reconstrucción.
- 111 pruebas unitarias aprobadas, sin omitidas, incluidas agendas finitas, evidencia real, cambio de tiempo, repaso futuro, reconstrucción no destructiva y planes de 15 minutos.
- La primera regresión completa ejecutó 73 casos: 63 aprobados y 10 fallidos. Se corrigieron acceso a colección guardada, ayuda fuera del viewport, texto accesible visible a 320 px, espacios en etiquetas y recorridos que todavía buscaban controles retirados. Esa pasada no se presenta como aprobada.
- **75/75** casos aprobados en la regresión completa posterior, sin omitidos. [Salida](artifacts/redesign/qa/static-regression.log).
- Build de servidor aprobado y **1/1** recorrido autenticado aprobado, incluidos agenda idempotente, rechazo de duración inválida, diagnóstico, PDFs, lectura, exportación y persistencia. Se detectó y corrigió antes una doble lectura del cuerpo del nuevo endpoint; ese intento fallido no cuenta como aprobado. [Salida](artifacts/redesign/qa/server-regression.log).
- Build estático del candidato: `2026-10-15T20:00:31.303Z`. [Compilación EN/PT](artifacts/redesign/qa/build-pages.log) y [servidor](artifacts/redesign/qa/build-server.log).
- **92 capturas posteriores** de las áreas y herramientas, sin errores JavaScript ni overflow. [Registro](artifacts/redesign/after/observations.json).
- En los diez casos idioma×viewport, Start quedó completamente dentro de la primera pantalla. Tras desplazar la página, el contador quedó libre de la barra inferior. La medición usa desplazamiento instantáneo para no tomar un fotograma intermedio de una animación. [Medidas](artifacts/redesign/interaction-metrics.json).
- Verificación estructural de 262 clases/428 comprobaciones sin incidencias de estructura; revisión semántica manual limitada a doce muestras. [pedagogy.json](artifacts/redesign/pedagogy.json).

## Qué se prueba

Ambos espacios nuevos; inglés B1 con errores y B2 con checkpoints; portugués A2 con checkpoints; clases pausadas; primeros intentos; rutina con variantes; lectura, escritura, palabras y ayudas; múltiples PDFs, borrado/restauración; sincronización entre dispositivos simulados; autorización fallida; rollback de IndexedDB; arranque con fallo recuperable; offline; grabación del navegador; escucha con apoyo; actualización compartida y caché; controles y estados en móvil/escritorio.

Las pruebas de audio usan un dispositivo simulado de Chromium para ejecutar MediaRecorder y comprobar contenedores y persistencia. No se realizó evaluación acústica ni prueba de un micrófono físico. Los servicios GitHub de sincronización se simulan en QA; la publicación del repositorio se verifica por separado contra GitHub real.

## Límites

No hay certificación WCAG ni MCER. Se miden contraste de tokens y recorridos concretos, no todos los estados posibles. Los viewports no equivalen a hardware Safari/iPhone real. El tiempo de actividades es estimativo y los resultados de ejercicios no acreditan competencia global. Las pruebas usan bases temporales, no datos privados existentes.

Los intentos de descargar el Companion Volume y el buscador oficial fueron bloqueados por el proxy con 403; no se declara esa lectura como realizada. La revisión pedagógica distingue contraste conceptual, inventario automático y muestras inspeccionadas.
