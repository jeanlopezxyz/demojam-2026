package com.redhat.ecommerce.gateway.security;

import io.quarkus.oidc.runtime.OidcJwtCallerPrincipal;
import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.HttpHeaders;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Processes user context from Keycloak JWT and creates secure headers for microservices
 */
@ApplicationScoped
public class UserContextProcessor {
    
    private static final Logger LOG = Logger.getLogger(UserContextProcessor.class);
    
    @Inject
    SecurityIdentity securityIdentity;
    
    @ConfigProperty(name = "gateway.security.shared-secret")
    String sharedSecret;
    
    /**
     * Process user context from Keycloak JWT and create secure headers
     */
    public Map<String, String> processUserContext(HttpHeaders headers) {
        Map<String, String> enhancedHeaders = new HashMap<>();
        
        try {
            if (securityIdentity.isAnonymous()) {
                LOG.debug("Anonymous request - no user context to process");
                return enhancedHeaders;
            }
            
            // Extract user information from Keycloak JWT
            if (securityIdentity.getPrincipal() instanceof OidcJwtCallerPrincipal jwtPrincipal) {
                JsonWebToken jwt = jwtPrincipal.getClaim("jwt");
                
                String userId = jwt.getSubject();
                String email = jwt.getClaim("email");
                String name = jwt.getClaim("name");
                String preferredUsername = jwt.getClaim("preferred_username");
                
                // Extract roles from realm_access
                List<String> roles = extractRoles(jwt);
                
                // Create timestamp for replay attack prevention
                String timestamp = String.valueOf(Instant.now().toEpochMilli());
                
                // Create user context data
                enhancedHeaders.put("X-User-ID", userId);
                enhancedHeaders.put("X-User-Email", email != null ? email : "");
                enhancedHeaders.put("X-User-Name", name != null ? name : (preferredUsername != null ? preferredUsername : ""));
                enhancedHeaders.put("X-User-Roles", String.join(",", roles));
                enhancedHeaders.put("X-Auth-Timestamp", timestamp);
                enhancedHeaders.put("X-Auth-Method", "keycloak");
                
                // Create HMAC signature to prevent header tampering
                String signature = createSignature(userId, timestamp);
                enhancedHeaders.put("X-Gateway-Signature", signature);
                
                LOG.debugf("Created user context for: %s (%s)", userId, email);
            }
            
        } catch (Exception e) {
            LOG.errorf("Error processing user context: %s", e.getMessage());
            // Continue without user context - some endpoints are public
        }
        
        return enhancedHeaders;
    }
    
    @SuppressWarnings("unchecked")
    private List<String> extractRoles(JsonWebToken jwt) {
        try {
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                Object rolesObj = realmAccess.get("roles");
                if (rolesObj instanceof List) {
                    return (List<String>) rolesObj;
                }
            }
        } catch (Exception e) {
            LOG.warnf("Could not extract roles from JWT: %s", e.getMessage());
        }
        return List.of("user"); // Default role
    }
    
    private String createSignature(String userId, String timestamp) {
        try {
            String data = userId + ":" + timestamp;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(sharedSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (Exception e) {
            LOG.errorf("Error creating signature: %s", e.getMessage());
            return "invalid-signature";
        }
    }
}