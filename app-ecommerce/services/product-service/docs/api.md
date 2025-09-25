# Product Service API Reference

## Product Endpoints

### GET /products
List products with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `category` (string): Category slug or ID
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `brand` (string): Brand filter
- `sort` (string): Sort by: price_asc, price_desc, name, newest, popular

**Response:**
```json
{
  "products": [
    {
      "id": "64f8a123b456c789d012e345",
      "name": "MacBook Pro 16-inch",
      "price": {
        "amount": 2499.99,
        "currency": "USD"
      },
      "category": {
        "name": "Laptops",
        "path": "Electronics > Computers > Laptops"
      },
      "images": [
        {
          "url": "/images/products/macbook-pro-16.jpg",
          "alt": "MacBook Pro 16-inch"
        }
      ],
      "rating": 4.8,
      "reviewCount": 156
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "pages": 13
  }
}
```

### GET /products/{id}
Get detailed product information.

### GET /products/search
Search products with full-text search.

**Query Parameters:**
- `q` (string): Search query
- `category` (string): Category filter
- `brand` (string): Brand filter

## Category Endpoints

### GET /categories
List all product categories.

### GET /categories/{id}/products
Get products in specific category.