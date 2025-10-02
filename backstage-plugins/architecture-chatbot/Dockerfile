FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build plugin
RUN npm run build

# Production stage
FROM scratch

# Copy built plugin
COPY --from=builder /app/dist /dist
COPY --from=builder /app/dynamic-plugin.json /

# Plugin metadata
LABEL name="architecture-chatbot"
LABEL version="1.0.0"
LABEL description="Architecture documentation chatbot plugin for Red Hat Developer Hub"