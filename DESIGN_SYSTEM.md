# Sistema de diseño: espacio de estudio

## Organización

Una arquitectura común para English OS y Português OS. Cinco áreas: Today/Hoje, Classes/Aulas, Review/Revisão, Library/Biblioteca y Progress/Progresso. Ajustes es secundario. El selector 🇬🇧 English / 🇧🇷 Português permanece visible en el encabezado de todas las áreas, también en móvil. Las pestañas de cada área agrupan herramientas; no son una segunda navegación global.

El diseño anterior no se conserva debajo de una capa de overrides. `globals.css` contiene tokens, base, controles y shell; `study-modules.css` contiene layouts de herramientas. Se retiraron seis hojas superpuestas, `classes.css` y los componentes sin importadores activos comprobados.

## Tokens efectivos

| Token | Claro EN | Oscuro EN |
| --- | --- | --- |
| Fondo | `#faf8f2` | `#1c2723` |
| Superficie | `#fffefb` | `#25332c` |
| Superficie secundaria | `#f0eee6` | `#2e3d35` |
| Texto | `#293a32` | `#f4f2e9` |
| Texto secundario | `#5c665a` | `#bec7bd` |
| Acento | `#245b45` | `#cae5a1` |
| Bloque de estudio | `#e1edb8` | `#344832` |

Portugués comparte la tipografía, estructura y componentes. Acento ciruela `#6b478b`, bloque lavanda `#e9def2`; en oscuro, superficies ciruela y acento `#d6b8f1`. Sus colores no dependen de estereotipos culturales.

Los alias heredados que aún consumen herramientas apuntan a estos tokens; no definen una segunda paleta. Los colores de error y acierto acompañan texto o estado, no sustituyen la explicación. El juego de letras conserva su leyenda funcional y devolución textual.

## Tipografía y composición

Nunito variable, alojada localmente mediante `next/font/local`, con su licencia SIL OFL existente. Se precarga con el resto de la aplicación y se incluye en el caché offline. Cuerpo de 16 px y altura 1,65; títulos con peso 800 y portada de Hoy fluida de 43–59 px. La tipografía reemplaza la fuente genérica del sistema.

El fondo cálido y las superficies claras se combinan con un bloque de estudio lima o lavanda. Una pequeña cubierta de cuaderno usa texto del idioma y el emoji de la actividad. Los emojis identifican secciones y tareas; están ocultos al lector de pantalla cuando son decorativos. Las etiquetas de navegación siguen siendo texto.

Espaciados recurrentes: 6, 8, 12, 16, 20, 24, 32 y 48 px. Controles de 10–12 px de radio y superficies de 16–24 px. Sin degradados ni animaciones continuas. Las transiciones de controles duran 160 ms y respetan reducción de movimiento.

## Layouts

- Escritorio: lateral de 236 px, 180 px en pantallas intermedias. Contenido hasta 1360 px y padding fluido.
- Hoy: actividad principal amplia y una cola horizontal de hasta tres tareas; la cola pasa a lista vertical en móvil. Sin indicadores académicos, saludo o herramientas técnicas.
- Hasta 800 px: navegación inferior de cinco destinos, sin drawer/hamburger. Padding de contenido y `env(safe-area-inset-bottom)` evitan tapar los controles finales.
- Clases: bloque paginado de cuatro filas, objetivo actual y una sala de clase con teoría revisable y una pregunta principal.
- PDF: lectura amplia y herramientas laterales. Hasta 980 px, pestañas para priorizar un panel; sin ocultar permanentemente las herramientas.
- Progreso: semana, resultados concretos y límites de evidencia; requisitos, logros e historial en detalles secundarios.
- Ajustes: formulario de preferencias y opciones de datos, con una columna en móvil.

## Interacción accesible

Un encabezado principal por pantalla. Enlace para saltar al contenido, `aria-current`, nombres explícitos para selectores, foco visible, mensajes `status`/`alert`, estados vacíos accionables y reintentos. Se conserva el manejo de foco de los diálogos. El cambio de idioma también se bloquea mientras se graba o se espera permiso del micrófono, con aviso accesible. El texto solo para lectores de pantalla usa `.sr-only`/`.visually-hidden`.

Los cambios de estado reducen la planificación manual: guardar una tarea actualiza el mismo contador; revelar ayuda no simula una respuesta independiente. La nube de traducción tiene una posición por defecto dentro del viewport y usa un panel inferior en móvil. Las animaciones respetan `prefers-reduced-motion`.

Las pruebas de contraste cubren texto principal/secundario en superficies, superficie secundaria y texto del bloque de estudio en claro y oscuro. Esto no constituye una auditoría WCAG completa de todos los estados e imágenes.
