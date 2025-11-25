# Multi-stage build for Artist Booking App
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM dependencies AS build
COPY . .
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files, patches, and install production dependencies only
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --prod --frozen-lockfile

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
