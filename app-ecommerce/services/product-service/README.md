# Product Service

## Overview
The Product Service manages the complete product catalog, including categories, inventory integration, and search capabilities.

## Features
- Product CRUD operations
- Category management and hierarchy
- Advanced search and filtering
- Product image and media handling
- Pricing and promotion management
- Product reviews and ratings

## Architecture
- **Technology**: Node.js + Express.js
- **Database**: MongoDB (flexible schema for product attributes)
- **Search**: MongoDB text indexes
- **File Storage**: Local/S3 for product images
- **Caching**: Redis for frequent queries

## Database Schema
```javascript
// Products Collection
{
  _id: ObjectId,
  name: String,
  description: String,
  category: ObjectId,
  price: {
    amount: Number,
    currency: String
  },
  images: [String],
  attributes: {
    size: String,
    color: String,
    weight: Number,
    // Dynamic attributes
  },
  status: "active" | "inactive" | "discontinued",
  createdAt: Date,
  updatedAt: Date
}

// Categories Collection
{
  _id: ObjectId,
  name: String,
  description: String,
  parent: ObjectId,
  level: Number,
  path: String,
  createdAt: Date
}
```

## API Endpoints

### Products
- `GET /products` - List products with filtering
- `GET /products/{id}` - Get product details
- `POST /products` - Create new product (admin)
- `PUT /products/{id}` - Update product (admin)
- `DELETE /products/{id}` - Delete product (admin)
- `GET /products/search` - Search products
- `GET /products/featured` - Get featured products

### Categories
- `GET /categories` - List all categories
- `GET /categories/{id}` - Get category details
- `POST /categories` - Create category (admin)
- `PUT /categories/{id}` - Update category (admin)
- `GET /categories/{id}/products` - Get products in category

## Search Capabilities
- Full-text search on product names and descriptions
- Filter by category, price range, attributes
- Sorting by price, popularity, rating, date
- Pagination and result limiting
- Faceted search with aggregations

## Configuration
Environment variables:
- `MONGODB_URL` - MongoDB connection string
- `REDIS_URL` - Redis cache connection
- `UPLOAD_PATH` - Product image storage path
- `MAX_FILE_SIZE` - Maximum image file size
- `SEARCH_INDEX_BATCH_SIZE` - Search indexing batch size

## Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Load testing
npm run test:load
```

## Monitoring
- Health check: `GET /health`
- Metrics: `GET /metrics`
- Search performance monitoring
- Database query optimization
- Image upload monitoring

## Deployment
```bash
# Docker build
docker build -t product-service .

# With MongoDB
docker run -p 3002:3002 --link mongodb product-service
```