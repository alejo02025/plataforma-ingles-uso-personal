# Revisión de las últimas actualizaciones — 16/10/2026

Se conserva el trabajo reciente de los PR #12 y #13: recorrido conectado de clases, ejercicios inmersivos con tips, explicaciones en español, constructor de oraciones y correcciones de la biblioteca portuguesa. Esta revisión no restablece la app a una versión anterior ni modifica bases, esquemas, IDs, reglas de avance o archivos del estudiante.

## Correcciones implementadas

- **Acceso al portugués:** en la versión revisada el escritorio ubicaba el selector al pie del lateral y el móvil de 375/390 px ocultaba sus nombres. El encabezado ahora muestra ambas banderas y los nombres completos en todas las áreas, sin entrar en Ajustes.
- **Idioma activo:** tocar su bandera ya no recarga la página ni añade otra solicitud de actualización a la sesión.
- **Grabación y permiso pendiente:** cambiar de espacio se bloquea mientras se usa el micrófono o se espera su permiso, con un aviso accesible. No se atribuye ninguna nota de pronunciación a la transcripción.
- **Requisitos:** el botón del checkpoint abría el desplazamiento hacia un `details` cerrado. Ahora despliega las tareas antes de llevar al estudiante hasta ellas.
- **Contraste y nombres:** se oscureció el texto secundario sobre superficies coloreadas; las pruebas cubren también la superficie secundaria y el bloque principal, en ambos temas. Los nombres nativos del selector no pasan por traducción automática.
- **Ejercicios nuevos:** se conserva el jugador de lecciones del PR #13. La devolución móvil reserva espacio para que el control de volver no quede cubierto.

## Identidad y organización visual

Nunito variable alojada localmente, fondo cálido, acento verde y lima en inglés, ciruela y lavanda en portugués. Emojis acompañan las etiquetas de secciones y actividades. La portada de estudio conserva una sola acción principal; la secuencia complementaria pasa debajo. Se mantienen las traducciones al español incorporadas en la última versión.

Las variables y reglas comunes están consolidadas en `globals.css`. Los estilos de recorrido, referencia y jugador de clases están en `study-modules.css`, sin restaurar las paletas superpuestas de versiones anteriores. La marca Lingua y los iconos instalables existentes se conservan.

## Verificación

TypeScript, 111 unitarias, builds estáticos EN/PT y build de servidor aprobados. El recorrido autenticado del servidor aprobó 1/1. Las capturas del candidato cubren 92 vistas, sin excepciones JavaScript ni overflow en esas visitas. En los diez casos idioma×tamaño, Empezar quedó en el primer viewport y el contador quedó libre de la navegación después de desplazarse.

La regresión final aprobó 81/81 casos, sin omitidos, incluidos los ejercicios inmersivos del PR #13. La publicación terminó y se comprobó contra ambas URLs públicas. No se presenta una compilación local como comprobación del sitio público.

Las pruebas usan perfiles temporales y Chromium, con micrófono simulado para probar grabación. No verifican hardware iPhone/Safari, evaluación acústica ni todos los contenidos pedagógicos. Los errores de sincronización externa se simulan para verificar que se conserva la copia local.

## Publicación comprobada

PR [#14](https://github.com/alejo02025/plataforma-ingles-uso-personal/pull/14), controles aprobados e integrado. El [workflow de main](https://github.com/alejo02025/plataforma-ingles-uso-personal/actions/runs/38838234311) aprobó verificación y publicación. La versión servida es `2026-10-16T02:08:58.890Z`; su worker coincide y sus 124 archivos de precarga respondieron correctamente.

Se tomaron otras 92 capturas de la publicación nueva en los cinco tamaños. Dos recorridos públicos completaron una clase real, comprobaron guardado al recargar y cambiaron de idioma mediante el selector visible. Cada espacio conservó sus propios resultados; la siguiente clase fue diferente de la terminada. Se usaron perfiles efímeros, no datos privados de los estudiantes.

[Comparador antes/publicado](artifacts/redesign/identity-comparison.html) · [Trazabilidad de CI y release](artifacts/redesign/identity-public-verification.json) · [Recorridos públicos](artifacts/redesign/identity-published-journey.json).

Las capturas anteriores corresponden al release `2026-10-16T01:54:51.451Z` con el jugador de lecciones del PR #13. El capturador se actualizó para reconocer el recorrido nuevo; un primer intento con el selector anterior caducó y no se presenta como una captura aprobada. Las comprobaciones se repitieron tras incorporar las publicaciones recientes.

Las peticiones HTTPS públicas se recuperan con Node fetch y la CA de confianza del entorno; Chromium ejecuta los HTML y recursos reales. No se desactiva TLS. El worker se bloquea durante esos recorridos para permitir el relay; instalación, actualización y funcionamiento sin señal con worker activo se comprobaron en Playwright local. No se afirma una instalación física en iPhone.
