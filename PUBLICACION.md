# Publicación de English OS y Português OS

Autorizada por el usuario el 15/10/2026 mediante «publicar».

- [English OS](https://alejo02025.github.io/plataforma-ingles-uso-personal/)
- [Português OS](https://alejo02025.github.io/plataforma-ingles-uso-personal/portugues/)

Commit que publicó los archivos: `487265b93becf204fb761b4e80844f535e5ce80d`.
Versión: `2026-10-15T12:24:08.581Z`. Origen pedagógico/funcional: `5e75ba2`; se incorporaron las dos actualizaciones automáticas RSS de main antes de publicar.

GitHub Pages informó `built`. Los dos HTML públicos, 34 recursos referenciados y el service worker coinciden con la entrega verificada. Las descargas HTTPS conservaron la validación de certificados. [Registro](artifacts/audit/deployment.json).

Validación funcional previa: 102 pruebas unitarias, 66 recorridos Chromium, un recorrido Node y compilaciones EN/PT/Node aprobadas. El navegador público de este entorno encontró un error de confianza del certificado de su proxy; no se presenta ese intento como recorrido funcional aprobado. El detalle está en [RESULTADOS_QA.md](RESULTADOS_QA.md).

En una instalación ya abierta, usar **Update app / Atualizar aplicativo**. La actualización cambia los archivos de la aplicación; conserva IndexedDB, PDFs, respuestas, borradores y preferencias de los dos espacios. Los casos automatizados verifican esa conservación; el borrado externo del almacenamiento del navegador sigue fuera de esta garantía.
