# Auditoría inicial — 2026-10-14

## Alcance
Revisión estática del repositorio, documentación, lógica CEFR y banco de diagnóstico de portugués. No se ejecutaron pruebas de navegador ni compilaciones en este primer lote. Por tanto, no existe validación de producción.

## Cambios implementados
- Corrección de tres explicaciones del diagnóstico portugués que mezclaban castellano y portugués.
- Tokens cromáticos diferenciados para English OS y Português OS, con variantes para tema oscuro.
- Estilo de marca portugués personalizado y compatibilidad con `prefers-reduced-motion`.
- Color del navegador coherente con el espacio de estudio.

## Riesgos y tareas pendientes
- **P0:** Ejecutar `npm ci`, `npm run typecheck`, `npm test`, `npm run build:pages` y `npm run test:pages`. Ninguno se ha ejecutado aquí.
- **P1:** Revisar todas las explicaciones portuguesas y su política de uso de español como lengua de apoyo.
- **P1:** Comprobar localización de mensajes como `nivel activo es A1`, que aparece en una prueba.
- **P1:** Validar contraste y accesibilidad de la nueva paleta en páginas reales y dispositivos móviles.
- **P1:** Separar indicadores de constancia, puntuación y competencia demostrada.
- **P1:** Auditar calidad editorial de las clases A1–C2, evitando asumir cobertura MCER completa.
- **P2:** Rediseñar dashboard, clases, PDF Studio y analítica sobre pruebas visuales antes/después.
- **P2:** Evaluar herramientas de speaking sin confundir transcripción con evaluación de pronunciación.

## Restricciones
La rama no debe fusionarse ni publicarse hasta ejecutar QA. No alterar datos del estudiante ni sincronización privada sin migración segura.
