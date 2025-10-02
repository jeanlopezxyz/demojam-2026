####
# Multi-stage build for Quarkus API Gateway
####

## Stage 1: Build the application
FROM registry.access.redhat.com/ubi8/openjdk-21:1.18 AS build

# Install Maven in build stage
USER root
RUN microdnf install -y tar gzip && \
    curl -L https://archive.apache.org/dist/maven/maven-3/3.9.8/binaries/apache-maven-3.9.8-bin.tar.gz -o /tmp/maven.tar.gz && \
    tar -xzf /tmp/maven.tar.gz -C /opt && \
    ln -s /opt/apache-maven-3.9.8 /opt/maven && \
    rm /tmp/maven.tar.gz

ENV PATH="/opt/maven/bin:$PATH"
ENV MAVEN_HOME="/opt/maven"

# Set working directory and permissions
WORKDIR /tmp/src
USER 185

# Copy Maven files first for better caching
COPY --chown=185 pom.xml /tmp/src/pom.xml

# Download dependencies (better Docker layer caching)
RUN mvn dependency:go-offline -B

# Copy source code
COPY --chown=185 src /tmp/src/src

# Build the application
RUN mvn clean package -DskipTests -B

## Stage 2: Create the runtime image  
FROM registry.access.redhat.com/ubi8/openjdk-21-runtime:1.18

ENV LANGUAGE='en_US:en'

# Copy the built application from build stage
COPY --from=build --chown=185 /tmp/src/target/quarkus-app/lib/ /deployments/lib/
COPY --from=build --chown=185 /tmp/src/target/quarkus-app/*.jar /deployments/
COPY --from=build --chown=185 /tmp/src/target/quarkus-app/app/ /deployments/app/
COPY --from=build --chown=185 /tmp/src/target/quarkus-app/quarkus/ /deployments/quarkus/

# Expose port
EXPOSE 8080
USER 185

# Configure Java runtime
ENV JAVA_OPTS_APPEND="-Dquarkus.http.host=0.0.0.0 -Dquarkus.http.port=8080 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/q/health/ready || exit 1

# Start the application
ENTRYPOINT [ "/opt/jboss/container/java/run/run-java.sh" ]