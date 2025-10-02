.PHONY: help build up down dev logs clean install test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for all services (NPM workspaces + Maven)
	@echo "Installing dependencies for all services..."
	@echo "📦 Installing NPM dependencies..."
	npm install
	@echo "☕ Installing Maven dependencies for Quarkus services..."
	@for service in user product order payment inventory notification recommendation; do \
		echo "Installing dependencies for $${service}-service..."; \
		cd services/$${service}-service && mvn dependency:go-offline -q && cd ../..; \
	done
	@echo "✅ All dependencies installed!"

dev: ## Start all services in development mode with hot reload
	@echo "Starting services in development mode..."
	docker-compose -f docker-compose.dev.yml up -d

build: ## Build all container images (Quarkus + Node.js)
	@echo "🔨 Building all container images..."
	@echo "☕ Building Quarkus services..."
	@for service in user product order payment inventory notification recommendation; do \
		echo "Building $${service}-service..."; \
		cd services/$${service}-service && mvn clean package -Dquarkus.container-image.build=true -Dquarkus.profile=dev -q && cd ../..; \
	done
	@echo "🚪 Building API Gateway and Frontend..."
	docker-compose -f docker-compose.dev.yml build api-gateway frontend
	@echo "✅ All images built and ready for deployment!"

build-for-openshift: ## Build container images for OpenShift deployment
	@echo "🚀 Building images for OpenShift..."
	@for service in user product order payment inventory notification recommendation; do \
		echo "Building $${service}-service for OpenShift..."; \
		cd services/$${service}-service && mvn clean package \
			-Dquarkus.container-image.build=true \
			-Dquarkus.container-image.push=false \
			-Dquarkus.profile=prod \
			-Dquarkus.container-image.registry=quay.io \
			-Dquarkus.container-image.group=redhat \
			-Dquarkus.container-image.tag=v1.0.0 && cd ../..; \
	done
	@echo "✅ OpenShift images built!"

push-images: ## Push container images to registry  
	@echo "📤 Pushing images to registry..."
	@for service in user product order payment inventory notification recommendation; do \
		echo "Pushing $${service}-service..."; \
		cd services/$${service}-service && mvn clean package \
			-Dquarkus.container-image.build=true \
			-Dquarkus.container-image.push=true \
			-Dquarkus.profile=prod && cd ../..; \
	done
	@echo "✅ All images pushed to registry!"

down: ## Stop all services
	@echo "Stopping all services..."
	docker-compose -f docker-compose.dev.yml down

logs: ## View logs from all services
	docker-compose -f docker-compose.dev.yml logs -f

logs-service: ## View logs from specific service (usage: make logs-service SERVICE=user-service)
	docker-compose -f docker-compose.dev.yml logs -f $(SERVICE)

clean: ## Clean up Docker containers, images, and volumes
	@echo "Cleaning up..."
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

restart: ## Restart all services
	make down
	make dev

restart-service: ## Restart specific service (usage: make restart-service SERVICE=user-service)
	docker-compose -f docker-compose.dev.yml restart $(SERVICE)

shell: ## Access shell of specific service (usage: make shell SERVICE=user-service)
	docker-compose -f docker-compose.dev.yml exec $(SERVICE) sh

db-shell: ## Access PostgreSQL shell
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d ecommerce_db

mongo-shell: ## Access MongoDB shell
	docker-compose -f docker-compose.dev.yml exec mongodb mongosh -u mongo -p password

redis-shell: ## Access Redis shell
	docker-compose -f docker-compose.dev.yml exec redis redis-cli -a password

test: ## Run tests for all services (NPM + Maven)
	@echo "Running tests for all services..."
	@echo "🧪 Running NPM tests..."
	npm run test --workspaces --if-present
	@echo "☕ Running Maven tests for Quarkus services..."
	@for service in user product order payment inventory notification recommendation; do \
		echo "Testing $${service}-service..."; \
		cd services/$${service}-service && mvn test -q && cd ../..; \
	done
	@echo "✅ All tests completed!"

health: ## Check health of all services
	@echo "Checking service health..."
	curl -s http://localhost:8080/health | jq . || echo "API Gateway not responding"

setup: ## Initial setup - install dependencies, build images, and start services  
	make install
	make build
	make dev
	@echo "Setup complete! Services are starting..."
	@echo "Frontend: http://localhost:3000"
	@echo "API Gateway: http://localhost:8080"
	@echo "Keycloak: http://localhost:8090"
	@echo "Health Check: http://localhost:8080/health"
	@echo ""
	@echo "🔧 Quarkus Dev UIs:"
	@for port in 3001 3002 3003 3004 3005 3006 3007; do \
		echo "  http://localhost:$$port/q/dev"; \
	done

native-build: ## Build native images for all Quarkus services
	@echo "Building native images (requires GraalVM)..."
	@for service in user product order payment inventory notification recommendation; do \
		echo "Building native image for $${service}-service..."; \
		cd services/$${service}-service && mvn clean package -Pnative -Dquarkus.container-image.build=true && cd ../..; \
	done
	@echo "✅ All native images built!"

quarkus-dev: ## Start individual Quarkus service in dev mode (usage: make quarkus-dev SERVICE=user-service)
	@if [ -z "$(SERVICE)" ]; then \
		echo "Usage: make quarkus-dev SERVICE=user-service"; \
		exit 1; \
	fi
	cd services/$(SERVICE) && mvn quarkus:dev

dev-assistant: ## Access Quarkus 3.28.1 Dev Assistant (AI-powered development help)
	@echo "🤖 Quarkus 3.28.1 Dev Assistant available at:"
	@echo ""
	@echo "  user-service: http://localhost:3001/q/dev-ui"
	@echo "  product-service: http://localhost:3002/q/dev-ui"
	@echo "  order-service: http://localhost:3003/q/dev-ui"
	@echo "  payment-service: http://localhost:3004/q/dev-ui" 
	@echo "  inventory-service: http://localhost:3005/q/dev-ui"
	@echo "  notification-service: http://localhost:3006/q/dev-ui"
	@echo "  recommendation-service: http://localhost:3007/q/dev-ui"
	@echo ""
	@echo "💡 Features: Code generation, AI suggestions, live reload, debugging"

java25-preview: ## Enable Java 25 preview features in development
	@echo "🔥 Enabling Java 25 preview features..."
	@for service in user product order payment inventory notification recommendation; do \
		echo "Enabling preview features for $${service}-service..."; \
		cd services/$${service}-service && mvn quarkus:dev -Dquarkus.args="--enable-preview" && cd ../..; \
	done

status: ## Show status of all services
	docker-compose -f docker-compose.dev.yml ps