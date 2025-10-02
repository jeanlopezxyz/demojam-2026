package com.redhat.ecommerce.order.query;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * CQRS Read Model for Orders - Optimized for queries
 * Denormalized data for fast reads, updated via events
 */
@Entity
@Table(name = "order_read_model")
public class OrderReadModel extends PanacheEntityBase {
    
    @Id
    public String orderId;
    
    // User information (denormalized)
    @Column(name = "user_id")
    public String userId;
    
    @Column(name = "user_email")
    public String userEmail;
    
    @Column(name = "user_name")
    public String userName;
    
    // Order information
    @Column(name = "order_number")
    public String orderNumber;
    
    @Enumerated(EnumType.STRING)
    public OrderStatus status;
    
    @Column(name = "total_amount")
    public BigDecimal totalAmount;
    
    @Column(name = "item_count")
    public Integer itemCount;
    
    @Column(name = "currency")
    public String currency = "USD";
    
    // Shipping information (denormalized)
    @Column(name = "shipping_address")
    public String shippingAddress;
    
    @Column(name = "shipping_method")
    public String shippingMethod;
    
    @Column(name = "shipping_cost")
    public BigDecimal shippingCost;
    
    @Column(name = "estimated_delivery")
    public Instant estimatedDelivery;
    
    // Payment information (denormalized)
    @Column(name = "payment_status")
    public String paymentStatus;
    
    @Column(name = "payment_method")
    public String paymentMethod;
    
    @Column(name = "payment_id")
    public String paymentId;
    
    // Timestamps
    @Column(name = "created_at")
    public Instant createdAt;
    
    @Column(name = "updated_at")
    public Instant updatedAt;
    
    @Column(name = "completed_at")
    public Instant completedAt;
    
    // Optimized finder methods for queries
    public static List<OrderReadModel> findByUserId(String userId) {
        return list("userId = ?1 order by createdAt desc", userId);
    }
    
    public static List<OrderReadModel> findByUserIdAndStatus(String userId, OrderStatus status) {
        return list("userId = ?1 and status = ?2 order by createdAt desc", userId, status);
    }
    
    public static List<OrderReadModel> findByStatus(OrderStatus status) {
        return list("status = ?1 order by createdAt desc", status);
    }
    
    public static List<OrderReadModel> findRecentOrders(String userId, int limit) {
        return find("userId = ?1 order by createdAt desc", userId)
                .page(0, limit)
                .list();
    }
    
    public static OrderReadModel findByOrderId(String orderId) {
        return find("orderId", orderId).firstResult();
    }
    
    // Analytics queries
    public static BigDecimal getTotalRevenueForUser(String userId) {
        return (BigDecimal) find("select sum(o.totalAmount) from OrderReadModel o where o.userId = ?1 and o.status in (?2)", 
                                userId, List.of(OrderStatus.DELIVERED, OrderStatus.PAID))
                .project(BigDecimal.class)
                .firstResult();
    }
    
    public static Long getOrderCountForUser(String userId) {
        return count("userId = ?1", userId);
    }
    
    public static List<Object[]> getOrderStatsByPeriod(Instant fromDate, Instant toDate) {
        return find("select date_trunc('day', o.createdAt) as day, count(*) as orderCount, sum(o.totalAmount) as revenue " +
                   "from OrderReadModel o where o.createdAt between ?1 and ?2 " +
                   "group by date_trunc('day', o.createdAt) order by day desc", fromDate, toDate)
                .project(Object[].class)
                .list();
    }
    
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