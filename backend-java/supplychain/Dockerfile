# Stage 1: Build the app using Maven + Java 21
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copy Maven wrapper and pom first (for caching)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable and download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build the JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run with lightweight JRE only
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/supplychain-0.0.1-SNAPSHOT.jar app.jar

# Render sets PORT env variable automatically
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
