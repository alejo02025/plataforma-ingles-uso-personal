# Auditoría visual — Language Studio 3.0

Fecha: 16/10/2026. Capturas de Chromium con perfiles temporales, no dispositivos físicos. [Registro detallado de defectos](docs/OS3_AUDITORIA.md).

## Antes

252 capturas públicas: 18 estados × 7 viewports × 2 idiomas. [Originales y medidas](artifacts/redesign/os3-before/observations.json). Se observaron portada decorativa de Hoy, peso excesivo de la cabecera móvil, emojis repetidos, corrección móvil superpuesta, varias cajas sucesivas en referencia y ayudas duplicadas. No hubo overflow ni excepciones JS en las visitas; la ausencia de esos fallos no hacía adecuada la jerarquía.

## Reconstrucción implementada

- Inter local reemplaza Nunito en el producto activo. Tipografía moderada, título compacto y cuerpos con medida de lectura; fuente y licencia incluidas offline.
- Hoy utiliza una actividad principal y lista ordenada lateral en escritorio, lineal en móvil. Sin ilustración, porcentajes académicos ni saludos extensos.
- Navegación con iconos funcionales y cinco destinos; cabecera móvil de una fila con selector de idiomas. Ajustes secundario. No se agregó otra barra global.
- Clase enfocada sin repetir el título global; teoría breve, ejemplo, ejercicio, feedback inline y siguiente acción. Consulta de palabra disponible también dentro del ejercicio.
- Grammar Studio coloca controles y modelo juntos; tiempos, patrones y verbos usan el mismo sistema. Instrucciones y notas extensas son desplegables.
- Repaso incorpora errores reales con detalles progresivos; Biblioteca y Progreso consumen los mismos tokens, tipografía y controles.
- Paleta neutra y un acento por idioma; radios 8 px, sombras contenidas, sin degradados en controles ni decoración emoji constante. Las banderas son identificadores funcionales.

## Validación

Se capturaron la candidata local y la web publicada: [252 pantallas públicas principales](artifacts/redesign/os3-published/observations.json), más 14 estados públicos del cuaderno con datos reales de prueba. [Comparación antes/después](artifacts/redesign/os3-comparison.html) y [QA](RESULTADOS_QA.md). Hay pruebas de contraste de texto y superficies en ambos temas, foco, teclado, etiquetas, mensajes y acceso al botón principal. Esto no equivale a certificación WCAG de todos los estados.

Las medidas de inicio registran Start visible y contador despejado después de desplazar, a siete tamaños. Pinturas y tiempos corresponden a esta máquina sin throttling: no son mediciones de usuarios reales ni Lighthouse/Core Web Vitals de producción.

El último pedido incorpora colores ambientales en movimiento detrás del contenido, compartiendo los acentos de cada idioma. Hay control de pausa persistente en Ajustes, pausa de pestaña oculta y soporte de movimiento reducido. Se repiten capturas y pruebas sobre esta versión; no se usa el resultado anterior de 89 pruebas como si incluyera el fondo nuevo.

El fondo motivó una corrección adicional de contraste: texto secundario más oscuro en claro y menor intensidad ambiental en oscuro. La prueba mide las paradas reales del gradiente, su opacidad y las combinaciones de solapamiento; no se limita a comparar tokens sobre una superficie plana.

La nueva pestaña de errores se comprueba además con un intento realmente guardado en los siete tamaños y ambos idiomas: 14 capturas adicionales, sin sustituirlas por un estado vacío. No existía un cuaderno equivalente en la versión anterior.
