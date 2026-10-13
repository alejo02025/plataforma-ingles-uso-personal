@echo off
setlocal EnableExtensions DisableDelayedExpansion
title English OS - Instalacion
chcp 65001 >nul
set "PATH=%ProgramFiles%\nodejs;%ProgramFiles%\Git\cmd;%LocalAppData%\Programs\Git\cmd;%PATH%"
set "PROJECT_DIR=%USERPROFILE%\EnglishOS\plataforma-ingles-uso-personal"
set "NODE_MAJOR="

echo.
echo English OS - instalacion para Windows
echo Instala Node.js 24 y Git desde el catalogo oficial de winget.
echo Guarda el proyecto en "%PROJECT_DIR%".
echo Los datos de aprendizaje existentes se conservan.
echo.

for /f "tokens=1 delims=." %%V in ('node.exe --version 2^>nul') do set "NODE_MAJOR=%%V"
if "%NODE_MAJOR%"=="v24" goto git_setup
if defined NODE_MAJOR goto wrong_node

where winget.exe >nul 2>&1
if errorlevel 1 goto missing_winget
echo [1/4] Instalando Node.js 24. Windows puede pedir permiso para instalarlo.
winget.exe install --exact --id OpenJS.NodeJS.LTS --version 24.20.0 --source winget --accept-package-agreements --accept-source-agreements
if errorlevel 1 goto install_failed
set "PATH=%ProgramFiles%\nodejs;%ProgramFiles%\Git\cmd;%LocalAppData%\Programs\Git\cmd;%PATH%"
for /f "tokens=1 delims=." %%V in ('node.exe --version 2^>nul') do set "NODE_MAJOR=%%V"
if not "%NODE_MAJOR%"=="v24" goto node_unavailable

:git_setup
where git.exe >nul 2>&1
if not errorlevel 1 goto repository_setup
where winget.exe >nul 2>&1
if errorlevel 1 goto missing_winget
echo [2/4] Instalando Git desde el catalogo oficial.
winget.exe install --exact --id Git.Git --source winget --accept-package-agreements --accept-source-agreements
if errorlevel 1 goto install_failed
set "PATH=%ProgramFiles%\nodejs;%ProgramFiles%\Git\cmd;%LocalAppData%\Programs\Git\cmd;%PATH%"
where git.exe >nul 2>&1
if errorlevel 1 goto git_unavailable

:repository_setup
echo [3/4] Preparando tu proyecto.
if exist "%PROJECT_DIR%\" goto existing_repository
if not exist "%USERPROFILE%\EnglishOS\" mkdir "%USERPROFILE%\EnglishOS"
if errorlevel 1 goto install_failed
git.exe clone --branch main --single-branch https://github.com/alejo02025/plataforma-ingles-uso-personal.git "%PROJECT_DIR%"
if errorlevel 1 goto clone_failed
goto application_setup

:existing_repository
if not exist "%PROJECT_DIR%\.git\" goto occupied_directory
set "PROJECT_REMOTE="
for /f "delims=" %%R in ('git.exe -C "%PROJECT_DIR%" config --get remote.origin.url 2^>nul') do set "PROJECT_REMOTE=%%R"
if "%PROJECT_REMOTE%"=="https://github.com/alejo02025/plataforma-ingles-uso-personal.git" goto application_setup
if "%PROJECT_REMOTE%"=="https://github.com/alejo02025/plataforma-ingles-uso-personal" goto application_setup
goto occupied_directory

:application_setup
if not exist "%PROJECT_DIR%\package-lock.json" goto incomplete_project
if not exist "%PROJECT_DIR%\scripts\start-windows.cmd" goto incomplete_project
cd /d "%PROJECT_DIR%"
if errorlevel 1 goto install_failed
echo [4/4] Instalando dependencias y preparando la base de datos.
call npm.cmd ci --no-audit
if errorlevel 1 goto install_failed
call npm.cmd run db:migrate
if errorlevel 1 goto install_failed

set "LAUNCHER=%USERPROFILE%\EnglishOS\Abrir English OS.cmd"
if not exist "%LAUNCHER%" (
  >"%LAUNCHER%" echo @echo off
  >>"%LAUNCHER%" echo call "%PROJECT_DIR%\scripts\start-windows.cmd"
)
set "DESKTOP="
for /f "delims=" %%D in ('powershell.exe -NoProfile -Command "[Environment]::GetFolderPath('Desktop')"') do set "DESKTOP=%%D"
if defined DESKTOP if not exist "%DESKTOP%\English OS.cmd" copy "%LAUNCHER%" "%DESKTOP%\English OS.cmd" >nul
echo.
echo Instalacion terminada. El archivo para volver a abrirla esta en:
echo "%LAUNCHER%"
call "%PROJECT_DIR%\scripts\start-windows.cmd"
exit /b %errorlevel%

:missing_winget
echo Windows no encuentra winget. Instala o actualiza "Instalador de aplicaciones" de Microsoft:
echo https://apps.microsoft.com/detail/9nblggh4nns1
echo Despues vuelve a abrir este instalador.
goto failed

:wrong_node
echo Se detecto otra version de Node.js. Este proyecto requiere la version 24.
echo No se reemplazo tu instalacion actual. Compartime el resultado de node --version.
goto failed

:node_unavailable
echo Node.js todavia no esta disponible. Reinicia Windows y vuelve a ejecutar este archivo.
goto failed

:git_unavailable
echo Git todavia no esta disponible. Reinicia Windows y vuelve a ejecutar este archivo.
goto failed

:clone_failed
echo No se pudo descargar el repositorio. Si es privado, inicia sesion con tu cuenta de GitHub.
echo Se conservaron las carpetas existentes. Compartime el mensaje de error que aparece arriba.
goto failed

:occupied_directory
echo La carpeta de destino ya existe y no corresponde al repositorio esperado.
echo No se cambio ni borro esa carpeta. Compartime este mensaje para elegir otra ubicacion.
goto failed

:incomplete_project
echo El proyecto existente no incluye los archivos necesarios para esta instalacion.
echo No se reemplazo tu codigo. Compartime este mensaje para actualizarlo conservando tus cambios.
goto failed

:install_failed
echo No se pudo terminar la instalacion. Compartime el mensaje de error que aparece arriba.

:failed
echo.
pause
exit /b 1
