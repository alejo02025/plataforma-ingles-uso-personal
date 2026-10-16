# Sistema de diseño — Language Studio 3.0

## Arquitectura

Dos identidades y una implementación. `src/app/globals.css` contiene tokens, shell y controles; `src/styles/study-modules.css`, layouts de estudio. Se modificaron los estilos existentes; no se añadió una capa de overrides. Componentes compartidos: `ExerciseFrame`, `ChoiceOptions`, `SentenceTiles`, `LearningInsight`, `StudyCopy`, `SpanishTranslation`, `Correction` y controles base.

Cinco áreas: Today/Hoje, Classes/Aulas, Review/Revisão, Library/Biblioteca, Progress/Progresso. Settings/Ajustes es secundario. 🇬🇧 English / 🇧🇷 Português permanece visible; las pestañas internas agrupan herramientas sin competir con navegación global.

## Tokens efectivos

| Función               | Claro     | Oscuro    |
| --------------------- | --------- | --------- |
| Fondo                 | `#F7F8F6` | `#171C1A` |
| Superficie            | `#FFFFFF` | `#202724` |
| Superficie secundaria | `#F2F3EF` | `#29312D` |
| Texto                 | `#202725` | `#EDF1EC` |
| Texto secundario      | `#4D5953` | `#B0BAB2` |
| Borde                 | `#DFE4DF` | `#3D4841` |
| Acento inglés         | `#167568` | `#8BD3BA` |
| Acento portugués      | `#7652A6` | `#CCB0EE` |
| Éxito                 | `#26784F` | `#8BD3A5` |
| Error                 | `#B34443` | `#F2AAA5` |

Estados usan texto, icono o etiqueta además del color. Los alias heredados remiten a estos tokens. Superficies de apoyo no crean identidades nuevas por herramienta.

## Tipografía y espacio

Inter Variable 4.1, local, SIL OFL. `next/font/local`, sin descarga de fuente en tiempo de lectura. Procedencia y hash en `public/assets/fonts/NOTICE.md`; se conserva la fuente antigua por compatibilidad de recursos históricos, no se usa en el layout activo.

Cuerpo 16 px, línea 1,6; encabezados 650 y letra ligeramente ajustada. H1 fluido 1,65–2,1 rem, h2 1,35 rem, h3 1,05 rem. Los ejemplos distinguen modelo, estructura y apoyo español secundario; no se rebaja el contraste para ocultar una traducción.

Espacios recurrentes 6/8/12/16/20/24/32 px; radio principal 8 px. Sidebar 212 px. Hoy: dos columnas en escritorio y una en móvil; controles y resultados de Grammar Studio juntos. Móvil usa cinco destinos inferiores con safe-area y cabecera de una fila. No hay drawer global ni corrección fijada sobre el botón.

## Interacción

Una pregunta por pantalla, progreso sobre ítems reales, comprobar antes de revelar, feedback inline y continuar. Primera respuesta inmutable; pistas graduadas y teoría identificadas como ayudas. Las respuestas abiertas no reconocidas muestran incertidumbre, no error inventado.

Foco al encabezado de la nueva pregunta, selección nativa con teclado, controles táctiles, Undo/Clear, pausa con borrador, nombres accesibles, status/alert y reintentos. Los diálogos conservan gestión de foco; LearningInsight usa una tarjeta inline que no secuestra el foco ni tapa la respuesta. Movimiento reducido respetado.

La traducción es editorial o modelo explícito. `spanishCopy` devuelve null para prosa desconocida; no se fabrica una frase genérica como traducción literal. En evaluación se traduce la consigna y la explicación después de responder, no la solución antes de tiempo.

[Validación y límites de accesibilidad](RESULTADOS_QA.md).

## Fondo en movimiento solicitado al continuar

Tres manchas de color suaves detrás del contenido, con movimiento de 32–41 segundos mediante transformaciones CSS. Verde/azul en inglés, ciruela/rosa en portugués y apoyo cálido común. Las superficies de ejercicio siguen opacas. El fondo no recibe clics, queda oculto a tecnologías asistivas y no añade descargas, canvas ni bucles JavaScript por frame.

Se detiene con `prefers-reduced-motion`, al ocultar la pestaña o mediante Ajustes → Moving background colours / Cores em movimento no fundo. La preferencia se guarda automáticamente por idioma en este navegador, sin modificar el esquema del alumno ni exigir GitHub. No se afirma medición energética en dispositivos físicos.

El fondo motivó una corrección adicional de contraste: texto secundario más oscuro en claro y menor intensidad ambiental en oscuro. La prueba mide las paradas reales del gradiente, su opacidad y las combinaciones de solapamiento; no se limita a comparar tokens sobre una superficie plana.

En teléfonos, las manchas de color usan una geometría propia para que sigan visibles alrededor de la tarjeta principal y la cola; no se reutilizan sin ajuste las posiciones de escritorio.
