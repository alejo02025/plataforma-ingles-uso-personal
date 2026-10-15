# Implementación de la reconstrucción definitiva

Base: `4d78acf`. Rama: `redesign/study-first-2026-10-15`. Publicación autorizada por el usuario, después de PR y verificación.

## Completado en código

- [x] Recorrer las aplicaciones públicas actuales y conservar 92 capturas previas.
- [x] Sustituir dashboard y navegación por cinco áreas y Hoy con una única acción principal.
- [x] Guardar una agenda finita por fecha dentro de la base existente, sin falsos resultados.
- [x] Conectar su contador a clases, rutinas, lectura, escritura y repasos guardados.
- [x] Preservar sesiones, borradores, IDs, IndexedDB, PDFs, vocabulario, checkpoints y sincronización opcional.
- [x] Mantener finalizado el día tras recargar y cambiar duración.
- [x] Agrupar herramientas en Clases, Repaso, Biblioteca, Progreso y Ajustes.
- [x] Unificar entrada de PDFs y conservar importación de texto personal.
- [x] Limitar catálogo de clases a un bloque de cuatro lecciones sin desactivar requisitos.
- [x] Conservar guía gramatical libre, oralidad honesta, feedback y material avanzado.
- [x] Reemplazar CSS acumulado por base compartida y estilos de herramientas.
- [x] Retirar componentes sin uso comprobado; conservar bibliotecas de datos y pruebas relevantes.
- [x] Corregir localización de navegación, ayudas fuera de pantalla, selectores y recuperación de agenda dañada.
- [x] Ampliar el pipeline a toda la regresión estática y al recorrido del servidor.

## Verificación y entrega

El estado ejecutado de pruebas, capturas, PR, integración y despliegue se registra en [RESULTADOS_QA.md](RESULTADOS_QA.md). No se marca una publicación como verificada por haber compilado o subido archivos.

La secuencia de entrega es: unitarias y TypeScript → builds EN/PT → regresión completa → build y recorrido autenticado Node → capturas comparativas → PR → checks → integración → regeneración estática → comprobación del sitio público y su versión.

## Conservación y reversibilidad

No se modifica el esquema ni se borra información del estudiante. La agenda nueva es un payload opcional, exportable y sincronizable mediante los mecanismos existentes. Las preferencias históricas de 5/40 minutos se respetan. Si una agenda está dañada se conserva su contenido anterior dentro del mismo payload al reconstruirla.

Una reversión de código no requiere resetear bases. Los checkpoints guardados no se reinterpretan como certificados MCER. El diagnóstico no fuerza un cambio de nivel. Las credenciales privadas no se trasladan al sitio estático.

## Evolución posterior recomendada

Revisión semántica extensa de los bancos avanzados, tareas de transferencia y rúbricas de producción; listening con voces reales; evaluación oral válida si se incorpora tecnología adecuada. Ninguna de esas capacidades se simula en esta reconstrucción.
