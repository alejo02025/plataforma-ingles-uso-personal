# English OS

Una plataforma personal para leer, practicar y construir evidencia de tu progreso en inglés. Interfaz en español argentino, contenido adulto y datos persistentes. Primera fase funcional sobre Next.js, TypeScript y SQLite.

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
- Seis lecturas originales A2–B2 sobre viajes, finanzas, historia, tecnología, trabajo y vida cotidiana. Preguntas corregidas en el servidor con explicaciones.
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
