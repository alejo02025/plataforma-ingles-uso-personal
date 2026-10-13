@echo off
setlocal EnableExtensions DisableDelayedExpansion
title English OS
chcp 65001 >nul
set "PATH=%ProgramFiles%\nodejs;%ProgramFiles%\Git\cmd;%LocalAppData%\Programs\Git\cmd;%PATH%"
cd /d "%~dp0.."
if errorlevel 1 goto failed
if not exist "package.json" goto failed
where node.exe >nul 2>&1
if errorlevel 1 goto failed
where npm.cmd >nul 2>&1
if errorlevel 1 goto failed

rem Verifica una respuesta funcional antes de reutilizar un servidor.
call :ready
if not errorlevel 1 goto open_browser

rem No inicia un segundo servidor si el puerto ya pertenece a otra aplicacion.
powershell.exe -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',3000); $c.Close(); exit 1 } catch { exit 0 }"
if errorlevel 1 goto occupied_port

start "English OS - servidor" /D "%CD%" cmd.exe /d /k "npm.cmd run dev"
echo Preparando English OS. La primera vez puede tardar un poco.
for /l %%N in (1,1,45) do (
  call :ready
  if not errorlevel 1 goto open_browser
  timeout.exe /t 2 /nobreak >nul
)
echo El servidor no respondio a tiempo. Revisa la ventana "English OS - servidor".
echo Compartime su mensaje de error para resolverlo.
pause
exit /b 1

:open_browser
echo English OS esta lista. Abriendo tu navegador.
echo Deja abierta la ventana "English OS - servidor" mientras la uses.
start "" "http://localhost:3000"
exit /b 0

:ready
powershell.exe -NoProfile -Command "try { $s = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/state' -TimeoutSec 2; if ($s.documents.Count -gt 0 -and $s.plan.activities.Count -gt 0) { exit 0 } } catch {}; exit 1"
exit /b %errorlevel%

:occupied_port
echo El puerto 3000 esta ocupado por un servicio que no pudimos verificar.
echo No se detuvo ningun proceso. Si configuraste una clave de acceso, abri la app y entra con ella.
echo Si no, compartime este mensaje para elegir otro puerto.
pause
exit /b 1

:failed
echo No encontramos Node.js, npm o el proyecto completo.
echo Volve a ejecutar el instalador de English OS para completar la preparacion.
pause
exit /b 1
