package com.redhat.ecommerce.gateway.resource;

import com.redhat.ecommerce.gateway.service.ProxyService;
import io.smallrye.mutiny.Uni;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.time.Instant;
import java.util.Map;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "API Gateway", description = "Central gateway for microservices routing")
public class GatewayResource {
    
    private static final Logger LOG = Logger.getLogger(GatewayResource.class);
    
    @Inject
    ProxyService proxyService;
    
    // Health endpoint (public)
    @GET
    @Path("/health")
    @PermitAll
    @Operation(summary = "Gateway health check")
    @APIResponse(responseCode = "200", description = "Gateway is healthy")
    public Uni<Response> health() {
        return Uni.createFrom().item(() -> 
            Response.ok(Map.of(
                "status", "healthy",
                "service", "api-gateway",
                "timestamp", Instant.now(),
                "version", "1.0.0"
            )).build()
        );
    }
    
    // Root endpoint info
    @GET
    @PermitAll
    @Operation(summary = "Gateway information")
    @APIResponse(responseCode = "200", description = "Gateway info")
    public Uni<Response> info() {
        return Uni.createFrom().item(() -> 
            Response.ok(Map.of(
                "message", "E-commerce Platform API Gateway",
                "version", "1.0.0", 
                "status", "running",
                "timestamp", Instant.now(),
                "endpoints", Map.of(
                    "health", "/api/health",
                    "users", "/api/users",
                    "products", "/api/products",
                    "orders", "/api/orders",
                    "payments", "/api/payments",
                    "inventory", "/api/inventory",
                    "notifications", "/api/notifications",
                    "recommendations", "/api/recommendations"
                )
            )).build()
        );
    }
    
    // User Service Proxy
    @Path("/users")
    @RolesAllowed({"user", "admin"})
    @Operation(summary = "User service proxy")
    public Uni<Response> proxyUsers(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
        return proxyService.proxyRequest("user-service", uriInfo, headers);
    }
    
    // Product Service Proxy (public access for browsing)
    @GET
    @Path("/products/categories")
    @PermitAll
    @Operation(summary = "Get product categories (public)")
    public Uni<Response> getProductCategories() {
        return proxyService.proxyRequest("product-service", "/products/categories", null);
    }
    
    @GET
    @Path("/products")
    @PermitAll
    @Operation(summary = "List products (public)")
    public Uni<Response> listProducts(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
        String queryString = uriInfo.getRequestUri().getQuery();
        return proxyService.proxyRequestWithQueryParams("product-service", uriInfo.getPath(), queryString, headers);
    }
    
    @GET
    @Path("/products/{id}")
    @PermitAll
    @Operation(summary = "Get product details (public)")
    public Uni<Response> getProduct(@PathParam("id") String id, @Context HttpHeaders headers) {
        return proxyService.proxyRequest("product-service", "/products/" + id, headers);
    }
    
    // Order Service Proxy
    @Path("/orders")
    @RolesAllowed({"user", "admin"})
    @Operation(summary = "Order service proxy")
    public Uni<Response> proxyOrders(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
        return proxyService.proxyRequest("order-service", uriInfo, headers);
    }
    
    // Payment Service Proxy
    @Path("/payments")
    @RolesAllowed({"user", "admin"})
    @Operation(summary = "Payment service proxy")
    public Uni<Response> proxyPayments(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
        return proxyService.proxyRequest("payment-service", uriInfo, headers);
    }
    
    // Payment Methods Proxy
    @Path("/payment-methods")
    @RolesAllowed({"user", "admin"})
    @Operation(summary = "Payment methods service proxy")
    public Uni<Response> proxyPaymentMethods(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
        return proxyService.proxyRequest("payment-service", uriInfo, headers);
    }
    
    // Inventory Service Proxy
    @Path("/inventory")
    @RolesAllowed({"admin", "seller"})
    @Operation(summary = "Inventory service proxy")
    public Uni<Response> proxyInventory(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
        return proxyService.proxyRequest("inventory-service", uriInfo, headers);
    }
    
    // Notification Service Proxy
    @Path("/notifications")
    @RolesAllowed({"user", "admin"})
    @Operation(summary = "Notification service proxy")
    public Uni<Response> proxyNotifications(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
        return proxyService.proxyRequest("notification-service", uriInfo, headers);
    }
    
    // Recommendation Service Proxy
    @GET
    @Path("/recommendations/popular")
    @PermitAll
    @Operation(summary = "Get popular product recommendations (public)")
    public Uni<Response> getPopularRecommendations(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
        String queryString = uriInfo.getRequestUri().getQuery();
        return proxyService.proxyRequestWithQueryParams("recommendation-service", uriInfo.getPath(), queryString, headers);
    }
    
    @GET
    @Path("/recommendations")
    @RolesAllowed({"user", "admin"})
    @Operation(summary = "Get user recommendations")
    public Uni<Response> getUserRecommendations(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
        String queryString = uriInfo.getRequestUri().getQuery();
        return proxyService.proxyRequestWithQueryParams("recommendation-service", uriInfo.getPath(), queryString, headers);
    }
}