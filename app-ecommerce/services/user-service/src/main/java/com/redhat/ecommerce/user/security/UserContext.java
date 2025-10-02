package com.redhat.ecommerce.user.security;

import java.time.Instant;
import java.util.List;

/**
 * User context extracted from API Gateway headers
 * Contains user information validated by Keycloak
 */
public class UserContext {
    
    private final String id;
    private final String email;
    private final String name;
    private final List<String> roles;
    private final Instant authenticatedAt;
    
    public UserContext(String id, String email, String name, List<String> roles, Instant authenticatedAt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.roles = roles != null ? roles : List.of();
        this.authenticatedAt = authenticatedAt;
    }
    
    public String getId() {
        return id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getName() {
        return name;
    }
    
    public List<String> getRoles() {
        return roles;
    }
    
    public Instant getAuthenticatedAt() {
        return authenticatedAt;
    }
    
    public boolean hasRole(String role) {
        return roles.contains(role);
    }
    
    public boolean isAdmin() {
        return hasRole("admin");
    }
    
    public boolean isUser() {
        return hasRole("user");
    }
    
    @Override
    public String toString() {
        return "UserContext{" +
                "id='" + id + '\'' +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", roles=" + roles +
                ", authenticatedAt=" + authenticatedAt +
                '}';
    }
}