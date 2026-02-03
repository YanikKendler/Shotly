@echo off

set VERSION=%~1
if "%VERSION%"=="" echo VERSION NAME NOT PROVIDED & exit /b 1

set IMAGE=yanikkendler/shotly-admin:%VERSION%

docker build -t %IMAGE% . || (
    echo DOCKER BUILD FAILED
    exit /b 0
)

docker push %IMAGE% || (
    echo DOCKER PUSH FAILED
    exit /b 0
)

exit /b 0