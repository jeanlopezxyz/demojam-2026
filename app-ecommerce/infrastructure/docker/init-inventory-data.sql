-- Inventory Service Initial Data
-- Stock levels for tech polo shirts

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    max_stock_level INTEGER NOT NULL DEFAULT 1000,
    location VARCHAR(100) DEFAULT 'MAIN_WAREHOUSE',
    last_restocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    reserved_for VARCHAR(255), -- order_id or user_id
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, RELEASED, CONFIRMED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert inventory for tech polo shirts
INSERT INTO inventory_items (product_id, sku, quantity, reserved_quantity, reorder_level, max_stock_level, location, last_restocked_at) VALUES
('64f8b3c4d1234567890abce1', 'JAVA-POLO-001', 150, 5, 20, 500, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abce2', 'PYTHON-POLO-001', 200, 8, 25, 600, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abce3', 'JS-POLO-001', 75, 3, 15, 300, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abce4', 'RH-OPENSHIFT-001', 100, 12, 20, 400, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abce5', 'AWS-POLO-001', 80, 4, 15, 350, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abce6', 'DOCKER-POLO-001', 120, 7, 25, 450, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abce7', 'K8S-POLO-001', 90, 6, 20, 400, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abce8', 'GITHUB-POLO-001', 110, 9, 22, 450, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abce9', 'REACT-POLO-001', 95, 5, 18, 380, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abcea', 'QUARKUS-POLO-001', 65, 15, 15, 300, 'MAIN_WAREHOUSE', NOW()),
('64f8b3c4d1234567890abceb', 'MICRO-POLO-001', 45, 2, 10, 200, 'MAIN_WAREHOUSE', NOW());

-- Create some sample reservations
INSERT INTO stock_reservations (product_id, quantity, reserved_for, expires_at, status) VALUES
('64f8b3c4d1234567890abce1', 2, 'order_123', NOW() + INTERVAL '1 hour', 'ACTIVE'),
('64f8b3c4d1234567890abce4', 5, 'order_124', NOW() + INTERVAL '2 hours', 'ACTIVE'),
('64f8b3c4d1234567890abcea', 3, 'cart_user_456', NOW() + INTERVAL '30 minutes', 'ACTIVE');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_reservations_product_id ON stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON stock_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON stock_reservations(status);