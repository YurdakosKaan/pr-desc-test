# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Test stage (optional, can be skipped in production)
FROM builder AS test
RUN bun test

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

# Create data directory for persistence
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run the application
CMD ["bun", "run", "src/index.ts"]

