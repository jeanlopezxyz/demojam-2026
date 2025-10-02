package com.redhat.ecommerce.product.resource;

import com.redhat.ecommerce.product.model.Product;
import io.smallrye.mutiny.Uni;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Products", description = "Product catalog management APIs")
public class ProductResource {
    
    private static final Logger LOG = Logger.getLogger(ProductResource.class);
    
    @GET
    @PermitAll
    @Operation(summary = "List all products")
    @APIResponse(responseCode = "200", description = "Products retrieved successfully")
    public Uni<Response> listProducts(
            @QueryParam("featured") @DefaultValue("false") boolean featured,
            @QueryParam("category") String category,
            @QueryParam("search") String search,
            @QueryParam("limit") @DefaultValue("20") int limit,
            @QueryParam("offset") @DefaultValue("0") int offset) {
        
        return Uni.createFrom().item(() -> {
            LOG.infof("Listing products: featured=%s, category=%s, search=%s, limit=%d", featured, category, search, limit);
            
            List<Product> products;
            
            if (search != null && !search.trim().isEmpty()) {
                // Search by name, description, or tags
                products = Product.searchByName(search.trim());
            } else if (featured) {
                products = Product.findFeatured();
            } else if (category != null) {
                products = Product.findByCategory(category);
            } else {
                products = Product.findActive();
            }
            
            // Apply pagination
            List<Product> paginatedProducts = products.stream()
                    .skip(offset)
                    .limit(limit)
                    .toList();
            
            // Enrich products with popularity score for consistency with recommendations
            List<Map<String, Object>> enrichedProducts = paginatedProducts.stream()
                .map(this::enrichProductWithPopularityScore)
                .toList();
            
            return Response.ok(Map.of(
                "success", true,
                "data", enrichedProducts,
                "pagination", Map.of(
                    "offset", offset,
                    "limit", limit,
                    "total", products.size()
                ),
                "timestamp", Instant.now()
            )).build();
        });
    }
    
    @GET
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "Get product by ID")
    @APIResponse(responseCode = "200", description = "Product retrieved successfully")
    @APIResponse(responseCode = "404", description = "Product not found")
    public Uni<Response> getProduct(@PathParam("id") String id) {
        
        return Uni.createFrom().item(() -> {
            LOG.infof("Getting product: %s", id);
            
            Product product = Product.findById(id);
            
            if (product != null && product.isActive) {
                return Response.ok(Map.of(
                    "success", true,
                    "data", product
                )).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of(
                            "success", false,
                            "message", "Product not found"
                        )).build();
            }
        });
    }
    
    @GET
    @Path("/search")
    @PermitAll
    @Operation(summary = "Search products")
    @APIResponse(responseCode = "200", description = "Search results")
    public Uni<Response> searchProducts(@QueryParam("q") String query) {
        
        return Uni.createFrom().item(() -> {
            LOG.infof("Searching products: %s", query);
            
            if (query == null || query.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("success", false, "message", "Search query required"))
                        .build();
            }
            
            List<Product> products = Product.searchByName(query.trim());
            
            return Response.ok(Map.of(
                "success", true,
                "data", products,
                "query", query,
                "count", products.size()
            )).build();
        });
    }
    
    @GET
    @Path("/categories")
    @PermitAll
    @Operation(summary = "List product categories")
    @APIResponse(responseCode = "200", description = "Categories retrieved successfully")
    public Uni<Response> getCategories() {
        
        return Uni.createFrom().item(() -> {
            LOG.info("Getting product categories");
            
            // Mock categories for now - in full implementation would be from DB
            List<Map<String, Object>> categories = List.of(
                Map.of("id", "64f8b3c4d1234567890abcd1", "name", "Programming Languages", 
                       "slug", "programming-languages", "color", "#3b82f6"),
                Map.of("id", "64f8b3c4d1234567890abcd2", "name", "Cloud Platforms", 
                       "slug", "cloud-platforms", "color", "#10b981"),
                Map.of("id", "64f8b3c4d1234567890abcd3", "name", "DevOps Tools", 
                       "slug", "devops-tools", "color", "#8b5cf6"),
                Map.of("id", "64f8b3c4d1234567890abcd4", "name", "Tech Companies", 
                       "slug", "tech-companies", "color", "#f59e0b")
            );
            
            return Response.ok(Map.of(
                "success", true,
                "data", categories
            )).build();
        });
    }
    
    @GET
    @Path("/featured")
    @PermitAll
    @Operation(summary = "Get featured products")
    @APIResponse(responseCode = "200", description = "Featured products retrieved")
    public Uni<Response> getFeaturedProducts() {
        
        return Uni.createFrom().item(() -> {
            LOG.info("Getting featured products");
            
            List<Product> featuredProducts = Product.findFeatured();
            
            return Response.ok(Map.of(
                "success", true,
                "data", featuredProducts,
                "count", featuredProducts.size()
            )).build();
        });
    }
    
    @GET
    @Path("/health")
    @PermitAll
    @Operation(summary = "Service health check")
    @APIResponse(responseCode = "200", description = "Service is healthy")
    public Uni<Response> healthCheck() {
        return Uni.createFrom().item(() -> 
            Response.ok(Map.of(
                "status", "healthy",
                "service", "product-service",
                "timestamp", Instant.now(),
                "version", "1.0.0",
                "technology", "Quarkus + Java 25"
            )).build()
        );
    }
    
    /**
     * Enrich product with popularity score using same algorithm as Recommendation Service
     */
    private Map<String, Object> enrichProductWithPopularityScore(Product product) {
        // Same algorithm as Recommendation Service: rating * reviewCount + featuredBonus
        double baseScore = (product.rating != null ? product.rating.doubleValue() : 0.0) * 
                          (product.reviewCount != null ? product.reviewCount : 0);
        double featuredBonus = (product.isFeatured != null && product.isFeatured) ? 100.0 : 0.0;
        double popularityScore = baseScore + featuredBonus;
        
        // Convert Product entity to Map and add popularityScore
        Map<String, Object> productMap = new HashMap<>();
        productMap.put("id", product.id.toString());
        productMap.put("name", product.name);
        productMap.put("description", product.description);
        productMap.put("shortDescription", product.shortDescription);
        productMap.put("slug", product.slug);
        productMap.put("sku", product.sku);
        productMap.put("price", product.price);
        productMap.put("comparePrice", product.comparePrice);
        productMap.put("categoryId", product.categoryId);
        productMap.put("tags", product.tags != null ? product.tags : List.of());
        productMap.put("images", product.images != null ? product.images : List.of());
        productMap.put("isActive", product.isActive);
        productMap.put("isFeatured", product.isFeatured);
        productMap.put("stockQuantity", product.stockQuantity);
        productMap.put("brand", product.brand);
        productMap.put("rating", product.rating);
        productMap.put("reviewCount", product.reviewCount);
        productMap.put("popularityScore", popularityScore); // ← ADDED: Same as Recommendation Service
        productMap.put("metadata", product.metadata);
        productMap.put("createdAt", product.createdAt);
        productMap.put("updatedAt", product.updatedAt);
        
        return productMap;
    }
}