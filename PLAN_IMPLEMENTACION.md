# Plan de implementación

## Condiciones

Rama aislada `audit/integral-2026-10-14`; conservar arquitectura, IDs, borradores, intentos, PDFs y checkpoints. No publicar ni fusionar. No migraciones destructivas, secretos frontend ni nuevas plataformas obligatorias.

## P0

1. Reproducir la repetición de actividades al elegir siguiente y distinguir reanudar de iniciar otra tarea.
2. Controlar versión de bancos/registro de primeras respuestas; garantizar guardado idempotente.
3. Corregir localización: idioma de estudio primero, apoyo español debajo.
4. Validar aislamiento de datos, rollback ante sincronización y pérdida de conectividad.
5. Corregir cantidades y afirmaciones de evaluación en documentación.

## P1

1. Dashboard con recomendación inmediata y motivo trazable.
2. Actividades contextualizadas, distractores plausibles y dificultad graduada.
3. Clases concentradas en una comprobación cada vez, con borrador/retoma.
4. Design tokens por idioma, temas, tipografía y espaciado responsive.
5. PDF lectura/herramientas adaptadas a pantalla; mantener varios archivos, papelera y respuestas.
6. Analítica de constancia, rendimiento objetivo y competencia pendiente separadas.
7. Diagnóstico más variado y explicitación de incertidumbre sin cambiar el inicio automáticamente.

## P2

1. Práctica oral mediante grabación/transcripción opcionales, sin nota de pronunciación inventada.
2. Listening guiado y límites de voz del navegador.
3. Recomendaciones según errores, repaso, nivel, historial y disponibilidad.
4. Evaluación externa y tareas abiertas con rúbrica solo cuando haya capacidad fiable.

## Puerta de revisión

Build dual EN/PT; tests unitarios y Playwright; matriz de pantallas; capturas antes/después; datos existentes conservados; registro exacto de fallos y limitaciones en `RESULTADOS_QA.md`. Un resultado de prueba no se extrapola a otro navegador o tecnología no ejecutada.

## Estado de implementación de la rama

P0/P1: código integrado para progresión y borradores, diagnóstico, feedback bilingüe, dashboard, clases centradas, PDF adaptable, evidencia separada y temas. Se conservan las claves, tablas, IDs y checkpoints; no se ejecuta publicación.

P2 implementado: recomendación priorizada por pendientes/refuerzo/repasos, grabación local, reflexión y comprensión breve de voz sintética. P2 pendiente de validación externa: diagnóstico calibrado, producciones evaluadas por rúbrica, audio natural licenciado amplio y evaluación fiable de pronunciación. No se sustituyen esas limitaciones por porcentajes inventados.

El estado exacto de la puerta de revisión figura en `RESULTADOS_QA.md`. Los casos se ejecutan en bases temporales; los perfiles de niveles superiores son fixtures desechables, no cambios a los estudiantes reales.

## Seguimiento: tiempo disponible y continuidad

Implementado después de la revisión inicial:

- Motor de recomendación separado: pendiente real → refuerzo → ejercicio guiado pausado → palabras por repasar → práctica breve o siguiente clase habilitada.
- Elección opcional de 5, 20 o 40 minutos para hoy. Se conserva por idioma y día de estudio en este dispositivo; el tiempo habitual y el plan existente no cambian.
- Una pausa de cinco minutos propone una práctica pendiente del bloque antes de una clase más larga. Si hay una tarea pendiente o un refuerzo que requiere más tiempo, ofrece un tramo y aclara que empezar no acredita terminar.
- Retomar desde el inicio abre el modo del borrador pausado, sin reiniciar su secuencia. Los borradores completados o de otro bloque/nivel no se recomiendan.
- El recorrido exploratorio distingue su duración completa del tiempo elegido hoy. Mantiene su carácter opcional.

No introduce migraciones, puntuaciones nuevas ni requisitos más débiles. Las duraciones son estimaciones, no límites que corten una sesión. La preferencia diaria es local; no constituye sincronización entre dispositivos.
