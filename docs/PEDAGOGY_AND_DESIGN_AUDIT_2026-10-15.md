# Auditoría pedagógica y visual — English OS / Português OS
**15 octubre 2026 · revisión del código posterior al rediseño**

## Método y alcance
Revisé los recorridos diarios, la ruta de clases, la estimación de nivel, el registro de evidencias, los materiales de ejemplo, el módulo oral, la localización y los estilos. Esta auditoría combina lectura estática del código y pruebas de regresión en CI. **No es una validación externa del MCER ni una revisión manual exhaustiva de todas las 131 clases por idioma.** No dispone de una muestra de usuarios que permita medir ganancias reales de aprendizaje.

## Hallazgos

| Prioridad | Observación | Evidencia | Tratamiento |
| --- | --- | --- | --- |
| P1 | El texto de inicio fijaba un punto de partida B1/A1 incluso cuando podía existir un diagnóstico diferente o incompleto | `src/components/dashboard.tsx` y `src/lib/placement.ts` | Se usa la referencia diagnóstica cuando está completada, distinguiéndola del nivel de la ruta |
| P1 | El acceso a producción oral existía pero podía quedar secundario frente a indicadores y actividades cerradas | `src/components/oral-practice.tsx`, dashboard | Nueva consigna comunicativa contextual en el inicio con acceso al módulo oral |
| P2 | Un comentario A1 del diagnóstico portugués usaba la construcción metalingüística poco natural «Com eu» | `src/locales/pt-BR/content.ts` | Corregido a «Com o pronome “eu”...» |
| P1 | Listening se basa en audios de síntesis y preguntas cerradas; speaking guarda producción, sin juicio fonético fiable | `src/lib/oral-practice.ts`, `src/locales/learning/oral-scenarios.ts` | Mantener aviso explícito; planificar variedad de voces y evaluación auténtica antes de inferir dominio |
| P1 | El cálculo de exactitud objetiva agregada no demuestra competencia comunicativa global | `src/lib/evidence-summary.ts` | Se preserva separación de actividad, precisión y habilidades sin evaluar |
| P2 | Densidad visual del inicio: resumen, accesos, ruta y exploración compiten por atención | dashboard, CSS de estudio | Tarjeta oral de bajo peso visual; se mantiene recomendación principal como CTA; pendiente estudio con usuarios |

## Inglés (A2/B1 → B2)
- **Fortalezas:** práctica contextual, rutas graduadas, recuperación, correcciones en ítems objetivos, posibilidad de trabajar materiales propios y seguimiento longitudinal.
- **Limitaciones:** falta una corrección humana o de herramienta fiable para escritura y habla, escuchar voces sintéticas no sustituye conversaciones naturales, y aprobar bloques no implica desempeño B2 fuera de la app.
- **Próxima prioridad:** introducir periódicamente tareas abiertas (resumir, explicar, argumentar) con devolución auténtica y escuchar diversas voces en situaciones reales. Evitar subir nivel por repetición de respuestas conocidas.
- **Sesión sugerida 20 minutos:** 4 min repaso, 7 min clase o texto, 5 min frase/escritura propia, 4 min voz o listening. No adjudicarle a la app minutos que no haya registrado.

## Portugués brasileño (A1 → autonomía)
- **Fortalezas:** contexto para hispanohablantes, voz pt-BR, material cotidiano, léxico y primeras conjugaciones, separación total del historial.
- **Limitaciones:** interferencia español-portugués, sonidos nasales y variantes de pronunciación requieren entrenamiento específico; los distractores y la voz sintética no bastan para conversación espontánea.
- **Próxima prioridad:** producción oral breve, escucha con varias personas reales, contrastes español/portugués, colocaciones y retroalimentación adaptada al nivel.
- **Sesión sugerida 20 minutos:** 5 min escuchar, 6 min vocabulario/frases en contexto, 5 min clase, 4 min expresarse en voz alta.

## Principios no negociables
1. Los resultados de actividades cerradas son evidencia específica, no certificación CEFR.
2. Guardar una grabación no constituye prueba de pronunciación correcta.
3. El material del usuario no debe sobrescribirse al ajustar la pedagogía o los estilos.
4. Una tarea diaria debe ser la acción dominante; el usuario puede elegir actividades distintas.
5. Evitar replicar el contenido del inglés mediante traducción literal al portugués cuando afecte naturalidad.
6. Mantener retrocompatibilidad de borradores, historia y sincronización.

## Calidad de los cambios de esta intervención
- Test responsive del inicio para ambos espacios y acceso al módulo oral.
- Los tests preexistentes siguen siendo la principal cobertura de rutas, lectura, PDF, sincronización y persistencia.
- La publicación se realizará únicamente si la validación automática concluye correctamente.

## Mejoras posteriores que siguen abiertas
- Aumentar la exposición a audio auténtico y voces diversas.
- Instrumento de evaluación de writing con rúbrica y corrector fiable.
- Speaking con devolución fonética/acústica calibrada o revisión humana.
- Auditoría editorial línea por línea de todos los materiales A1–C2.
- Prueba con estudiantes reales (tasas de comprensión, abandono, mejoras entre pre/postests).
