# GitHub Pages y sincronización privada

Sitio: https://alejo02025.github.io/plataforma-ingles-uso-personal/

## Publicación desde este repositorio

Con Node 24 y las dependencias instaladas:

```sh
npm ci
npm run publish:pages
npm run test:pages
```

`build:pages` crea un proyecto temporal ignorado en `.pages-project`, elimina las rutas que requieren un servidor de esa copia y exporta la interfaz con el prefijo del repositorio. No altera los datos locales ni la versión de servidor. SQLite WebAssembly y el worker de PDF.js se sirven desde GitHub Pages, sin CDN. `publish:pages` copia únicamente la exportación a la raíz y registra sus archivos en `.pages-files.json` para actualizarla sin borrar archivos fuente.

Subí los cambios a `main`. GitHub Pages debe estar configurado con **Deploy from a branch → main → / (root)**. `.nojekyll` permite servir `_next`. Si la configuración actual apunta a otra rama/carpeta o usa Actions, cambiala una sola vez en **Settings → Pages**; hacer push no modifica esa opción del repositorio. No hace falta un proveedor adicional, DNS propio ni una computadora encendida.

## Sincronización

1. Creá en GitHub un repositorio separado llamado `english-os-datos`, **privado**. Puede estar vacío.
2. En Settings → Developer settings → Personal access tokens → Fine-grained tokens, creá una autorización con vencimiento, **Only select repositories**, seleccionando únicamente ese repositorio, **Contents: Read and write**. No incluyas el repositorio público de la app.
3. En Preferencias de English OS, ingresá `usuario/english-os-datos` y la autorización. Repetí en tu otro dispositivo usando el mismo repositorio privado.

El token se usa directamente desde el navegador hacia la API oficial de GitHub y permanece en memoria. Nunca se guarda en IndexedDB, localStorage, la exportación, Git o el historial personal. Al recargar, volver a autorizar es necesario. Sin autorización o conexión, los cambios quedan en IndexedDB; reconectar los combina con GitHub. La app comprueba que el repositorio sea privado antes de subir datos. No es un sistema multiusuario.

`english-os/state.json` contiene las tablas y marcas de cambios por campo; los PDF originales van a `english-os/files/`. Las actualizaciones usan el SHA de GitHub para detectar escrituras concurrentes y vuelven a leer antes de reintentar. Las colecciones combinan registros; campos conflictivos usan una marca de tiempo y un identificador de dispositivo para decidir de forma determinista. Finalizaciones no vuelven a abrirse. Dos resultados offline de una misma actividad se conservan como intentos independientes. El código público y Pages no contienen estos datos.

Los límites de GitHub aplican: no se usa la API como almacenamiento de alto tráfico. La sincronización consulta cada 20 segundos mientras la pestaña está abierta y autorizada, y después de modificaciones. Archivos de hasta 10 MB por PDF y 20 MB por archivo sincronizado. El historial privado también queda en los commits del repositorio de datos; borrarlo de la última versión no borra versiones previas. Conservá copias descargadas si querés una copia independiente.

## Límites de esta edición

- GitHub Pages ejecuta únicamente contenido estático. Las funciones de estudio se ejecutan en el navegador; no hay API Node o SQLite de servidor.
- Sin correcciones IA, consultas a proveedores de IA ni preguntas generadas automáticamente para PDF. Lecturas editoriales, diagnóstico, ejercicios, escritos, PDF, vocabulario, calendario y progreso funcionan localmente.
- La voz depende del navegador. PDF escaneados necesitan OCR no incluido.
- Si borrás el almacenamiento del navegador antes de sincronizar, perdés los cambios locales. La navegación privada puede borrar datos al cerrar.
- La sincronización automática necesita autorización. GitHub Pages por sí solo no permite iniciar sesión y escribir datos privados sin ella. No hay sincronización en segundo plano con la pestaña cerrada.
- Las pruebas de integración simulan únicamente la API de GitHub para verificar concurrencia, privacidad y dos dispositivos. La conexión a un repositorio privado real requiere tu autorización en la app; no se afirma haberla probado sin ella.

La edición local con servidor sigue disponible con `npm run dev`, sus archivos SQLite y sus funciones IA opcionales.
