package com.redhat.ecommerce.gateway.security;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * CORS Filter for API Gateway
 * Handles CORS for both local development and OpenShift deployment
 */
@Provider
@Priority(Priorities.HEADER_DECORATOR)
public class CorsFilter implements ContainerRequestFilter, ContainerResponseFilter {
    
    private static final Logger LOG = Logger.getLogger(CorsFilter.class);
    
    @ConfigProperty(name = "frontend.url", defaultValue = "http://localhost:3000")
    String frontendUrl;
    
    @ConfigProperty(name = "quarkus.profile", defaultValue = "dev")
    String profile;
    
    private static final List<String> ALLOWED_ORIGINS_DEV = Arrays.asList(
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000"
    );
    
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String origin = requestContext.getHeaderString("Origin");
        String method = requestContext.getMethod();
        
        LOG.debugf("CORS Filter - Origin: %s, Method: %s, Profile: %s", origin, method, profile);
        
        // Handle preflight OPTIONS requests
        if ("OPTIONS".equals(method)) {
            LOG.debugf("Handling CORS preflight for origin: %s", origin);
        }
    }
    
    @Override
    public void filter(ContainerRequestContext requestContext, 
                      ContainerResponseContext responseContext) throws IOException {
        
        String origin = requestContext.getHeaderString("Origin");
        
        if (origin != null && isOriginAllowed(origin)) {
            // Set CORS headers
            responseContext.getHeaders().add("Access-Control-Allow-Origin", origin);
            responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");
            responseContext.getHeaders().add("Access-Control-Allow-Methods", 
                "GET,POST,PUT,DELETE,OPTIONS,PATCH");
            responseContext.getHeaders().add("Access-Control-Allow-Headers", 
                "Content-Type,Authorization,X-User-ID,X-User-Email,X-User-Name,X-User-Roles,X-Requested-With,Accept,Origin");
            responseContext.getHeaders().add("Access-Control-Expose-Headers", 
                "X-Gateway,X-Total-Count,X-Rate-Limit-Remaining");
            responseContext.getHeaders().add("Access-Control-Max-Age", "3600");
            
            LOG.debugf("CORS headers added for origin: %s", origin);
        } else if (origin != null) {
            LOG.warnf("CORS request denied for origin: %s", origin);
        }
    }
    
    private boolean isOriginAllowed(String origin) {
        if (origin == null) {
            return false;
        }
        
        LOG.debugf("Checking origin: %s, Profile: %s, Frontend URL: %s", origin, profile, frontendUrl);
        
        // Development mode - allow localhost variations AND real IP
        if ("dev".equals(profile)) {
            boolean isAllowed = ALLOWED_ORIGINS_DEV.stream().anyMatch(allowedOrigin -> origin.equals(allowedOrigin)) ||
                               origin.startsWith("http://localhost:") || 
                               origin.startsWith("http://127.0.0.1:") ||
                               origin.startsWith("http://10.0.10.3:") ||  // Real IP
                               origin.equals(frontendUrl);
            
            LOG.debugf("Development mode - Origin %s allowed: %s", origin, isAllowed);
            return isAllowed;
        }
        
        // Production mode - check against configured frontend URL and OpenShift patterns
        boolean allowed = origin.equals(frontendUrl) || 
                         origin.contains(".apps.cluster-tzfv6.tzfv6.sandbox1862.opentlc.com") ||
                         origin.startsWith("https://frontend-");
        
        LOG.debugf("Production mode - Origin %s allowed: %s", origin, allowed);
        return allowed;
    }
}