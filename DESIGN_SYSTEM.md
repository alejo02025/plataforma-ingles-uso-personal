# Sistema de diseño: espacio de estudio

## Organización

Una arquitectura común para English OS y Português OS. Cinco áreas: Today/Hoje, Classes/Aulas, Review/Revisão, Library/Biblioteca y Progress/Progresso. Ajustes y cambio de espacio son secundarios. Las pestañas de cada área agrupan herramientas; no son una segunda navegación global.

El diseño anterior no se conserva debajo de una capa de overrides. `globals.css` contiene tokens, base, controles y shell; `study-modules.css` contiene layouts de herramientas. Se retiraron seis hojas superpuestas, `classes.css` y los componentes sin importadores activos comprobados.

## Tokens efectivos

| Token                 | Claro     | Oscuro    |
| --------------------- | --------- | --------- |
| Fondo                 | `#f6f7f9` | `#151a21` |
| Superficie            | `#ffffff` | `#1c232d` |
| Superficie secundaria | `#eef1f5` | `#252f3b` |
| Texto                 | `#1e2835` | `#e9edf3` |
| Texto secundario      | `#5e6a78` | `#acb8c6` |
| Borde                 | `#dce1e7` | `#354150` |
| Acento inglés         | `#2857a4` | `#9bbcff` |
| Acento portugués      | `#187258` | `#8ed8bc` |

Los alias heredados que aún consumen herramientas apuntan a estos tokens; no definen una segunda paleta. Los colores de error y acierto acompañan texto o estado, no sustituyen la explicación. El juego de letras conserva su leyenda funcional y devolución textual.

## Tipografía y composición

Fuente principal del sistema (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif). Sin precargar una fuente decorativa. Cuerpo de 15 px y altura 1,6; títulos fluidos, pesos moderados. La lectura extensa usa una altura mayor y ancho controlado.

Espaciados recurrentes: 6, 8, 12, 16, 20, 24, 32 y 48 px. Radio habitual 5–8 px. Bordes finos; sin degradados. La sombra se reserva a ayudas superpuestas donde distingue capas.

## Layouts

- Escritorio: lateral de 208 px, 180 px en pantallas intermedias. Contenido hasta 1440 px y padding fluido.
- Hoy: acción principal y hasta tres tareas complementarias en dos columnas; una columna en móvil. Sin indicadores académicos, saludo o herramientas técnicas.
- Hasta 800 px: navegación inferior de cinco destinos, sin drawer/hamburger. Padding de contenido y `env(safe-area-inset-bottom)` evitan tapar los controles finales.
- Clases: bloque paginado de cuatro filas, objetivo actual y una sala de clase con teoría revisable y una pregunta principal.
- PDF: lectura amplia y herramientas laterales. Hasta 980 px, pestañas para priorizar un panel; sin ocultar permanentemente las herramientas.
- Progreso: semana, resultados concretos y límites de evidencia; requisitos, logros e historial en detalles secundarios.
- Ajustes: formulario de preferencias y opciones de datos, con una columna en móvil.

## Interacción accesible

Un encabezado principal por pantalla. Enlace para saltar al contenido, `aria-current`, nombres explícitos para selectores, foco visible, mensajes `status`/`alert`, estados vacíos accionables y reintentos. Se conserva el manejo de foco de los diálogos y la protección durante grabaciones. El texto solo para lectores de pantalla usa `.sr-only`/`.visually-hidden`.

Los cambios de estado reducen la planificación manual: guardar una tarea actualiza el mismo contador; revelar ayuda no simula una respuesta independiente. La nube de traducción tiene una posición por defecto dentro del viewport y usa un panel inferior en móvil. Las animaciones respetan `prefers-reduced-motion`.

Las pruebas de contraste cubren tokens de texto principal/secundario en superficies claras y oscuras. Esto no constituye una auditoría WCAG completa de todos los estados e imágenes.
