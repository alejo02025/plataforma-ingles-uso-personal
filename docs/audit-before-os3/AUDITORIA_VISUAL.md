# Auditoría visual de la reconstrucción definitiva

## Antes: versión real vigente al comenzar

Base `4d78acf`, sitio público. Se recorrieron todos los destinos anteriores en EN/PT y los cinco tamaños pedidos. [92 capturas y observaciones](artifacts/redesign/before/observations.json). La adquisición HTTPS se hizo con Node fetch usando la CA de confianza del proxy; Chromium ejecutó los HTML/assets públicos reales. No se desactivó TLS. El service worker se bloqueó solo durante estas capturas públicas; las pruebas offline se ejecutan por separado con worker activo.

A 390 px, Clases medía 18.013 px en inglés y 13.797 px en portugués. Había trece destinos, catálogo completo de un nivel, referencia duplicada y controles móviles competidores. Inicio ya mostraba Today, pero todavía tenía diagnóstico, notas, enlaces y un contador desconectado de algunas recomendaciones. La reconstrucción parte de estos hechos, no de las pantallas de un intento anterior.

## Intervención visual y operativa

- Inicio sustituido por Hoy: fecha, tiempo, una tarea, hasta tres siguientes y contador de esas tareas.
- Lateral de cinco áreas; Ajustes e idioma secundarios. Móvil con barra fija compacta y áreas seguras.
- Clases reconstruida como bloque de cuatro lecciones, con próximo paso y requisitos plegables.
- Repaso concentra recuperación y práctica; la colección guardada mantiene búsqueda, ejemplos y próximas revisiones.
- Biblioteca integra archivos, lecturas y noticias, sin duplicar importadores PDF.
- Progreso muestra semana, aciertos en ejercicios y lo pendiente de evaluación; el detalle no ocupa la portada.
- Ajustes es una pantalla, no una ventana que compite con la navegación.
- Nueva tipografía principal, composiciones, espaciado, estados, tablas y paneles. Sin overlays de los estilos anteriores.

## Capturas posteriores

Se regeneraron **92 capturas posteriores**, sin overflow ni excepciones en esas visitas. [Registro posterior](artifacts/redesign/after/observations.json) y [comparador de PNG originales](artifacts/redesign/comparison.html).

| Pantalla móvil de 390 px | Inglés antes → después | Portugués antes → después |
| ------------------------ | ---------------------- | ------------------------- |
| Clases                   | 18.013 → 1.511 px      | 13.797 → 1.532 px         |
| Biblioteca / PDFs        | 1.227 → 844 px         | 1.301 → 844 px            |
| Progreso                 | 5.393 → 1.753 px       | 5.479 → 1.757 px          |

La altura por sí sola no define calidad. La diferencia comprobada es que el catálogo se pagina, las herramientas se agrupan y la acción principal está en el primer viewport. El contenido sigue accesible. El CSS pasó de 9,957 líneas en ocho hojas a 2,834 líneas en dos hojas, con responsabilidades separadas.

Las mediciones de interacción confirman Start dentro de la primera pantalla y el contador libre de la barra al desplazarse. Los tiempos observados son locales, sin throttling, no promesas sobre dispositivos físicos. La repetición contra GitHub Pages terminó con 92 capturas públicas, sin overflow ni excepciones en esas visitas; el comparador ahora muestra esa publicación, no el candidato local. [Versión pública comprobada](artifacts/redesign/published/observations.json).

Los estados de clase, lector, error de guardado y oralidad se capturan mediante pruebas funcionales en `artifacts/redesign/qa/`. Las capturas anteriores permanecen intactas.
