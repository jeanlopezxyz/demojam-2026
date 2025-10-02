package com.redhat.ecommerce.user.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "users")
public class User extends PanacheEntityBase {
    
    @Id
    @Column(name = "id")
    public String id; // Keycloak user ID
    
    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    public String email;
    
    @NotBlank
    @Column(name = "first_name")
    public String firstName;
    
    @NotBlank
    @Column(name = "last_name")  
    public String lastName;
    
    @Column(name = "phone")
    public String phone;
    
    @Column(name = "is_active")
    public Boolean isActive = true;
    
    @Embedded
    public UserPreferences preferences;
    
    @CreationTimestamp
    @Column(name = "created_at")
    public Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    public Instant updatedAt;
    
    // Panache finder methods
    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
    
    public static User findByKeycloakId(String keycloakId) {
        return find("id", keycloakId).firstResult();
    }
    
    public static List<User> findActiveUsers() {
        return list("isActive", true);
    }
    
    public static long countActiveUsers() {
        return count("isActive", true);
    }
    
    // Business methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public void activate() {
        this.isActive = true;
        this.persist();
    }
    
    public void deactivate() {
        this.isActive = false;
        this.persist();
    }
    
    public void updatePreferences(UserPreferences newPreferences) {
        this.preferences = newPreferences;
        this.persist();
    }
    
    @Embeddable
    public static class UserPreferences {
        @Column(name = "email_notifications")
        public Boolean emailNotifications = true;
        
        @Column(name = "sms_notifications")
        public Boolean smsNotifications = false;
        
        @Column(name = "marketing_emails")
        public Boolean marketingEmails = false;
        
        @Column(name = "preferred_language")
        public String preferredLanguage = "en";
        
        @Column(name = "timezone")
        public String timezone = "UTC";
        
        public UserPreferences() {}
        
        // Java 25 - More flexible constructor patterns
        public UserPreferences(Boolean emailNotifications, Boolean smsNotifications, 
                             Boolean marketingEmails) {
            this(emailNotifications, smsNotifications, marketingEmails, "en", "UTC");
        }
        
        public UserPreferences(Boolean emailNotifications, Boolean smsNotifications, 
                             Boolean marketingEmails, String preferredLanguage, String timezone) {
            this.emailNotifications = emailNotifications;
            this.smsNotifications = smsNotifications;
            this.marketingEmails = marketingEmails;
            this.preferredLanguage = preferredLanguage;
            this.timezone = timezone;
        }
    }
}