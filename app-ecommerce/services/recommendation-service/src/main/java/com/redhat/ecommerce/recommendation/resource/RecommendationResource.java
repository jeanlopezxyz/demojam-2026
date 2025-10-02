package com.redhat.ecommerce.recommendation.resource;

import com.redhat.ecommerce.recommendation.dto.RecommendationResponse;
import com.redhat.ecommerce.recommendation.model.UserBehavior;
import com.redhat.ecommerce.recommendation.service.RecommendationService;
import io.smallrye.mutiny.Uni;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/recommendations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Recommendations", description = "Product recommendation APIs")
public class RecommendationResource {
    
    private static final Logger LOG = Logger.getLogger(RecommendationResource.class);
    
    @Inject
    RecommendationService recommendationService;
    
    @GET
    @Path("/user/{userId}")
    @Operation(summary = "Get personalized recommendations for user")
    @APIResponse(responseCode = "200", description = "User recommendations retrieved successfully")
    @APIResponse(responseCode = "404", description = "User not found")
    @RolesAllowed({"user", "admin"})
    public Uni<Response> getUserRecommendations(
            @Parameter(description = "User ID") @PathParam("userId") String userId,
            @Parameter(description = "Number of recommendations") @QueryParam("limit") @DefaultValue("10") int limit) {
        
        return Uni.createFrom().item(() -> {
            LOG.infof("Getting recommendations for user: %s (limit: %d)", userId, limit);
            
            List<RecommendationResponse> recommendations = 
                recommendationService.getUserRecommendations(userId, limit);
            
            RecommendationResponse.UserRecommendationsResponse response = 
                new RecommendationResponse.UserRecommendationsResponse(userId, recommendations);
                
            return Response.ok(response).build();
        });
    }
    
    @GET
    @Path("/product/{productId}/similar")
    @Operation(summary = "Get products similar to the given product")
    @APIResponse(responseCode = "200", description = "Similar products retrieved successfully")
    public Uni<Response> getSimilarProducts(
            @Parameter(description = "Product ID") @PathParam("productId") String productId,
            @Parameter(description = "Number of similar products") @QueryParam("limit") @DefaultValue("5") int limit) {
        
        return Uni.createFrom().item(() -> {
            LOG.infof("Getting similar products for: %s (limit: %d)", productId, limit);
            
            List<RecommendationResponse> similar = 
                recommendationService.getSimilarProducts(productId, limit);
                
            return Response.ok(Map.of(
                "productId", productId,
                "similarProducts", similar,
                "count", similar.size()
            )).build();
        });
    }
    
    @GET
    @Path("/popular")
    @Operation(summary = "Get popular/trending products")
    @APIResponse(responseCode = "200", description = "Popular products retrieved successfully")
    public Uni<Response> getPopularProducts(
            @Parameter(description = "Number of popular products") @QueryParam("limit") @DefaultValue("20") int limit) {
        
        LOG.infof("Getting popular products (limit: %d)", limit);
        
        return recommendationService.getPopularProducts(limit)
            .onItem().transform(popular -> {
                RecommendationResponse.PopularProductsResponse response = 
                    new RecommendationResponse.PopularProductsResponse(popular);
                return Response.ok(response).build();
            })
            .onFailure().recoverWithItem(throwable -> {
                LOG.errorf("Error getting popular products: %s", throwable.getMessage());
                return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(Map.of("error", "Recommendation service temporarily unavailable"))
                    .build();
            });
    }
    
    @POST
    @Path("/track")
    @Operation(summary = "Track user behavior for recommendation engine")
    @APIResponse(responseCode = "201", description = "Behavior tracked successfully")
    @APIResponse(responseCode = "400", description = "Invalid behavior data")
    @RolesAllowed({"user", "admin"})
    public Uni<Response> trackBehavior(
            @Parameter(description = "User ID from token") @HeaderParam("X-User-ID") String userId,
            RecommendationResponse.TrackingRequest request) {
        
        return Uni.createFrom().item(() -> {
            LOG.infof("Tracking behavior for user %s: %s on product %s", 
                     userId, request.behaviorType, request.productId);
            
            try {
                UserBehavior.BehaviorType behaviorType = 
                    UserBehavior.BehaviorType.valueOf(request.behaviorType.toUpperCase());
                
                recommendationService.trackUserBehavior(
                    userId, request.productId, behaviorType, 
                    request.rating, request.sessionId, request.duration);
                
                return Response.status(Response.Status.CREATED)
                        .entity(Map.of(
                            "success", true,
                            "message", "Behavior tracked successfully",
                            "userId", userId,
                            "productId", request.productId,
                            "behaviorType", request.behaviorType
                        )).build();
                        
            } catch (IllegalArgumentException e) {
                LOG.errorf("Invalid behavior type: %s", request.behaviorType);
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of(
                            "success", false,
                            "message", "Invalid behavior type: " + request.behaviorType,
                            "validTypes", UserBehavior.BehaviorType.values()
                        )).build();
            } catch (Exception e) {
                LOG.errorf("Error tracking behavior: %s", e.getMessage());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity(Map.of(
                            "success", false,
                            "message", "Failed to track behavior"
                        )).build();
            }
        });
    }
    
    @GET
    @Path("/user/{userId}/stats")
    @Operation(summary = "Get user behavior statistics")
    @APIResponse(responseCode = "200", description = "User stats retrieved successfully")
    @RolesAllowed({"user", "admin"})
    public Uni<Response> getUserStats(@PathParam("userId") String userId) {
        
        return Uni.createFrom().item(() -> {
            LOG.infof("Getting stats for user: %s", userId);
            
            List<UserBehavior> behaviors = UserBehavior.findByUserId(userId);
            
            Map<UserBehavior.BehaviorType, Long> behaviorCounts = behaviors.stream()
                    .collect(Collectors.groupingBy(
                        b -> b.behaviorType,
                        Collectors.counting()
                    ));
            
            return Response.ok(Map.of(
                "userId", userId,
                "totalInteractions", behaviors.size(),
                "behaviorBreakdown", behaviorCounts,
                "lastActivity", behaviors.stream()
                    .map(b -> b.timestamp)
                    .max(java.time.Instant::compareTo)
                    .orElse(null)
            )).build();
        });
    }
}