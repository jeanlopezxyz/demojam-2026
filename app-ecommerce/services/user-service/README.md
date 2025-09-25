# User Service

## Overview
The User Service handles all authentication, authorization, and user management operations for the e-commerce platform.

## Features
- JWT-based authentication
- Role-based access control (RBAC)
- User profile management
- Password encryption and security
- Session management
- Account recovery

## Architecture
- **Technology**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Encryption**: bcrypt for passwords
- **Validation**: Joi for input validation

## Database Schema
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Password recovery

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/account` - Delete user account
- `GET /users/{id}` - Get user by ID (admin only)

## Configuration
Environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration time
- `BCRYPT_ROUNDS` - Password hashing rounds

## Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

## Monitoring
- Health check endpoint: `GET /health`
- Metrics endpoint: `GET /metrics`
- Database connection monitoring
- Authentication rate limiting

## Deployment
```bash
# Docker build
docker build -t user-service .

# Docker run
docker run -p 3001:3001 user-service

# With environment
docker run -p 3001:3001 --env-file .env user-service
```