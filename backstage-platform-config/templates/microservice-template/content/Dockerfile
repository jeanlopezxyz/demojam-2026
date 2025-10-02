# Multi-stage production Dockerfile for ${{ values.name }}
# Following security and performance best practices

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy dependencies from build stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

# Create uploads directory if needed
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE ${{ values.port }}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${{ values.port }}/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=${{ values.port }}
ENV SERVICE_NAME=${{ values.name }}

# Labels for container metadata
LABEL maintainer="${{ values.owner }}"
LABEL service.name="${{ values.name }}"
LABEL service.version="1.0.0"
LABEL service.description="${{ values.description }}"
LABEL service.database="${{ values.database }}"

# Start application with dumb-init
CMD ["dumb-init", "node", "src/index.js"]