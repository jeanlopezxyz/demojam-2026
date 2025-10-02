package com.redhat.ecommerce.user.security;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * Filter to extract user context from API Gateway headers
 * NO authentication logic - trusts API Gateway validation
 */
@Provider
@Priority(Priorities.AUTHENTICATION)
public class UserContextFilter implements ContainerRequestFilter {
    
    private static final Logger LOG = Logger.getLogger(UserContextFilter.class);
    
    private static final String USER_ID_HEADER = "x-user-id";
    private static final String USER_EMAIL_HEADER = "x-user-email";
    private static final String USER_NAME_HEADER = "x-user-name";
    private static final String USER_ROLES_HEADER = "x-user-roles";
    private static final String AUTH_TIMESTAMP_HEADER = "x-auth-timestamp";
    private static final String GATEWAY_SIGNATURE_HEADER = "x-gateway-signature";
    
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();
        
        // Skip health checks and public endpoints
        if (isPublicEndpoint(path)) {
            return;
        }
        
        // Verify request came through API Gateway
        String gatewaySignature = requestContext.getHeaderString(GATEWAY_SIGNATURE_HEADER);
        String timestamp = requestContext.getHeaderString(AUTH_TIMESTAMP_HEADER);
        
        if (gatewaySignature == null || timestamp == null) {
            LOG.warnf("Direct access attempt to protected endpoint: %s", path);
            requestContext.abortWith(
                Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Direct access forbidden. Use API Gateway.\"}")
                    .build()
            );
            return;
        }
        
        // Check timestamp (prevent replay attacks)
        try {
            long timestampMs = Long.parseLong(timestamp);
            long age = System.currentTimeMillis() - timestampMs;
            if (age > 300000) { // 5 minutes
                LOG.warnf("Expired authentication timestamp: %s", timestamp);
                requestContext.abortWith(
                    Response.status(Response.Status.FORBIDDEN)
                        .entity("{\"error\":\"Authentication expired\"}")
                        .build()
                );
                return;
            }
        } catch (NumberFormatException e) {
            LOG.errorf("Invalid timestamp format: %s", timestamp);
            requestContext.abortWith(
                Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Invalid authentication timestamp\"}")
                    .build()
            );
            return;
        }
        
        // Extract user context from headers
        String userId = requestContext.getHeaderString(USER_ID_HEADER);
        String email = requestContext.getHeaderString(USER_EMAIL_HEADER);
        String name = requestContext.getHeaderString(USER_NAME_HEADER);
        String rolesStr = requestContext.getHeaderString(USER_ROLES_HEADER);
        
        if (userId != null) {
            // Parse roles
            List<String> roles = parseRoles(rolesStr);
            
            // Create user context and inject into request
            UserContext userContext = new UserContext(userId, email, name, roles, 
                                                     Instant.ofEpochMilli(Long.parseLong(timestamp)));
            requestContext.setProperty("userContext", userContext);
            
            LOG.debugf("User context extracted: %s (%s)", userContext.getId(), userContext.getEmail());
        } else if (requiresAuthentication(path)) {
            LOG.warnf("Authentication required for endpoint: %s", path);
            requestContext.abortWith(
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Authentication required\"}")
                    .build()
            );
        }
    }
    
    private boolean isPublicEndpoint(String path) {
        return path.equals("health") || 
               path.startsWith("q/") ||
               path.equals("") ||
               path.equals("/");
    }
    
    private boolean requiresAuthentication(String path) {
        // Most user service endpoints require authentication
        return !isPublicEndpoint(path);
    }
    
    private List<String> parseRoles(String rolesStr) {
        if (rolesStr == null || rolesStr.trim().isEmpty()) {
            return List.of();
        }
        
        try {
            // Parse JSON array format: ["role1", "role2"]
            String cleaned = rolesStr.replaceAll("[\\[\\]\"]", "");
            return Arrays.asList(cleaned.split(",\\s*"));
        } catch (Exception e) {
            LOG.warnf("Failed to parse roles: %s", rolesStr);
            return List.of();
        }
    }
}