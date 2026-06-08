FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Ubah port internal Spring Boot agar sesuai dengan standar Hugging Face (7860)
ENV PORT=7860
EXPOSE 7860

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
