# --- STAGE 1: Build ---
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set the working directory for the build
WORKDIR /build

# 1. Copy the pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline

# 2. Copy the source code
COPY src ./src

# 3. Build the application
# Use -DskipTests if you want to speed up the container build
RUN mvn package -DskipTests

# --- STAGE 2: Run ---
FROM eclipse-temurin:21-jre

# Set standard Quarkus/Java environment variables
ENV AUTH0_URL="unknown" \
    AUTH0SECRET="unknown" \
    AUTH0_MANAGEMENT_SECRET="unknown" \
    DB_URL="unknown" \
    DB_USERNAME="unknown" \
    DB_PASSWORD="unknown" \
    STRIPE_API_KEY="unknown" \
    STRIPE_WEBHOOK_SECRET="unknown" \
    FRONTEND_URL="unknown"

RUN mkdir -p /opt/application
WORKDIR /opt/application

# Copy the built jar from the build stage
# Note: Quarkus usually builds into /target/quarkus-app/ or a runner.jar
# Adjust the path below if your pom.xml generates a specific name
COPY --from=build /build/target/shotly-backend-runner.jar /opt/application/backend.jar

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "-c", "java -Dquarkus.oidc.credentials.secret=${AUTH0SECRET} -Dauth0.client-secret=${AUTH0_MANAGEMENT_SECRET} -Dquarkus.datasource.jdbc.url=${DB_URL} -Dquarkus.datasource.username=${DB_USERNAME} -Dquarkus.datasource.password=${DB_PASSWORD} -Dstripe.api-key=${STRIPE_API_KEY} -Dstripe.webhook-secret=${STRIPE_WEBHOOK_SECRET} -Dstripe.frontend-url=${FRONTEND_URL} -Dme.kendler.yanik.auth0.Auth0ManagementClient/mp-rest/url=${AUTH0_URL} -jar backend.jar"]