-- Create databases for PostgreSQL services
CREATE DATABASE user_service_db;
CREATE DATABASE order_service_db;
CREATE DATABASE payment_service_db;
CREATE DATABASE inventory_service_db;
CREATE DATABASE keycloak_db;

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON DATABASE user_service_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE order_service_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE payment_service_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE inventory_service_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO postgres;