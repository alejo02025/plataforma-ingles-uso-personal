# Sistema de diseño compartido

## Principios

Idioma de estudio como capa principal, traducción española secundaria. Un objetivo y una acción primaria por pantalla. Adulto, claro, práctico; color para jerarquía y estado, nunca para afirmar dominio.

## Tokens y variantes

Implementado en `src/styles/audit-design.css`: variables CSS compartidas y variantes por `data-study-language`, con dark theme por `data-theme`. Referencia English: esmeralda `#16836B`, azul `#19354A`, fondo `#F7F9F8`, superficie blanca, texto `#182826`. Referencia português: verde `#24845D`, azul `#174C74`, amarillo `#F2C96B`, fondo `#FAF9F4`. Para acciones se usan tonos más oscuros: EN `#13765F` y PT `#1B714E`. Dark theme: fondo `#111C22`, superficie `#1B2A30`, texto `#EDF5F2`, secundario `#B2C5BE`. Los pares efectivos deben tener contraste suficiente; estas paletas son dirección, no garantía automática de WCAG.

Escala implementada: 4/8/12/16/24/32 px, radios 10/16/22 px y títulos responsive de 28–40 px, peso 800. Font local Nunito ya disponible; distinguir título, acción, texto y apoyo, sin introducir otra descarga obligatoria. Dark theme requiere tokens propios de superficie/texto/borde y revisión de controles.

## Componentes

- Botón primario: verbo + destino, estado ocupado, área táctil adecuada, foco visible.
- Inputs: etiqueta persistente, error asociado y valor conservado si falla.
- Tarjeta: título, un contenido principal y acciones inequívocas.
- Copia bilingüe: bloque principal nativo seguido de `lang="es"`; sin interpolar idiomas en una misma regla.
- Feedback: resultado del ítem, modelo nativo, por qué, situación de uso y próxima estrategia; ayudas visibles.
- Modal: nombre accesible, foco atrapado, Escape cuando es seguro, foco restaurado y sin descartar una escritura accidentalmente.
- Empty state: explicar qué falta y una acción; no porcentajes ficticios.
- Progreso: «sin evidencia» para habilidades no evaluadas, no cero de dominio.

## Responsive y movimiento

375/390 móvil: columna única y navegación inferior sin tapar acciones. 768: preservar lectura y legibilidad; 1440: paneles cuando aportan claridad. `prefers-reduced-motion` debe reducir transiciones. Evitar que una traducción extensa desplace toda la consigna y el botón fuera de contexto.

Las mediciones, capturas y límites reales se registran en `RESULTADOS_QA.md`; este documento describe el sistema y sus reglas, no declara una certificación de accesibilidad.

Los indicadores de etapa de clase usan texto `var(--surface)` sobre `var(--green)`; el tema oscuro no conserva texto blanco sobre verde claro. La copia secundaria conserva un tamaño legible, `lang="es"` y espacio separado. Las traducciones de opciones de clase aparecen después de confirmar la respuesta; la teoría y la explicación bilingües siguen disponibles.

El ajuste «Time for today / Tempo para hoje» permanece en un detalle cerrado debajo de la acción principal. Usa controles nativos con foco visible y área mínima de 44 px; admite 5/20/40 minutos. Una nota bilingüe distingue duración estimada completa y tramo recomendado cuando no alcanza el tiempo. El inicio conserva una sola acción primaria; el selector no genera tarjetas o estadísticas adicionales.
