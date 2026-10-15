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
