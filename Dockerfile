# Railway Dockerfile for DreamWeaver API
FROM node:18-alpine

WORKDIR /app

# Copy package files for server only
COPY server/package*.json ./
COPY shared ./shared

# Install dependencies
RUN npm ci --only=production

# Copy server source
COPY server/src ./src
COPY server/tsconfig.json ./

# Copy shared types
COPY shared ../shared

# Install tsx for running TypeScript directly
RUN npm install -g tsx

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the server with tsx
CMD ["tsx", "src/index.ts"]