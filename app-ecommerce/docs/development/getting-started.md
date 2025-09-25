# Getting Started - Developer Guide

## Quick Start

Welcome to the e-commerce platform development environment! This guide will get you up and running in minutes.

## Prerequisites

### Required Tools
- **Node.js** 20+ LTS
- **Docker** & Docker Compose
- **Git** 2.30+
- **kubectl** (for Kubernetes deployment)
- **npm** or **yarn**

### Optional Tools
- **Postman** - API testing
- **MongoDB Compass** - Database GUI
- **pgAdmin** - PostgreSQL GUI
- **Redis CLI** - Cache management

## Development Environment Setup

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/company/ecommerce-platform.git
cd ecommerce-platform

# Install dependencies for all services
make install

# Or manually for each service
cd services/user-service && npm install
cd ../product-service && npm install
cd ../order-service && npm install
cd ../payment-service && npm install
cd ../inventory-service && npm install
cd ../notification-service && npm install
cd ../../api-gateway && npm install
cd ../frontend && npm install
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env
cp services/user-service/.env.example services/user-service/.env
cp services/product-service/.env.example services/product-service/.env
# ... repeat for all services

# Configure your environment variables
# DATABASE_URL, REDIS_URL, JWT_SECRET, etc.
```

### 3. Start Infrastructure
```bash
# Start databases and supporting services
docker-compose up -d postgres mongodb redis

# Wait for services to be ready
make wait-for-services

# Run database migrations
make migrate
```

### 4. Start Development Servers
```bash
# Option 1: Start all services
make dev

# Option 2: Start individual services
cd services/user-service && npm run dev
cd services/product-service && npm run dev
# ... etc

# Option 3: Using Docker Compose
docker-compose -f docker-compose.dev.yml up
```

## Service URLs

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| Frontend | http://localhost:3000 | 3000 | React.js UI |
| API Gateway | http://localhost:8080 | 8080 | Main API entry |
| User Service | http://localhost:3001 | 3001 | Authentication |
| Product Service | http://localhost:3002 | 3002 | Product catalog |
| Order Service | http://localhost:3003 | 3003 | Order processing |
| Payment Service | http://localhost:3004 | 3004 | Payment processing |
| Inventory Service | http://localhost:3005 | 3005 | Stock management |
| Notification Service | http://localhost:3006 | 3006 | Notifications |

## Database Access

### PostgreSQL
```bash
# Connect to user database
psql postgresql://postgres:password@localhost:5432/users

# Connect to orders database
psql postgresql://postgres:password@localhost:5432/orders

# Connect to payments database
psql postgresql://postgres:password@localhost:5432/payments

# Connect to inventory database
psql postgresql://postgres:password@localhost:5432/inventory
```

### MongoDB
```bash
# Connect to product database
mongosh mongodb://localhost:27017/products

# Connect to notifications database
mongosh mongodb://localhost:27017/notifications
```

### Redis
```bash
# Connect to Redis
redis-cli -h localhost -p 6379
```

## Testing

### Unit Tests
```bash
# Test all services
make test

# Test specific service
cd services/user-service && npm test

# Test with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
make test:integration

# Cleanup
docker-compose -f docker-compose.test.yml down
```

### API Testing
```bash
# Using Newman (Postman CLI)
npm run test:api

# Using curl scripts
./scripts/test-apis.sh
```

### Load Testing
```bash
# Using Artillery
npm run test:load

# Using k6
k6 run tests/load/user-service.js
```

## Development Tools

### Code Quality
```bash
# Linting all services
make lint

# Fix linting issues
make lint:fix

# Type checking (TypeScript services)
make typecheck

# Security audit
make audit
```

### Database Tools
```bash
# Reset all databases
make db:reset

# Seed with test data
make db:seed

# Create migration
make migration:create name=add_user_preferences

# Run migrations
make migrate
```

### Debugging
```bash
# Debug specific service with inspector
cd services/user-service
npm run debug

# View logs in real-time
make logs service=user-service

# Monitor all services
make monitor
```

## Hot Reload & Development Workflow

### File Watching
All services support hot reload in development:
- **Backend services** - nodemon restarts on file changes
- **Frontend** - Vite hot module replacement
- **API Gateway** - Auto-reload with middleware changes

### Development Workflow
1. **Feature Branch** - Create feature branch from `develop`
2. **Local Development** - Code and test locally
3. **Unit Tests** - Run `npm test` before commit
4. **Commit** - Use conventional commits
5. **Push** - GitHub Actions runs CI
6. **Pull Request** - Code review process
7. **Merge** - Auto-deploy to staging
8. **Release** - Manual promotion to production

## Troubleshooting

### Common Issues

#### Services not starting
```bash
# Check port conflicts
netstat -tulpn | grep :3001

# Check Docker containers
docker ps -a

# View service logs
docker-compose logs user-service
```

#### Database connection issues
```bash
# Test database connectivity
make test:db

# Reset database
make db:reset

# Check database logs
docker-compose logs postgres
```

#### Authentication issues
```bash
# Verify JWT configuration
curl http://localhost:3001/auth/test

# Check user service logs
docker-compose logs user-service
```

## Additional Resources

- **[API Documentation](../apis/rest-apis.md)** - Complete API reference
- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Deployment Guide](../operations/deployment.md)** - Production deployment
- **[Monitoring Setup](../operations/monitoring.md)** - Observability stack
- **[Contributing Guidelines](../CONTRIBUTING.md)** - Development standards

## Getting Help

- **Slack**: #ecommerce-platform-dev
- **Team Leads**: Check team ownership in Backstage
- **Issues**: Create GitHub issue with template
- **Documentation**: Backstage TechDocs portal