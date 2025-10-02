# Recommendation Service

AI-powered product recommendation microservice built with **Quarkus** - showcasing polyglot microservices architecture.

## Features

### 🤖 Recommendation Algorithms
- **Collaborative Filtering**: Based on similar user preferences
- **Content-Based**: Based on product characteristics and user history
- **Popular Products**: Trending and most-viewed products
- **Cross-Selling**: Products frequently bought together

### ⚡ Performance Features
- **Redis Caching**: Sub-second response times
- **Reactive APIs**: Non-blocking I/O with Quarkus reactive
- **GraalVM Ready**: Native compilation support
- **Fast Startup**: < 1 second boot time

### 📊 Analytics & Tracking
- **User Behavior Tracking**: Views, purchases, cart actions, searches
- **Real-time Counters**: Popular product metrics
- **Session Analytics**: User journey tracking
- **A/B Testing Ready**: Algorithm performance comparison

## API Endpoints

### Public Endpoints
```http
GET /recommendations/popular?limit=20
GET /recommendations/product/{productId}/similar?limit=5
```

### Authenticated Endpoints
```http
GET /recommendations/user/{userId}?limit=10
POST /recommendations/track
GET /recommendations/user/{userId}/stats
```

## Technology Stack

- **Framework**: Quarkus 3.16.2 (Latest)
- **Language**: Java 17
- **Database**: MongoDB (behavior data)
- **Cache**: Redis (recommendations cache)
- **Security**: Keycloak OIDC integration
- **Observability**: Prometheus metrics, Health checks
- **Documentation**: OpenAPI/Swagger

## Configuration

Key configuration in `application.yml`:

```yaml
quarkus:
  http:
    port: 3007
  mongodb:
    connection-string: mongodb://mongo:password@mongodb:27017/recommendation_service_db
  redis:
    hosts: redis:6379
  oidc:
    auth-server-url: http://keycloak:8080/realms/ecommerce
```

## Usage Examples

### Track User Behavior
```javascript
// Frontend integration
import { recommendationsAPI } from '../services/api';

// Track product view
await recommendationsAPI.trackBehavior({
  productId: 'product-123',
  behaviorType: 'VIEW',
  duration: 30000 // 30 seconds
});
```

### Get Recommendations
```javascript
// Get personalized recommendations
const recommendations = await recommendationsAPI.getUserRecommendations(userId, 10);

// Get similar products
const similar = await recommendationsAPI.getSimilarProducts(productId, 5);
```

## Development

### Local Development
```bash
# Start with all services
make dev

# Or start individually
cd services/recommendation-service
mvn quarkus:dev
```

### Testing
```bash
# Run tests
mvn test

# Test specific endpoint
curl http://localhost:3007/recommendations/popular
```

### Dev Mode Features
- **Live Reload**: Code changes reload automatically
- **Dev UI**: http://localhost:3007/q/dev
- **Health Check**: http://localhost:3007/q/health
- **Metrics**: http://localhost:3007/q/metrics
- **OpenAPI**: http://localhost:3007/q/swagger-ui

## Production Build

### JVM Mode
```bash
mvn clean package
java -jar target/quarkus-app/quarkus-run.jar
```

### Native Mode (GraalVM)
```bash
mvn clean package -Pnative
./target/recommendation-service-1.0.0-runner
```

## Integration Points

### With Other Services
- **Product Service**: Fetch product metadata for recommendations
- **User Service**: User profile data for personalization
- **Order Service**: Purchase history for collaborative filtering

### With Frontend
- **Home Page**: Personalized and popular recommendations
- **Product Detail**: Similar products section
- **User Profile**: Recommendation statistics

### With Infrastructure
- **API Gateway**: JWT validation and routing
- **MongoDB**: Behavior data storage
- **Redis**: Recommendation caching
- **Keycloak**: Authentication and authorization

## Monitoring

### Health Checks
- **Readiness**: `/q/health/ready`
- **Liveness**: `/q/health/live`
- **Custom**: MongoDB and Redis connectivity

### Metrics
- **Prometheus**: `/q/metrics`
- **Custom Metrics**: Recommendation accuracy, cache hit rates
- **Business Metrics**: User engagement, conversion rates