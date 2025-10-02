package com.redhat.ecommerce.product.model;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@MongoEntity(collection = "products")
public class Product extends PanacheMongoEntity {
    
    public String name;
    public String description;
    public String shortDescription;
    public String slug;
    public String sku;
    public BigDecimal price;
    public BigDecimal comparePrice;
    public String categoryId;
    public List<String> tags;
    public List<String> images;
    public Boolean isActive = true;
    public Boolean isFeatured = false;
    public Integer stockQuantity;
    public String brand;
    public BigDecimal rating;
    public Integer reviewCount;
    public ProductMetadata metadata;
    public Instant createdAt;
    public Instant updatedAt;
    
    // Panache finder methods
    public static List<Product> findActive() {
        return list("isActive", true);
    }
    
    public static List<Product> findFeatured() {
        return list("isFeatured = true and isActive = true");
    }
    
    public static List<Product> findByCategory(String categoryId) {
        return list("categoryId = ?1 and isActive = true", categoryId);
    }
    
    public static Product findBySlug(String slug) {
        return find("slug = ?1 and isActive = true", slug).firstResult();
    }
    
    public static List<Product> searchByName(String query) {
        // Simple search using Panache find method with case-insensitive regex
        return findActive().stream()
            .filter(product -> 
                product.name.toLowerCase().contains(query.toLowerCase()) ||
                (product.description != null && product.description.toLowerCase().contains(query.toLowerCase())) ||
                (product.tags != null && product.tags.stream().anyMatch(tag -> tag.toLowerCase().contains(query.toLowerCase())))
            )
            .toList();
    }
    
    public static class ProductMetadata {
        public String weight;
        public String dimensions;
        public String material;
        public String color;
        public String size;
        public List<String> features;
        
        public ProductMetadata() {}
    }
}