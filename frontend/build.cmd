@echo off

set VERSION=%~1
if "%VERSION%"=="" echo VERSION NAME NOT PROVIDED & exit /b 1

set IMAGE=yanikkendler/shotly-frontend:%VERSION%

set BUILD_FOR_PROD=%~2
if "%BUILD_FOR_PROD%"=="" set BUILD_FOR_PROD=false

docker build -t %IMAGE% --build-arg BUILD_FOR_PROD=%BUILD_FOR_PROD% . || (
    echo DOCKER BUILD FAILED
    exit /b 0
)

docker push %IMAGE% || (
    echo DOCKER PUSH FAILED
    exit /b 0
)

exit /b 0