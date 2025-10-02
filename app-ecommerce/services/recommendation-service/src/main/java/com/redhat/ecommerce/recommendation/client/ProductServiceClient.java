package com.redhat.ecommerce.recommendation.client;

import io.smallrye.mutiny.Uni;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@RegisterRestClient(configKey = "product-service")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface ProductServiceClient {
    
    @GET
    @Path("/products")
    Uni<ProductApiResponse> getAllProducts(@QueryParam("limit") Integer limit);
    
    @GET
    @Path("/products/{id}")
    Uni<ProductApiResponse.Product> getProduct(@PathParam("id") String id);
    
    @GET
    @Path("/products")
    Uni<ProductApiResponse> getFeaturedProducts(@QueryParam("featured") boolean featured, @QueryParam("limit") Integer limit);
    
    // Response wrapper to match Product Service API structure
    class ProductApiResponse {
        public List<Product> data;
        public boolean success;
        public Pagination pagination;
        public String timestamp;
        
        public static class Product {
            public String id;
            public String name;
            public String description;
            public String slug;
            public String sku;
            public Double price;
            public String categoryId;
            public List<String> tags;
            public List<String> images;
            public Boolean isActive;
            public Boolean isFeatured;
            public Integer stockQuantity;
            public String brand;
            public Double rating;
            public Integer reviewCount;
            public String createdAt;
            public String updatedAt;
        }
        
        public static class Pagination {
            public Integer offset;
            public Integer total;
            public Integer limit;
        }
    }
}