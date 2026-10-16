# Corrección del estudio de gramática — 16 de octubre de 2026

## Fallos reproducidos

- El constructor pt-BR producía `Eu pagei`, `Eu chegei`, `Eu começei` y `Eu praticei`. Ahora conserva los cambios ortográficos de la primera persona del pretérito: `paguei`, `cheguei`, `comecei`, `pratiquei`. Las demás personas conservan sus terminaciones.
- El imperfecto de `construir` perdía las tildes: ahora `construía`, `construíamos`, `construíam`.
- `odiar` requería formas propias: `odeio`, `odeia`, `odeiam`, `odeie`, `odeiem`, frente a `odiamos` y `odiemos`.
- Algunas fórmulas no describían el ejemplo que aparecía al lado: el infinitivo impersonal portugués caía en la explicación del gerundio compuesto; el infinitivo compuesto situaba la negación en el lugar equivocado; el subjuntivo imperfecto se confundía con una forma compuesta.
- En inglés la estructura no seleccionaba el auxiliar del sujeto ni distinguía adecuadamente `let's not`, los pedidos interrogativos y las distintas formas del ejemplo con gerundio. Ahora utiliza el sujeto efectivo, también al entrar en imperativo.
- El generador del sitio portugués traducía textos de apoyo marcados `lang="es"`, los hijos de `StudyCopy` y propiedades `spanish`. Ahora protege estos textos y continúa traduciendo los controles nativos. Se prueba ejecutando el localizador real sobre una fuente JSX temporal.

## Presentación

El resultado identifica el tiempo y tipo de oración seleccionados. La fórmula aparece en el idioma estudiado con un apoyo español construido exclusivamente a partir del vocabulario controlado de esa fórmula. Los ejemplos de la guía se marcan `translate="no"` para evitar que una traducción automática del navegador altere los modelos; esto no impide las traducciones españolas propias de la aplicación.

Se conserva la clave existente `foundation-builder:v1`, las selecciones y los borradores. No se cambia el esquema de SQL, no se modifica el progreso de curso y no se mezclan idiomas.

## Verificación

- TypeScript aprobado y 127 pruebas unitarias aprobadas, sin omisiones, incluyendo las regresiones nuevas de conjugación, fórmulas y localización.
- Pruebas Playwright añadidas para ambos idiomas: oración, traducción, auxiliar, fórmula, comparación de formas, recarga y selección persistente, apoyo español intacto y ausencia de desbordamiento a 375, 390 y 1440 px.
- Compilación estática de ambos idiomas y compilación de la edición de servidor realizadas.
- Capturas del estado anterior y de los recorridos corregidos: `artifacts/grammar-fix/`.

Los resultados finales de la regresión completa y la publicación se registran en el pull request. Estos casos no equivalen a una revisión semántica exhaustiva de todas las combinaciones del catálogo.
