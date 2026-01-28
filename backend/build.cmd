@echo off

set VERSION=%~1
if "%VERSION%"=="" echo VERSION NAME NOT PROVIDED & exit /b 1

set IMAGE=yanikkendler/shotly-backend:%VERSION%

REM Maven (verwende mvnw.cmd auf Windows falls vorhanden)
if exist mvnw.cmd (
    call mvnw.cmd clean package || (
        echo MAVEN BUILD FAILED
        exit /b 0
    )
) else (
    .\mvnw clean package || (
        echo MAVEN BUILD FAILED
        exit /b 0
    )
)

docker build -t %IMAGE% . || (
    echo DOCKER BUILD FAILED
    exit /b 0
)

docker push %IMAGE% || (
    echo DOCKER PUSH FAILED
    exit /b 0
)

exit /b 0