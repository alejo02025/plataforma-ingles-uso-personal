# Publicación y privacidad de lingua

## Destino

GitHub Pages publica la raíz de `main` con `.nojekyll`. `npm run build:pages` produce `out/` y `node scripts/publish-pages.mjs` copia únicamente archivos generados permitidos. No toca IndexedDB ni datos personales del navegador.

La aplicación unificada comparte componentes React, sistema visual, contratos y versión. Genera inglés en `/plataforma-ingles-uso-personal/` y portugués brasileño en `/plataforma-ingles-uso-personal/portugues/`. La localización se aplica a copias temporales y conserva las ayudas didácticas en español. Los currículos, modelos lingüísticos y ejemplos son propios de cada idioma. Para incorporar otro idioma se requiere autorar su contenido y registrar su build; no alcanza con traducir etiquetas.

## Validación y publicación

1. `npm ci` con Node 24.
2. `npm run typecheck` y `npm test`.
3. `npm run build:pages` y `npm run test:pages`.
4. `npm run build` y `npm run test:e2e` también verifican la edición histórica de servidor, que no se publica en Pages.
5. Integrar la PR solo con validación satisfactoria. El workflow de main vuelve a validar, genera los dos idiomas y solicita un build de Pages.
6. Comparar versión pública y recursos con el commit generado. Un push por sí solo no demuestra publicación.

## Datos locales

Se mantienen `english-os-private-v1` y `portuguese-os-private-v1` en IndexedDB. Inglés conserva sus claves históricas de localStorage; portugués usa el prefijo `portuguese:`. El selector no borra ni migra esos datos. No hay cuentas ni envío de documentos, respuestas, historial o grabaciones a APIs externas. La sincronización de datos con GitHub fue retirada.

Los recursos públicos de la aplicación se descargan desde el mismo sitio. Las noticias son un archivo público generado por el workflow de RSS, sin datos del estudiante. La IA opcional de PDFs funciona dentro del navegador con pesos del mismo sitio; sus respuestas pueden equivocarse. Audio usa MediaRecorder local y reproducción con voces instaladas identificadas por `localService`. No se evalúa pronunciación ni se otorgan notas automáticas de calidad de escritura.

## Respaldos

Settings / Ajustes ofrece exportar y restaurar el formato `lingua-local-backup`, versión 1, por idioma. Incluye manifiesto de historial, PDFs y audio; excluye borradores de ejercicios abiertos y pesos del modelo. El límite total del archivo es 100 MB y los JSON no están cifrados. El botón histórico adicional solo exporta registros y no es una copia completa restaurable.

Restaurar primero valida estructura, marcador de idioma, archivos, columnas y relaciones en una base temporal. Pide confirmación explícita y descarga una copia actual antes de reemplazar. Los archivos y registros se guardan atómicamente en IndexedDB; si falla la cuota o escritura, se conserva la última base durable también en memoria. Los datos del otro idioma quedan intactos. No hay sincronización automática: mover una copia a otro dispositivo es manual.

El navegador puede borrar datos por limpieza, modo privado o presión de espacio. Un acceso instalado puede tener almacenamiento aislado. Conservá la copia y comprobá el archivo descargado antes de cerrar o cambiar de dispositivo.

## Materiales

Los PDFs con texto seleccionable se procesan localmente. No hay OCR. Papelera y restauración de documentos conservan sus referencias e historial; importar un segundo PDF no reemplaza el anterior. Los límites propios del importador siguen vigentes.

## Actualizaciones

Los dos idiomas comparten identificador de versión y recursos públicos de SQL/PDF/modelo. El service worker actualiza recursos, no bases personales. La actualización espera mientras hay trabajo abierto y conserva el respaldo separado del código publicado. Si una pestaña permanece en una versión previa, usar el control de actualización de Ajustes o volver a abrir el sitio; no limpiar los datos de navegación para actualizar.
