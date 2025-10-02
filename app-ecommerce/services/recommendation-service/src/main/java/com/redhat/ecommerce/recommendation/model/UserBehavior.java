package com.redhat.ecommerce.recommendation.model;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;

import java.time.Instant;
import java.util.List;

@MongoEntity(collection = "user_behaviors")
public class UserBehavior extends PanacheMongoEntity {
    
    public String userId;
    public String productId;
    public BehaviorType behaviorType;
    public Double rating;
    public Instant timestamp;
    public String sessionId;
    public Long duration; // For view events
    
    public enum BehaviorType {
        VIEW, PURCHASE, ADD_TO_CART, REMOVE_FROM_CART, SEARCH, CLICK, SHARE
    }
    
    // Panache finder methods
    public static List<UserBehavior> findByUserId(String userId) {
        return list("userId", userId);
    }
    
    public static List<UserBehavior> findByProductId(String productId) {
        return list("productId", productId);
    }
    
    public static List<UserBehavior> findByUserAndType(String userId, BehaviorType type) {
        return list("userId = ?1 and behaviorType = ?2", userId, type);
    }
    
    public static List<UserBehavior> findRecentByUser(String userId, int limit) {
        return find("userId = ?1 order by timestamp desc", userId)
                .page(0, limit)
                .list();
    }
    
    public static long countByProduct(String productId) {
        return count("productId", productId);
    }
    
    // Business methods
    public static void trackBehavior(String userId, String productId, BehaviorType type) {
        trackBehavior(userId, productId, type, null, null, null);
    }
    
    public static void trackBehavior(String userId, String productId, BehaviorType type, 
                                   Double rating, String sessionId, Long duration) {
        UserBehavior behavior = new UserBehavior();
        behavior.userId = userId;
        behavior.productId = productId;
        behavior.behaviorType = type;
        behavior.rating = rating;
        behavior.sessionId = sessionId;
        behavior.duration = duration;
        behavior.timestamp = Instant.now();
        behavior.persist();
    }
}