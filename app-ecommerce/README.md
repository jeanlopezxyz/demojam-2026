# E-commerce Platform - Microservices Architecture

## Architecture Overview

This is a modern enterprise e-commerce platform built with microservices architecture, featuring:

### Microservices:
- **User Service**: Authentication/Authorization (PostgreSQL)
- **Product Service**: Product catalog management (MongoDB)
- **Order Service**: Order processing (PostgreSQL)
- **Payment Service**: Payment processing (PostgreSQL)
- **Inventory Service**: Stock management (Redis + PostgreSQL)
- **Notification Service**: Email/SMS notifications (MongoDB)

### Infrastructure:
- **API Gateway**: Request routing and authentication
- **Frontend**: React.js application
- **Databases**: PostgreSQL, MongoDB, Redis
- **Containerization**: Docker & Docker Compose

## Project Structure

```
ecommerce-platform/
├── services/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── inventory-service/
│   └── notification-service/
├── api-gateway/
├── frontend/
├── shared/
└── infrastructure/
```

## Getting Started

1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access the frontend at `http://localhost:3000`
4. API Gateway available at `http://localhost:8080`