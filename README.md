# English OS & Português OS

Dos espacios personales para estudiar idiomas, con una sola pregunta al entrar: **¿qué estudio hoy?** Inglés y portugués brasileño comparten la experiencia y conservan sus datos por separado.

[English OS](https://alejo02025.github.io/plataforma-ingles-uso-personal/) · [Português OS](https://alejo02025.github.io/plataforma-ingles-uso-personal/portugues/) · [Comparación visual real](artifacts/redesign/comparison.html) · [QA ejecutado](RESULTADOS_QA.md).

## Empezar

Abrí Today / Hoje y tocá Start / Começar. La actividad principal considera trabajo inconcluso, refuerzos, palabras pendientes y clases disponibles. Hasta tres siguientes completan una sesión estimativa. Al terminar, el día queda cerrado y no vuelve a ofrecer automáticamente las mismas tareas.

Podés elegir 15, 20, 30 o 45 minutos. Los ajustes históricos de 5 y 40 se respetan. Cambiar duración conserva lo que terminaste. La preferencia habitual está en Settings / Ajustes y se aplica a días nuevos.

No hace falta crear una cuenta ni configurar GitHub para estudiar y guardar progreso en ese navegador. El respaldo privado entre dispositivos es opcional.

## Cinco áreas

| Área                 | Qué contiene                                                                         |
| -------------------- | ------------------------------------------------------------------------------------ |
| Today / Hoje         | Una actividad principal, hasta tres siguientes y su contador real                    |
| Classes / Aulas      | Próxima clase, bloque de cuatro lecciones, requisitos y guía de idioma siempre libre |
| Review / Revisão     | Palabras y ejemplos guardados, repasos, rutinas, juegos, escucha y grabaciones       |
| Library / Biblioteca | PDFs con pestañas independientes, textos personales, lecturas y noticias             |
| Progress / Progresso | Semana de estudio, resultados de ejercicios, evidencias e historial/calendario       |

Ajustes reúne tema, tiempo habitual, diagnóstico orientativo, datos, sincronización y actualización. En computadora hay un lateral; en móvil, una barra inferior compacta. No hay un menú adicional de trece herramientas.

## Aprendizaje conectado

Se conservan los puntos de partida históricos: Alejo A2 y Jazmín A1, además de cualquier checkpoint posterior guardado. El diagnóstico no cambia automáticamente el recorrido. Cada idioma conserva 131 clases originales orientadas al MCER; no son un currículo acreditado ni certifican un nivel.

Las clases combinan objetivo, explicación, ejemplos, una pregunta cada vez, corrección y aplicación personal. Se conserva la primera respuesta y el historial. Los bloques conectan clases, lectura, vocabulario y escritura; los requisitos no se relajan al cambiar de diseño. Los niveles futuros quedan bloqueados; la guía de tiempos, verbos y formación de oraciones permanece abierta.

Completar una actividad acredita estudio. Un acierto describe ese ejercicio. Guardar escritura, audio o una racha no demuestra competencia lingüística. Progreso muestra estas diferencias y lo pendiente de evaluar. El [informe pedagógico](AUDITORIA_COMPLETA.md) distingue revisión estructural y muestras inspeccionadas.

Las palabras de un texto abren una nube con significado, explicación y uso en español, modelo en el idioma estudiado y guardado. Word help / Ajuda com palavras permite inspeccionar opciones de un ejercicio sin elegirlas. Los repasos piden recuperar antes de revelar y registran la propia valoración de memoria, no una nota objetiva de dominio.

## Biblioteca y PDFs

En My files / Meus arquivos se pueden importar varios PDFs sin reemplazar los anteriores. Cada pestaña conserva lectura, respuestas, conversación y borradores. Quitar un archivo lo mueve a la papelera; Undo / Restore lo recupera con su historial.

En escritorio se separan documento y herramientas. En móvil se prioriza un panel mediante pestañas. Se pueden guardar palabras, contestar preguntas, registrar dudas y volver al punto anterior. El modo guiado cita pasajes. La IA local es opcional y sus respuestas no son evaluaciones autoritativas.

Readings / Leituras permite agregar texto personal sin duplicar el importador de PDFs. News / Notícias ofrece titulares con fuente, fecha y reflexión opcional sin nota. Abrir una fuente externa requiere conexión.

Límites de archivos: PDF con texto seleccionable, 10 MB, 150 páginas y 100.000 caracteres. OCR para imágenes no está incluido. Importar no envía automáticamente el texto a una API de IA.

## Audio

En Review → Listen & record / Revisão → Ouvir e gravar se puede grabar hasta dos minutos, reproducir y guardar audio, nota y transcripción manual. No hay charla oral con IA ni nota automática de pronunciación o fluidez.

Listening usa voz sintética y dos preguntas objetivas. Mostrar la transcripción registra ayuda y excluye ese resultado de la evidencia independiente. Las voces disponibles y su funcionamiento sin señal dependen del navegador y del dispositivo.

## Guardado, offline y actualización

La edición de GitHub Pages usa SQLite en IndexedDB. Ambos idiomas tienen bases independientes; actualizaciones, cambios visuales y sincronización no restablecen esas bases. La agenda diaria se guarda dentro de la base existente y no crea sesiones o resultados ficticios.

Una primera conexión descarga la app y sus recursos de estudio. En Ajustes se puede comprobar Ready offline / Pronto sem conexão. Los PDFs personales y el progreso quedan en IndexedDB. Los pesos del modelo local se descargan solo al elegir activarlo; no son necesarios para leer o practicar.

Update app / Atualizar aplicativo está en Ajustes. La actualización compartida renueva ambos espacios y espera si hay una grabación o preferencias modificadas. Los enlaces de idioma mantienen la versión compartida. No se borran caches de datos personales como método de actualizar.

El guardado del navegador no es una copia externa. Para otro dispositivo se puede exportar o configurar un repositorio privado. La sincronización combina historiales y usa carpetas `english-os/` y `portuguese-os/`; no mezcla idiomas. El token queda solo en memoria y debe volver a autorizarse tras recargar. Nunca se escribe en el código o el chat. [Despliegue y límites](docs/DEPLOYMENT.md).

## Ejecutar y verificar

Requiere Node.js 24. No necesita Docker, PostgreSQL ni una clave de IA para empezar.

```bash
npm ci
npm run dev
```

La base se inicializa automáticamente. Para producción de servidor:

```bash
npm run build
npm run start
```

Para las dos exportaciones estáticas:

```bash
npm run build:pages
npm run test:pages
```

Verificación del proyecto:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
node --import tsx scripts/audit-curriculum.ts
```

Las pruebas estáticas y de servidor usan el mismo directorio de resultados: deben ejecutarse de forma secuencial. Chromium instalado se detecta automáticamente; en otra máquina se puede instalar con `npx playwright install chromium` o definir `PLAYWRIGHT_EXECUTABLE_PATH`.

El servidor de preview de Pages usa 3200 por defecto. `STUDY_PREVIEW_PORT=3300 node scripts/serve-pages.mjs` permite capturas independientes mientras se prueba. `scripts/redesign-capture.mjs` conserva capturas reales; `scripts/redesign-metrics.mjs` mide la posición de la acción principal y del contador. Los tiempos locales no son promesas de rendimiento en teléfonos.

Los scripts de instalación para Windows permanecen disponibles. Sus instrucciones anteriores están [archivadas](docs/audit-2026-10-14/README.md); la ejecución en hardware Windows no se declara verificada en esta revisión.

## Configuración de servidor y privacidad

Ver [.env.example](.env.example). `APP_ACCESS_TOKEN` protege el acceso; `ENGLISH_DATA_DIR` fija el volumen persistente; `ENGLISH_AI_API_KEY` y `ENGLISH_AI_MODEL` habilitan un proveedor externo solo en servidor. Nunca usar secretos en `NEXT_PUBLIC_*`.

La conexión externa de IA no se presenta como verificada con una credencial real. Su contrato tiene pruebas simuladas. Las grabaciones no reciben evaluación acústica a partir de una transcripción.

Para respaldar el servidor, detenerlo y copiar todo el directorio de datos, incluidos WAL/SHM y archivos PDF. La exportación JSON no sustituye una copia de los originales. El código y el sitio público no contienen el historial privado.

## Implementación y publicación

[Auditoría completa](AUDITORIA_COMPLETA.md) · [Inglés](AUDITORIA_INGLES.md) · [Portugués](AUDITORIA_PORTUGUES.md) · [Auditoría visual](AUDITORIA_VISUAL.md) · [Plan](PLAN_IMPLEMENTACION.md) · [Sistema de diseño](DESIGN_SYSTEM.md) · [QA](RESULTADOS_QA.md).

El workflow verifica TypeScript, unitarias, ambos builds estáticos, toda la regresión de Pages, build de servidor y recorrido autenticado. La publicación ocurre después de integrar un PR verificado en main. Se regeneran los estáticos, se solicita un build de Pages y se comprueban versión y capturas públicas. Un build local o un push no se presenta por sí solo como prueba de publicación.

La [revisión del 16/10/2026](CORRECCIONES_2026-10-16.md) documenta la identidad cálida, selector de idiomas siempre visible, protección de grabaciones, requisitos desplegables y verificación pública del cambio.
