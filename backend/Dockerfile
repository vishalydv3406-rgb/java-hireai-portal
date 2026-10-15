# HireAI Backend Dockerfile
# Multi-stage build: build with Maven, run with minimal JRE

# ── Stage 1: Build ─────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Download dependencies first (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress 2>/dev/null || true

COPY src ./src
RUN ./mvnw clean package -DskipTests --no-transfer-progress 2>/dev/null || \
    mvn clean package -DskipTests --no-transfer-progress

# ── Stage 2: Runtime ───────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S hireai && adduser -S hireai -G hireai

WORKDIR /app

# Copy the executable jar
COPY --from=builder /app/target/*.jar app.jar

# Non-root user for security
USER hireai

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
