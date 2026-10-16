# QA — Language Studio 3.0

Fecha: 16/10/2026. Base `82c372d`, rama `feat/language-studio-3`. Implementado; verificación integral y publicación en curso. Los resultados anteriores se conservan en [historial](docs/audit-before-os3/RESULTADOS_QA.md).

## Ejecutado

- TypeScript: aprobado.
- Unitarias: 122 aprobadas, 0 fallos, 0 omitidas.
- Exportaciones estáticas EN/PT y build Node: aprobados, misma instantánea de código para los dos idiomas.
- Auditoría estructural: 262 clases / 428 comprobaciones, 0 incidencias estructurales; 12 muestras históricas manuales, sin afirmar revisión semántica completa.
- Capturas públicas anteriores: 252, 7 tamaños y ambos idiomas, 0 excepciones JS / 0 overflow en esos estados.
- Pruebas nuevas focalizadas: ocho recorridos 3.0 aprobados; cubren primera respuesta, ayudas, producción no calificada, borradores offline, edición 2 histórica, selector de idioma, teclado y listening sintético simulado. La guía se repitió tras precisar selectores de traducción y sus dos pruebas pasaron.

- Candidata: 252 capturas nuevas, con errores de consola y excepciones JS monitorizados; cero incidencias y cero overflow.
- Interacciones adicionales: 36 capturas del player y cuaderno. Start y contador despejados en 14 casos de entrada (dos idiomas × siete tamaños).
- Colores ambientales: movimiento, pausa persistente y reducción de movimiento comprobados. Contraste de solapamientos calculado desde las paradas CSS reales en ambos temas.
- Comprobación específica posterior: vocabulario abierto no reconocido queda sin calificar; las dos pruebas de constancia conservan 0/3 resultados objetivos y tres respuestas pendientes, sin fabricar tres errores adicionales.

## En ejecución

Regresión estática final de 91 pruebas, recorrido Node autenticado, PR y publicación. Este documento se actualizará con resultados ejecutados; no se marca como publicado por haber generado `out/`.

## Alcance y límites

Chromium en esta máquina, viewports simulados, sin iPhone físico ni Safari. Los tests automáticos verifican flujos y datos; no certifican WCAG ni eficacia de aprendizaje. El test nuevo de TTS usa voz/eventos simulados, no escucha humana. El audio no recibe nota acústica. Las respuestas abiertas sin modelo quedan pendientes y la escritura usa rúbricas, no un corrector humano simulado.
