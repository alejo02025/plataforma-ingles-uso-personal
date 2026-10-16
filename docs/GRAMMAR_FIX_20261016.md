# Corrección del estudio de gramática — 16 de octubre de 2026

## Fallos reproducidos

- El constructor pt-BR producía `Eu pagei`, `Eu chegei`, `Eu começei` y `Eu praticei`. Ahora conserva los cambios ortográficos de la primera persona del pretérito: `paguei`, `cheguei`, `comecei`, `pratiquei`. Las demás personas conservan sus terminaciones.
- El imperfecto de `construir` perdía las tildes: ahora `construía`, `construíamos`, `construíam`.
- `odiar` requería formas propias: `odeio`, `odeia`, `odeiam`, `odeie`, `odeiem`, frente a `odiamos` y `odiemos`.
- Algunas fórmulas no describían el ejemplo que aparecía al lado: el infinitivo impersonal portugués caía en la explicación del gerundio compuesto; el infinitivo compuesto situaba la negación en el lugar equivocado; las formas compuestas no identificaban el auxiliar y el participio de su modelo.
- En inglés la estructura no seleccionaba el auxiliar del sujeto ni distinguía adecuadamente `let's not`, los pedidos interrogativos y las distintas formas del ejemplo con gerundio. Ahora utiliza el sujeto efectivo, también al entrar en imperativo.

## Protección preventiva de la localización

El generador no distinguía el apoyo español de los controles traducibles. Ahora protege `lang="es"`, los hijos de `StudyCopy` y propiedades `spanish`, mientras continúa traduciendo los controles nativos. Una fuente JSX temporal demuestra que un texto con una entrada en el diccionario se conserva dentro del apoyo español y se traduce dentro de un control nativo. Las etiquetas españolas de tiempo y tipo de oración inspeccionadas en la publicación anterior ya estaban correctas; no se atribuye a esta protección una corrección visible de esas etiquetas.

## Presentación

El resultado identifica el tiempo y tipo de oración seleccionados. La fórmula aparece en el idioma estudiado con un apoyo español construido exclusivamente a partir del vocabulario controlado de esa fórmula. Los ejemplos de la guía se marcan `translate="no"` para evitar que una traducción automática del navegador altere los modelos; esto no impide las traducciones españolas propias de la aplicación.

Se conserva la clave existente `foundation-builder:v1`, las selecciones y los borradores. No se cambia el esquema de SQL, no se modifica el progreso de curso y no se mezclan idiomas.

## Verificación

- TypeScript aprobado y 127 pruebas unitarias aprobadas, sin omisiones, incluyendo las regresiones nuevas de conjugación, fórmulas y localización.
- Regresión Playwright local completa: 93/93 pruebas estáticas aprobadas y 1/1 recorrido autenticado de servidor aprobado, sin omisiones. Pruebas añadidas para ambos idiomas: oración, traducción, auxiliar, fórmula, comparación de formas, recarga y selección persistente, apoyo español intacto y ausencia de desbordamiento a 375, 390 y 1440 px.
- Compilación estática de ambos idiomas y compilación de la edición de servidor realizadas.
- Capturas del estado anterior y de los recorridos corregidos: `artifacts/grammar-fix/`.

## Publicación comprobada

El PR #20 quedó integrado en `de47782`. La validación del PR (run `38981575217`) y la validación/publicación de main (run `38982252783`) finalizaron con éxito. La exportación generada es `3101327`, con versión pública **2026-10-16T23:46:24.747Z**.

Se ejecutaron recorridos sobre los HTML y recursos públicos originales de ambos idiomas: `Eu paguei a conta`, `Eu não paguei a conta`, `Nós construíamos uma casa?`, preguntas con `has` y el imperativo negativo `let's not`. Se comprobó la selección después de recargar y el ancho a 375, 390 y 1440 px, sin errores de consola ni desbordamientos. Los 133 recursos precargados y ambos puntos de entrada coinciden byte a byte/SHA256 con la exportación de main; la versión y el service worker corresponden a la misma publicación.

Las pruebas públicas usan perfiles descartables de Chromium y recursos originales obtenidos mediante fetch con TLS verificado. No acceden a los datos reales del navegador de los estudiantes. Los service workers públicos se bloquearon en estos recorridos; el uso offline y las actualizaciones se comprobaron por separado en Playwright local. Estos casos no equivalen a una revisión semántica exhaustiva de todas las combinaciones del catálogo.

Evidencia reproducible: `artifacts/grammar-fix/release-verification.json`, `public-verification.json`, `public-assets.json`, capturas anteriores/posteriores y logs de pruebas.
