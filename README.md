# English OS

Una plataforma personal para leer, practicar y construir evidencia de tu progreso en inglés. Interfaz en inglés, contenido adulto y datos persistentes. Primera fase funcional sobre Next.js, TypeScript y SQLite.

## Usar desde celular y notebook, sin PowerShell

Abrí [English OS en GitHub Pages](https://alejo02025.github.io/plataforma-ingles-uso-personal/). La edición web funciona sin un servidor en tu computadora. Guarda los datos en el navegador y permite sincronizarlos automáticamente entre dispositivos con un segundo repositorio **privado** de GitHub. No usa otras plataformas ni requiere un plan de alojamiento pago.

En **Preferences → Your devices · GitHub** hay instrucciones para crear el repositorio privado y un token detallado limitado a ese repositorio con **Contents: Read and write**. Ingresá el token en la app, nunca en el chat ni en el código. Se conserva únicamente en memoria: recargar o cerrar la pestaña requiere volver a autorizar. Los cambios locales quedan guardados y se combinan al reconectar. La sincronización opera con la pestaña abierta y autorizada, cada 20 segundos y después de cambios, dentro de los límites de la API de GitHub.

El repositorio público contiene el código y el sitio generado; tu historial y PDF se envían únicamente al repositorio privado. Incluye PDF Studio con lectura, preguntas con referencias y conversación con IA local opcional, ejecutada en el dispositivo. Los datos de la instalación anterior en Windows no se transfieren solos. [Detalles de publicación y límites](docs/DEPLOYMENT.md).

## Dos espacios de estudio

La página principal permite elegir **Alejo · English** o **Jazmín · Português · Brasil**. [El espacio de Jazmín](https://alejo02025.github.io/plataforma-ingles-uso-personal/portugues/) tiene la misma experiencia de PDFs, preguntas, conversación local, palabras del día, vocabulario, calendario y gráfico de constancia, con interfaz y contenido original en portugués brasileño. Incluye seis lecturas, nueve preguntas de evaluación inicial, ejercicios de gramática y 56 palabras y expresiones con ejemplos cotidianos. La voz solicita `pt-BR` al navegador.

Los datos de cada espacio se guardan por separado. Los respaldos llevan un identificador de idioma y no permiten combinar los dos historiales. Si se conecta GitHub, el inglés usa `english-os/` y el portugués `portuguese-os/`, incluso dentro de un mismo repositorio privado. Cada espacio necesita su autorización en memoria; cambiar de espacio recarga la página y requiere volver a conectar para sincronizar. El estudio local sigue disponible sin esa autorización.

Ambos espacios tienen su propio ícono y enlace para la pantalla de inicio. El modelo local es pequeño y su calidad en portugués es limitada: las preguntas de hechos muestran citas del documento y las respuestas en inglés vuelven al modo guiado en portugués. No hay evaluación automática de respuestas abiertas ni llamadas a una API de IA.

## Recorrido conectado por idioma

Alejo comienza en **A2** y Jazmín en **A1**. **Classes / Aulas** y la entrada **MCER** de portugués abren el mismo recorrido. Los demás niveles están bloqueados; pueden verse sus requisitos, pero no abrir ni guardar una clase futura desde la interfaz ni la API. Preferencias y diagnóstico no cambian el punto de partida elegido.

Cada idioma tiene **131 clases originales**: presentación, hábitos, verbos y oraciones en presente/pasado/futuro, experiencias, narración, condiciones, consejos, relativas, argumentos, discurso indirecto, pasiva, concesión, registro, inferencias y síntesis. Son prácticas orientadas al MCER, no un curso validado que certifique por sí solo todas las competencias de A1–C2.

Para abrir la clase siguiente se requiere al menos **80 %** en la anterior. Cada bloque de hasta cuatro clases se conecta con evidencia registrada desde la primera clase aprobada de ese bloque: lectura del nivel con al menos **60 %** o una respuesta objetiva correcta sobre un PDF; tres palabras distintas recordadas o un juego con al menos **75 %** sin ayudas; escritura guardada de al menos 30 caracteres. La conversación oral con IA ya no forma parte de las clases ni de sus requisitos. Escribir o declarar práctica no demuestra calidad de escritura ni pronunciación; no se les inventa una nota. La siguiente etapa requiere todos los bloques del nivel. Las lecturas pendientes del último día planificado y las iniciadas anteriormente deben retomarse antes de abrir una clase nueva. Una clase ya aprobada sigue disponible para repaso.

Los requisitos muestran el porqué en español y enlazan con la tarea. La escritura complementaria también está disponible si el plan diario es de cinco minutos. Los espacios mantienen sus evidencias separadas y se sincronizan mediante el respaldo privado de cada idioma. Las prácticas iniciales MCER antiguas y sus respuestas se conservan, pero sus cuatro tareas ya no permiten saltar un nivel del recorrido completo.

Los hitos completados se guardan en `course_checkpoints` mediante una migración adicional que no elimina datos. Un dispositivo atrasado no los borra al combinar respaldos, y ampliar el catálogo no vuelve a bloquear un nivel que ya quedó completado. Las palabras y los PDF pueden retirarse sin borrar los resultados históricos; los requisitos de lectura también reconocen material archivado.

## Audio y conversación oral

La charla oral con IA se retiró de la interfaz. Los mensajes y borradores anteriores permanecen en el almacenamiento y las copias para no perder historial. El módulo disponible usa reconocimiento de voz del navegador para transcribir, y el modelo local es de texto; no proporciona una evaluación fiable del audio o la pronunciación. No se presenta esa transcripción como una corrección de audio. Se conserva la reproducción de ejemplos y palabras con las voces del dispositivo.

## Clases guiadas

Cada clase incluye explicación en español, ejemplos en el idioma estudiado, audio del dispositivo, un detalle útil, comprobaciones objetivas y práctica personal. Los resultados, correcciones, borradores y tiempo se conservan al volver a intentar. Las pestañas **Verbs / Verbos** y **Sentences / Frases** agregan referencias de conjugación y un constructor de modelos; consultar una referencia no aprueba la clase vinculada ni salta requisitos.

Tocar una palabra de un texto abre una nube con significado, explicación y uso en español, un modelo en inglés/portugués y opción de guardar. El selector **Word help / Ajuda com palavras → Pick a word from the page** permite inspeccionar una palabra de una respuesta sin seleccionar esa respuesta. Las entradas revisadas tienen prioridad; el diccionario local FreeDict amplía la cobertura. Las equivalencias indirectas de portugués están identificadas y las palabras desconocidas admiten una nota propia, sin traducción inventada. Los datos derivados FreeDict y sus fuentes originales se distribuyen con GPL-2.0-or-later y avisos en `external-data/freedict` y `public/assets/word-help`.

Las clases aplican objetivos orientados al MCER, ejemplos explicados, práctica de recuperación y repaso espaciado. El apartado **How these classes are designed / Como estas aulas são preparadas** incluye referencias al Consejo de Europa, Roediger y Karpicke (2006) y Cepeda et al. (2006). El respaldo de esos métodos no implica que estas clases sean un curso completo validado, una certificación MCER o una docente con credenciales reales.

## Juegos y repaso

**Games / Jogos** tiene tres juegos gratis: **Meaning Match**, **Sentence Shuffle** y **Word Trail**. Cada idioma usa su propio vocabulario y ejemplos. El primer desafío de cada tipo se mantiene estable durante el día; después de guardar su resultado, se puede jugar una ronda nueva. El botón **Save game result** registra la puntuación y el tiempo de juego visible en el historial y en el gráfico de progreso. Las partidas sin guardar no cuentan como progreso completado. El borrador conserva selecciones, rondas, intentos, pistas y tiempo al salir, actualizar o recargar; **Resume game / Retomar jogo** permite continuar en el mismo dispositivo. Cada idioma tiene borradores separados. Guardar el resultado final elimina solamente ese borrador, sin borrar resultados anteriores. Cada juego ofrece **How to play**, una pista opcional y ejemplos cotidianos al terminar. Las partidas con pistas quedan identificadas en el historial. La puntuación compara las respuestas con el contenido del juego, sin IA ni una evaluación de nivel. No se altera el calendario de repetición espaciada por jugar.

**Vocabulary / Vocabulário** permite filtrar las palabras por memoria declarada: nuevas o falladas, recordadas recientemente y tres revisiones consecutivas recordadas. El inicio ofrece accesos directos y una idea diaria plegable; el historial de juegos también se puede abrir cuando se necesite. La barra inferior de celular conecta inicio, lectura, juegos, repaso y progreso; la notebook conserva el menú lateral. No hay anuncios, bloqueos de pago ni suscripciones.

## Estudiar en la edición web

- **PDF Studio**: cada PDF queda en una pestaña de **Your bookshelf**. **Add PDF** agrega uno o varios sin reemplazar los anteriores, incluso mientras el tutor responde. Cada documento conserva su lectura, sus respuestas, su conversación y los borradores de ese navegador. La **×** lo mueve a **Trash**; **Undo** o **Restore** lo recupera con su historial. Las respuestas abiertas se guardan sin inventar una nota.
- **Enable local AI** descarga aproximadamente 110 MB la primera vez (hasta 120 MB en navegadores que necesitan el motor compatible). El modelo abierto SmolLM2 y su motor se sirven desde este mismo GitHub Pages y se guardan en el dispositivo; no se envían PDF o mensajes a una API de IA. Sin activarlo, hay un modo de lectura guiada que cita el texto original. Es un modelo pequeño: puede equivocarse o ser lento, especialmente en celulares.
- **Word of the Day / Palavra do dia** muestra el significado en español debajo de la palabra y luego la definición y los ejemplos en el idioma estudiado. Guardá palabras y expresiones en **Vocabulary**, que organiza categorías y ejemplos en **Everyday sentences**.
- **Practice momentum** es un gráfico interactivo de constancia de 0 a 100. Tocá un día para ver sus actividades, respuestas de PDF, palabras, repasos y conversaciones guardadas. Sube con práctica registrada y disminuye 8% en días completos sin actividad; el día actual sin terminar no se penaliza. No es una estimación de nivel de inglés.
- La interfaz adapta navegación y distribución al celular y la computadora. El saludo usa la hora local del dispositivo. Incluye el ícono verde de English OS para iPhone y Android, con un nombre corto y apertura en modo independiente desde la pantalla de inicio. Para actualizar un acceso antiguo, agregá de nuevo el sitio desde Safari o el navegador del celular; mantené el acceso anterior hasta comprobar tu progreso o sincronizarlo.
- La app busca nuevas versiones al abrirla, al volver a la pestaña y cada minuto. Cuando encuentra una, muestra **A new version of the app is available → Update**. La actualización conserva los datos del navegador; la autorización de sincronización vuelve a ingresarse porque permanece sólo en memoria.

Un repositorio público permite leer el código y proponer cambios, pero no otorga permiso de escritura a sus visitantes. Los cambios directos requieren permisos de propietario o colaborador en GitHub. La app no publica datos personales en este repositorio.

## Ejecutar

### Instalacion guiada en Windows

Descarga [install-windows.cmd](scripts/install-windows.cmd) y ejecutalo con doble clic. Instala Node.js 24.20.0 y Git mediante el catalogo oficial de `winget`, sin desactivar comprobaciones de firmas, checksums o TLS. Windows puede solicitar permiso para instalar esas herramientas. Si falta `winget`, muestra el enlace oficial de Microsoft para instalar **Instalador de aplicaciones**.

El proyecto se descarga en `%USERPROFILE%\EnglishOS\plataforma-ingles-uso-personal`. El script instala dependencias con `npm.cmd ci`, conserva la base de datos y arranca el servidor. Crea un archivo **English OS.cmd** en el escritorio cuando puede, sin reemplazar un archivo existente con ese nombre. Tambien deja **Abrir English OS.cmd** en la carpeta EnglishOS de tu usuario. Este archivo abre el navegador cuando la API responde con lecturas y un plan; el proceso del servidor debe permanecer abierto.

Si encuentra otra version de Node, una carpeta que no corresponde al proyecto o un puerto ocupado, se detiene y conserva el estado existente. El instalador no reinicia, borra ni actualiza un checkout existente, y no configura claves de IA. Un repositorio privado puede solicitar tu inicio de sesion en GitHub. Estos scripts fueron revisados y sus paquetes contrastados con el catalogo oficial; su ejecucion en Windows todavia necesita validarse en una maquina Windows.

### Instalacion manual

Requiere **Node.js 24** y npm. No necesita PostgreSQL, Docker ni una clave de IA para empezar.

```bash
cd /workspace/plataforma-ingles-uso-personal
npm ci
npm run db:migrate
npm run dev
```

En otra máquina, usá la carpeta donde clonaste el proyecto. El servidor usa el puerto 3000 por defecto. Para otro puerto: `npm run dev -- --port 3001`. `.nvmrc` especifica Node 24. La base también se inicializa automáticamente al acceder a la API. Las migraciones conservan tus datos y se ejecutan una sola vez.

Para ejecutar la compilación de producción:

```bash
npm run build
npm start
```

La primera visita permite empezar el diagnóstico. Cada respuesta se guarda; podés salir y retomarlo. También podés comenzar con las lecturas inmediatamente. El plan se guarda por día según el horario de Buenos Aires y se ajusta a tus intereses, precisión observada, errores en ejercicios y palabras vencidas. Preferencias permite elegir sesiones de 5, 20 o 40 minutos; el cambio de duración se aplica al siguiente plan.

## Qué funciona

- Dashboard con actividades, tiempo activo, continuidad y vocabulario pendiente, sin estadísticas ficticias.
- Diagnóstico retomable de nueve situaciones: reading, grammar y vocabulary. Línea de base por competencia; confianza baja, sin certificar MCER.
- Plan diario persistente y acceso a la última actividad pendiente, incluso de un día anterior.
- Seis lecturas originales A2–B2 sobre viajes, finanzas, historia, tecnología, trabajo y vida cotidiana. Preguntas corregidas con explicaciones; en GitHub Pages se evalúan en el navegador.
- Lector por fragmentos, posición y respuestas guardadas, selección de palabras y expresiones, glosario inicial y pronunciación con la voz disponible en el navegador.
- Importación de texto y PDF con texto seleccionable. Extracción real, fragmentación, descarga privada del original y resumen escrito. Sin clave de IA, el resumen se registra sin una nota de comprensión inventada.
- Vocabulario persistente, contexto de origen, pronunciación cuando está disponible, repasos espaciados e historial de recuerdo autorreportado.
- Escritura con borrador persistente y devoluciones IA estructuradas: gramática, vocabulario y sugerencias de naturalidad. Historial de correcciones y patrones. Sin IA, se conserva la práctica sin nota automática.
- Calendario interactivo, detalle diario, tiempo semanal/mensual, competencias, precisión en ejercicios y gráfico de actividades de los últimos 14 días.
- Modo claro/oscuro persistente y navegación responsive.
- Exportación JSON de los datos, acceso opcional mediante contraseña y cookie firmada HttpOnly, validación de origen para escrituras y archivos originales fuera del directorio público.

## Configuración

Usá variables del entorno o un archivo **`.env.local`** en la raíz, según [.env.example](.env.example). Nunca agregues claves a variables `NEXT_PUBLIC_*` ni a Git.

| Variable             | Uso                                                                               | Necesaria                            |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| `ENGLISH_AI_API_KEY` | Clave de API de OpenAI, usada solo en el servidor                                 | Para IA                              |
| `ENGLISH_AI_MODEL`   | Modelo con soporte de JSON; predeterminado `gpt-4.1-mini`                         | Opcional                             |
| `APP_ACCESS_TOKEN`   | Contraseña larga de acceso personal; requiere un valor real en el servidor        | Antes de exponer la app públicamente |
| `ENGLISH_DATA_DIR`   | Ruta absoluta del volumen persistente; predeterminado `data/` dentro del proyecto | En despliegues con disco efímero     |

Los comandos de arranque usan el soporte de proxy de Node 24. Mantienen verificación TLS y respetan las autoridades de confianza del entorno. Para la IA, la política de salida debe permitir **`api.openai.com`**. Las dependencias vienen de **`registry.npmjs.org`**. Si usás un túnel de desarrollo, agregá su hostname concreto a `allowedDevOrigins` en `next.config.ts`; no habilites todos los orígenes. Los orígenes locales ya están contemplados.

### Funciones que usan un servicio externo

La corrección de textos, la consulta de términos fuera del glosario y la preparación de preguntas para tus PDF/textos llaman a la API oficial de OpenAI. Se activan con `ENGLISH_AI_API_KEY`. Ante una clave ausente o un error, la interfaz explica el problema y conserva los datos existentes.

La corrección envía tu texto y hasta cinco patrones de errores anteriores. El diccionario envía el término y su contexto. Las preguntas envían los primeros 12.000 caracteres del material, con aviso previo junto al botón. Las respuestas de IA se validan antes de guardar; son revisables, no evaluaciones MCER. No se evalúa pronunciación ni fluidez a partir de texto. Importar un documento no lo envía automáticamente a ningún proveedor.

**La conexión real con IA todavía necesita validarse con una credencial y acceso al dominio.** Los tests del contrato usan un proveedor simulado, claramente separado de la prueba de navegador sin IA. No hay respuestas ficticias que sustituyan al servicio en la aplicación.

### Datos y copias de seguridad

`data/english-os.sqlite` conserva el historial. Los PDF van en `data/files/`, con nombres aleatorios y permisos privados. Se excluyen de Git junto con `.env.local`. Una actualización de código no debe borrar `data/`. Si usás `ENGLISH_DATA_DIR`, mantené esa ruta estable.

Para una copia completa, detené el servidor y copiá **todo** el directorio de datos, incluidos posibles archivos WAL/SHM, en un destino privado. Restaurá la copia con el servidor detenido. La exportación JSON de la interfaz incluye todos los registros, pero no los bytes originales de los PDF ni una función de restauración automática. Los originales se descargan desde cada lectura.

Es una aplicación de un solo usuario. Para publicarla, usá HTTPS y `APP_ACCESS_TOKEN`, montá un volumen persistente y agregá límites de tráfico en tu proxy. La autenticación no es un sistema de cuentas multiusuario. Cambiar la contraseña invalida las cookies anteriores. Los uploads tienen límite de 10 MB, 150 páginas y 100.000 caracteres; PDFs escaneados o protegidos pueden requerir OCR u otra extracción. No se ejecuta contenido del PDF ni se renderiza HTML del texto importado.

## Comprobar

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
node scripts/check-restart.mjs
npm run format:check
```

Los tests unitarios usan una base temporal separada de tus datos. Comprueban fechas, diagnóstico retomable, persistencia, resultados idempotentes, límites de tiempo, repetición espaciada, importación real de PDF y planificación por errores. Las pruebas IA de contrato usan un proveedor simulado para verificar formato, errores y persistencia; no prueban la disponibilidad externa.

La prueba de navegador usa otra base temporal y un servidor de producción en el puerto 3100. Recorre acceso protegido, diagnóstico, lector, checkpoints, vocabulario, PDF, calendario, estadísticas, exportación, validación de origen y tema persistente. Usa `/usr/bin/chromium` cuando existe; en otra máquina, instalá el navegador con `npx playwright install chromium` o indicá `PLAYWRIGHT_EXECUTABLE_PATH`. Primero ejecutá `npm run build`. No se modifican tus datos de aprendizaje.

`scripts/check-restart.mjs` arranca y detiene dos veces un servidor de producción aislado en el puerto 3101; verifica que perfil, texto importado, vocabulario, sesión y borrador sobrevivan. Necesita ese puerto libre. `bash scripts/setup.sh` reproduce instalación, migraciones y compilación sin borrar tus datos.

## Qué sigue

[Arquitectura y fases](docs/ARCHITECTURE.md) describe las decisiones y los límites actuales. La siguiente fase incorpora grabación, transcripción, listening con audios naturales, evaluaciones periódicas y mayor personalización. Luego vendrán análisis acústico y analítica longitudinal calibrada.

El banco editorial inicial es finito. El diagnóstico breve todavía no está validado psicométricamente. La precisión de ejercicios y el recuerdo declarado no equivalen a un nivel MCER, y el sistema no declara B2 por completar actividades. Las estimaciones iniciales se conservan como referencia hasta disponer de instrumentos de evaluación más amplios.

## Acceso sin señal y novedades

La versión de Pages instala un service worker compartido por ambos perfiles. Primero debe terminar la descarga y aparecer **Ready offline / Pronto sem conexão**. Se guardan pantallas, clases, diccionarios, iconos y motores PDF/SQLite; los archivos personales y el progreso permanecen en IndexedDB. No se descargan automáticamente los 98 MB de pesos de IA: requieren la elección previa en PDF Studio. Para inferencia sin señal también debe haberse guardado ese modelo. Voz y reconocimiento local dependen del navegador y sus paquetes instalados.

Actualizar persiste la base, descarga la nueva app y activa la versión compartida. Una descarga fallida conserva la versión anterior. El service worker sólo elimina cachés antiguas de archivos de la app; nunca borra IndexedDB, localStorage, borradores ni PDF. Cerrar una pantalla de práctica desde otro perfil se difiere hasta una pantalla segura. El navegador puede eliminar almacenamiento por presión de espacio o por una acción del usuario; el respaldo privado en GitHub sigue siendo recomendable.

Cada entrada al inicio muestra una frase original en el idioma del perfil con su significado en español. La bandera abre categorías del recorrido. La biblioteca ofrece portadas tipográficas originales y continuación con porcentaje de secciones visitadas, sin presentar ese porcentaje como comprensión evaluada.

**News / Notícias** muestra titulares RSS reales de BBC News y Agência Brasil, fuente, enlace y fecha. El workflow de GitHub consulta dos veces al día. No crea noticias ni reproduce artículos completos; si una fuente no responde conserva los titulares anteriores con sus fechas. Sin señal se ofrece la última lista guardada y se requiere conexión para visitar el artículo original. La consulta local desde este entorno puede estar bloqueada por la red; el workflow corre en GitHub y su estado debe verificarse antes de afirmar que existen titulares nuevos.

## Coordinación y refuerzo entre secciones

Inicio, Clases, Progreso y el menú de banderas consultan el mismo recorrido por idioma. La bandera clasifica las secciones y muestra el próximo paso, el nivel compartido y dónde hace falta refuerzo. El plan diario adapta tareas no iniciadas al cambiar de nivel en ambos idiomas; respeta los ejercicios ya comenzados, sus sesiones y borradores.

Las comprobaciones recientes de lectura (también preguntas objetivas sobre PDF), gramática y vocabulario pueden pausar clases nuevas aunque haya una aprobación anterior. Se consideran hasta los últimos tres ejercicios de cada competencia de los últimos catorce días: con al menos dos ejercicios y menos del 70 % agregado, se pide una práctica nueva con al menos 80 %. Una práctica independiente con 80 % habilita continuar sin borrar notas anteriores. Las victorias con ayudas no cierran un refuerzo de vocabulario. Las clases de recuperación siguen disponibles, evitando que el propio requisito impida volver a intentarlas. Lecturas opcionales de un nivel superior no se usan para bloquear a un principiante; las dificultades de niveles previos y PDF propios sí orientan el refuerzo. Esto describe desempeño en ejercicios de la app, no una evaluación validada del dominio general.

Las palabras del día y los juegos nuevos usan grupos de vocabulario acordes al nivel de estudio compartido. Los grupos son decisiones de enseñanza de esta app, no una clasificación oficial de palabras aisladas. Los juegos anteriores conservan su edición y semilla para que una actualización del banco no borre una partida pendiente ni cambie cómo se puntúa.

La sincronización entre dispositivos combina resultados y checkpoints de cada idioma dentro del repositorio privado autorizado de GitHub; esos mismos datos alimentan el recorrido. Los borradores locales siguen en su dispositivo. La autorización debe ingresarse en la app, y permanece únicamente en memoria. Alejo y Jazmín conservan trayectorias personales separadas: sincronizar no convierte el A1 de Jazmín en el A2 de Alejo.

## Sugerencia al comienzo de Inicio

La primera tarjeta ofrece un recorrido opcional: explorar una lectura del nivel activo (o retomar la pendiente), abrir una clase concreta del recorrido, reflexionar sobre un titular real con fuente y fecha, y jugar Meaning Match con vocabulario relacionado cuando está disponible. La selección compara vocabulario real del material; si no hay coincidencia lo aclara. La semilla del juego sugerido abre las mismas palabras mostradas, y una partida pendiente tiene prioridad. Los tiempos son estimaciones para explorar, no para aprobar cada actividad. Las reflexiones se guardan automáticamente por fecha, noticia e idioma en el dispositivo, sin nota ni crédito ficticio. La tarjeta no crea actividades, no exige completar su orden y no altera los requisitos de acceso ni las finalizaciones anteriores.

La interfaz comparte la tipografía redondeada Nunito (licencia SIL OFL, incluida con la app y disponible sin señal), tarjetas y acentos vivos en ambos idiomas y temas. Inicio evita duplicar el recorrido, la lectura y las tareas del día: los accesos a las actividades, el diagnóstico opcional y los datos guardados siguen disponibles.

Inicio muestra únicamente el saludo y un itinerario opcional compacto. Sólo el primer paso está desplegado; clase, noticia y juego se abren al tocarlos. Se retiraron de Inicio las promociones, accesos grandes repetidos, el panel de nivel y los gráficos; las funciones siguen en sus secciones. La frase está en Mi día dentro de un desplegable y la palabra del día tiene un botón pequeño en la barra superior, sin botón flotante que tape el contenido.

## Ayudas siempre disponibles

Language help / Ajuda com o idioma aparece en el menú principal y en la bandera. Es una sección independiente, sin bloqueos ni requisitos: tablas de verbos, armado interactivo de afirmaciones/negativas/preguntas, tiempos presentes/pasados/futuros y fichas de consulta para acciones en curso, experiencias y pedidos corteses. Las explicaciones están en español y los modelos en el idioma del espacio. Reutiliza el borrador existente y funciona sin señal después de guardar la app; no acredita clases ni altera su acceso.

Las notas de las 131 clases del idioma, de A1 a C2, también se pueden consultar libremente por nivel y búsqueda desde Study notes / Notas de estudo. Esto permite leer teoría y ejemplos sin abrir ejercicios bloqueados ni registrar aprobaciones ficticias.

El menú agrupa las secciones principales en accesos compactos y las complementarias en “More sections / Mais seções”, plegado en celular. PDF Studio explica su propósito y sus pasos en español. Progreso muestra primero objetivos del nivel, clases y bloques aprobados, requisitos y refuerzos; los detalles anteriores siguen disponibles en un desplegable. Los objetivos orientan el estudio y no reemplazan una evaluación validada de las competencias MCER.

## Primer día y test orientativo

El tutorial de primera entrada explica en español cómo empezar: test, guía del día, clases y ayudas. Se recuerda por espacio y dispositivo; se puede volver a abrir con How to start / Como começar. El test contiene 12 situaciones (tres por tramo A1–B2) y una opción de desconocimiento, sin límite de tiempo. Cada respuesta se guarda al confirmarla y se puede retomar. El resultado muestra una referencia conservadora, resultados por lectura/gramática/vocabulario y un primer foco. Es un cuestionario guiado pequeño, no una certificación, ni evalúa audio o escritura. No altera el nivel de clases ni saltea requisitos. Los diagnósticos anteriores ya terminados se muestran con sus respuestas originales, sin exigir nuevas preguntas ni borrar historial.

Language help is always unlocked and opens with sentence construction, followed
by a full tense reference and a searchable offline verb catalogue. The catalogue
contains 7,100 English and 2,415 Portuguese verb lemmas / verb expressions with
Spanish equivalents aligned by WordNet sense. Forms are not counted as separate
verbs. It is a dictionary, not an automatic conjugator: reviewed everyday
conjugation models remain separate. Source notices, licenses, pinned input hashes
and reproducible extraction live in `external-data/wordnet/`,
`public/assets/verbs/` and `scripts/build-verb-catalog.py`. Dictionary adaptations
are CC BY-SA 3.0, separately from app code. All existing progress and drafts use
the same storage keys; consulting the help does not award course credit.

El constructor desbloqueado permite elegir los doce patrones temporales del inglés
más futuro con going to, condicionales y formas no personales; en portugués incluye
indicativo y subjuntivo simples/compuestos, imperativo, infinitivos y gerundios.
Las formas irregulares están revisadas para sus verbos cotidianos. Los imperativos
ofrecen solo las personas aplicables; los estados con un continuo poco natural
muestran una explicación en lugar de enseñar un ejemplo engañoso. La comparación
opcional reúne afirmación, negativa y pregunta con traducción en español.
Este cambio no modifica los modelos usados para calificar las clases anteriores,
ni los requisitos del recorrido, ni la clave de guardado de los borradores.

El selector del constructor tiene 182 verbos en inglés y 180 en portugués,
con búsqueda por infinitivo en el idioma o por significado en español. Los
modelos incluyen complementos compatibles, formas irregulares y ayudas de
traducción con voseo. Esta colección de práctica se mantiene separada del
catálogo de diccionario de miles de entradas y del banco de clases calificadas;
ampliarla no agrega requisitos ni cambia clases aprobadas. Un filtro sin
coincidencias conserva el verbo seleccionado y su oración; no borra borradores.

La ayuda de lenguaje abre con una guía de tres pasos y un constructor compacto.
Se eliminaron títulos y consejos duplicados; la regla de cada ejemplo y la
comparación se despliegan a pedido. Los tiempos están agrupados para consultar
solo el bloque necesario; las notas de A1–C2 siguen disponibles al pie. La lista
completa de verbos, todos los tiempos y los borradores existentes se conservan.

## Recorrido de actividades en Home

Debajo de la sugerencia flexible del día hay un recorrido de actividades A1–C2
con el propósito de cada paso explicado en español: palabras con ilustraciones,
formación de oraciones con bloques, lectura de una situación corta, las clases
del bloque y escritura personal. Los juegos y las lecturas largas son otra
forma de practicar, sin reemplazar el recorrido ni sus requisitos. Alejo mantiene
entrada A2 y Jazmín A1; los niveles futuros están bloqueados y los completados
se pueden repasar.

Los ejercicios objetivos se guardan automáticamente al terminarlos en las mismas
tablas de resultados, sesiones, errores e historial. El servidor o SQL.js vuelve
a calcular los aciertos desde el banco; no acepta una nota enviada por el cliente.
Cada intento tiene un ID y se guarda una vez. Las respuestas incompletas y los
bloques elegidos se conservan por dispositivo y espacio, también sin señal.
La rutina breve establece el comienzo de su bloque: lectura independiente ≥60%
y vocabulario independiente ≥80% aportan evidencia a los mismos requisitos que
las otras secciones. Las clases siguen necesitando ≥80%, escritura registrada y
las restantes condiciones del recorrido. Dos ejercicios fallidos pueden pausar
clases nuevas; una práctica independiente ≥80% permite retomar. Consultar ayudas
se registra y no acredita evidencia independiente. Los hitos anteriores no se
borran. La extensión de una escritura acredita práctica, sin calificar su calidad.

El banco de rutinas edición 1 debe conservarse para los borradores y resultados
publicados. Futuras ediciones deben agregarse con sus propios identificadores y
mantener la reproducción y el crédito de las ediciones previas; nunca reescribir
respuestas anteriores ni reiniciar bases de datos para actualizar contenido.
