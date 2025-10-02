# E-commerce Platform - Microservices Architecture

## Architecture Overview

This is a modern enterprise e-commerce platform built with microservices architecture, featuring:

### Microservices (Quarkus 3.28.1 + Java 25):
- **User Service**: User profile management (PostgreSQL)
- **Product Service**: Product catalog management (MongoDB)
- **Order Service**: Order processing with CQRS (PostgreSQL)
- **Payment Service**: Payment processing (PostgreSQL)
- **Inventory Service**: Stock management (PostgreSQL + Redis)
- **Notification Service**: Email/SMS notifications (MongoDB)
- **Recommendation Service**: AI-powered recommendations with CQRS (MongoDB + Redis)

### Infrastructure:
- **API Gateway**: Request routing and Keycloak authentication (Node.js)
- **Frontend**: React.js application with Material-UI and Keycloak integration
- **External Services**: Keycloak and AMQ Streams from OpenShift (public)

## Project Structure

```
ecommerce-platform/
├── services/                    # Quarkus microservices (Java 25)
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/          # CQRS implementation
│   ├── payment-service/
│   ├── inventory-service/
│   ├── notification-service/
│   └── recommendation-service/ # AI + CQRS
├── api-gateway/                # Node.js gateway
├── frontend/                   # React application
├── infrastructure/             # Development database setup
└── docs/                      # Technical documentation
```

## Development Setup

### Prerequisites
- Java 25 (for Quarkus services)
- Node.js 18+ (for API Gateway and Frontend)
- Docker and Docker Compose
- Maven 3.9+

### External Services (OpenShift)
This project uses external services deployed in OpenShift:
- **Keycloak**: Identity and access management
- **AMQ Streams**: Apache Kafka for event-driven architecture

### Configuration
1. Copy `.env.openshift` to `.env` and update with actual OpenShift URLs
2. Configure Keycloak realm and clients in the external instance
3. Setup AMQ Streams topics for events

### Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd app-ecommerce
   make setup
   ```

2. **Configure external services**:
   ```bash
   cp .env.openshift .env
   # Edit .env with your OpenShift service URLs
   ```

3. **Start services**:
   ```bash
   make dev
   ```

4. **Access applications**:
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8080
   - Quarkus Dev UIs: http://localhost:3001-3007/q/dev-ui

## Key Features

### Technology Stack
- **Quarkus 3.28.1**: Latest microservices framework
- **Java 25**: Latest LTS with modern language features
- **CQRS + Event Sourcing**: Order and recommendation services
- **Event-Driven**: OpenShift Streams for Apache Kafka
- **Keycloak Integration**: Enterprise authentication
- **React + Material-UI**: Modern frontend

### Development Experience
- **Live Reload**: Quarkus dev mode with instant updates
- **Dev Assistant**: AI-powered development help
- **Integrated Testing**: JUnit for services, Jest for frontend
- **Health Checks**: Built-in monitoring endpoints
- **OpenAPI**: Auto-generated API documentation

### Production Ready
- **Container Native**: Optimized for OpenShift deployment
- **Event-Driven**: Loose coupling between services
- **CQRS**: Scalable read/write patterns
- **Security**: Centralized authentication via API Gateway
- **Observability**: Metrics, health checks, distributed tracing

## Deployment

This repository contains only source code. Production deployment uses:
- **Tekton Pipelines**: CI/CD automation
- **Helm Charts**: Kubernetes deployment manifests
- **ArgoCD**: GitOps deployment management
- **OpenShift Streams**: Managed Kafka messaging

For deployment instructions, see the separate infrastructure repositories.