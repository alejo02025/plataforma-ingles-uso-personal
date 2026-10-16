# Evidencia de la reconstrucción

- `before/`: 92 capturas de la publicación anterior, base `4d78acf`.
- `after/`: 92 capturas del candidato local final.
- `published/`: capturas de GitHub Pages obtenidas después del despliegue.
- `comparison.html`: comparación entre la publicación anterior y la nueva.
- `verification.json`, `published-assets.json`, `published-journey.json`, `ci-release.json`: resultados y trazabilidad.
- `qa/`: logs y estados capturados por pruebas funcionales; no datos privados.

Las capturas son PNG originales de Chromium. Los viewports no equivalen a dispositivos físicos. Las peticiones públicas pasan por Node fetch con la CA de confianza del entorno, sin desactivar TLS; el worker se bloquea durante esos recorridos, y se prueba activo por separado en las regresiones locales.

Comandos desde la raíz del repositorio:

```bash
node --use-env-proxy scripts/redesign-capture.mjs published
node --use-env-proxy artifacts/redesign/verify-public-assets.mjs
node --use-env-proxy --import tsx artifacts/redesign/published-journey.ts
```

Los recorridos usan perfiles efímeros; no modifican el progreso de los estudiantes. El verificador de recursos guarda estado, tamaño y SHA-256 de las respuestas públicas, no evalúa competencia lingüística ni acredita instalación de PWA.

## Language Studio 3.0 — 16/10/2026

La evidencia de esta intervención usa el prefijo `os3-`; no reemplaza capturas ni informes de versiones anteriores. `os3-before` y `os3-candidate`: 252 originales por fase, 18 estados de EN/PT en siete tamaños. `os3-qa/exercises.json`: 36 capturas adicionales tras interacciones reales con los formatos nuevos, corrección y cuaderno. `os3-metrics.json`: botón principal y contador despejados. `os3-pedagogy.json`: inventario estructural, con cobertura manual declarada. [Comparador](os3-comparison.html). Publicación y resultados definitivos en [QA](../../RESULTADOS_QA.md).

```bash
node --use-env-proxy scripts/redesign-capture.mjs os3-before
node scripts/redesign-capture.mjs os3-candidate http://127.0.0.1:3312/plataforma-ingles-uso-personal/
node --import tsx scripts/capture-studio-three.ts
node scripts/redesign-metrics.mjs http://127.0.0.1:3312/plataforma-ingles-uso-personal/ artifacts/redesign/os3-metrics.json
node --import tsx scripts/audit-curriculum.ts artifacts/redesign/os3-pedagogy.json
```

No volver a ejecutar `os3-before` sobre una publicación nueva: ya no representaría la base auditada.
