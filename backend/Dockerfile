# Utiliser Maven pour compiler le projet
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Utiliser JDK pour exécuter l'application
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/futureNow-0.0.1.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
