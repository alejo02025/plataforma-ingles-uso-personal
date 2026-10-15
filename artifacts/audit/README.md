# Evidencia visual de la auditoría

`before/`: exportación estática publicada existente al empezar la auditoría, antes de regenerar el build. EN/PT, perfiles vacíos y tema claro, a 375/390/768/1440 px. Capturas locales; no se visitaron ni modificaron datos personales remotos.

`after/`: build de la rama de auditoría, mismas anchuras e idiomas; se añaden capturas dark cuando se ejecuta esa prueba.

`measurements.json` por fase contiene mediciones locales reales. `readyMs` incluye espera visual y captura: **no es LCP, Lighthouse ni una medición de teléfono físico**. No extrapolar a producción o a una conexión móvil.

La matriz posterior se reproduce con:

```sh
npm run build:pages
npm run test:pages -- tests/pages/integral-audit.spec.ts
```

`capture.mjs` permite recoger mediciones ampliadas desde un servidor ya abierto en `127.0.0.1:3201` que sirva los archivos estáticos bajo `/plataforma-ingles-uso-personal/`; no cambia datos de usuarios ni publica nada. Ejecutar desde la raíz del repositorio con `node artifacts/audit/capture.mjs after http://127.0.0.1:3200`.

Los fixtures de niveles B1/B2/A2 existen solamente dentro de contextos Playwright desechables. Una base SQLite real se abre y se verifica con `PRAGMA integrity_check` antes de reintroducirla en el IndexedDB de test. Los hitos simulan historia previa; **no son un mecanismo para desbloquear niveles en producción ni una certificación de dominio**.

Las capturas `class-*`, `studio-*`, `routine-*`, `oral-*` y `*-dark-*` muestran estados adicionales **posteriores**; no se presenta una comparación anterior de esos estados cuando no se capturó. `*-home-viewport-390.png` muestra el primer viewport móvil, mientras que las capturas por ancho son de página completa. Los archivos de métricas identifican mediciones locales, no puntuaciones de rendimiento certificadas.

`before/collection-only.json` conserva una recolección inicial de 11 casos omitidos, sin ejecución. No se contabiliza como QA aprobada. Los resultados ejecutados de cierre están en `verification.json` y `verification.txt`.

`after/time-en-390.png` y `after/time-pt-390.png` muestran una recomendación para cinco minutos. Se reproducen con `npm run test:pages -- tests/pages/study-time.spec.ts`. La preferencia vale para ese día y espacio en el dispositivo; no modifica el plan ni sus requisitos. Ejecutar las suites estática y Node por separado: ambas usan por defecto `test-results`.
