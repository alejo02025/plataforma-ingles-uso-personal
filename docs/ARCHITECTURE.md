# English OS · arquitectura y recorrido

## Decisiones

Next.js App Router y TypeScript, API ejecutada en Node 24, SQLite con `node:sqlite` y migraciones versionadas. SQLite es una base transaccional persistente apropiada para un usuario; evita servicios adicionales y se puede migrar a PostgreSQL si aparece uso multiusuario. Los datos y archivos van en `data/` o `ENGLISH_DATA_DIR`, nunca en el navegador ni en el repositorio. La interfaz usa CSS propio con variables, componentes accesibles y tema claro/oscuro, sin dependencia de fuentes externas.

Las rutas API validan entradas con Zod, usan consultas parametrizadas, verifican origen en escrituras y pueden protegerse con una contraseña de acceso y cookie HttpOnly firmada. La clave de IA solo se usa en el servidor hacia la API oficial de OpenAI. El contexto enviado incluye el nivel orientativo y patrones de errores, no documentos completos ni historial indiscriminado. Importar un PDF no lo envía a IA. El usuario decide solicitar una corrección.

## Modelo

Perfil → diagnósticos y respuestas retomables → evaluaciones por competencia. Documentos → checkpoints de lectura. Planes diarios → actividades → sesiones y resultados. Vocabulario → repasos con historial. Correcciones → errores categorizados y recurrentes. Evaluaciones → snapshots de evidencia. PDFs originales quedan en almacenamiento privado, con metadatos en documentos. Migraciones en `src/lib/db.ts`, registro `schema_migrations`; no se borra la base al arrancar.

Los planes se guardan por fecha de Buenos Aires y duración. Priorizan vocabulario vencido y la menor precisión observada entre competencias con evidencia. Las recomendaciones indican su motivo. Una actividad terminada no equivale a subir de nivel. El diagnóstico corto es orientativo, con baja confianza: sus ítems fueron redactados para este producto, no constituyen una prueba MCER validada. Speaking/listening/writing permanecen sin estimación hasta contar con instrumentos adecuados. No hay puntuaciones inventadas, días prellenados ni gráficos de ejemplo.

## Fases

1. **MVP utilizable:** perfil, diagnóstico retomable de reading/grammar/vocabulary; plan diario; biblioteca curada y textos propios; PDF con texto seleccionable; lector y preguntas; vocabulario con repetición espaciada; producción escrita, correcciones IA estructuradas; calendario, estadísticas objetivas y exportación. Tests de persistencia, planificación, seguridad, importación y recorrido UI.
2. **Práctica auditiva y oral:** grabación persistente, transcripción real, audios naturales licenciados, controles y preguntas; personalización por patrones; evaluaciones periódicas más amplias. No evaluar pronunciación por transcripción.
3. **Evidencia longitudinal:** instrumentos MCER calibrados, análisis acústico, conversaciones y adaptación con mejores muestras. Validar el sistema de estimación antes de afirmar B2.

## Límites deliberados del MVP

Banco inicial editorial finito, no generación infinita de lecturas. IA para corrección real, opcional según credencial. PDFs escaneados necesitan OCR, pendiente. No speech-to-text ni listening en esta fase. Aplicación personal, no multiusuario. Respaldar volumen de datos antes de actualizar. El acceso público requiere token, HTTPS, límites de tráfico en el proxy y un volumen persistente; no desplegar como función efímera con disco descartable.
