# Auditoría visual y de interacción

## Antes: evidencia ejecutada

Se capturaron EN/PT a 375, 390, 768 y 1440 px en Chromium, perfiles nuevos, tema claro. Las ocho capturas están en `artifacts/audit/before/`; las mediciones en `measurements.json`. No se observó desbordamiento horizontal ni errores JavaScript en estas pantallas.

La pantalla inicial presentaba saludo, tutorial, racha/logros, sugerencia diaria, recorrido, nivel, explicaciones, requisitos y accesos. La acción de aprender se desplazaba hacia abajo. Esto fragmentaba la atención y mezclaba orientación, resultados y reglas. La jerarquía debe llevar una recomendación accionable arriba y dejar las reglas detalladas accesibles en segundo plano.

Los detalles plegados y varias ventanas modales incrementan las transiciones. Una actividad pausada no debe sustituir silenciosamente la actividad que el usuario acaba de elegir. El aviso de reanudación y los controles de continuar necesitan nombrar su destino.

## Dirección implementada

- Home: saludo compacto, objetivo/etapa, recomendación principal, resumen semanal, habilidades y accesos.
- Rutina: contexto adulto, imagen/ilustración útil, instrucción breve nativa y apoyo español debajo.
- Clases: un ejercicio a la vez; teoría revisable; feedback cercano al elemento respondido.
- PDF: lectura a la izquierda y herramientas a la derecha en escritorio; pestañas/paneles en móvil.
- Progreso: constancia, resultados y competencias como conceptos separados.
- Vocabulario/juegos: navegación rápida, prioridades de repaso y ayudas registradas.

## Verificación accesible

Los tests comprueban nombres accesibles, foco, teclado y ausencia de overflow en recorridos concretos. Eso no equivale a certificación WCAG. Contraste debe medirse sobre estilos computados y composiciones visibles; gradientes, imágenes y estados requieren inspección adicional. Animaciones deben respetar `prefers-reduced-motion`.

## Después

La rama incorpora un dashboard con CTA antes del resumen semanal, explicación bilingüe del motivo y duración. El tutorial inicial queda visible en su primera visita después de la acción principal; la sugerencia extendida queda en detalles opcionales; el recorrido permanece accesible. Analítica se organiza en constancia, rendimiento y competencia, excluyendo resultados con ayudas de los porcentajes objetivos independientes y marcando escritura/oral sin evaluar.

Las capturas posteriores y las diferencias observadas se registran en `RESULTADOS_QA.md` y `artifacts/audit/COMPARACION.md`. No se considera probado un componente únicamente porque su CSS compiló.

Se corrigió una colisión de especificidad: los tokens heredados del tema claro y del espacio portugués seguían imponiendo parte de la paleta anterior. Las pruebas verifican el fondo efectivo de cada idioma, además del contraste de texto principal/secundario frente a superficie en temas claro/oscuro. El amarillo queda reservado al acento decorativo; los enlaces usan el tono de acción.

El texto bilingüe aumenta la altura de pantalla. Se prioriza la tarea principal y se mantienen accesibles los detalles; no se afirma que la pantalla completa quepa sin desplazamiento. Las capturas se hacen con el pop-up diario y el tutorial descartados para comparar la misma situación inicial. Las pruebas específicas verifican también la primera visita.
