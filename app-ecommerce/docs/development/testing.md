# Testing Strategy & Guidelines

## Testing Philosophy

Our testing strategy follows the **Testing Pyramid** approach with comprehensive coverage across all layers of the application stack.

## Testing Pyramid

```
    /\
   /  \    E2E Tests (10%)
  /____\   Integration Tests (20%)
 /______\  Unit Tests (70%)
```

### **Unit Tests (70%)**
- **Purpose**: Test individual functions and methods
- **Scope**: Service layer, utilities, business logic
- **Tools**: Jest, Mocha, Chai
- **Target**: >90% code coverage

### **Integration Tests (20%)**
- **Purpose**: Test service interactions and database operations
- **Scope**: API endpoints, database operations, external integrations
- **Tools**: Jest, Supertest, Test Containers
- **Target**: All critical user journeys

### **End-to-End Tests (10%)**
- **Purpose**: Test complete user workflows
- **Scope**: Full application stack from UI to database
- **Tools**: Playwright, Cypress
- **Target**: Critical business flows

## Test Categories

### **1. Unit Tests**

#### **User Service Example**
```javascript
// tests/unit/userService.test.js
const { createUser, validatePassword } = require('../../src/services/userService');

describe('User Service', () => {
  describe('createUser', () => {
    it('should create user with encrypted password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      const user = await createUser(userData);
      
      expect(user.email).toBe(userData.email);
      expect(user.password).toBeUndefined(); // Password should not be returned
      expect(user.id).toBeDefined();
    });
    
    it('should throw error for duplicate email', async () => {
      const userData = { email: 'existing@example.com', password: 'pass123' };
      
      await expect(createUser(userData)).rejects.toThrow('Email already exists');
    });
  });
  
  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      const result = await validatePassword('password123', '$2b$10$hashedPassword');
      expect(result).toBe(true);
    });
    
    it('should reject incorrect password', async () => {
      const result = await validatePassword('wrongpass', '$2b$10$hashedPassword');
      expect(result).toBe(false);
    });
  });
});
```

#### **Product Service Example**
```javascript
// tests/unit/productService.test.js
const { searchProducts, calculatePrice } = require('../../src/services/productService');

describe('Product Service', () => {
  describe('searchProducts', () => {
    it('should return products matching search query', async () => {
      const results = await searchProducts('laptop');
      
      expect(results.products).toHaveLength(5);
      expect(results.total).toBe(25);
      expect(results.facets).toHaveProperty('categories');
    });
    
    it('should apply price filters correctly', async () => {
      const results = await searchProducts('', { minPrice: 100, maxPrice: 500 });
      
      results.products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(500);
      });
    });
  });
});
```

### **2. Integration Tests**

#### **API Integration Tests**
```javascript
// tests/integration/userAPI.test.js
const request = require('supertest');
const app = require('../../src/app');
const { setupTestDB, cleanupTestDB } = require('../helpers/database');

describe('User API Integration', () => {
  beforeAll(async () => {
    await setupTestDB();
  });
  
  afterAll(async () => {
    await cleanupTestDB();
  });
  
  describe('POST /auth/register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe'
      };
      
      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });
    
    it('should return error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

#### **Database Integration Tests**
```javascript
// tests/integration/orderDatabase.test.js
const { Order, OrderItem } = require('../../src/models');
const { setupTestDB, cleanupTestDB } = require('../helpers/database');

describe('Order Database Integration', () => {
  beforeEach(async () => {
    await setupTestDB();
  });
  
  afterEach(async () => {
    await cleanupTestDB();
  });
  
  it('should create order with items in transaction', async () => {
    const orderData = {
      userId: 1,
      totalAmount: 299.99,
      status: 'pending'
    };
    
    const itemsData = [
      { productId: 1, quantity: 2, price: 99.99 },
      { productId: 2, quantity: 1, price: 99.99 }
    ];
    
    const order = await Order.createWithItems(orderData, itemsData);
    
    expect(order.id).toBeDefined();
    expect(order.items).toHaveLength(2);
    expect(order.totalAmount).toBe(299.99);
  });
});
```

### **3. End-to-End Tests**

#### **User Journey Tests**
```javascript
// tests/e2e/userJourney.test.js
const { test, expect } = require('@playwright/test');

test.describe('Complete Purchase Journey', () => {
  test('user can register, browse products, and complete purchase', async ({ page }) => {
    // User Registration
    await page.goto('http://localhost:3000/register');
    await page.fill('[data-testid=email]', 'e2e@example.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.fill('[data-testid=firstName]', 'E2E');
    await page.fill('[data-testid=lastName]', 'User');
    await page.click('[data-testid=register-button]');
    
    await expect(page).toHaveURL('/dashboard');
    
    // Product Browsing
    await page.goto('/products');
    await page.fill('[data-testid=search-input]', 'laptop');
    await page.click('[data-testid=search-button]');
    
    await expect(page.locator('[data-testid=product-card]')).toHaveCount(5);
    
    // Add to Cart
    await page.click('[data-testid=product-card]').first();
    await page.click('[data-testid=add-to-cart]');
    
    await expect(page.locator('[data-testid=cart-count]')).toHaveText('1');
    
    // Checkout Process
    await page.click('[data-testid=cart-icon]');
    await page.click('[data-testid=checkout-button]');
    
    // Fill shipping information
    await page.fill('[data-testid=shipping-street]', '123 Test St');
    await page.fill('[data-testid=shipping-city]', 'Test City');
    await page.fill('[data-testid=shipping-zip]', '12345');
    
    // Add payment method
    await page.click('[data-testid=add-payment-method]');
    await page.fill('[data-testid=card-number]', '4242424242424242');
    await page.fill('[data-testid=expiry]', '12/25');
    await page.fill('[data-testid=cvc]', '123');
    
    // Complete order
    await page.click('[data-testid=place-order]');
    
    await expect(page.locator('[data-testid=order-confirmation]')).toBeVisible();
    await expect(page.locator('[data-testid=order-number]')).toContainText('ORD-');
  });
});
```

## Performance Testing

### **Load Testing Scenarios**

#### **User Authentication Load**
```yaml
# tests/load/auth-load.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 300
      arrivalRate: 100
scenarios:
  - name: "Login load test"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomEmail() }}"
            password: "password123"
```

#### **Product Search Load**
```yaml
# tests/load/search-load.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 600
      arrivalRate: 500
scenarios:
  - name: "Product search"
    flow:
      - get:
          url: "/api/products/search?q={{ $randomString(5) }}"
```

### **Performance Benchmarks**
| Endpoint | Expected Response Time (P95) | Expected Throughput |
|----------|------------------------------|---------------------|
| User Login | < 200ms | 1000 req/sec |
| Product Search | < 300ms | 2000 req/sec |
| Order Creation | < 500ms | 100 req/sec |
| Payment Processing | < 1000ms | 50 req/sec |

## Test Data Management

### **Test Database Strategy**
```javascript
// tests/helpers/database.js
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

const setupTestDB = async () => {
  // PostgreSQL test database
  const pgPool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL
  });
  
  await pgPool.query('BEGIN');
  
  // MongoDB test database
  const mongoClient = new MongoClient(process.env.TEST_MONGODB_URL);
  await mongoClient.connect();
  
  return { pgPool, mongoClient };
};

const cleanupTestDB = async ({ pgPool, mongoClient }) => {
  await pgPool.query('ROLLBACK');
  await mongoClient.db().dropDatabase();
  await pgPool.end();
  await mongoClient.close();
};
```

### **Test Data Fixtures**
```javascript
// tests/fixtures/users.js
const userFixtures = {
  validUser: {
    email: 'valid@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  invalidUser: {
    email: 'invalid-email',
    password: '123' // Too short
  }
};

module.exports = userFixtures;
```

## Test Reporting

### **Coverage Reports**
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html

# Coverage thresholds
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### **Test Results Dashboard**
- **Allure Reports**: Comprehensive test reporting
- **Test Trends**: Track test performance over time
- **Flaky Test Detection**: Identify unreliable tests
- **Test Distribution**: Coverage across services

## Test Automation

### **CI/CD Integration**
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [user-service, product-service, order-service]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd services/${{ matrix.service }} && npm ci
      - name: Run unit tests
        run: cd services/${{ matrix.service }} && npm run test:unit
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - name: Run integration tests
        run: npm run test:integration
        
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Start services
        run: docker-compose -f docker-compose.test.yml up -d
      - name: Wait for services
        run: sleep 30
      - name: Run E2E tests
        run: npx playwright test
```

### **Test Environment Management**
```javascript
// tests/setup/testEnvironment.js
const { GenericContainer, Wait } = require('testcontainers');

const setupTestEnvironment = async () => {
  // Start PostgreSQL container
  const postgresContainer = await new GenericContainer('postgres:15')
    .withEnvironment({ POSTGRES_PASSWORD: 'test' })
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
    .start();
    
  // Start MongoDB container
  const mongoContainer = await new GenericContainer('mongo:7')
    .withExposedPorts(27017)
    .withWaitStrategy(Wait.forLogMessage('Waiting for connections'))
    .start();
    
  // Start Redis container
  const redisContainer = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
    .start();
    
  return {
    postgres: {
      host: postgresContainer.getHost(),
      port: postgresContainer.getMappedPort(5432)
    },
    mongodb: {
      host: mongoContainer.getHost(),
      port: mongoContainer.getMappedPort(27017)
    },
    redis: {
      host: redisContainer.getHost(),
      port: redisContainer.getMappedPort(6379)
    }
  };
};
```

## Mock & Stub Strategy

### **External Service Mocking**
```javascript
// tests/mocks/stripeService.js
const stripeServiceMock = {
  createPaymentIntent: jest.fn().mockResolvedValue({
    id: 'pi_test_123456',
    status: 'requires_payment_method',
    amount: 199.99
  }),
  
  confirmPayment: jest.fn().mockResolvedValue({
    id: 'pi_test_123456',
    status: 'succeeded',
    charges: {
      data: [{
        id: 'ch_test_123456',
        amount: 199.99,
        currency: 'usd'
      }]
    }
  }),
  
  createRefund: jest.fn().mockResolvedValue({
    id: 're_test_123456',
    amount: 199.99,
    status: 'succeeded'
  })
};

module.exports = stripeServiceMock;
```

### **Database Mocking**
```javascript
// tests/mocks/database.js
const mockDatabase = {
  users: new Map(),
  products: new Map(),
  orders: new Map(),
  
  async findUserByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  },
  
  async createUser(userData) {
    const id = this.users.size + 1;
    const user = { id, ...userData, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
};
```

## Security Testing

### **Authentication Tests**
```javascript
// tests/security/auth.test.js
describe('Authentication Security', () => {
  it('should reject requests without token', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .expect(401);
      
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
  
  it('should reject expired tokens', async () => {
    const expiredToken = generateExpiredToken();
    
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
      
    expect(response.body.error.code).toBe('TOKEN_EXPIRED');
  });
  
  it('should prevent SQL injection in user queries', async () => {
    const maliciousEmail = "admin@example.com'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/auth/login')
      .send({ email: maliciousEmail, password: 'password' })
      .expect(400);
      
    // Verify database is still intact
    const userCount = await User.count();
    expect(userCount).toBeGreaterThan(0);
  });
});
```

### **Input Validation Tests**
```javascript
// tests/security/validation.test.js
describe('Input Validation', () => {
  it('should sanitize XSS attempts', async () => {
    const maliciousInput = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: maliciousInput,
        description: 'Test product'
      })
      .expect(400);
      
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

## Test Metrics & Reporting

### **Key Testing Metrics**
- **Test Coverage**: Line, branch, function coverage
- **Test Execution Time**: Performance of test suite
- **Test Reliability**: Flaky test detection
- **Bug Detection Rate**: Tests catching issues

### **Automated Reporting**
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.test.{js,ts}',
    '!src/**/*.spec.{js,ts}'
  ],
  testMatch: [
    '**/__tests__/**/*.(js|ts)',
    '**/*.(test|spec).(js|ts)'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testEnvironment: 'node'
};
```

## Testing Best Practices

### **1. Test Organization**
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
├── fixtures/      # Test data
├── mocks/         # Service mocks
├── helpers/       # Test utilities
└── setup/         # Test environment setup
```

### **2. Test Naming Conventions**
- **Unit**: `*.test.js` or `*.spec.js`
- **Integration**: `*.integration.test.js`
- **E2E**: `*.e2e.test.js`
- **Performance**: `*.load.test.js`

### **3. Test Data Strategy**
- **Deterministic**: Predictable test data
- **Isolated**: Each test creates its own data
- **Realistic**: Production-like data volumes
- **Secure**: No real customer data in tests

### **4. Continuous Testing**
- **Pre-commit**: Unit tests run before commit
- **PR**: Full test suite on pull requests
- **Staging**: Integration tests on deployment
- **Production**: Synthetic monitoring tests

## Testing Tools & Configuration

### **Jest Configuration**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit"
  },
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "collectCoverageFrom": [
      "src/**/*.{js,ts}",
      "!src/**/*.test.{js,ts}"
    ]
  }
}
```

### **Playwright Configuration**
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] }
    }
  ]
};
```