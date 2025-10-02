package com.redhat.ecommerce.order.query;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Query objects for Order aggregate - CQRS Read Side
 * Queries represent information needs
 */
public abstract class OrderQuery {
    
    /**
     * Query to get orders for a specific user
     */
    public static class GetUserOrders {
        public String userId;
        public Integer page = 0;
        public Integer size = 20;
        public String sortBy = "createdAt";
        public String sortDirection = "DESC";
        public List<String> statusFilter;
        public Instant fromDate;
        public Instant toDate;
        
        public GetUserOrders(String userId) {
            this.userId = userId;
        }
    }
    
    /**
     * Query to get order details by ID
     */
    public static class GetOrderById {
        public String orderId;
        public String userId; // For security - user can only see their orders
        
        public GetOrderById(String orderId, String userId) {
            this.orderId = orderId;
            this.userId = userId;
        }
    }
    
    /**
     * Query for order analytics and reports
     */
    public static class GetOrderAnalytics {
        public String userId;
        public Instant fromDate;
        public Instant toDate;
        public String groupBy = "day"; // day, week, month
        public List<String> metrics = List.of("count", "totalValue", "averageValue");
        
        public GetOrderAnalytics(String userId, Instant fromDate, Instant toDate) {
            this.userId = userId;
            this.fromDate = fromDate;
            this.toDate = toDate;
        }
    }
    
    /**
     * Query for order tracking information
     */
    public static class GetOrderTracking {
        public String orderId;
        public String userId;
        public Boolean includeEvents = true;
        
        public GetOrderTracking(String orderId, String userId) {
            this.orderId = orderId;
            this.userId = userId;
        }
    }
    
    /**
     * Admin query for order management
     */
    public static class GetOrdersForAdmin {
        public Integer page = 0;
        public Integer size = 50;
        public String status;
        public String searchTerm;
        public Instant fromDate;
        public Instant toDate;
        public String sortBy = "createdAt";
        public String sortDirection = "DESC";
        
        public GetOrdersForAdmin() {}
    }
    
    /**
     * Query for order statistics
     */
    public static class GetOrderStatistics {
        public String period = "last30days"; // today, last7days, last30days, last90days
        public String groupBy = "day";
        public List<String> metrics = List.of("orderCount", "revenue", "averageOrderValue");
        
        public GetOrderStatistics() {}
    }
}