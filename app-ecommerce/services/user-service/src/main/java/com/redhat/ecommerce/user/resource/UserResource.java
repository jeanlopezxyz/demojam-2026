package com.redhat.ecommerce.user.resource;

import com.redhat.ecommerce.user.dto.UserProfileResponse;
import com.redhat.ecommerce.user.dto.UserUpdateRequest;
import com.redhat.ecommerce.user.model.User;
import com.redhat.ecommerce.user.security.UserContext;
import com.redhat.ecommerce.user.service.UserService;
import io.smallrye.mutiny.Uni;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.ContainerRequestContext;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Users", description = "User profile management APIs")
public class UserResource {
    
    private static final Logger LOG = Logger.getLogger(UserResource.class);
    
    @Inject
    UserService userService;
    
    @GET
    @Path("/profile")
    @Operation(summary = "Get current user profile")
    @APIResponse(responseCode = "200", description = "User profile retrieved successfully")
    @APIResponse(responseCode = "404", description = "User not found")
    public Uni<Response> getCurrentUserProfile(@Context ContainerRequestContext requestContext) {
        
        return Uni.createFrom().item(() -> {
            UserContext userContext = getUserContext(requestContext);
            LOG.infof("Getting profile for user: %s", userContext.getId());
            
            User user = userService.findOrCreateUser(userContext);
            UserProfileResponse response = new UserProfileResponse(user);
            
            return Response.ok(Map.of(
                "success", true,
                "data", response
            )).build();
        });
    }
    
    @PUT
    @Path("/profile")
    @Operation(summary = "Update current user profile")
    @APIResponse(responseCode = "200", description = "Profile updated successfully")
    @APIResponse(responseCode = "400", description = "Invalid profile data")
    public Uni<Response> updateCurrentUserProfile(
            @Context ContainerRequestContext requestContext,
            @Valid UserUpdateRequest updateRequest) {
        
        return Uni.createFrom().item(() -> {
            UserContext userContext = getUserContext(requestContext);
            LOG.infof("Updating profile for user: %s", userContext.getId());
            
            try {
                User updatedUser = userService.updateUserProfile(userContext.getId(), updateRequest);
                UserProfileResponse response = new UserProfileResponse(updatedUser);
                
                return Response.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "data", response
                )).build();
                
            } catch (IllegalArgumentException e) {
                LOG.errorf("Invalid profile update data: %s", e.getMessage());
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of(
                            "success", false,
                            "message", e.getMessage()
                        )).build();
            } catch (Exception e) {
                LOG.errorf("Error updating profile: %s", e.getMessage());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity(Map.of(
                            "success", false,
                            "message", "Failed to update profile"
                        )).build();
            }
        });
    }
    
    @DELETE
    @Path("/profile")
    @Operation(summary = "Delete current user profile")
    @APIResponse(responseCode = "200", description = "Profile deleted successfully")
    public Uni<Response> deleteCurrentUserProfile(@Context ContainerRequestContext requestContext) {
        
        return Uni.createFrom().item(() -> {
            UserContext userContext = getUserContext(requestContext);
            LOG.infof("Deleting profile for user: %s", userContext.getId());
            
            boolean deleted = userService.deleteUser(userContext.getId());
            
            if (deleted) {
                return Response.ok(Map.of(
                    "success", true,
                    "message", "Profile deleted successfully"
                )).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of(
                            "success", false,
                            "message", "User not found"
                        )).build();
            }
        });
    }
    
    // Admin endpoints
    @GET
    @Path("/admin/users")
    @Operation(summary = "Get all users (admin only)")
    @APIResponse(responseCode = "200", description = "Users retrieved successfully")
    @RolesAllowed("admin")
    public Uni<Response> getAllUsers(
            @Parameter(description = "Page number") @QueryParam("page") @DefaultValue("0") int page,
            @Parameter(description = "Page size") @QueryParam("size") @DefaultValue("20") int size) {
        
        return Uni.createFrom().item(() -> {
            LOG.infof("Admin request: Getting all users (page: %d, size: %d)", page, size);
            
            List<User> users = userService.getAllUsers(page, size);
            long totalCount = User.count();
            
            return Response.ok(Map.of(
                "success", true,
                "data", users.stream().map(UserProfileResponse::new).toList(),
                "pagination", Map.of(
                    "page", page,
                    "size", size,
                    "total", totalCount,
                    "totalPages", (totalCount + size - 1) / size
                )
            )).build();
        });
    }
    
    @GET
    @Path("/admin/users/{userId}")
    @Operation(summary = "Get user by ID (admin only)")
    @APIResponse(responseCode = "200", description = "User retrieved successfully")
    @APIResponse(responseCode = "404", description = "User not found")
    @RolesAllowed("admin")
    public Uni<Response> getUserById(@PathParam("userId") String userId) {
        
        return Uni.createFrom().item(() -> {
            LOG.infof("Admin request: Getting user by ID: %s", userId);
            
            User user = User.findByKeycloakId(userId);
            
            if (user != null) {
                UserProfileResponse response = new UserProfileResponse(user);
                return Response.ok(Map.of(
                    "success", true,
                    "data", response
                )).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of(
                            "success", false,
                            "message", "User not found"
                        )).build();
            }
        });
    }
    
    @GET
    @Path("/health")
    @Operation(summary = "Service health check")
    @APIResponse(responseCode = "200", description = "Service is healthy")
    public Uni<Response> healthCheck() {
        return Uni.createFrom().item(() -> 
            Response.ok(Map.of(
                "status", "healthy",
                "service", "user-service",
                "timestamp", Instant.now(),
                "version", "1.0.0"
            )).build()
        );
    }
    
    private UserContext getUserContext(ContainerRequestContext requestContext) {
        UserContext context = (UserContext) requestContext.getProperty("userContext");
        if (context == null) {
            throw new WebApplicationException("User context not found", Response.Status.UNAUTHORIZED);
        }
        return context;
    }
}