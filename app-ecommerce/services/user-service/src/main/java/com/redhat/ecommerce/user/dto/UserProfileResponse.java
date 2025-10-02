package com.redhat.ecommerce.user.dto;

import com.redhat.ecommerce.user.model.User;

import java.time.Instant;

public class UserProfileResponse {
    
    public String id;
    public String email;
    public String firstName;
    public String lastName;
    public String phone;
    public Boolean isActive;
    public UserPreferencesDto preferences;
    public Instant createdAt;
    public Instant updatedAt;
    
    public UserProfileResponse() {}
    
    public UserProfileResponse(User user) {
        this.id = user.id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.phone = user.phone;
        this.isActive = user.isActive;
        this.preferences = user.preferences != null ? 
            new UserPreferencesDto(user.preferences) : new UserPreferencesDto();
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
    
    public static class UserPreferencesDto {
        public Boolean emailNotifications;
        public Boolean smsNotifications;
        public Boolean marketingEmails;
        public String preferredLanguage;
        public String timezone;
        
        public UserPreferencesDto() {}
        
        public UserPreferencesDto(User.UserPreferences preferences) {
            this.emailNotifications = preferences.emailNotifications;
            this.smsNotifications = preferences.smsNotifications;
            this.marketingEmails = preferences.marketingEmails;
            this.preferredLanguage = preferences.preferredLanguage;
            this.timezone = preferences.timezone;
        }
    }
}

public class UserUpdateRequest {
    
    public String firstName;
    public String lastName;
    public String phone;
    public UserPreferencesUpdateDto preferences;
    
    public UserUpdateRequest() {}
    
    public static class UserPreferencesUpdateDto {
        public Boolean emailNotifications;
        public Boolean smsNotifications;
        public Boolean marketingEmails;
        public String preferredLanguage;
        public String timezone;
        
        public UserPreferencesUpdateDto() {}
        
        public User.UserPreferences toEntity() {
            return new User.UserPreferences(
                emailNotifications,
                smsNotifications,
                marketingEmails,
                preferredLanguage,
                timezone
            );
        }
    }
}