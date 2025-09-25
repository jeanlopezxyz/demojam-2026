# REST APIs Documentation

## API Gateway Overview

All external API requests go through our centralized API Gateway at `http://localhost:8080` (development) or `https://api.ecommerce.company.com` (production).

## Authentication

### **JWT Token Authentication**
```bash
# Login to get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}

# Use token in subsequent requests
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:8080/api/users/profile
```

## User Management API

### **Base URL**: `/api/users`

### **Authentication Endpoints**
```bash
# Register new user
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

# Login user
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Refresh token
POST /api/auth/refresh
{
  "refreshToken": "refresh_token_here"
}

# Logout
POST /api/auth/logout
```

### **User Profile Endpoints**
```bash
# Get user profile
GET /api/users/profile
Authorization: Bearer {token}

# Update user profile
PUT /api/users/profile
Authorization: Bearer {token}
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}

# Change password
POST /api/users/change-password
Authorization: Bearer {token}
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword"
}
```

## Product Catalog API

### **Base URL**: `/api/products`

### **Product Endpoints**
```bash
# Get all products (with pagination)
GET /api/products?page=1&limit=20&category=electronics&minPrice=100&maxPrice=500

# Search products
GET /api/products/search?q=laptop&category=electronics&sort=price

# Get product by ID
GET /api/products/123

# Get featured products
GET /api/products/featured

# Get product reviews
GET /api/products/123/reviews
```

### **Category Endpoints**
```bash
# Get all categories
GET /api/categories

# Get category tree
GET /api/categories/tree

# Get products in category
GET /api/categories/123/products
```

### **Admin Endpoints** (Authentication Required)
```bash
# Create product
POST /api/products
Authorization: Bearer {admin_token}
{
  "name": "MacBook Pro",
  "description": "High-performance laptop",
  "category": "electronics",
  "price": 1999.99,
  "attributes": {
    "brand": "Apple",
    "model": "M3 Pro",
    "storage": "512GB"
  }
}

# Update product
PUT /api/products/123
Authorization: Bearer {admin_token}

# Delete product
DELETE /api/products/123
Authorization: Bearer {admin_token}
```

## Order Management API

### **Base URL**: `/api/orders`

### **Shopping Cart**
```bash
# Get user's cart
GET /api/cart
Authorization: Bearer {token}

# Add item to cart
POST /api/cart/items
Authorization: Bearer {token}
{
  "productId": 123,
  "quantity": 2,
  "selectedAttributes": {
    "size": "L",
    "color": "blue"
  }
}

# Update cart item
PUT /api/cart/items/456
Authorization: Bearer {token}
{
  "quantity": 3
}

# Remove item from cart
DELETE /api/cart/items/456
Authorization: Bearer {token}
```

### **Order Processing**
```bash
# Create order from cart
POST /api/orders
Authorization: Bearer {token}
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "US"
  },
  "paymentMethod": "stripe_card_123"
}

# Get user's orders
GET /api/orders?status=completed&page=1&limit=10
Authorization: Bearer {token}

# Get order details
GET /api/orders/789
Authorization: Bearer {token}

# Cancel order
POST /api/orders/789/cancel
Authorization: Bearer {token}
```

## Payment Processing API

### **Base URL**: `/api/payments`

### **Payment Methods**
```bash
# Get user's payment methods
GET /api/payments/methods
Authorization: Bearer {token}

# Add payment method
POST /api/payments/methods
Authorization: Bearer {token}
{
  "type": "card",
  "stripeTokenId": "tok_visa",
  "billingAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  }
}

# Delete payment method
DELETE /api/payments/methods/123
Authorization: Bearer {token}
```

### **Payment Processing**
```bash
# Process payment
POST /api/payments/process
Authorization: Bearer {token}
{
  "orderId": 789,
  "paymentMethodId": 123,
  "amount": 199.99,
  "currency": "USD"
}

# Get payment status
GET /api/payments/456/status
Authorization: Bearer {token}

# Request refund
POST /api/payments/456/refund
Authorization: Bearer {admin_token}
{
  "amount": 199.99,
  "reason": "Customer request"
}
```

## Inventory Management API

### **Base URL**: `/api/inventory`

### **Stock Information**
```bash
# Get product stock
GET /api/inventory/products/123/stock

# Check stock availability
POST /api/inventory/check-availability
{
  "items": [
    {
      "productId": 123,
      "quantity": 2,
      "attributes": {"size": "L"}
    }
  ]
}

# Reserve stock
POST /api/inventory/reserve
Authorization: Bearer {token}
{
  "items": [
    {
      "productId": 123,
      "quantity": 2,
      "attributes": {"size": "L"}
    }
  ],
  "reservationId": "cart_456"
}
```

### **Admin Endpoints**
```bash
# Update stock levels
PUT /api/inventory/products/123/stock
Authorization: Bearer {admin_token}
{
  "quantity": 100,
  "operation": "set" // or "add", "subtract"
}

# Get low stock alerts
GET /api/inventory/alerts/low-stock
Authorization: Bearer {admin_token}

# Inventory movements
GET /api/inventory/movements?productId=123&startDate=2024-01-01
Authorization: Bearer {admin_token}
```

## Notification Service API

### **Base URL**: `/api/notifications`

### **User Notifications**
```bash
# Get user notifications
GET /api/notifications?unread=true&page=1&limit=20
Authorization: Bearer {token}

# Mark as read
PUT /api/notifications/123/read
Authorization: Bearer {token}

# Update notification preferences
PUT /api/notifications/preferences
Authorization: Bearer {token}
{
  "email": {
    "orderUpdates": true,
    "promotions": false,
    "newsletter": true
  },
  "sms": {
    "orderUpdates": true,
    "promotions": false
  },
  "push": {
    "orderUpdates": true,
    "promotions": true
  }
}
```

### **Admin Endpoints**
```bash
# Send notification to user
POST /api/notifications/send
Authorization: Bearer {admin_token}
{
  "userId": 123,
  "type": "order_shipped",
  "channels": ["email", "push"],
  "data": {
    "orderId": 789,
    "trackingNumber": "1Z999AA1234567890"
  }
}

# Send bulk notification
POST /api/notifications/send-bulk
Authorization: Bearer {admin_token}
{
  "userIds": [123, 456, 789],
  "type": "promotion",
  "template": "summer_sale",
  "channels": ["email"]
}
```

## Search API

### **Base URL**: `/api/search`

```bash
# Global search across products
GET /api/search?q=laptop&filters=category:electronics,price:100-1000&sort=relevance

# Advanced search with facets
POST /api/search/advanced
{
  "query": "gaming laptop",
  "filters": {
    "category": ["electronics", "computers"],
    "brand": ["Apple", "Dell", "HP"],
    "priceRange": {
      "min": 500,
      "max": 2000
    },
    "attributes": {
      "memory": ["16GB", "32GB"],
      "storage": ["SSD"]
    }
  },
  "sort": {
    "field": "price",
    "order": "asc"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}

# Get search suggestions
GET /api/search/suggestions?q=lap

# Get popular searches
GET /api/search/trending
```

## Analytics API

### **Base URL**: `/api/analytics`

```bash
# Product analytics
GET /api/analytics/products/123/views?period=7d
GET /api/analytics/products/123/sales?period=30d

# User behavior analytics
GET /api/analytics/users/behavior?period=7d
GET /api/analytics/users/retention?cohort=2024-01

# Sales analytics
GET /api/analytics/sales/revenue?period=30d&groupBy=day
GET /api/analytics/sales/top-products?period=7d&limit=10

# Performance analytics
GET /api/analytics/performance/response-times?service=user-service&period=1h
GET /api/analytics/performance/error-rates?period=24h
```

## Error Handling

### **Standard Error Response**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### **HTTP Status Codes**
- **200 OK**: Successful GET requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation failed
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server error
- **503 Service Unavailable**: Service temporarily down

## Rate Limiting

### **Rate Limits by Endpoint Type**
- **Authentication**: 5 requests per minute per IP
- **Search**: 100 requests per minute per user
- **Product Catalog**: 1000 requests per minute per user
- **Order Operations**: 50 requests per minute per user
- **Payment Operations**: 10 requests per minute per user

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
X-RateLimit-Window: 60
```

## API Testing

### **Postman Collections**
Pre-configured Postman collections available:
- **User Service**: Authentication and profile management
- **Product Service**: Catalog operations and search
- **Order Service**: Shopping cart and order processing
- **Payment Service**: Payment processing and methods
- **Inventory Service**: Stock management
- **Notification Service**: Messaging and preferences

### **Newman CLI Testing**
```bash
# Run all API tests
newman run tests/api/user-service.postman_collection.json -e tests/api/development.postman_environment.json

# Run specific collection
newman run tests/api/product-service.postman_collection.json \
  --env-var "baseUrl=http://localhost:8080" \
  --env-var "authToken=$AUTH_TOKEN"
```

### **Load Testing with Artillery**
```yaml
# tests/load/user-service.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Load test"

scenarios:
  - name: "User authentication flow"
    weight: 70
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/api/users/profile"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

## API Metrics & Monitoring

### **Prometheus Metrics**
Each service exposes metrics at `/metrics`:
```
# Request metrics
http_requests_total{method="GET",endpoint="/users/profile",status="200"}
http_request_duration_seconds{method="GET",endpoint="/users/profile"}

# Business metrics
user_registrations_total
orders_created_total
payments_processed_total
products_viewed_total

# Infrastructure metrics
database_connections_active
cache_hit_rate
memory_usage_bytes
cpu_usage_percent
```

### **Health Check Endpoints**
```bash
# Service health
GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.2.3",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "external_apis": "healthy"
  }
}

# Readiness check
GET /ready
{
  "status": "ready",
  "dependencies": {
    "database": "connected",
    "cache": "connected"
  }
}
```

## API Versioning

### **Versioning Strategy**
- **URL Versioning**: `/api/v1/users`, `/api/v2/users`
- **Header Versioning**: `Accept: application/vnd.api+json;version=1`
- **Backward Compatibility**: Maintained for 2 major versions

### **Version Lifecycle**
1. **Alpha** (v1alpha1): Experimental, may change
2. **Beta** (v1beta1): Stable API, minor changes possible  
3. **Stable** (v1): Production ready, backward compatible
4. **Deprecated** (v1deprecated): Still supported, plan migration
5. **Sunset** (removed): No longer available

## Interactive API Documentation

### **Swagger UI**
- **Development**: http://localhost:8080/api-docs
- **Staging**: https://staging-api.ecommerce.company.com/docs
- **Production**: https://api.ecommerce.company.com/docs

### **Redoc Documentation**
- **Alternative UI**: http://localhost:8080/redoc
- **PDF Export**: Available for offline documentation
- **Code Samples**: Multiple programming languages

## SDK & Client Libraries

### **JavaScript/TypeScript SDK**
```javascript
import { EcommerceAPI } from '@company/ecommerce-sdk';

const client = new EcommerceAPI({
  baseURL: 'https://api.ecommerce.company.com',
  apiKey: 'your-api-key'
});

// User operations
const user = await client.users.getProfile();
const orders = await client.orders.list({ status: 'completed' });

// Product operations
const products = await client.products.search('laptop');
const product = await client.products.getById(123);
```

### **Python SDK**
```python
from ecommerce_sdk import EcommerceClient

client = EcommerceClient(
    base_url='https://api.ecommerce.company.com',
    api_key='your-api-key'
)

# User operations
user = client.users.get_profile()
orders = client.orders.list(status='completed')

# Product operations
products = client.products.search('laptop')
product = client.products.get_by_id(123)
```

## API Discovery

### **Service Registry**
All APIs are automatically registered in Backstage:
- **Service Discovery**: Find available APIs
- **Dependency Mapping**: Understand service relationships
- **API Catalog**: Browse all endpoints
- **Documentation**: Integrated API docs

### **OpenAPI Specifications**
Each service maintains OpenAPI 3.0 specifications:
- **Auto-generated**: From code annotations
- **Validation**: Request/response validation
- **Code Generation**: Client SDK generation
- **Testing**: Contract testing with specifications