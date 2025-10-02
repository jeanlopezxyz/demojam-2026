package com.redhat.ecommerce.user.service;

import com.redhat.ecommerce.user.dto.UserUpdateRequest;
import com.redhat.ecommerce.user.model.User;
import com.redhat.ecommerce.user.security.UserContext;
import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class UserService {
    
    private static final Logger LOG = Logger.getLogger(UserService.class);
    
    /**
     * Find existing user or create from Keycloak context
     * This is called when user authenticates via Keycloak for the first time
     */
    @Transactional
    public User findOrCreateUser(UserContext userContext) {
        User user = User.findByKeycloakId(userContext.getId());
        
        if (user == null) {
            LOG.infof("Creating new user profile for Keycloak ID: %s", userContext.getId());
            
            user = new User();
            user.id = userContext.getId(); // Use Keycloak ID as primary key
            user.email = userContext.getEmail();
            
            // Parse name from Keycloak
            String fullName = userContext.getName();
            if (fullName != null && fullName.contains(" ")) {
                String[] nameParts = fullName.split(" ", 2);
                user.firstName = nameParts[0];
                user.lastName = nameParts[1];
            } else {
                user.firstName = fullName != null ? fullName : "User";
                user.lastName = "";
            }
            
            user.isActive = true;
            user.preferences = createDefaultPreferences();
            user.createdAt = Instant.now();
            user.updatedAt = Instant.now();
            
            user.persist();
            LOG.infof("Created user profile: %s (%s)", user.id, user.email);
        } else {
            // Update email if changed in Keycloak
            if (!user.email.equals(userContext.getEmail())) {
                user.email = userContext.getEmail();
                user.updatedAt = Instant.now();
                user.persist();
                LOG.infof("Updated email for user %s: %s", user.id, user.email);
            }
        }
        
        return user;
    }
    
    @Transactional
    public User updateUserProfile(String userId, UserUpdateRequest updateRequest) {
        User user = User.findByKeycloakId(userId);
        
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        
        // Update basic info
        if (updateRequest.firstName != null && !updateRequest.firstName.trim().isEmpty()) {
            user.firstName = updateRequest.firstName.trim();
        }
        
        if (updateRequest.lastName != null && !updateRequest.lastName.trim().isEmpty()) {
            user.lastName = updateRequest.lastName.trim();
        }
        
        if (updateRequest.phone != null) {
            user.phone = updateRequest.phone.trim().isEmpty() ? null : updateRequest.phone.trim();
        }
        
        // Update preferences
        if (updateRequest.preferences != null) {
            if (user.preferences == null) {
                user.preferences = createDefaultPreferences();
            }
            
            updatePreferences(user.preferences, updateRequest.preferences);
        }
        
        user.updatedAt = Instant.now();
        user.persist();
        
        LOG.infof("Updated user profile: %s", userId);
        return user;
    }
    
    @Transactional
    public boolean deleteUser(String userId) {
        User user = User.findByKeycloakId(userId);
        
        if (user != null) {
            // Soft delete - just deactivate
            user.deactivate();
            LOG.infof("Deactivated user: %s", userId);
            return true;
        }
        
        return false;
    }
    
    public List<User> getAllUsers(int page, int size) {
        return User.find("isActive = true order by createdAt desc")
                .page(page, size)
                .list();
    }
    
    public User getUserById(String userId) {
        return User.findByKeycloakId(userId);
    }
    
    private User.UserPreferences createDefaultPreferences() {
        return new User.UserPreferences(
            true,  // emailNotifications
            false, // smsNotifications  
            false, // marketingEmails
            "en",  // preferredLanguage
            "UTC"  // timezone
        );
    }
    
    private void updatePreferences(User.UserPreferences current, 
                                 UserUpdateRequest.UserPreferencesUpdateDto update) {
        if (update.emailNotifications != null) {
            current.emailNotifications = update.emailNotifications;
        }
        if (update.smsNotifications != null) {
            current.smsNotifications = update.smsNotifications;
        }
        if (update.marketingEmails != null) {
            current.marketingEmails = update.marketingEmails;
        }
        if (update.preferredLanguage != null && !update.preferredLanguage.trim().isEmpty()) {
            current.preferredLanguage = update.preferredLanguage.trim();
        }
        if (update.timezone != null && !update.timezone.trim().isEmpty()) {
            current.timezone = update.timezone.trim();
        }
    }
}