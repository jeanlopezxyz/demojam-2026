package com.redhat.ecommerce.recommendation.health;

import io.quarkus.mongodb.reactive.ReactiveMongoClient;
import io.quarkus.redis.datasource.RedisDataSource;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@Readiness
@ApplicationScoped
public class RecommendationHealthCheck implements HealthCheck {
    
    @Inject
    ReactiveMongoClient mongoClient;
    
    @Inject
    RedisDataSource redisDS;
    
    @Override
    public HealthCheckResponse call() {
        
        try {
            // Check MongoDB connection
            mongoClient.getDatabase("recommendation_service_db")
                      .runCommand(new org.bson.Document("ping", 1))
                      .await().atMost(java.time.Duration.ofSeconds(2));
            
            // Check Redis connection
            redisDS.value(String.class, String.class).get("health-check");
            
            return HealthCheckResponse.named("recommendation-service")
                    .status(true)
                    .withData("mongodb", "UP")
                    .withData("redis", "UP")
                    .withData("service", "recommendation-service")
                    .withData("version", "1.0.0")
                    .build();
                    
        } catch (Exception e) {
            return HealthCheckResponse.named("recommendation-service")
                    .status(false)
                    .withData("error", e.getMessage())
                    .withData("mongodb", "DOWN")
                    .withData("redis", "DOWN")
                    .build();
        }
    }
}