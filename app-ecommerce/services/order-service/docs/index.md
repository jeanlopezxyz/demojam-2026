# Order Service

## Order Processing & Fulfillment

The Order Service orchestrates the complete order lifecycle from cart creation to fulfillment, managing complex business workflows and integrating with payment and inventory systems.

## Key Responsibilities

- **Shopping Cart Management** - Session-based and persistent carts
- **Order Processing** - Order creation, validation, and workflow
- **Order Status Tracking** - Real-time order status updates
- **Fulfillment Coordination** - Integration with warehouses and shipping
- **Order Analytics** - Business metrics and reporting
- **Refund & Return Processing** - Post-purchase operations

## Technical Architecture

```mermaid
graph TD
    A[API Gateway] --> B[Order Service]
    B --> C[Express.js Router]
    
    C --> D[Cart Controller]
    C --> E[Order Controller]
    C --> F[Fulfillment Controller]
    
    D --> G[Cart Service]
    E --> H[Order Service]
    F --> I[Fulfillment Service]
    
    G --> J[(PostgreSQL)]
    H --> J
    I --> J
    
    H --> K[Payment Service]
    H --> L[Inventory Service]
    H --> M[Notification Service]
    
    H --> N[Order State Machine]
    N --> O[Webhook System]
```

## Database Schema

### **Orders Table**
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    
    -- Financial Information
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Shipping Information
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    shipping_method VARCHAR(50),
    estimated_delivery_date DATE,
    
    -- Tracking
    tracking_number VARCHAR(100),
    carrier VARCHAR(50),
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'web',
    notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT orders_total_positive CHECK (total_amount >= 0)
);

-- Custom enum type for order status
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed', 
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'returned'
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
```

### **Order Items Table**
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    
    -- Product Information (snapshot at time of order)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image VARCHAR(500),
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Product Variants
    selected_attributes JSONB DEFAULT '{}',
    
    -- Fulfillment
    fulfillment_status VARCHAR(50) DEFAULT 'pending',
    warehouse_location VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT order_items_price_positive CHECK (unit_price >= 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### **Shopping Carts Table**
```sql
CREATE TABLE shopping_carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    
    -- Cart totals
    subtotal DECIMAL(10,2) DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Constraints
    CONSTRAINT shopping_carts_user_session_check CHECK (
        (user_id IS NOT NULL AND session_id IS NULL) OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    )
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    selected_attributes JSONB DEFAULT '{}',
    added_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES shopping_carts(id) ON DELETE CASCADE,
    CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0),
    UNIQUE(cart_id, product_id, selected_attributes)
);
```

## Order State Machine

### **Order Status Flow**
```mermaid
stateDiagram-v2
    [*] --> pending : Create Order
    pending --> confirmed : Payment Successful
    pending --> cancelled : Payment Failed
    
    confirmed --> processing : Inventory Reserved
    confirmed --> cancelled : Insufficient Stock
    
    processing --> shipped : Items Dispatched
    processing --> cancelled : Processing Error
    
    shipped --> delivered : Customer Received
    shipped --> returned : Return Initiated
    
    delivered --> returned : Return Request
    delivered --> [*] : Order Complete
    
    cancelled --> [*] : Order Cancelled
    returned --> refunded : Refund Processed
    refunded --> [*] : Refund Complete
```

### **State Machine Implementation**
```javascript
// Order state machine
const OrderStateMachine = {
  transitions: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: ['refunded'],
    refunded: []
  },
  
  async transition(orderId, newStatus, context = {}) {
    const order = await Order.findById(orderId);
    
    if (!this.canTransition(order.status, newStatus)) {
      throw new Error(`Invalid transition from ${order.status} to ${newStatus}`);
    }
    
    // Execute pre-transition hooks
    await this.executePreHooks(order, newStatus, context);
    
    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: newStatus,
        updatedAt: new Date(),
        [`${newStatus}At`]: new Date()
      },
      { new: true }
    );
    
    // Execute post-transition hooks
    await this.executePostHooks(updatedOrder, newStatus, context);
    
    return updatedOrder;
  },
  
  canTransition(currentStatus, newStatus) {
    return this.transitions[currentStatus]?.includes(newStatus) || false;
  },
  
  async executePreHooks(order, newStatus, context) {
    switch (newStatus) {
      case 'confirmed':
        await this.reserveInventory(order);
        await this.createPaymentIntent(order);
        break;
      case 'processing':
        await this.validateInventoryReservation(order);
        break;
      case 'shipped':
        await this.generateTrackingNumber(order);
        await this.notifyCustomer(order, 'shipped');
        break;
    }
  },
  
  async executePostHooks(order, newStatus, context) {
    // Send status update notifications
    await notificationService.sendOrderStatusUpdate(order.userId, {
      orderId: order.id,
      status: newStatus,
      trackingNumber: order.trackingNumber
    });
    
    // Update analytics
    await analyticsService.trackOrderEvent(order.id, newStatus);
    
    // Trigger webhooks
    await webhookService.triggerOrderWebhook(order, newStatus);
  }
};
```

## API Endpoints

### **Shopping Cart API**

#### **GET /cart**
```javascript
// Get user's cart
// Authorization: Bearer {token}

// Response
{
  "id": 123,
  "userId": 456,
  "items": [
    {
      "id": 789,
      "productId": 101,
      "productName": "MacBook Pro 16-inch",
      "productImage": "/images/products/macbook-pro-16.jpg",
      "unitPrice": 2499.99,
      "quantity": 1,
      "totalPrice": 2499.99,
      "selectedAttributes": {
        "color": "Space Gray",
        "storage": "512GB"
      },
      "availability": {
        "inStock": true,
        "maxQuantity": 5
      }
    }
  ],
  "totals": {
    "subtotal": 2499.99,
    "tax": 199.99,
    "shipping": 0,
    "discount": 0,
    "total": 2699.98
  },
  "itemCount": 1,
  "currency": "USD",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### **POST /cart/items**
```javascript
// Add item to cart
// Authorization: Bearer {token}

// Request
{
  "productId": 101,
  "quantity": 2,
  "selectedAttributes": {
    "color": "Space Gray",
    "storage": "1TB"
  }
}

// Response
{
  "success": true,
  "cartItem": {
    "id": 790,
    "productId": 101,
    "quantity": 2,
    "totalPrice": 4999.98
  },
  "cart": {
    "itemCount": 3,
    "total": 7499.97
  }
}
```

### **Order Management API**

#### **POST /orders**
```javascript
// Create order from cart
// Authorization: Bearer {token}

// Request
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe", 
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "US",
    "phone": "+1234567890"
  },
  "billingAddress": {
    // Same structure as shipping, or null to use shipping address
  },
  "paymentMethodId": "pm_1234567890",
  "shippingMethod": "standard",
  "promoCode": "SAVE10",
  "notes": "Please leave at front door"
}

// Response
{
  "order": {
    "id": 1001,
    "orderNumber": "ORD-2024-001001",
    "status": "pending",
    "items": [
      {
        "productId": 101,
        "productName": "MacBook Pro 16-inch",
        "quantity": 1,
        "unitPrice": 2499.99,
        "totalPrice": 2499.99
      }
    ],
    "totals": {
      "subtotal": 2499.99,
      "tax": 199.99,
      "shipping": 0,
      "discount": 249.99,
      "total": 2449.99
    },
    "shippingAddress": { /* address details */ },
    "estimatedDelivery": "2024-01-22",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "paymentIntent": {
    "id": "pi_1234567890",
    "status": "requires_confirmation",
    "clientSecret": "pi_1234567890_secret_abc123"
  }
}
```

#### **GET /orders**
```javascript
// List user's orders
// Authorization: Bearer {token}
// Query: ?status=completed&page=1&limit=10&startDate=2024-01-01

// Response
{
  "orders": [
    {
      "id": 1001,
      "orderNumber": "ORD-2024-001001",
      "status": "delivered",
      "itemCount": 2,
      "totalAmount": 2449.99,
      "currency": "USD",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "deliveredAt": "2024-01-20T14:22:00.000Z",
      "items": [
        {
          "productName": "MacBook Pro 16-inch",
          "quantity": 1,
          "totalPrice": 2499.99,
          "image": "/images/products/macbook-pro-16-thumb.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "summary": {
    "totalOrders": 25,
    "totalSpent": 12750.50,
    "averageOrderValue": 510.02
  }
}
```

## Business Logic

### **Order Creation Workflow**
```javascript
// Order creation process
const createOrder = async (userId, orderData) => {
  const transaction = await db.transaction();
  
  try {
    // 1. Validate cart contents
    const cart = await Cart.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // 2. Validate product availability
    const availability = await inventoryService.checkAvailability(cart.items);
    if (!availability.allAvailable) {
      throw new Error('Some items are out of stock');
    }
    
    // 3. Calculate totals
    const pricing = await calculateOrderTotals(cart.items, orderData);
    
    // 4. Create order record
    const order = await Order.create({
      userId,
      orderNumber: generateOrderNumber(),
      items: cart.items,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      ...pricing
    }, { transaction });
    
    // 5. Reserve inventory
    await inventoryService.reserveItems(order.id, cart.items);
    
    // 6. Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      orderId: order.id,
      amount: pricing.totalAmount,
      currency: pricing.currency,
      paymentMethodId: orderData.paymentMethodId
    });
    
    // 7. Clear user's cart
    await Cart.clearByUserId(userId, { transaction });
    
    await transaction.commit();
    
    // 8. Send confirmation email
    await notificationService.sendOrderConfirmation(userId, order);
    
    return { order, paymentIntent };
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

### **Order Fulfillment Process**
```javascript
// Fulfillment workflow
const fulfillOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  
  if (order.status !== 'confirmed') {
    throw new Error('Order must be confirmed before fulfillment');
  }
  
  try {
    // 1. Update status to processing
    await OrderStateMachine.transition(orderId, 'processing');
    
    // 2. Allocate inventory from specific warehouse
    const allocation = await inventoryService.allocateItems(order.items);
    
    // 3. Generate pick list for warehouse
    const pickList = await generatePickList(order, allocation);
    await warehouseService.createPickList(pickList);
    
    // 4. Create shipping label
    const shippingLabel = await shippingService.createLabel({
      orderId: order.id,
      fromAddress: allocation.warehouse.address,
      toAddress: order.shippingAddress,
      items: order.items,
      shippingMethod: order.shippingMethod
    });
    
    // 5. Update order with tracking info
    await Order.findByIdAndUpdate(orderId, {
      trackingNumber: shippingLabel.trackingNumber,
      carrier: shippingLabel.carrier,
      shippingLabelUrl: shippingLabel.labelUrl
    });
    
    // 6. Transition to shipped status
    await OrderStateMachine.transition(orderId, 'shipped', {
      trackingNumber: shippingLabel.trackingNumber
    });
    
    return shippingLabel;
    
  } catch (error) {
    // Mark order as processing error
    await Order.findByIdAndUpdate(orderId, {
      status: 'processing_error',
      internalNotes: `Fulfillment error: ${error.message}`
    });
    
    throw error;
  }
};
```

## Pricing Engine

### **Order Total Calculation**
```javascript
const calculateOrderTotals = async (items, orderData) => {
  let subtotal = 0;
  
  // Calculate subtotal
  for (const item of items) {
    const product = await productService.getById(item.productId);
    const unitPrice = await pricingService.getPrice(product, item.selectedAttributes);
    subtotal += unitPrice * item.quantity;
  }
  
  // Apply promotions
  const promotions = await promotionService.getApplicablePromotions(orderData.userId, items);
  let discountAmount = 0;
  for (const promotion of promotions) {
    discountAmount += await promotion.calculateDiscount(subtotal, items);
  }
  
  // Apply promo code
  if (orderData.promoCode) {
    const promoDiscount = await promoCodeService.validateAndApply(orderData.promoCode, subtotal);
    discountAmount += promoDiscount;
  }
  
  // Calculate tax
  const taxAmount = await taxService.calculateTax({
    subtotal: subtotal - discountAmount,
    shippingAddress: orderData.shippingAddress,
    items: items
  });
  
  // Calculate shipping
  const shippingAmount = await shippingService.calculateCost({
    items: items,
    shippingAddress: orderData.shippingAddress,
    shippingMethod: orderData.shippingMethod
  });
  
  const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;
  
  return {
    subtotal,
    discountAmount,
    taxAmount,
    shippingAmount,
    totalAmount,
    currency: 'USD'
  };
};
```

## Service Integrations

### **Payment Service Integration**
```javascript
// Payment processing integration
const processPayment = async (orderId, paymentData) => {
  const order = await Order.findById(orderId);
  
  try {
    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: order.totalAmount,
      currency: order.currency,
      orderId: orderId,
      customerId: order.userId,
      paymentMethodId: paymentData.paymentMethodId,
      metadata: {
        orderNumber: order.orderNumber,
        itemCount: order.items.length
      }
    });
    
    // Confirm payment
    const payment = await paymentService.confirmPayment(paymentIntent.id, {
      paymentMethodId: paymentData.paymentMethodId,
      returnUrl: `${process.env.FRONTEND_URL}/orders/${orderId}/confirmation`
    });
    
    if (payment.status === 'succeeded') {
      await OrderStateMachine.transition(orderId, 'confirmed', {
        paymentId: payment.id,
        transactionId: payment.charges.data[0].id
      });
    }
    
    return payment;
    
  } catch (error) {
    await OrderStateMachine.transition(orderId, 'cancelled', {
      cancellationReason: 'payment_failed',
      paymentError: error.message
    });
    
    throw error;
  }
};
```

### **Inventory Service Integration**
```javascript
// Inventory management integration
const InventoryIntegration = {
  async checkAvailability(items) {
    const response = await fetch(`${process.env.INVENTORY_SERVICE_URL}/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getServiceToken()}`
      },
      body: JSON.stringify({ items })
    });
    
    return await response.json();
  },
  
  async reserveItems(orderId, items) {
    const response = await fetch(`${process.env.INVENTORY_SERVICE_URL}/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getServiceToken()}`
      },
      body: JSON.stringify({
        orderId,
        items,
        reservationTTL: 3600 // 1 hour
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to reserve inventory');
    }
    
    return await response.json();
  },
  
  async releaseReservation(orderId) {
    await fetch(`${process.env.INVENTORY_SERVICE_URL}/release/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await getServiceToken()}`
      }
    });
  }
};
```

## Analytics & Metrics

### **Business Metrics**
```javascript
// Order metrics collection
const OrderMetrics = {
  // Counter metrics
  ordersCreated: new promClient.Counter({
    name: 'orders_created_total',
    help: 'Total number of orders created',
    labelNames: ['source', 'payment_method']
  }),
  
  orderValue: new promClient.Histogram({
    name: 'order_value_usd',
    help: 'Order value in USD',
    labelNames: ['user_segment', 'source'],
    buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000]
  }),
  
  // Processing time metrics
  orderProcessingTime: new promClient.Histogram({
    name: 'order_processing_duration_seconds',
    help: 'Time to process order from creation to confirmation',
    labelNames: ['payment_method']
  }),
  
  // Conversion metrics
  cartConversion: new promClient.Gauge({
    name: 'cart_conversion_rate',
    help: 'Percentage of carts converted to orders'
  }),
  
  // Track key events
  trackOrderCreated(order, source) {
    this.ordersCreated.inc({ 
      source, 
      payment_method: order.paymentMethod 
    });
    
    this.orderValue.observe(
      { 
        user_segment: order.userSegment,
        source 
      }, 
      order.totalAmount
    );
  },
  
  trackOrderProcessed(order, processingStartTime) {
    const duration = (Date.now() - processingStartTime) / 1000;
    this.orderProcessingTime.observe(
      { payment_method: order.paymentMethod },
      duration
    );
  }
};
```

## Testing Strategy

### **Unit Tests**
```javascript
// tests/unit/orderService.test.js
describe('Order Service', () => {
  describe('calculateOrderTotals', () => {
    it('should calculate correct totals with tax and shipping', async () => {
      const items = [
        { productId: 1, quantity: 2, unitPrice: 99.99 },
        { productId: 2, quantity: 1, unitPrice: 149.99 }
      ];
      
      const orderData = {
        shippingAddress: { state: 'CA', country: 'US' },
        shippingMethod: 'standard'
      };
      
      const totals = await orderService.calculateOrderTotals(items, orderData);
      
      expect(totals.subtotal).toBe(349.97);
      expect(totals.taxAmount).toBe(30.50); // CA tax rate
      expect(totals.shippingAmount).toBe(0); // Free shipping
      expect(totals.totalAmount).toBe(380.47);
    });
  });
  
  describe('validateOrderTransition', () => {
    it('should allow valid status transitions', () => {
      expect(orderService.canTransition('pending', 'confirmed')).toBe(true);
      expect(orderService.canTransition('shipped', 'delivered')).toBe(true);
    });
    
    it('should reject invalid status transitions', () => {
      expect(orderService.canTransition('pending', 'shipped')).toBe(false);
      expect(orderService.canTransition('delivered', 'pending')).toBe(false);
    });
  });
});
```

### **Integration Tests**
```javascript
// tests/integration/orderWorkflow.test.js
describe('Order Workflow Integration', () => {
  it('should complete full order workflow', async () => {
    // Setup test data
    const user = await createTestUser();
    const product = await createTestProduct({ price: 99.99, stock: 10 });
    
    // Add to cart
    const cart = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ productId: product.id, quantity: 2 })
      .expect(200);
    
    // Create order
    const orderResponse = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        shippingAddress: testShippingAddress,
        paymentMethodId: 'pm_test_123'
      })
      .expect(201);
    
    const orderId = orderResponse.body.order.id;
    
    // Simulate payment confirmation
    await request(app)
      .post(`/orders/${orderId}/confirm-payment`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ paymentIntentId: 'pi_test_123' })
      .expect(200);
    
    // Verify order status
    const order = await Order.findById(orderId);
    expect(order.status).toBe('confirmed');
    
    // Verify inventory was reserved
    const inventory = await inventoryService.getReservation(orderId);
    expect(inventory.items).toHaveLength(1);
    expect(inventory.items[0].quantity).toBe(2);
  });
});
```

## Security Considerations

### **Authorization Rules**
- **Cart Operations**: User can only access their own cart
- **Order Creation**: Validated user with payment method
- **Order Viewing**: Users see only their orders
- **Order Management**: Admin can view/modify all orders
- **Fulfillment**: Warehouse role for fulfillment operations

### **Data Protection**
- **PII Encryption**: Shipping addresses encrypted at rest
- **Payment Data**: No credit card data stored (PCI compliance)
- **Order History**: Archived after 7 years
- **Audit Trail**: All order modifications logged

## Deployment Configuration

### **Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/orders
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000

# External Services
PAYMENT_SERVICE_URL=http://payment-service:3004
INVENTORY_SERVICE_URL=http://inventory-service:3005
NOTIFICATION_SERVICE_URL=http://notification-service:3006
PRODUCT_SERVICE_URL=http://product-service:3002

# Business Configuration
ORDER_TIMEOUT_MINUTES=30
MAX_CART_ITEMS=50
MAX_ORDER_VALUE=50000
DEFAULT_CURRENCY=USD

# Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Monitoring
METRICS_PORT=9090
LOG_LEVEL=info
```