-- Order Service Initial Data  
-- Sample orders for testing CQRS

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    item_count INTEGER NOT NULL,
    shipping_address TEXT NOT NULL,
    billing_address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CQRS Read Model for optimized queries
CREATE TABLE IF NOT EXISTS order_read_model (
    order_id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    order_number VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    item_count INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_address TEXT,
    shipping_method VARCHAR(100),
    shipping_cost DECIMAL(10,2),
    estimated_delivery TIMESTAMP,
    payment_status VARCHAR(50),
    payment_method VARCHAR(100),
    payment_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Insert sample orders for testing
INSERT INTO orders (id, user_id, order_number, status, total_amount, item_count, shipping_address, billing_address, notes, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'ORD-2025-001', 'DELIVERED', 91.98, 2, '123 Main St, New York, NY 10001', '123 Main St, New York, NY 10001', 'Birthday gift', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', 'ORD-2025-002', 'SHIPPED', 55.99, 1, '456 Oak Ave, San Francisco, CA 94102', '456 Oak Ave, San Francisco, CA 94102', 'Conference wear', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440003', 'ORD-2025-003', 'PENDING', 134.97, 3, '789 Pine St, Seattle, WA 98101', '789 Pine St, Seattle, WA 98101', 'Team order', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

-- Insert order items
INSERT INTO order_items (order_id, product_id, sku, quantity, unit_price) VALUES
-- Order 1: Java Duke + Python Polo
('550e8400-e29b-41d4-a716-446655440101', '64f8b3c4d1234567890abce1', 'JAVA-POLO-001', 1, 45.99),
('550e8400-e29b-41d4-a716-446655440101', '64f8b3c4d1234567890abce2', 'PYTHON-POLO-001', 1, 42.99),

-- Order 2: Red Hat OpenShift Polo
('550e8400-e29b-41d4-a716-446655440102', '64f8b3c4d1234567890abce4', 'RH-OPENSHIFT-001', 1, 55.99),

-- Order 3: Docker + Kubernetes + React
('550e8400-e29b-41d4-a716-446655440103', '64f8b3c4d1234567890abce6', 'DOCKER-POLO-001', 1, 44.99),
('550e8400-e29b-41d4-a716-446655440103', '64f8b3c4d1234567890abce7', 'K8S-POLO-001', 1, 49.99),
('550e8400-e29b-41d4-a716-446655440103', '64f8b3c4d1234567890abce9', 'REACT-POLO-001', 1, 43.99);

-- Populate CQRS read model
INSERT INTO order_read_model (
    order_id, user_id, user_email, user_name, order_number, status, total_amount, 
    item_count, shipping_address, payment_status, payment_method, created_at, updated_at, completed_at
) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'John Doe', 'ORD-2025-001', 'DELIVERED', 91.98, 2, '123 Main St, New York, NY 10001', 'PAID', 'CREDIT_CARD', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'Jane Smith', 'ORD-2025-002', 'SHIPPED', 55.99, 1, '456 Oak Ave, San Francisco, CA 94102', 'PAID', 'PAYPAL', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NULL),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440003', 'mike.wilson@example.com', 'Mike Wilson', 'ORD-2025-003', 'PENDING', 134.97, 3, '789 Pine St, Seattle, WA 98101', 'PENDING', NULL, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_read_model_user_id ON order_read_model(user_id);
CREATE INDEX IF NOT EXISTS idx_read_model_status ON order_read_model(status);