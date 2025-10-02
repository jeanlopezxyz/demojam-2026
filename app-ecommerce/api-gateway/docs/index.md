# API Gateway

Quarkus-based central API Gateway for the E-commerce Platform microservices.

## Overview

The API Gateway serves as the single entry point for all client requests, providing:

- **Request Routing**: Intelligent routing to backend microservices
- **Authentication**: Keycloak OIDC integration for secure access
- **CORS Handling**: Cross-origin resource sharing configuration
- **Circuit Breaking**: Fault tolerance for unavailable services
- **Rate Limiting**: Protection against abuse
- **Service Discovery**: Health checking and routing decisions

## Technology Stack

- **Framework**: Quarkus 3.28.1
- **Language**: Java 21
- **Security**: Keycloak OIDC
- **Fault Tolerance**: SmallRye Fault Tolerance
- **Observability**: Prometheus metrics, Health checks, OpenAPI

## Architecture

### Security Model

```
Frontend → API Gateway → Keycloak (JWT validation)
              ↓
         [Secure Headers] → Microservices (header trust)
```

**Key Principles:**
- Only API Gateway communicates with Keycloak
- Microservices are NOT exposed to internet
- Internal communication uses trusted headers
- Network isolation via Docker networks/Kubernetes NetworkPolicies

### Service Discovery

The gateway automatically handles service availability:

- **Health Checks**: Monitors backend service health
- **Circuit Breaker**: Prevents cascade failures
- **Graceful Degradation**: Returns meaningful errors for unavailable services
- **Environment-aware URLs**: localhost (dev) vs Kubernetes DNS (prod)

## Network Configuration

### Development (Docker)
```
Gateway: http://localhost:8080
Services: http://service-name:3001-3007
```

### Production (OpenShift)
```
Gateway: https://api-gateway-route.apps.cluster.com
Services: http://service-name.namespace.svc.cluster.local:8080
```

## Endpoints

### Public Endpoints
- `GET /api/health` - Gateway health check
- `GET /api/products` - Product browsing (no auth required)
- `GET /api/recommendations/popular` - Popular recommendations

### Authenticated Endpoints
- `GET /api/users/profile` - User profile (requires Keycloak JWT)
- `POST /api/orders` - Create order (requires authentication)
- `GET /api/recommendations/user/{id}` - Personal recommendations

### Admin Endpoints
- `GET /api/inventory` - Inventory management (admin role required)

## Configuration

Environment variables are managed in:
- `.env.local` - Development configuration
- `.env.production` - OpenShift configuration

Key variables:
- `KEYCLOAK_URL` - External Keycloak instance
- `USER_SERVICE_URL` - Internal user service URL
- `FRONTEND_URL` - Frontend URL for CORS

## Development

### Local Development
```bash
cd api-gateway
mvn quarkus:dev
```

Access:
- **Service**: http://localhost:8080
- **Dev UI**: http://localhost:8080/q/dev-ui
- **Health**: http://localhost:8080/q/health
- **Metrics**: http://localhost:8080/q/metrics
- **API Docs**: http://localhost:8080/q/swagger-ui

### Testing
```bash
# Health check
curl http://localhost:8080/api/health

# Service discovery
curl http://localhost:8080/api/products

# Auth flow (requires Keycloak)
curl -H "Authorization: Bearer <jwt-token>" http://localhost:8080/api/users/profile
```

## Service Dependencies

The API Gateway depends on:
- **External**: Keycloak for authentication
- **Internal**: All microservices for routing

Services accessed by gateway:
- user-service (port 3001/8080)
- product-service (port 3002/8080)  
- order-service (port 3003/8080)
- payment-service (port 3004/8080)
- inventory-service (port 3005/8080)
- notification-service (port 3006/8080)
- recommendation-service (port 3007/8080)

## Security Notes

- **No database access**: Gateway is stateless
- **Header injection**: Adds X-User-* headers for microservices
- **HMAC signatures**: Prevents header tampering
- **Network isolation**: Microservices not accessible from internet
- **Role-based access**: Uses Keycloak roles for authorization