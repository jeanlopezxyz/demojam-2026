# ${{ values.name | title }} Service

## Overview

${{ values.description }}

**Owner**: ${{ values.owner }}  
**Database**: ${{ values.database }}  
**Port**: ${{ values.port }}  
**Environment**: ${{ values.environment }}

## Architecture

This service follows the e-commerce platform microservice patterns with enterprise-grade security, monitoring, and deployment practices.

### Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js
{% if values.database == "postgresql" %}
- **Database**: PostgreSQL with Sequelize ORM
{% endif %}
{% if values.database == "mongodb" %}
- **Database**: MongoDB with Mongoose ODM
{% endif %}
{% if values.hasCache or values.database == "redis-only" %}
- **Cache**: Redis for session management and caching
{% endif %}
{% if values.hasAuth %}
- **Authentication**: JWT tokens with role-based access control
{% endif %}
{% if values.hasMetrics %}
- **Monitoring**: Prometheus metrics with Grafana dashboards
{% endif %}
- **Container**: Docker with multi-stage builds
- **Orchestration**: Kubernetes with auto-scaling

### Security Features
{% if values.hasAuth %}
- JWT-based authentication
- Role-based authorization
{% endif %}
{% if values.hasRateLimit %}
- API rate limiting
{% endif %}
{% if values.hasValidation %}
- Input validation with Joi schemas
{% endif %}
- Helmet.js security headers
- CORS protection
- Non-root container execution
- Read-only filesystem
- Network policies

## Getting Started

### Prerequisites
- Node.js 20+
- npm 8+
{% if values.database == "postgresql" %}
- PostgreSQL 15+
{% endif %}
{% if values.database == "mongodb" %}
- MongoDB 7+
{% endif %}
{% if values.hasCache or values.database == "redis-only" %}
- Redis 7+
{% endif %}

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start dependencies**:
   {% if values.database == "postgresql" %}
   ```bash
   # Start PostgreSQL
   docker run -d --name postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=${{ values.name | replace("-", "_") }} \
     -p 5432:5432 postgres:15
   ```
   {% endif %}
   {% if values.database == "mongodb" %}
   ```bash
   # Start MongoDB
   docker run -d --name mongodb \
     -p 27017:27017 mongo:7
   ```
   {% endif %}
   {% if values.hasCache or values.database == "redis-only" %}
   ```bash
   # Start Redis
   docker run -d --name redis \
     -p 6379:6379 redis:7-alpine
   ```
   {% endif %}

4. **Run migrations** (if applicable):
   ```bash
   npm run migrate
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Endpoints
- `GET /health` - Service health check
- `GET /ready` - Service readiness check
{% if values.hasMetrics %}
- `GET /metrics` - Prometheus metrics
{% endif %}

### Business Endpoints
{% if values.hasSwagger %}
- Full API documentation available at `http://localhost:${{ values.port }}/api-docs`
{% endif %}

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Test Coverage
```bash
npm run test:coverage
```

### Load Testing
```bash
# Using Artillery (install globally: npm install -g artillery)
artillery run tests/load/load-test.yml
```

## Deployment

### Docker
```bash
# Build container
docker build -t ${{ values.name }} .

# Run container
docker run -p ${{ values.port }}:${{ values.port }} \
  --env-file .env \
  ${{ values.name }}
```

### Kubernetes
```bash
# Deploy to staging
kubectl apply -f k8s/ -n ecommerce-staging

# Deploy to production
kubectl apply -f k8s/ -n ecommerce-production
```

## Monitoring

{% if values.hasMetrics %}
### Metrics
- **Request metrics**: Duration, rate, errors
- **Business metrics**: Service-specific KPIs
- **System metrics**: Memory, CPU, database connections

### Dashboards
- Grafana dashboard: `${{ values.name }}-dashboard`
- Prometheus queries available in `/docs/monitoring.md`
{% endif %}

### Logging
- **Structured JSON logging** for production
- **Human-readable logs** for development
- **Correlation IDs** for request tracing
- **Security event logging** for audit trails

### Alerting
- **Critical alerts**: PagerDuty integration
- **Warning alerts**: Slack notifications
- **Business alerts**: Custom thresholds

## Security

{% if values.hasAuth %}
### Authentication
- JWT tokens with configurable expiration
- Token blacklisting support
- Refresh token rotation
{% endif %}

### Input Validation
{% if values.hasValidation %}
- Joi schema validation for all endpoints
- SQL injection prevention
- XSS protection
{% endif %}

### Container Security
- Non-root user execution
- Read-only filesystem
- Minimal attack surface
- Regular vulnerability scanning

## Development Guidelines

### Code Standards
- ESLint configuration with Airbnb base
- Prettier code formatting
- Conventional commit messages
- 80%+ test coverage requirement

### API Design
- RESTful endpoint design
- Consistent error response format
- Proper HTTP status codes
- OpenAPI 3.0 specifications

### Database Best Practices
{% if values.database == "postgresql" %}
- Parameterized queries (no SQL injection)
- Connection pooling
- Database migrations
- Index optimization
{% endif %}
{% if values.database == "mongodb" %}
- Schema validation
- Index optimization
- Aggregation pipelines
- Connection pooling
{% endif %}

## Support

- **Team**: ${{ values.owner }}
- **Slack**: #${{ values.name | replace("-", "") }}-support
- **Documentation**: Backstage TechDocs
- **Issues**: GitHub Issues with service label