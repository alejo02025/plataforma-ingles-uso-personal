# Plan de implementación — Language Studio 3.0

Base `82c372d`, rama aislada `feat/language-studio-3`. El [historial anterior](docs/audit-before-os3/PLAN_IMPLEMENTACION.md) permanece disponible.

## Trabajo implementado

1. Inspección del código actual y ejecución pública EN/PT a siete tamaños; 252 capturas anteriores y registro de defectos.
2. Tokens y tipografía Inter, Hoy, navegación, clases enfocadas, guía gramatical y componentes de interacción compartidos.
3. Edición 3 de ejercicios, variantes explícitas, primera respuesta, ayudas y resultados no verificables separados.
4. Traducciones editoriales, guía siempre disponible, consignas progresivas de escritura y cuaderno conectado de errores.
5. Eliminación de una escena decorativa sin importadores; consolidación de estilos existentes, sin otra hoja CSS ni dependencias nuevas.
6. Fondo ambiental solicitado durante la ejecución, sin interceptar acciones, con movimiento reducido y control persistente por idioma.
7. Exportación bilingüe desde una misma instantánea de fuente; pruebas de datos históricos, aislamiento y actualización.

## Verificación y entrega

TypeScript y 122 unitarias pasaron. La regresión completa de navegador, edición Node, capturas candidatas, pull request, checks, integración y publicación se registran con su resultado real en [RESULTADOS_QA.md](RESULTADOS_QA.md). No se confunde compilar con publicar.

Orden: checks locales → build EN/PT → regresión → build y recorrido Node autenticado → revisión visual → PR → CI → integración autorizada → regeneración estática → verificación de assets/SW y recorridos públicos → capturas comparativas finales.

## Conservación y reversibilidad

No hay migración SQL ni reset de IndexedDB. Los campos opcionales nuevos se añaden al JSON existente; rutinas 1/2 y borradores históricos conservan su edición. Checkpoints previos y duraciones históricas se respetan. Reenviar un resultado no sustituye la respuesta inicial. Las exportaciones y respaldos siguen disponibles. Revertir código no requiere borrar progreso.

## Pendientes reales

Revisión semántica manual completa del catálogo, más contextos originales y distractores avanzados, audio humano, validación acústica si se incorpora tecnología apropiada, evaluación de producciones abiertas y contraste exhaustivo del currículo con descriptores. Ninguno se presenta como ya acreditado.
