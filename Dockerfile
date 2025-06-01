# ─── STAGE 1: Build ───────────────────────────────────────────────────────────
FROM --platform=linux/amd64 node:18-alpine AS builder

# Install build dependencies for bcrypt (and any other native modules)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of your source
COPY . .

# Generate Prisma client
# Note: This DATABASE_URL is only used during build time for generating the Prisma client
# The actual DATABASE_URL used at runtime will come from environment variables

# Add Clerk environment variables for build time


RUN npx prisma generate

RUN npm rebuild bcrypt --build-from-source

# Skip static optimization for pages that require authentication
ENV NEXT_PUBLIC_SKIP_AUTH_PAGES="true"

# Build the Next.js app
RUN npm run build

# ─── STAGE 2: Production Image ────────────────────────────────────────────────
FROM --platform=linux/amd64 node:18-alpine AS runner

WORKDIR /app

# Copy only prod deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build output and runtime assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Prisma schema for migrations
COPY --from=builder /app/prisma/schema.prisma ./prisma/

# Add a script to run migrations and start the app
COPY --from=builder /app/package.json ./package.json

# No need for a custom entrypoint script
EXPOSE 3000
ENV NODE_ENV=production

# Just start the app without running migrations
CMD ["npm", "run", "start"]
