package com.redhat.ecommerce.recommendation.model;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;

import java.time.Instant;
import java.util.List;

@MongoEntity(collection = "product_recommendations")
public class ProductRecommendation extends PanacheMongoEntity {
    
    public String userId;
    public String productId;
    public Double score;
    public RecommendationType type;
    public String reason;
    public Instant createdAt;
    public Instant expiresAt;
    
    public enum RecommendationType {
        COLLABORATIVE_FILTERING,
        CONTENT_BASED,
        POPULAR,
        TRENDING,
        CROSS_SELL,
        UP_SELL,
        RECENTLY_VIEWED
    }
    
    // Panache finder methods
    public static List<ProductRecommendation> findByUserId(String userId) {
        return list("userId = ?1 and expiresAt > ?2 order by score desc", 
                   userId, Instant.now());
    }
    
    public static List<ProductRecommendation> findByUserAndType(String userId, RecommendationType type) {
        return list("userId = ?1 and type = ?2 and expiresAt > ?3 order by score desc", 
                   userId, type, Instant.now());
    }
    
    public static List<ProductRecommendation> findTopRecommendations(String userId, int limit) {
        return find("userId = ?1 and expiresAt > ?2 order by score desc", 
                   userId, Instant.now())
                .page(0, limit)
                .list();
    }
    
    public static List<ProductRecommendation> findSimilarProducts(String productId, int limit) {
        return find("productId != ?1 and type in (?2, ?3) and expiresAt > ?4 order by score desc",
                   productId, 
                   List.of(RecommendationType.CONTENT_BASED, RecommendationType.CROSS_SELL),
                   Instant.now())
                .page(0, limit)
                .list();
    }
    
    // Business methods
    public static void createRecommendation(String userId, String productId, 
                                          Double score, RecommendationType type, String reason) {
        ProductRecommendation recommendation = new ProductRecommendation();
        recommendation.userId = userId;
        recommendation.productId = productId;
        recommendation.score = score;
        recommendation.type = type;
        recommendation.reason = reason;
        recommendation.createdAt = Instant.now();
        recommendation.expiresAt = Instant.now().plusSeconds(24 * 60 * 60); // 24 hours
        recommendation.persist();
    }
    
    public static void cleanupExpired() {
        delete("expiresAt < ?1", Instant.now());
    }
}