package com.redhat.ecommerce.recommendation.service;

import com.redhat.ecommerce.recommendation.dto.RecommendationResponse;
import com.redhat.ecommerce.recommendation.model.ProductRecommendation;
import com.redhat.ecommerce.recommendation.model.UserBehavior;
import com.redhat.ecommerce.recommendation.client.ProductServiceClient;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import io.smallrye.mutiny.Uni;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class RecommendationService {
    
    @Inject
    RedisDataSource redisDS;
    
    @RestClient
    ProductServiceClient productServiceClient;
    
    @ConfigProperty(name = "recommendation.cache.ttl")
    Duration cacheTtl;
    
    @ConfigProperty(name = "recommendation.algorithm.collaborative-filtering.min-rating-threshold")
    Double minRatingThreshold;
    
    private ValueCommands<String, String> cache;
    
    @PostConstruct
    public void init() {
        cache = redisDS.value(String.class, String.class);
    }
    
    public List<RecommendationResponse> getUserRecommendations(String userId, int limit) {
        // Try cache first
        String cacheKey = "recommendations:" + userId;
        String cached = cache.get(cacheKey);
        
        if (cached != null) {
            // Parse cached recommendations (simplified)
            return getCachedRecommendations(cached, limit);
        }
        
        // Generate fresh recommendations
        List<ProductRecommendation> recommendations = generateRecommendations(userId, limit);
        
        // Cache results
        cacheRecommendations(cacheKey, recommendations);
        
        return recommendations.stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<RecommendationResponse> getSimilarProducts(String productId, int limit) {
        String cacheKey = "similar:" + productId;
        String cached = cache.get(cacheKey);
        
        if (cached != null) {
            return getCachedRecommendations(cached, limit);
        }
        
        List<ProductRecommendation> similar = ProductRecommendation.findSimilarProducts(productId, limit);
        cacheRecommendations(cacheKey, similar);
        
        return similar.stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }
    
    public Uni<List<RecommendationResponse.PopularProduct>> getPopularProducts(int limit) {
        // Get real products from Product Service (reactive)
        System.out.println("DEBUG: Calling Product Service for " + (limit * 2) + " products");
        return productServiceClient.getAllProducts(limit * 2)
            .onItem().transform(response -> {
                System.out.println("DEBUG: Product Service response received: " + (response != null));
                System.out.println("DEBUG: Response data: " + (response != null && response.data != null ? response.data.size() + " products" : "null"));
                
                if (response == null || response.data == null) {
                    System.out.println("DEBUG: Response or data is null, returning empty list");
                    return new ArrayList<RecommendationResponse.PopularProduct>();
                }
                
                // Simple algorithm: sort by rating * reviewCount + featured bonus
                return response.data.stream()
                    .filter(p -> p.isActive != null && p.isActive)
                    .sorted((a, b) -> {
                        double scoreA = calculatePopularityScore(a);
                        double scoreB = calculatePopularityScore(b);
                        return Double.compare(scoreB, scoreA);
                    })
                    .limit(limit)
                    .map(this::convertToPopularProduct)
                    .collect(Collectors.toList());
            })
            .onFailure().recoverWithItem(throwable -> {
                System.out.println("DEBUG: Product Service call failed: " + throwable.getMessage());
                throwable.printStackTrace();
                // Fallback: return empty list if Product Service is unavailable
                return new ArrayList<>();
            });
    }
    
    private double calculatePopularityScore(ProductServiceClient.ProductApiResponse.Product product) {
        double baseScore = (product.rating != null ? product.rating : 0.0) * 
                          (product.reviewCount != null ? product.reviewCount : 0);
        double featuredBonus = (product.isFeatured != null && product.isFeatured) ? 100.0 : 0.0;
        return baseScore + featuredBonus;
    }
    
    private RecommendationResponse.PopularProduct convertToPopularProduct(ProductServiceClient.ProductApiResponse.Product product) {
        double popularity = calculatePopularityScore(product);
        String reason = buildRecommendationReason(product);
        
        return new RecommendationResponse.PopularProduct(
            product.id, product.name, product.description, product.price,
            product.categoryId, product.tags, product.images, product.brand,
            product.rating, product.reviewCount, popularity, reason
        );
    }
    
    private String buildRecommendationReason(ProductServiceClient.ProductApiResponse.Product product) {
        if (product.isFeatured != null && product.isFeatured) {
            return "Featured product with " + product.rating + " rating";
        } else if (product.rating != null && product.rating > 4.5) {
            return "Highly rated with " + product.reviewCount + " reviews";
        } else {
            return "Popular in " + getReadableCategoryName(product.categoryId);
        }
    }
    
    private String getReadableCategoryName(String categoryId) {
        // Simple mapping based on known category IDs
        return switch (categoryId) {
            case "64f8b3c4d1234567890abcd1" -> "Programming Languages";
            case "64f8b3c4d1234567890abcd2" -> "Cloud Platforms";
            case "64f8b3c4d1234567890abcd3" -> "DevOps Tools";
            case "64f8b3c4d1234567890abcd4" -> "Tech Companies";
            default -> "Tech Products";
        };
    }
    
    public void trackUserBehavior(String userId, String productId, 
                                UserBehavior.BehaviorType behaviorType, 
                                Double rating, String sessionId, Long duration) {
        
        // Store behavior
        UserBehavior.trackBehavior(userId, productId, behaviorType, rating, sessionId, duration);
        
        // Invalidate user's recommendation cache (comment out for now due to API changes)
        // cache.del("recommendations:" + userId);
        
        // Update real-time counters for popular products
        updatePopularityCounters(productId, behaviorType);
    }
    
    private List<ProductRecommendation> generateRecommendations(String userId, int limit) {
        List<ProductRecommendation> results = new ArrayList<>();
        
        // 1. Collaborative Filtering (based on similar users)
        results.addAll(generateCollaborativeRecommendations(userId, limit / 3));
        
        // 2. Content-Based (based on user's previous likes)
        results.addAll(generateContentBasedRecommendations(userId, limit / 3));
        
        // 3. Popular/Trending products
        results.addAll(generatePopularRecommendations(userId, limit / 3));
        
        // Sort by score and limit
        return results.stream()
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    private List<ProductRecommendation> generateCollaborativeRecommendations(String userId, int limit) {
        // Simplified collaborative filtering
        List<UserBehavior> userBehaviors = UserBehavior.findByUserId(userId);
        List<ProductRecommendation> recommendations = new ArrayList<>();
        
        // Find users with similar behavior patterns
        Set<String> likedProducts = userBehaviors.stream()
                .filter(b -> b.rating != null && b.rating >= minRatingThreshold)
                .map(b -> b.productId)
                .collect(Collectors.toSet());
        
        // This is a simplified version - in production you'd use proper ML algorithms
        for (String productId : likedProducts) {
            ProductRecommendation.createRecommendation(
                userId, productId, 0.8, 
                ProductRecommendation.RecommendationType.COLLABORATIVE_FILTERING,
                "Users with similar preferences also liked this"
            );
            recommendations.add(ProductRecommendation.findById(productId));
        }
        
        return recommendations.stream().limit(limit).collect(Collectors.toList());
    }
    
    private List<ProductRecommendation> generateContentBasedRecommendations(String userId, int limit) {
        // Simplified content-based filtering
        List<ProductRecommendation> recommendations = new ArrayList<>();
        
        // Get user's recent behaviors
        List<UserBehavior> recentBehaviors = UserBehavior.findRecentByUser(userId, 10);
        
        // Find similar products (this would use actual product features in production)
        for (UserBehavior behavior : recentBehaviors) {
            if (behavior.behaviorType == UserBehavior.BehaviorType.PURCHASE || 
                behavior.behaviorType == UserBehavior.BehaviorType.VIEW) {
                
                ProductRecommendation.createRecommendation(
                    userId, behavior.productId, 0.7,
                    ProductRecommendation.RecommendationType.CONTENT_BASED,
                    "Similar to products you've viewed"
                );
            }
        }
        
        return ProductRecommendation.findByUserAndType(userId, 
                ProductRecommendation.RecommendationType.CONTENT_BASED)
                .stream().limit(limit).collect(Collectors.toList());
    }
    
    private List<ProductRecommendation> generatePopularRecommendations(String userId, int limit) {
        List<ProductRecommendation> recommendations = new ArrayList<>();
        
        // Get popular products that user hasn't interacted with
        List<UserBehavior> userProducts = UserBehavior.findByUserId(userId);
        Set<String> userProductIds = userProducts.stream()
                .map(b -> b.productId)
                .collect(Collectors.toSet());
        
        // This would query actual popular products from analytics
        // For now, create placeholder recommendations
        for (int i = 0; i < limit; i++) {
            String productId = "popular-product-" + i;
            if (!userProductIds.contains(productId)) {
                ProductRecommendation.createRecommendation(
                    userId, productId, 0.6,
                    ProductRecommendation.RecommendationType.POPULAR,
                    "Trending now"
                );
            }
        }
        
        return ProductRecommendation.findByUserAndType(userId, 
                ProductRecommendation.RecommendationType.POPULAR)
                .stream().limit(limit).collect(Collectors.toList());
    }
    
    // OLD METHOD - Replaced with real Product Service integration
    // private List<RecommendationResponse.PopularProduct> calculatePopularProducts(int limit) {
    //     // This was generating mock data - now we use real products
    //     List<RecommendationResponse.PopularProduct> popular = new ArrayList<>();
    //     for (int i = 0; i < limit; i++) {
    //         popular.add(new RecommendationResponse.PopularProduct(
    //             "product-" + i, 100L + i * 10, 20L + i * 2, 
    //             4.5 - (i * 0.1), 0.9 - (i * 0.05)
    //         ));
    //     }
    //     return popular;
    // }
    
    private void updatePopularityCounters(String productId, UserBehavior.BehaviorType behaviorType) {
        String counterKey = "counters:" + productId + ":" + behaviorType.name().toLowerCase();
        try {
            cache.incr(counterKey);
            // Note: expire with duration not available in this Redis client version
            // Using expiration via set with TTL instead
        } catch (Exception e) {
            // Handle Redis errors gracefully
        }
    }
    
    private List<RecommendationResponse> getCachedRecommendations(String cached, int limit) {
        // Simplified cache parsing - in production use proper JSON serialization
        return new ArrayList<>();
    }
    
    private void cacheRecommendations(String cacheKey, List<ProductRecommendation> recommendations) {
        try {
            // Simplified caching - in production use proper JSON serialization
            cache.setex(cacheKey, cacheTtl.getSeconds(), "cached-data");
        } catch (Exception e) {
            // Handle Redis errors gracefully
        }
    }
    
    private List<RecommendationResponse.PopularProduct> getCachedPopularProducts(String cached, int limit) {
        // Simplified cache parsing
        return new ArrayList<>();
    }
    
    private void cachePopularProducts(String cacheKey, List<RecommendationResponse.PopularProduct> products) {
        try {
            cache.setex(cacheKey, cacheTtl.getSeconds(), "cached-popular");
        } catch (Exception e) {
            // Handle Redis errors gracefully
        }
    }
}