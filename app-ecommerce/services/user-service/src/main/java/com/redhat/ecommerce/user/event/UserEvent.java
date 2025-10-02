package com.redhat.ecommerce.user.event;

import java.time.Instant;

/**
 * Base class for all user-related events
 * Follows event-driven microservices patterns
 */
public abstract class UserEvent {
    
    public String eventId;
    public String userId;
    public String eventType;
    public Instant timestamp;
    public String version = "1.0";
    
    protected UserEvent(String eventType, String userId) {
        this.eventId = java.util.UUID.randomUUID().toString();
        this.eventType = eventType;
        this.userId = userId;
        this.timestamp = Instant.now();
    }
    
    /**
     * User created event - published when new user registers via Keycloak
     */
    public static class UserCreated extends UserEvent {
        public String email;
        public String firstName;
        public String lastName;
        public String phone;
        
        public UserCreated(String userId, String email, String firstName, String lastName, String phone) {
            super("user.created", userId);
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.phone = phone;
        }
    }
    
    /**
     * User profile updated event
     */
    public static class UserUpdated extends UserEvent {
        public String email;
        public String firstName;
        public String lastName;
        public String phone;
        public UserPreferencesData preferences;
        
        public UserUpdated(String userId, String email, String firstName, String lastName, 
                          String phone, UserPreferencesData preferences) {
            super("user.updated", userId);
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.phone = phone;
            this.preferences = preferences;
        }
        
        public static class UserPreferencesData {
            public Boolean emailNotifications;
            public Boolean smsNotifications;
            public Boolean marketingEmails;
            public String preferredLanguage;
            public String timezone;
            
            public UserPreferencesData() {}
        }
    }
    
    /**
     * User deactivated event
     */
    public static class UserDeactivated extends UserEvent {
        public String reason;
        
        public UserDeactivated(String userId, String reason) {
            super("user.deactivated", userId);
            this.reason = reason;
        }
    }
    
    /**
     * User preferences changed event - for notification service
     */
    public static class UserPreferencesChanged extends UserEvent {
        public Boolean emailNotifications;
        public Boolean smsNotifications;
        public Boolean marketingEmails;
        public String preferredLanguage;
        
        public UserPreferencesChanged(String userId, Boolean emailNotifications, 
                                    Boolean smsNotifications, Boolean marketingEmails, 
                                    String preferredLanguage) {
            super("user.preferences.changed", userId);
            this.emailNotifications = emailNotifications;
            this.smsNotifications = smsNotifications;
            this.marketingEmails = marketingEmails;
            this.preferredLanguage = preferredLanguage;
        }
    }
}