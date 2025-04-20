# Étape 1 : Build du projet
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Étape 2 : Image d'exécution
FROM eclipse-temurin:17-jdk

# Installer ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Copier le binaire Rhubarb
COPY bin/rhubarb /app/bin/rhubarb
RUN chmod +x /app/bin/rhubarb


EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
