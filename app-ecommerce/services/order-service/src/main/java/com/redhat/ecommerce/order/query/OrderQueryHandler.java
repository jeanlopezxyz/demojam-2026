package com.redhat.ecommerce.order.query;

import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/**
 * CQRS Query Handler for Order read model
 * Optimized for fast reads from denormalized data
 */
@ApplicationScoped  
public class OrderQueryHandler {
    
    private static final Logger LOG = Logger.getLogger(OrderQueryHandler.class);
    
    /**
     * Handle GetUserOrders query - optimized for user order history
     */
    public OrderQueryResult.UserOrdersResult handle(OrderQuery.GetUserOrders query) {
        LOG.debugf("Handling GetUserOrders query for user: %s", query.userId);
        
        // Build dynamic query based on filters
        StringBuilder jpql = new StringBuilder("userId = ?1");
        List<Object> params = List.of(query.userId);
        
        if (query.statusFilter != null && !query.statusFilter.isEmpty()) {
            jpql.append(" and status in (?2)");
            params = List.of(query.userId, query.statusFilter);
        }
        
        if (query.fromDate != null && query.toDate != null) {
            jpql.append(" and createdAt between ?").append(params.size() + 1).append(" and ?").append(params.size() + 2);
            params = List.of(params.toArray()).stream().toList();
            params.add(query.fromDate);
            params.add(query.toDate);
        }
        
        jpql.append(" order by ").append(query.sortBy).append(" ").append(query.sortDirection);
        
        List<OrderReadModel> orders = OrderReadModel.find(jpql.toString(), params.toArray())
                .page(query.page, query.size)
                .list();
        
        long totalCount = OrderReadModel.count("userId", query.userId);
        
        return new OrderQueryResult.UserOrdersResult(orders, totalCount, query.page, query.size);
    }
    
    /**
     * Handle GetOrderById query - single order with full details
     */
    public OrderQueryResult.OrderDetailsResult handle(OrderQuery.GetOrderById query) {
        LOG.debugf("Handling GetOrderById query: %s for user: %s", query.orderId, query.userId);
        
        OrderReadModel order = OrderReadModel.findByOrderId(query.orderId);
        
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + query.orderId);
        }
        
        // Security check - user can only see their own orders
        if (!order.userId.equals(query.userId)) {
            throw new SecurityException("Access denied to order: " + query.orderId);
        }
        
        return new OrderQueryResult.OrderDetailsResult(order);
    }
    
    /**
     * Handle GetOrderAnalytics query - user analytics
     */
    public OrderQueryResult.AnalyticsResult handle(OrderQuery.GetOrderAnalytics query) {
        LOG.debugf("Handling GetOrderAnalytics query for user: %s", query.userId);
        
        // Get user statistics
        Long orderCount = OrderReadModel.getOrderCountForUser(query.userId);
        BigDecimal totalRevenue = OrderReadModel.getTotalRevenueForUser(query.userId);
        BigDecimal averageOrderValue = orderCount > 0 ? 
            totalRevenue.divide(BigDecimal.valueOf(orderCount), 2, java.math.RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;
        
        // Get time series data
        List<Object[]> timeSeriesData = OrderReadModel.getOrderStatsByPeriod(query.fromDate, query.toDate);
        
        return new OrderQueryResult.AnalyticsResult(
            orderCount, totalRevenue, averageOrderValue, timeSeriesData);
    }
    
    /**
     * Handle GetOrderTracking query - real-time order status
     */
    public OrderQueryResult.TrackingResult handle(OrderQuery.GetOrderTracking query) {
        LOG.debugf("Handling GetOrderTracking query: %s", query.orderId);
        
        OrderReadModel order = OrderReadModel.findByOrderId(query.orderId);
        
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + query.orderId);
        }
        
        if (!order.userId.equals(query.userId)) {
            throw new SecurityException("Access denied to order: " + query.orderId);
        }
        
        // Calculate tracking information
        String trackingStatus = calculateTrackingStatus(order);
        Integer progressPercentage = calculateProgressPercentage(order.status);
        Instant estimatedDelivery = order.estimatedDelivery;
        
        return new OrderQueryResult.TrackingResult(
            order.orderId, order.status.name(), trackingStatus, 
            progressPercentage, estimatedDelivery);
    }
    
    /**
     * Handle admin queries - for admin dashboard
     */
    public OrderQueryResult.AdminOrdersResult handle(OrderQuery.GetOrdersForAdmin query) {
        LOG.debugf("Handling GetOrdersForAdmin query");
        
        StringBuilder jpql = new StringBuilder("1=1");
        List<Object> params = List.of();
        
        if (query.status != null) {
            jpql.append(" and status = ?").append(params.size() + 1);
            params.add(OrderReadModel.OrderStatus.valueOf(query.status));
        }
        
        if (query.searchTerm != null && !query.searchTerm.trim().isEmpty()) {
            jpql.append(" and (orderNumber like ?").append(params.size() + 1)
                .append(" or userEmail like ?").append(params.size() + 2).append(")");
            String searchPattern = "%" + query.searchTerm.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
        }
        
        jpql.append(" order by ").append(query.sortBy).append(" ").append(query.sortDirection);
        
        List<OrderReadModel> orders = OrderReadModel.find(jpql.toString(), params.toArray())
                .page(query.page, query.size)
                .list();
        
        long totalCount = OrderReadModel.count();
        
        return new OrderQueryResult.AdminOrdersResult(orders, totalCount, query.page, query.size);
    }
    
    private String calculateTrackingStatus(OrderReadModel order) {
        return switch (order.status) {
            case PENDING -> "Order received and being processed";
            case CONFIRMED -> "Order confirmed, preparing for shipment";
            case PAYMENT_PROCESSING -> "Processing payment";
            case PAID -> "Payment confirmed, preparing order";
            case PREPARING -> "Order is being prepared";
            case SHIPPED -> "Order shipped, in transit";
            case DELIVERED -> "Order delivered successfully";
            case CANCELLED -> "Order cancelled";
            case REFUNDED -> "Order refunded";
        };
    }
    
    private Integer calculateProgressPercentage(OrderReadModel.OrderStatus status) {
        return switch (status) {
            case PENDING -> 10;
            case CONFIRMED -> 25;
            case PAYMENT_PROCESSING -> 40;
            case PAID -> 50;
            case PREPARING -> 70;
            case SHIPPED -> 85;
            case DELIVERED -> 100;
            case CANCELLED, REFUNDED -> 0;
        };
    }
}