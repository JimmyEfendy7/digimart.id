# Simplified single-stage Dockerfile for EasyPanel (with build-time fetch skip)
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Accept build-time arguments from EasyPanel and expose them as ENV for Next.js build
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_ASSETS_BASE_URL
ARG NEXT_PUBLIC_FRONTEND_URL
ARG NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
ARG NEXT_PUBLIC_MIDTRANS_ENVIRONMENT

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_ASSETS_BASE_URL=${NEXT_PUBLIC_ASSETS_BASE_URL}
ENV NEXT_PUBLIC_FRONTEND_URL=${NEXT_PUBLIC_FRONTEND_URL}
ENV NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=${NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
ENV NEXT_PUBLIC_MIDTRANS_ENVIRONMENT=${NEXT_PUBLIC_MIDTRANS_ENVIRONMENT}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_BASE_URL}

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOST=0.0.0.0

# Optionally skip network fetches during build to avoid ECONNREFUSED when backend is unavailable
# This does NOT disable TypeScript or ESLint; it only affects our api.ts guards
ARG SKIP_BUILD_FETCH=true

# Build the application (apply SKIP_BUILD_FETCH only at build time)
RUN SKIP_BUILD_FETCH=${SKIP_BUILD_FETCH} pnpm build

# Create non-root user
RUN useradd -m -s /bin/bash app && chown -R app:app /app

# Switch to non-root user
USER app

# Expose port
EXPOSE 3000

# Healthcheck (expects /health route; falls back to /)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/health || curl -fsS http://127.0.0.1:3000/ || exit 1

# Start the application
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
