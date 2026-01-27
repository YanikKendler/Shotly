@echo off
REM Windows batch - ignoriert Fehler und fährt fort

set IMAGE=%~1
if "%IMAGE%"=="" echo IMAGE NAME NOT PROVIDED & exit /b 1

REM Maven (verwende mvnw.cmd auf Windows falls vorhanden)
if exist mvnw.cmd (
  call mvnw.cmd clean package || echo MAVEN BUILD FAILED - continuing
) else (
  .\mvnw clean package || echo MAVEN BUILD FAILED - continuing
)

REM Docker build (ignoriert Fehler)
docker build -t %IMAGE% . || echo DOCKER BUILD FAILED - continuing

REM Docker push (ignoriert Fehler)
docker push %IMAGE% || echo DOCKER PUSH FAILED - continuing

exit /b 0