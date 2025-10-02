package com.redhat.ecommerce.recommendation.dto;

import com.redhat.ecommerce.recommendation.model.ProductRecommendation;

import java.time.Instant;
import java.util.List;

public class RecommendationResponse {
    
    public String productId;
    public Double score;
    public String type;
    public String reason;
    public Instant timestamp;
    
    public RecommendationResponse() {}
    
    public RecommendationResponse(ProductRecommendation recommendation) {
        this.productId = recommendation.productId;
        this.score = recommendation.score;
        this.type = recommendation.type.name().toLowerCase();
        this.reason = recommendation.reason;
        this.timestamp = recommendation.createdAt;
    }
    
    public static class UserRecommendationsResponse {
        public String userId;
        public List<RecommendationResponse> recommendations;
        public Integer totalCount;
        public Instant generatedAt;
        
        public UserRecommendationsResponse() {}
        
        public UserRecommendationsResponse(String userId, List<RecommendationResponse> recommendations) {
            this.userId = userId;
            this.recommendations = recommendations;
            this.totalCount = recommendations.size();
            this.generatedAt = Instant.now();
        }
    }
    
    public static class PopularProductsResponse {
        public List<PopularProduct> products;
        public Instant generatedAt;
        
        public PopularProductsResponse() {}
        
        public PopularProductsResponse(List<PopularProduct> products) {
            this.products = products;
            this.generatedAt = Instant.now();
        }
    }
    
    public static class PopularProduct {
        // Product details (from Product Service)
        public String productId;
        public String name;
        public String description;
        public Double price;
        public String categoryId;
        public List<String> tags;
        public List<String> images;
        public String brand;
        public Double rating;
        public Integer reviewCount;
        
        // Recommendation metrics (calculated)
        public Double popularityScore;
        public String reason;
        
        public PopularProduct() {}
        
        public PopularProduct(String productId, String name, String description, 
                            Double price, String categoryId, List<String> tags,
                            List<String> images, String brand, Double rating, 
                            Integer reviewCount, Double popularityScore, String reason) {
            this.productId = productId;
            this.name = name;
            this.description = description;
            this.price = price;
            this.categoryId = categoryId;
            this.tags = tags;
            this.images = images;
            this.brand = brand;
            this.rating = rating;
            this.reviewCount = reviewCount;
            this.popularityScore = popularityScore;
            this.reason = reason;
        }
    }
    
    public static class TrackingRequest {
        public String productId;
        public String behaviorType;
        public Double rating;
        public String sessionId;
        public Long duration;
        
        public TrackingRequest() {}
    }
}