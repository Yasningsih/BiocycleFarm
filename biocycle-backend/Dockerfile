# === STAGE 1: Proses Build Aplikasi ===
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
# Build project menjadi .jar tanpa menjalankan unit test agar cepat
RUN mvn clean package -DskipTests

# === STAGE 2: Proses Jalankan Aplikasi ===
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Salin file .jar hasil build dari Stage 1
COPY --from=build /app/target/*.jar app.jar

# PENTING: Batasi RAM Java (Maksimal 300MB) agar sisa RAM server tidak jebol
ENV JAVA_OPTS="-Xmx300m -Xms150m"

EXPOSE 8080

# Jalankan aplikasi dengan konfigurasi batasan RAM
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]