# English OS · arquitectura y recorrido

## Decisiones

Next.js App Router y TypeScript, con dos modos: servidor Node 24 y exportación estática dual para GitHub Pages. El servidor usa SQLite con `node:sqlite`; la edición publicada usa SQL.js en dos bases IndexedDB separadas, English OS y Português OS. SQLite es una base transaccional persistente apropiada para un usuario; evita servicios adicionales y se puede migrar a PostgreSQL si aparece uso multiusuario. En servidor, datos y archivos van en `data/` o `ENGLISH_DATA_DIR`. En GitHub Pages, quedan en el navegador y se respaldan opcionalmente en un repositorio privado; no se incorporan al repositorio público de código. La interfaz usa CSS propio con variables, componentes accesibles y tema claro/oscuro, sin dependencia de fuentes externas.

Las rutas API validan entradas con Zod, usan consultas parametrizadas, verifican origen en escrituras y pueden protegerse con una contraseña de acceso y cookie HttpOnly firmada. La clave de IA solo se usa en el servidor hacia la API oficial de OpenAI. El contexto enviado incluye el nivel orientativo y patrones de errores, no documentos completos ni historial indiscriminado. Importar un PDF no lo envía a IA. El usuario decide solicitar una corrección.

## Modelo

Perfil → diagnósticos y respuestas retomables → evaluaciones por competencia. Documentos → checkpoints de lectura. Planes diarios → actividades → sesiones y resultados. Vocabulario → repasos con historial. Correcciones → errores categorizados y recurrentes. Evaluaciones → snapshots de evidencia. PDFs originales quedan en almacenamiento privado, con metadatos en documentos. Migraciones en `src/lib/db.ts`, registro `schema_migrations`; no se borra la base al arrancar.

Los planes se guardan por fecha de Buenos Aires y duración. Priorizan vocabulario vencido y la menor precisión observada entre competencias con evidencia. Las recomendaciones indican su motivo. Una actividad terminada no equivale a subir de nivel. El diagnóstico corto es orientativo, con baja confianza: sus ítems fueron redactados para este producto, no constituyen una prueba MCER validada. Speaking/listening/writing permanecen sin estimación hasta contar con instrumentos adecuados. No hay puntuaciones inventadas, días prellenados ni gráficos de ejemplo.

## Fases

1. **MVP utilizable:** perfil, diagnóstico retomable de reading/grammar/vocabulary; plan diario; biblioteca curada y textos propios; PDF con texto seleccionable; lector y preguntas; vocabulario con repetición espaciada; producción escrita, correcciones IA estructuradas; calendario, estadísticas objetivas y exportación. Tests de persistencia, planificación, seguridad, importación y recorrido UI.
2. **Práctica auditiva y oral:** grabación persistente, transcripción real, audios naturales licenciados, controles y preguntas; personalización por patrones; evaluaciones periódicas más amplias. No evaluar pronunciación por transcripción.
3. **Evidencia longitudinal:** instrumentos MCER calibrados, análisis acústico, conversaciones y adaptación con mejores muestras. Validar el sistema de estimación antes de afirmar B2.

## Límites deliberados del MVP

Banco inicial editorial finito, no generación infinita de lecturas. IA para corrección real, opcional según credencial. PDFs escaneados necesitan OCR, pendiente. No hay speech-to-text automático ni evaluación validada de pronunciación. La rama de auditoría añade grabación local y comprensión de mensajes sintéticos con resultados limitados a dos preguntas; mostrar la transcripción cuenta como ayuda. Aplicación personal, no multiusuario. Respaldar volumen de datos antes de actualizar. El acceso público requiere token, HTTPS, límites de tráfico en el proxy y un volumen persistente; no desplegar como función efímera con disco descartable.

## Auditoría integral: conservación y evidencia

Los nuevos intentos de rutina usan edición 2; la edición 1 sigue reproducible para resultados anteriores. Los borradores se separan por tarea e intento. Los diagnósticos nuevos tienen 24 ítems; los históricos cerrados conservan sus respuestas. Ninguna de esas ampliaciones promueve el recorrido automáticamente.

La práctica oral usa metadatos versionados `oral-v1` en la tabla de mensajes existente, separados del contenido PDF mediante el documento reservado de voz. Los archivos de audio se guardan como Blob en el almacén IndexedDB del idioma; el respaldo SQL contiene metadatos/notas, no esos archivos. No se agregan tablas ni migraciones destructivas. Audio, transcripción manual y resultados de escucha se muestran como evidencias diferentes.

Los informes `AUDITORIA_*.md` y `RESULTADOS_QA.md` registran hechos, cambios y límites de esta rama; las fases anteriores no deben interpretarse como funciones todas implementadas o validadas.
