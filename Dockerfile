# Multi-stage Dockerfile for production build

# 1) Builder: install deps and compile TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

# Install OS deps used by Prisma engines during generate
RUN apk add --no-cache libc6-compat openssl

# Copy package manifests first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including dev) for build
RUN npm ci

# Copy sources
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and build TS
RUN npx prisma generate
RUN npm run build
RUN mkdir -p dist/generated && cp -r src/generated/* dist/generated/ || true


# 2) Production runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ARG APP_LOCALE=en
ARG APP_TIMEZONE="Europe/Kyiv"
ARG BOOKING_AVAILABLE_FROM_TIME="07:00"
ARG BOOKING_AVAILABLE_TO_TIME="23:59"
ARG BOOKING_SLOT_SIZE_IN_MINUTES=30
ARG BOOKING_MIN_DURATION_MINUTES=30
ARG BOOKING_MAX_DURATION_MINUTES=180

ENV NODE_ENV=production \
    APP_LOCALE=$APP_LOCALE \
    APP_TIMEZONE=$APP_TIMEZONE \
    BOOKING_AVAILABLE_FROM_TIME=$BOOKING_AVAILABLE_FROM_TIME \
    BOOKING_AVAILABLE_TO_TIME=$BOOKING_AVAILABLE_TO_TIME \
    BOOKING_SLOT_SIZE_IN_MINUTES=$BOOKING_SLOT_SIZE_IN_MINUTES \
    BOOKING_MIN_DURATION_MINUTES=$BOOKING_MIN_DURATION_MINUTES \
    BOOKING_MAX_DURATION_MINUTES=$BOOKING_MAX_DURATION_MINUTES

# Install runtime dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled app and necessary assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY locales ./locales
COPY docker/entrypoint.prod.sh ./entrypoint.prod.sh

# Bundle Prisma CLI and engines from builder to avoid runtime install
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/prisma /app/node_modules/prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/node_modules/.bin/prisma /usr/local/bin/prisma

# Ensure entrypoint is executable
RUN chmod +x ./entrypoint.prod.sh

# Non-root user for security
USER node

# Default command runs migrations and starts the app
ENTRYPOINT ["/app/entrypoint.prod.sh"]
