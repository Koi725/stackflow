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
# it with `node` — no tsx (a devDependency) is needed at deploy time. Imports
# (@prisma/client, bcryptjs) are left external and resolve at runtime from the
# traced standalone node_modules. esbuild is already present here via tsx.
RUN npx esbuild prisma/seed.ts --platform=node --format=cjs --outfile=prisma/seed.js

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

# Prisma schema + migrations + the compiled seed (prisma/seed.js), plus the CLI
# and engines (which the traced standalone node_modules does NOT include).
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# The `prisma` executable symlink (-> ../prisma/build/index.js). This is what
# `npx prisma` resolves from node_modules/.bin; without it, npx can't find the
# CLI locally and fails with "prisma: not found". Copied as a symlink; its target
# is the prisma package copied just above, so it resolves inside the runner.
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
# The real package.json (the Next standalone output writes a minimal one that has
# no `prisma.seed` key). `prisma db seed` reads the seed command from here.
COPY --from=builder /app/package.json ./package.json

# Create the avatar upload dir and hand the app tree to the non-root user. Because
# this dir is created + chowned in the image, a fresh named volume mounted here
# inherits that ownership, so the app can write uploads.
RUN mkdir -p /app/var/avatars && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

# Start the standalone server. Migrations are applied by deploy.sh before `up`.
CMD ["node", "server.js"]
