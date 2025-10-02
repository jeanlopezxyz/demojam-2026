package com.redhat.ecommerce.order.command;

import com.redhat.ecommerce.order.event.OrderEvent;
import com.redhat.ecommerce.order.event.OrderEventPublisher;
import com.redhat.ecommerce.order.model.Order;
import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * CQRS Command Handler for Order aggregate
 * Handles business logic and publishes events
 */
@ApplicationScoped
public class OrderCommandHandler {
    
    private static final Logger LOG = Logger.getLogger(OrderCommandHandler.class);
    
    @Inject
    OrderEventPublisher eventPublisher;
    
    /**
     * Handle CreateOrder command
     * Business logic: Validate items, calculate totals, create order
     */
    @Transactional
    public String handle(OrderCommand.CreateOrder command) {
        LOG.infof("Handling CreateOrder command for user: %s", command.userId);
        
        try {
            // Validate command
            validateCreateOrderCommand(command);
            
            // Create order aggregate
            Order order = new Order();
            order.id = java.util.UUID.randomUUID().toString();
            order.userId = command.userId;
            order.orderNumber = generateOrderNumber();
            order.status = Order.OrderStatus.PENDING;
            order.shippingAddress = command.shippingAddress;
            order.billingAddress = command.billingAddress;
            order.notes = command.notes;
            order.createdAt = Instant.now();
            order.updatedAt = Instant.now();
            
            // Calculate totals
            BigDecimal totalAmount = calculateOrderTotal(command.items);
            order.totalAmount = totalAmount;
            order.itemCount = command.items.size();
            
            // Persist order (write model)
            order.persist();
            
            // Publish OrderCreated event (triggers read model update)
            eventPublisher.publishOrderCreated(order, command.items);
            
            LOG.infof("Order created successfully: %s (total: %s)", order.id, totalAmount);
            return order.id;
            
        } catch (Exception e) {
            LOG.errorf("Failed to create order: %s", e.getMessage());
            throw new RuntimeException("Failed to create order", e);
        }
    }
    
    /**
     * Handle UpdateOrderStatus command
     */
    @Transactional
    public void handle(OrderCommand.UpdateOrderStatus command) {
        LOG.infof("Handling UpdateOrderStatus command: %s -> %s", command.orderId, command.newStatus);
        
        Order order = Order.findById(command.orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + command.orderId);
        }
        
        // Validate status transition
        validateStatusTransition(order.status, Order.OrderStatus.valueOf(command.newStatus.name()));
        
        // Update order
        Order.OrderStatus oldStatus = order.status;
        order.status = Order.OrderStatus.valueOf(command.newStatus.name());
        order.updatedAt = Instant.now();
        
        if (command.newStatus == OrderCommand.OrderStatus.DELIVERED) {
            order.completedAt = Instant.now();
        }
        
        order.persist();
        
        // Publish OrderStatusUpdated event
        eventPublisher.publishOrderStatusUpdated(order.id, oldStatus, order.status, command.reason);
        
        LOG.infof("Order status updated: %s (%s -> %s)", order.id, oldStatus, order.status);
    }
    
    /**
     * Handle CancelOrder command
     */
    @Transactional
    public void handle(OrderCommand.CancelOrder command) {
        LOG.infof("Handling CancelOrder command: %s", command.orderId);
        
        Order order = Order.findById(command.orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + command.orderId);
        }
        
        // Validate cancellation is allowed
        if (!canCancelOrder(order.status)) {
            throw new IllegalStateException("Cannot cancel order in status: " + order.status);
        }
        
        // Update order
        Order.OrderStatus oldStatus = order.status;
        order.status = Order.OrderStatus.CANCELLED;
        order.updatedAt = Instant.now();
        order.cancelledAt = Instant.now();
        order.cancellationReason = command.reason;
        
        order.persist();
        
        // Publish OrderCancelled event
        eventPublisher.publishOrderCancelled(order.id, command.reason, command.refundRequested);
        
        LOG.infof("Order cancelled: %s (reason: %s)", order.id, command.reason);
    }
    
    private void validateCreateOrderCommand(OrderCommand.CreateOrder command) {
        if (command.items == null || command.items.isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one item");
        }
        
        for (OrderCommand.CreateOrder.OrderItem item : command.items) {
            if (item.quantity <= 0) {
                throw new IllegalArgumentException("Item quantity must be positive");
            }
            if (item.unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Item price must be positive");
            }
        }
    }
    
    private BigDecimal calculateOrderTotal(List<OrderCommand.CreateOrder.OrderItem> items) {
        return items.stream()
                .map(item -> item.unitPrice.multiply(BigDecimal.valueOf(item.quantity)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }
    
    private void validateStatusTransition(Order.OrderStatus from, Order.OrderStatus to) {
        // Define valid status transitions
        boolean isValidTransition = switch (from) {
            case PENDING -> to == Order.OrderStatus.CONFIRMED || to == Order.OrderStatus.CANCELLED;
            case CONFIRMED -> to == Order.OrderStatus.PAYMENT_PROCESSING || to == Order.OrderStatus.CANCELLED;
            case PAYMENT_PROCESSING -> to == Order.OrderStatus.PAID || to == Order.OrderStatus.CANCELLED;
            case PAID -> to == Order.OrderStatus.PREPARING || to == Order.OrderStatus.REFUNDED;
            case PREPARING -> to == Order.OrderStatus.SHIPPED;
            case SHIPPED -> to == Order.OrderStatus.DELIVERED;
            default -> false;
        };
        
        if (!isValidTransition) {
            throw new IllegalStateException(
                String.format("Invalid status transition: %s -> %s", from, to));
        }
    }
    
    private boolean canCancelOrder(Order.OrderStatus status) {
        return status == Order.OrderStatus.PENDING || 
               status == Order.OrderStatus.CONFIRMED ||
               status == Order.OrderStatus.PAYMENT_PROCESSING;
    }
}