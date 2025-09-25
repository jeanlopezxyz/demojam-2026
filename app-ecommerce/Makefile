.PHONY: help build up down dev logs clean install test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for all services
	@echo "Installing dependencies for all services..."
	cd services/user-service && npm install
	cd services/product-service && npm install
	cd services/order-service && npm install
	cd services/payment-service && npm install
	cd services/inventory-service && npm install
	cd services/notification-service && npm install
	cd api-gateway && npm install
	cd frontend && npm install

build: ## Build all Docker images
	@echo "Building all Docker images..."
	docker-compose build

up: ## Start all services in production mode
	@echo "Starting all services..."
	docker-compose up -d

dev: ## Start all services in development mode with hot reload
	@echo "Starting services in development mode..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

down: ## Stop all services
	@echo "Stopping all services..."
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-service: ## View logs from specific service (usage: make logs-service SERVICE=user-service)
	docker-compose logs -f $(SERVICE)

clean: ## Clean up Docker containers, images, and volumes
	@echo "Cleaning up..."
	docker-compose down -v --remove-orphans
	docker system prune -f

restart: ## Restart all services
	make down
	make up

restart-service: ## Restart specific service (usage: make restart-service SERVICE=user-service)
	docker-compose restart $(SERVICE)

shell: ## Access shell of specific service (usage: make shell SERVICE=user-service)
	docker-compose exec $(SERVICE) sh

db-shell: ## Access PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d ecommerce_db

mongo-shell: ## Access MongoDB shell
	docker-compose exec mongodb mongosh -u mongo -p password

redis-shell: ## Access Redis shell
	docker-compose exec redis redis-cli -a password

test: ## Run tests for all services
	@echo "Running tests..."
	cd services/user-service && npm test
	cd services/product-service && npm test
	cd services/order-service && npm test
	cd services/payment-service && npm test
	cd services/inventory-service && npm test
	cd services/notification-service && npm test
	cd api-gateway && npm test
	cd frontend && npm test

health: ## Check health of all services
	@echo "Checking service health..."
	curl -s http://localhost:8080/health | jq .

setup: ## Initial setup - install dependencies and start services
	make install
	make build
	make up
	@echo "Setup complete! Services are starting..."
	@echo "Frontend: http://localhost:3000"
	@echo "API Gateway: http://localhost:8080"
	@echo "Health Check: http://localhost:8080/health"

status: ## Show status of all services
	docker-compose ps