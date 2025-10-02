# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Test, and Development Commands

### Primary Commands (via Makefile)
- `make setup` - Complete setup: install dependencies, build, and start services
- `make install` - Install dependencies for all services
- `make dev` - Start all services in development mode with hot reload
- `make build` - Build all container images (development)
- `make build-for-openshift` - Build container images for OpenShift
- `make push-images` - Push images to container registry
- `make down` - Stop all services
- `make logs` - View logs from all services
- `make logs-service SERVICE=<service-name>` - View logs from specific service
- `make clean` - Clean up development containers and images
- `make test` - Run tests for all services
- `make status` - Show status of all services
- `make health` - Check health of all services via API Gateway

### Individual Service Commands

**Quarkus Services** (api-gateway, user, product, order, payment, inventory, notification, recommendation):
- `mvn quarkus:dev` - Development mode with live reload (Java 25 + Quarkus 3.28.1)
- `mvn test` - Run JUnit tests
- `mvn clean package` - Build JAR
- `mvn clean package -Pnative` - Build native image (GraalVM + Java 25)
- `mvn clean package -Dquarkus.container-image.build=true` - Build container image
- `make quarkus-dev SERVICE=<service-name>` - Start single Quarkus service in dev mode
- `make dev-assistant` - Access AI-powered Dev Assistant (Quarkus 3.28.1)
- `make java25-preview` - Enable Java 25 preview features
- `make native-build` - Build native images for all Quarkus services

### Frontend Commands
- `npm run dev` - Development server with Vite
- `npm run build` - Production build
- `npm run lint` - ESLint with React rules
- `npm run preview` - Preview production build

## Architecture Overview

This is a microservices-based e-commerce platform with the following components:

### Core Services (Quarkus 3.28.1 + Java 25)
- **user-service** (port 3001): User profile management using PostgreSQL
- **product-service** (port 3002): Product catalog management using MongoDB
- **order-service** (port 3003): Order processing using PostgreSQL
- **payment-service** (port 3004): Payment processing with Stripe/PayPal integration
- **inventory-service** (port 3005): Stock management using PostgreSQL + Redis
- **notification-service** (port 3006): Email/SMS notifications using MongoDB
- **recommendation-service** (port 3007): AI-powered product recommendations using MongoDB + Redis

### Infrastructure
- **api-gateway** (port 8080): Quarkus-based gateway with Keycloak JWT validation, CORS, and request routing
- **frontend** (port 3000): React + Vite application with Material-UI and Keycloak integration
- **keycloak** (port 8090): Identity provider for authentication and authorization
- **postgres** (port 5432): Primary database for user, order, payment, inventory services + Keycloak
- **mongodb** (port 27017): Document store for product catalog, notifications, and recommendations
- **redis** (port 6379): Caching and session storage for inventory and recommendation services

### Event-Driven Communication
- **Development**: In-memory messaging (no external dependencies)
- **Production**: OpenShift Streams for Apache Kafka (managed service)
- **Pattern**: Each service owns its data, communicates via events
- **CQRS**: Command/Query separation in order-service and recommendation-service

### Service Communication
Services communicate via HTTP REST APIs through the API Gateway. Internal service URLs:
- USER_SERVICE_URL: http://user-service:3001
- PRODUCT_SERVICE_URL: http://product-service:3002
- ORDER_SERVICE_URL: http://order-service:3003
- PAYMENT_SERVICE_URL: http://payment-service:3004
- INVENTORY_SERVICE_URL: http://inventory-service:3005
- NOTIFICATION_SERVICE_URL: http://notification-service:3006
- RECOMMENDATION_SERVICE_URL: http://recommendation-service:3007

## Project Structure

```
/
├── services/           # Microservices (Quarkus + Java 25)
├── api-gateway/        # Request routing and auth (Node.js)
├── frontend/           # React application
├── infrastructure/     # Docker configs for development
└── docs/              # Architecture and API documentation
```

## Development Workflow

1. **Local Development**: Use `make dev` for hot-reloading across all services (development only)
2. **Database Access**: 
   - PostgreSQL: `make db-shell`
   - MongoDB: `make mongo-shell` 
   - Redis: `make redis-shell`
3. **Service Debugging**: `make shell SERVICE=<service-name>` for container access
4. **Container Management**: `make clean` to clean up development containers

**Note**: This repository contains only source code and development setup. Production deployment is handled via:
- **Tekton Pipelines**: For CI/CD (build, test, push container images)
- **Helm Charts**: For Kubernetes deployment (in separate repo)
- **ArgoCD**: For GitOps deployment automation
- **OpenShift Streams**: For managed Kafka event messaging

**Backstage Configuration**: Platform configuration is now properly separated in `/home/jeanlopez/Documents/redhat/demojam/backstage-platform-config/` directory for proper separation of concerns.

## Testing Strategy

- **Quarkus Services**: Use JUnit 5 for unit and integration tests
  - Run all tests: `make test`
  - Individual service tests: `cd services/<service-name> && mvn test`
  - API Gateway tests: `cd api-gateway && mvn test`
- **Frontend**: Uses Vite's test runner (if configured)
  - Frontend tests: `cd frontend && npm test` (if test script configured)

## Database Schemas

- **PostgreSQL**: Handles relational data for users, orders, payments, inventory
- **MongoDB**: Stores product catalog, categories, and notification templates
- **Redis**: Caches inventory levels and session data

Database initialization scripts:
- PostgreSQL: `infrastructure/docker/init-databases.sql`, `init-user-data.sql`, `init-inventory-data.sql`, `init-order-data.sql`
- MongoDB: `infrastructure/docker/init-product-data.js`

## Environment Configuration

Each service has its own environment configuration:
- **Frontend**: `.env.local` (VITE_API_URL, VITE_KEYCLOAK_*)
- **API Gateway**: `.env.local` (CORS, service URLs, Keycloak)
- **Microservices**: Each has `.env.local` (database, external services)
- **Production**: Each has `.env.production` for OpenShift deployment

No global .env file - each project manages its own configuration.

## Authentication Architecture

**Keycloak Integration**: The platform uses Keycloak for centralized authentication:
- **API Gateway**: Validates Keycloak JWT tokens via Quarkus OIDC and injects user context headers
- **Microservices**: Use custom UserContextFilter to extract user context from trusted headers (no direct JWT validation)
- **Frontend**: Uses keycloak-js for authentication flows
- **Security Flow**: Frontend → Keycloak → API Gateway (validates JWT) → Microservices (trust headers)
- **CORS Configuration**: Handled by API Gateway's CorsFilter for cross-origin requests

## Service Ports Reference

- Frontend: 3000
- User Service: 3001  
- Product Service: 3002
- Order Service: 3003
- Payment Service: 3004
- Inventory Service: 3005
- Notification Service: 3006
- Recommendation Service: 3007 (Quarkus)
- API Gateway: 8080
- Keycloak: 8090
- PostgreSQL: 5432
- MongoDB: 27017
- Redis: 6379