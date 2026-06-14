# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy pom.xml first to cache dependencies as a separate layer
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src/ src/
RUN mvn package -DskipTests -q

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre-alpine AS runtime

# Note: Playwright/Chromium is NOT baked into this image.
# The PDF export service (PdfService) uses the frontend URL and Playwright downloads
# the Chromium browser at runtime into a cache directory when PDF export is first used.
# This keeps the image lean and avoids bundling a large browser binary.

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S app && adduser -S app -G app

# Copy the built jar from the builder stage
COPY --from=builder /build/target/*.jar app.jar

# Switch to non-root user
USER app

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
