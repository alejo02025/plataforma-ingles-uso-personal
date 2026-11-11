# lingua · revisión del 17 de octubre de 2026

## Alcance y decisiones

Se conserva una aplicación React/Next compartida con cinco destinos: Hoy, Aprender, Practicar, Materiales y Progreso. Cada idioma genera su ruta de GitHub Pages desde el mismo código y mantiene currículo propio. El registro `src/locales/languages.ts` centraliza nombres, rutas, locale, objetivo y almacenamiento durable. Agregar un idioma requiere autorar contenido y soporte pedagógico: no se presenta una traducción como currículo nuevo.

El sistema visual compartido utiliza fondo de papel, superficies claras, tipografía Inter local, verde para inglés y ciruela para portugués, con tema oscuro equivalente. Se retiran las manchas animadas decorativas. En móvil se prioriza la acción diaria antes de explicaciones extendidas. Materiales, ejercicios y progreso conservan las herramientas útiles existentes.

## Revisión por sección

| Sección    | Verificación y resultado de implementación                                                                                                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hoy        | La agenda existente usa trabajo pendiente, errores recientes, repasos y requisitos del curso. Se conserva la sesión finita y su cierre real. Se distinguen objetivo de aprendizaje y nivel demostrado. Se refina la jerarquía del próximo paso, retomar y tareas siguientes.                                                                                             |
| Aprender   | Se mantienen 131 lecciones por idioma y formación de oraciones afirmativas, negativas e interrogativas, tiempos, pronombres, auxiliares, conectores y apoyo en español. Los recorridos no son copias lingüísticas entre sí. Se conservan los checkpoints históricos y controles de evidencia.                                                                            |
| Practicar  | Ejercicios con corrección verificable, vocabulario contextualizado y repaso espaciado. Se mantienen lectura, escritura guardada, escucha y grabación. Se agregan guías de sonidos independientes: énfasis, vocales y -ed en inglés; nasalidad, lh/nh, contracciones y variación brasileña en portugués. No hay notas automáticas ficticias de escritura o pronunciación. |
| Materiales | PDFs y textos se procesan localmente. La interfaz mantiene pestañas, posiciones, borradores y papelera de cada documento. El respaldo completo incluye originales y grabaciones. La IA opcional de lectura sigue siendo local y sus respuestas pueden ser incorrectas.                                                                                                   |
| Progreso   | Se mantienen actividades registradas, resultados objetivos, errores, calendario y evidencia por habilidad. Autovalorar vocabulario, completar una sesión o guardar producción no equivale a demostrar dominio general.                                                                                                                                                   |
| Ajustes    | Se elimina la conexión de datos con GitHub y sus tokens. Se corrige la lista de intereses de portugués y se incorpora exportación/restauración local con confirmación. La documentación explica ausencia de sincronización y límites del navegador.                                                                                                                      |

## Privacidad y conservación

No se cambian los nombres históricos de IndexedDB ni prefijos de localStorage. No hay migraciones destructivas. Se elimina el código de red que sincronizaba documentos e historial con repositorios externos. La voz sintética solo utiliza voces marcadas como locales por el navegador; sin ellas se ofrece la transcripción. Las grabaciones se guardan con MediaRecorder en el dispositivo.

El respaldo `lingua-local-backup` incluye registros, PDFs y audio, separados por idioma. La restauración valida estructura, versión, idioma, perfil, JSON, claves de archivos, columnas y relaciones en una base temporal. Requiere confirmación, descarga primero una copia del estado actual y guarda registros y adjuntos en la misma transacción. Un fallo de cuota/escritura revierte a la base durable anterior. Un respaldo de otro idioma se rechaza sin modificar datos.

## Validación

- Instalación de dependencias completada con Node 24.
- TypeScript sin errores.
- 131 pruebas unitarias sin fallos, incluida validación de respaldos.
- Tres pruebas de formato de respaldo también ejecutadas con el espacio de portugués.
- Compilación estática de inglés y portugués y compilación de la edición histórica de servidor verificadas localmente.
- La PR ejecuta la suite completa de 94 pruebas de navegador, más las pruebas de servidor. No se han desactivado suites para publicar; se actualizaron expectativas de navegación obsoletas y se sustituyeron los escenarios de sincronización retirada por restauración local, errores de guardado y rechazo entre idiomas.
- El resultado definitivo de CI y el commit publicado se registran en GitHub Actions y en la entrega final; este apartado no declara esos pasos aprobados antes de finalizar.

## Límites vigentes

Los recorridos históricos A2 de inglés y A1 de portugués se preservan para no reinterpretar avances. El objetivo B1→B2→C1 de inglés no se presenta como un nivel ya acreditado. El diagnóstico es orientativo y no certifica competencia ni reemplaza una evaluación humana de producción.

No hay sincronización entre dispositivos. El respaldo JSON no está cifrado y tiene límite de 100 MB; excluye borradores de ejercicios abiertos y pesos del modelo. El usuario debe conservarlo en un lugar privado. Limpiar datos, modo privado o políticas de espacio del navegador pueden hacer que el progreso deje de estar disponible. No hay OCR ni evaluación profesional automática de pronunciación/escritura. La voz disponible depende del sistema. Los navegadores y accesos instalados pueden aislar almacenamiento.
