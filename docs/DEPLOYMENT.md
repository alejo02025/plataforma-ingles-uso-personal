# GitHub Pages y sincronización privada

Sitio: https://alejo02025.github.io/plataforma-ingles-uso-personal/

## Publicación desde este repositorio

Con Node 24 y las dependencias instaladas:

```sh
npm ci
npm run publish:pages
npm run test:pages
```

`build:pages` crea un proyecto temporal ignorado en `.pages-project`, elimina las rutas que requieren un servidor de esa copia y exporta la interfaz con el prefijo del repositorio. No altera los datos locales ni la versión de servidor. SQLite WebAssembly, el worker de PDF.js, el modelo SmolLM2 y el motor local Wllama se sirven desde GitHub Pages, sin CDN. `publish:pages` copia únicamente la exportación a la raíz y registra sus archivos en `.pages-files.json` para actualizarla sin borrar archivos fuente.

Subí los cambios a `main`. GitHub Pages debe estar configurado con **Deploy from a branch → main → / (root)**. `.nojekyll` permite servir `_next`. Si la configuración actual apunta a otra rama/carpeta o usa Actions, cambiala una sola vez en **Settings → Pages**; hacer push no modifica esa opción del repositorio. No hace falta un proveedor adicional, DNS propio ni una computadora encendida.

## Sincronización

1. Creá en GitHub un repositorio separado llamado `english-os-datos`, **privado**. Puede estar vacío.
2. En Settings → Developer settings → Personal access tokens → Fine-grained tokens, creá una autorización con vencimiento, **Only select repositories**, seleccionando únicamente ese repositorio, **Contents: Read and write**. No incluyas el repositorio público de la app.
3. En **Preferences → Your devices · GitHub** de English OS, ingresá `usuario/english-os-datos` y la autorización. Repetí en tu otro dispositivo usando el mismo repositorio privado.

El token se usa directamente desde el navegador hacia la API oficial de GitHub y permanece en memoria. Nunca se guarda en IndexedDB, localStorage, la exportación, Git o el historial personal. Al recargar, volver a autorizar es necesario. Sin autorización o conexión, los cambios quedan en IndexedDB; reconectar los combina con GitHub. La app comprueba que el repositorio sea privado antes de subir datos. No es un sistema multiusuario.

`english-os/state.json` contiene las tablas y marcas de cambios por campo; los PDF originales van a `english-os/files/`. Las actualizaciones usan el SHA de GitHub para detectar escrituras concurrentes y vuelven a leer antes de reintentar. Las colecciones combinan registros; campos conflictivos usan una marca de tiempo y un identificador de dispositivo para decidir de forma determinista. Finalizaciones no vuelven a abrirse. Dos resultados offline de una misma actividad se conservan como intentos independientes. El código público y Pages no contienen estos datos.

Los límites de GitHub aplican: no se usa la API como almacenamiento de alto tráfico. La sincronización consulta cada 20 segundos mientras la pestaña está abierta y autorizada, y después de modificaciones. Archivos de hasta 10 MB por PDF y 20 MB por archivo sincronizado. El historial privado también queda en los commits del repositorio de datos; borrarlo de la última versión no borra versiones previas. Conservá copias descargadas si querés una copia independiente.

## Límites de esta edición

- GitHub Pages ejecuta únicamente contenido estático. Las funciones de estudio se ejecutan en el navegador; no hay API Node o SQLite de servidor.
- PDF Studio extrae texto y genera preguntas con fuentes en el navegador. La IA local opcional conversa usando pasajes relevantes del PDF; no llama a proveedores de inferencia ni certifica respuestas o nivel. Los escritos con corrección de la API del servidor siguen siendo exclusivos de la edición local con servidor.
- La IA local descarga aproximadamente 110–120 MB; puede consumir mucha memoria o ser lenta en algunos dispositivos. Las pruebas ejercitan inferencia real en Chromium y vistas móviles, pero no verifican rendimiento en un iPhone físico. No hay service worker: cargar la app requiere conexión; el modelo se conserva en IndexedDB mientras el navegador no elimine su almacenamiento.
- La voz depende del navegador. PDF escaneados necesitan OCR no incluido.
- Si borrás el almacenamiento del navegador antes de sincronizar, perdés los cambios locales. La navegación privada puede borrar datos al cerrar.
- La sincronización automática necesita autorización. GitHub Pages por sí solo no permite iniciar sesión y escribir datos privados sin ella. No hay sincronización en segundo plano con la pestaña cerrada.
- Las pruebas de integración simulan únicamente la API de GitHub para verificar concurrencia, privacidad y dos dispositivos. La conexión a un repositorio privado real requiere tu autorización en la app; no se afirma haberla probado sin ella.

La edición local con servidor sigue disponible con `npm run dev`, sus archivos SQLite y sus funciones IA opcionales.

## Modelo local y nuevas versiones

`public/local-ai/model.json` registra los SHA-256 del modelo y sus tres partes. Los pesos SmolLM2-135M-Instruct Q4_1 proceden del paquete Apache-2.0 `llm-smollm2` 0.1.2 de Simon Willison, verificado contra los metadatos de PyPI. Cada parte queda debajo del límite por archivo de GitHub. El navegador comprueba tamaños y hashes antes de cargar los pesos. Las licencias y atribuciones acompañan los archivos. `npm ci` instala las versiones fijadas de Wllama y el motor compatible; no necesita descargar pesos de otro sitio para construir la app. El modelo cacheado no se incluye en los respaldos personales ni se vuelve a subir al repositorio de sincronización.

Las preguntas de práctica son deterministas y se verifican contra el pasaje. El chat muestra referencias a páginas y secciones. Las preguntas sobre hechos concretos muestran una cita del texto y un seguimiento de la IA. Si una respuesta del modelo introduce nombres ajenos al pasaje, la app vuelve a una cita del texto en modo **Reading guide**; este filtro no garantiza exactitud de todas las respuestas. No se puntúan automáticamente las respuestas abiertas.

Cada `build:pages` escribe un identificador nuevo en la app y en `assets/version.json`. La comprobación evita caché y muestra el aviso con **Update** si son distintos. La recarga espera el guardado local y conserva IndexedDB. La versión anterior, sin esta función, requiere una recarga manual inicial. El aviso no publica código: aparece después de que GitHub Pages despliega un cambio.

Las migraciones agregan tablas de secciones, mensajes e intentos sin borrar registros previos. Los respaldos anteriores se admiten con estas tablas vacías. La traducción cambia solamente etiquetas conocidas; conserva textos personalizados, respuestas e historial.

## Pestañas y papelera de PDFs

Cada documento importado tiene una pestaña identificada por su ID. Subir otro no reemplaza los anteriores. El archivo seleccionado, el modo de lectura/práctica/chat y los borradores se recuerdan en ese navegador. La posición de lectura, respuestas enviadas y conversaciones se guardan en la base y se sincronizan con GitHub al autorizar la app. La fila de pestañas se desplaza horizontalmente en celulares; el botón para agregar permanece visible.

La **×** mueve un documento a **Trash**, sin borrar el PDF original, sus referencias, vocabulario, historial o respuestas. **Restore** o **Undo** lo recuperan. El estado se registra en el campo `documents.source` con el prefijo `trash:`, conservando la fuente original para restaurarla. La sincronización combina ese campo con sus marcas existentes: un dispositivo atrasado no hace reaparecer un PDF quitado, y una restauración posterior puede recuperarlo. Los respaldos incluyen también la papelera y sus archivos. No se ofrece borrado permanente en esta versión.

## Ícono de la pantalla de inicio

La metadata apunta a PNG de 180 píxeles para iOS y a un manifiesto con PNG de 192 y 512 píxeles para Android, incluido un ícono apto para recorte. El logo es una versión del mismo símbolo de la interfaz: una `e` y una flecha sobre verde. Todos los archivos se sirven desde `assets/app/` en este sitio. El manifiesto usa el prefijo del repositorio en `id`, `scope` y `start_url` y el nombre **English OS**. La edición local usa la raíz del servidor.

Los accesos ya agregados pueden conservar un ícono antiguo. Agregá de nuevo el sitio desde el navegador después de actualizarlo y conservá el acceso anterior hasta comprobar o respaldar tu progreso: algunos navegadores aíslan el almacenamiento de los accesos instalados. El manifiesto no agrega caché offline ni sincronización con la app cerrada.

## Portugués brasileño para Jazmín

`build:pages` compila dos exportaciones a partir de los mismos componentes: inglés en la raíz y portugués en `portugues/`. La copia temporal `.pages-pt-project` aplica el catálogo revisado `src/locales/pt-BR/ui.json` a textos de interfaz, preservando nombres de tablas, claves del contrato y códigos del teclado. Usa el currículo y vocabulario propios de `src/locales/pt-BR/`. Cambios en los componentes se comparten; nuevas frases de interfaz deben agregarse al catálogo. Nunca se modifican archivos fuente durante la localización.

`NEXT_PUBLIC_STUDY_LANGUAGE` identifica el espacio compilado. `workspace.ts` determina nombre inicial, marca, prefijos y almacenamiento. Se conserva el nombre antiguo de IndexedDB y las claves de inglés para no perder datos existentes; portugués usa otra base y un prefijo de localStorage. Los manifiestos personales incluyen `workspace: en/pt`. Respaldos antiguos sin marcador se consideran de inglés. La restauración rechaza un espacio diferente antes de cambiar datos. La sincronización usa carpetas diferentes y conserva la exigencia de repositorio privado.

Las dos exportaciones usan los assets de SQL.js, PDF.js y el modelo desde la raíz pública. Los pesos se publican una sola vez; el modelo queda cacheado en el almacenamiento de cada espacio. Ambos usan el mismo identificador de versión, servido desde la raíz. El manifiesto y alcance de instalación del portugués apuntan a `/plataforma-ingles-uso-personal/portugues/`, con nombre e ícono propios.

La IA local actual se entrenó principalmente en inglés: se le pide portugués brasileño y, cuando devuelve inglés o introduce nombres no respaldados, la app muestra una cita con una pregunta de lectura en portugués. No se promete la calidad de un modelo grande o un tutor humano. Las pruebas usan inferencia real para verificar este recorrido; simulan explícitamente GitHub para verificar que las dos carpetas privadas permanezcan independientes.

La edición con servidor local sigue siendo de inglés; su selector de portugués enlaza a la edición publicada en GitHub Pages.

## Actualizar ambos espacios

El botón de actualización guarda los datos pendientes y publica un aviso común en el almacenamiento del mismo navegador. Los enlaces entre Alejo y Jazmín llevan la actualización y una marca de apertura para evitar reutilizar HTML antiguo de la caché. Una pestaña del otro espacio aplica el aviso cuando vuelve a estar visible; espera si hay un diálogo, un campo en edición, una actividad abierta o IA trabajando. Una URL explícita de actualización no vuelve a ejecutar un aviso antiguo guardado. Los datos de estudio continúan separados. El aviso local no se transmite a otros dispositivos ni a almacenamientos aislados de accesos instalados; sus enlaces versionados y el control de versión publicado siguen disponibles.
