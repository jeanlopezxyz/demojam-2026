package com.redhat.ecommerce.user.event;

import io.smallrye.reactive.messaging.annotations.Broadcast;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Event publisher for user-related events
 * Uses OpenShift Streams for Apache Kafka
 */
@ApplicationScoped
public class UserEventPublisher {
    
    private static final Logger LOG = Logger.getLogger(UserEventPublisher.class);
    
    @Inject
    @Channel("user-events")
    @Broadcast
    Emitter<UserEvent> userEventEmitter;
    
    /**
     * Publish user created event
     * Consumed by: notification-service, recommendation-service
     */
    public void publishUserCreated(String userId, String email, String firstName, String lastName, String phone) {
        UserEvent.UserCreated event = new UserEvent.UserCreated(userId, email, firstName, lastName, phone);
        
        try {
            userEventEmitter.send(event);
            LOG.infof("Published UserCreated event: %s (%s)", userId, email);
        } catch (Exception e) {
            LOG.errorf("Failed to publish UserCreated event for user %s: %s", userId, e.getMessage());
            throw new RuntimeException("Failed to publish user created event", e);
        }
    }
    
    /**
     * Publish user updated event  
     * Consumed by: notification-service, recommendation-service
     */
    public void publishUserUpdated(String userId, String email, String firstName, String lastName, 
                                  String phone, UserEvent.UserUpdated.UserPreferencesData preferences) {
        UserEvent.UserUpdated event = new UserEvent.UserUpdated(userId, email, firstName, lastName, phone, preferences);
        
        try {
            userEventEmitter.send(event);
            LOG.infof("Published UserUpdated event: %s", userId);
        } catch (Exception e) {
            LOG.errorf("Failed to publish UserUpdated event for user %s: %s", userId, e.getMessage());
            throw new RuntimeException("Failed to publish user updated event", e);
        }
    }
    
    /**
     * Publish user deactivated event
     * Consumed by: order-service, payment-service, notification-service
     */
    public void publishUserDeactivated(String userId, String reason) {
        UserEvent.UserDeactivated event = new UserEvent.UserDeactivated(userId, reason);
        
        try {
            userEventEmitter.send(event);
            LOG.infof("Published UserDeactivated event: %s (reason: %s)", userId, reason);
        } catch (Exception e) {
            LOG.errorf("Failed to publish UserDeactivated event for user %s: %s", userId, e.getMessage());
            throw new RuntimeException("Failed to publish user deactivated event", e);
        }
    }
    
    /**
     * Publish user preferences changed event
     * Consumed by: notification-service
     */
    public void publishUserPreferencesChanged(String userId, Boolean emailNotifications, 
                                            Boolean smsNotifications, Boolean marketingEmails, 
                                            String preferredLanguage) {
        UserEvent.UserPreferencesChanged event = new UserEvent.UserPreferencesChanged(
            userId, emailNotifications, smsNotifications, marketingEmails, preferredLanguage);
        
        try {
            userEventEmitter.send(event);
            LOG.infof("Published UserPreferencesChanged event: %s", userId);
        } catch (Exception e) {
            LOG.errorf("Failed to publish UserPreferencesChanged event for user %s: %s", userId, e.getMessage());
            // Don't throw for preference changes - not critical
        }
    }
}