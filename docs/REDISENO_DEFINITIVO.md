# Reconstrucción de la experiencia de estudio

## Punto de partida real

Se actualizó desde `main` al commit `4d78acf` antes de modificar la aplicación. Se recorrió la versión pública vigente en ambos idiomas: Hoy, Clases, Repaso, PDF, Progreso, actividades, lecturas, práctica adicional, juegos, calendario, noticias, ayuda de idioma, práctica oral y Ajustes.

Se conservaron **92 capturas anteriores**: las cinco áreas y Ajustes a 1440×900, 1280×800, 768×1024, 390×844 y 375×812; las ocho herramientas adicionales se recorrieron a 1440 y 390. Perfiles vacíos de prueba, sin datos personales. `artifacts/redesign/before/observations.json` registra las visitas: cero excepciones JavaScript y cero desbordamientos horizontales en estas visitas. Eso no significa que todos los comportamientos o contenidos estuvieran correctos.

El navegador ejecutó los HTML y recursos públicos reales. Un adaptador de red recupera esas respuestas con `fetch` de Node y la CA de confianza del entorno: se conserva la verificación TLS, sin `ignoreHTTPSErrors`. No se reemplazó el sitio por HTML inventado. El adaptador evita el problema de confianza del proxy de Chromium de este entorno.

## Problemas confirmados

- Hay cinco destinos principales pero otros ocho en una navegación secundaria; móvil suma hamburguesa y barra inferior. La aplicación todavía organiza al usuario por sus herramientas internas.
- Biblioteca y lecturas se presentan como rutas diferentes. Gramática, verbos y frases aparecen en Clases, ayuda y práctica adicional.
- El título visible «Today/Hoje» no coincide con el nombre accesible heredado Home/Início.
- Hoy contiene pie de accesos, diagnóstico, nivel y una secuencia complementaria; no existe un estado final estable del día.
- El código de Hoy cuenta las actividades del plan antiguo, mientras su acción principal puede ser una clase o rutina de otro origen. Completar la recomendación no garantiza incrementar ese contador. Es un hallazgo de trazabilidad del código, no una pérdida de datos observada en estudiantes.
- El presupuesto se aplica a una lista que se recalcula al avanzar: no existe un itinerario diario fijo con referencias a evidencias reales.
- Siete hojas de estilos suman 9.773 líneas, sin contar `classes.css`. Conviven reglas de varios rediseños (`audit-*`, `learning-experience`, `os-next`, `today-first`) sobre los mismos componentes.
- No se observaron errores de consola en el recorrido inicial. La petición es reconstruir una experiencia confusa y redundante, no atribuir fallos de ejecución que no se reprodujeron.

## Decisiones de producto

1. Cinco áreas reales: Hoy, Clases, Repaso, Biblioteca y Progreso. Ajustes y cambio de espacio en una zona secundaria estable. Sin menú adicional de herramientas.
2. Hoy contiene una sola tarea principal, hasta tres siguientes, tiempo y conteo. No alberga teoría, diagnóstico, métricas, noticias técnicas ni tarjetas promocionales.
3. Una secuencia diaria persistente referencia clases, ejercicios, palabras y producciones existentes. Completar significa registrar una actividad, no demostrar dominio.
4. Repaso reúne palabras, errores y práctica. Biblioteca reúne originales, lecturas y noticias; Clases reúne el recorrido y la referencia siempre desbloqueada. Progreso reúne evolución e historial/calendario.
5. Un sistema visual único con tipografía de sistema, superficies neutras y acento por idioma. Se sustituyen las hojas superpuestas; se mantienen estilos de módulos necesarios, consolidados.
6. Se conservan bases, claves de borradores, IDs, PDFs, sincronización opcional y evidencias. No se reescribe el banco entero ni se afirma una validación MCER externa.

## Evidencia y cierre

Se integraron los PR #6 y #7 después de checks aprobados. La publicación 2026-10-15T20:50:09.219Z se verificó mediante 92 capturas públicas, dos recorridos de guardado/recarga/aislamiento y disponibilidad de los archivos del service worker. Los comandos, resultados, URLs de CI y límites están en [RESULTADOS_QA.md](../RESULTADOS_QA.md). El intento inicial de release se sustituyó al detectar la carrera con RSS; no se considera una publicación aprobada.
