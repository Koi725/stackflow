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

# Compile the TypeScript seed to a plain CommonJS file so the slim runner can run
# it with `node` — no tsx (a devDependency) is needed at deploy time. esbuild is
# already present here via tsx.
#
# --bundle inlines bcryptjs into the output: Next's build webpacks bcryptjs into
# the server chunks rather than leaving it in the traced standalone node_modules,
# so a bare `require("bcryptjs")` from the seed would fail with "Cannot find
# module 'bcryptjs'". Bundling makes the seed self-contained for that dep.
#
# @prisma/client is kept EXTERNAL on purpose: bundling it breaks Prisma's native
# query-engine loader (it looks for libquery_engine-*.node next to the bundle).
# Left external, it resolves at runtime from node_modules/@prisma/client (copied
# into the runner below) where the engine loads correctly.
RUN npx esbuild prisma/seed.ts --bundle --platform=node --format=cjs \
    --external:@prisma/client --outfile=prisma/seed.js

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

# Prisma schema + migrations + the compiled seed (prisma/seed.js), plus the FULL
# CLI package and engines (which the traced standalone node_modules does NOT
# include). Migrations are invoked by running the real package entry directly:
#   node node_modules/prisma/build/index.js migrate deploy
# The full node_modules/prisma package must stay intact — its build/index.js loads
# sibling assets (prisma_schema_build_bg.wasm etc.) by __dirname, so it MUST be run
# from its real path, never via a copied .bin symlink (which breaks those siblings).
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
