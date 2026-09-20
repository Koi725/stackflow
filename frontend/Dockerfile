# syntax=docker/dockerfile:1
# Stackflow production image — one Next.js app (UI + API routes), Next "standalone"
# output for a slim runtime. Migrations are run separately on deploy (see deploy.sh);
# this image ships the Prisma CLI + engines so `prisma migrate deploy` works offline.

# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma's engines need these on Alpine (musl + openssl).
RUN apk add --no-cache libc6-compat openssl

# Install deps against the exact lockfile first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source and build.
COPY . .
# Generate the Prisma client, then build the Next standalone server.
# No NEXT_PUBLIC_* vars exist in this app, so no build args are needed.
RUN npx prisma generate
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Same runtime libs Prisma needs.
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    AVATAR_UPLOAD_DIR=/app/var/avatars

# Run as a non-root user.
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# Next standalone server + static assets + public/ (the standalone bundle already
# contains a minimal traced node_modules, including @prisma/client).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema + migrations (needed by `migrate deploy`), plus the CLI and engines
# (which the traced standalone node_modules does NOT include).
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create the avatar upload dir and hand the app tree to the non-root user. Because
# this dir is created + chowned in the image, a fresh named volume mounted here
# inherits that ownership, so the app can write uploads.
RUN mkdir -p /app/var/avatars && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

# Start the standalone server. Migrations are applied by deploy.sh before `up`.
CMD ["node", "server.js"]
