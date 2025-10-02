package com.redhat.ecommerce.order.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Command objects for Order aggregate - CQRS Write Side
 * Commands represent business intentions
 */
public abstract class OrderCommand {
    
    public String commandId = java.util.UUID.randomUUID().toString();
    public Instant timestamp = Instant.now();
    public String userId;
    
    protected OrderCommand(String userId) {
        this.userId = userId;
    }
    
    /**
     * Command to create a new order
     */
    public static class CreateOrder extends OrderCommand {
        @NotNull
        public List<OrderItem> items;
        
        @NotBlank
        public String shippingAddress;
        
        @NotBlank  
        public String billingAddress;
        
        public String notes;
        
        public CreateOrder(String userId, List<OrderItem> items, 
                          String shippingAddress, String billingAddress, String notes) {
            super(userId);
            this.items = items;
            this.shippingAddress = shippingAddress;
            this.billingAddress = billingAddress;
            this.notes = notes;
        }
        
        public static class OrderItem {
            @NotBlank
            public String productId;
            
            @Positive
            public Integer quantity;
            
            @NotNull
            @Positive
            public BigDecimal unitPrice;
            
            public OrderItem() {}
            
            public OrderItem(String productId, Integer quantity, BigDecimal unitPrice) {
                this.productId = productId;
                this.quantity = quantity;
                this.unitPrice = unitPrice;
            }
        }
    }
    
    /**
     * Command to update order status
     */
    public static class UpdateOrderStatus extends OrderCommand {
        @NotBlank
        public String orderId;
        
        @NotNull
        public OrderStatus newStatus;
        
        public String reason;
        public String updatedBy;
        
        public UpdateOrderStatus(String userId, String orderId, OrderStatus newStatus, 
                               String reason, String updatedBy) {
            super(userId);
            this.orderId = orderId;
            this.newStatus = newStatus;
            this.reason = reason;
            this.updatedBy = updatedBy;
        }
    }
    
    /**
     * Command to cancel order
     */
    public static class CancelOrder extends OrderCommand {
        @NotBlank
        public String orderId;
        
        @NotBlank
        public String reason;
        
        public Boolean refundRequested = false;
        
        public CancelOrder(String userId, String orderId, String reason, Boolean refundRequested) {
            super(userId);
            this.orderId = orderId;
            this.reason = reason;
            this.refundRequested = refundRequested;
        }
    }
    
    /**
     * Command to confirm payment for order
     */
    public static class ConfirmOrderPayment extends OrderCommand {
        @NotBlank
        public String orderId;
        
        @NotBlank
        public String paymentId;
        
        @NotNull
        @Positive
        public BigDecimal amount;
        
        public String paymentMethod;
        
        public ConfirmOrderPayment(String userId, String orderId, String paymentId, 
                                  BigDecimal amount, String paymentMethod) {
            super(userId);
            this.orderId = orderId;
            this.paymentId = paymentId;
            this.amount = amount;
            this.paymentMethod = paymentMethod;
        }
    }
    
    /**
     * Order status enumeration
     */
    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PAYMENT_PROCESSING,
        PAID,
        PREPARING,
        SHIPPED,
        DELIVERED,
        CANCELLED,
        REFUNDED
    }
}