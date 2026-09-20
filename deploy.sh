#!/usr/bin/env bash
#
# Stackflow deploy cycle — run this ON THE SERVER.
# down → prune → pull → build → migrate → up
#
# Prerequisites on the host: Docker + Compose v2, a root .env (see .env.example),
# and nginx fronting 127.0.0.1:3400. The database migrates automatically here;
# seeding is a deliberate, separate manual step (see the note at the bottom).
#
# Make it executable once:  chmod +x deploy.sh

set -euo pipefail

# Always operate from the repo root (where docker-compose.yml lives).
cd "$(dirname "$0")"

echo "==> [1/6] Stopping the current stack"
docker compose down

echo "==> [2/6] Pruning dangling images and old build cache"
docker image prune -f
docker builder prune -f --filter until=1h

echo "==> [3/6] Pulling the latest code"
git pull --rebase --autostash

echo "==> [4/6] Building images (no cache)"
docker compose build --no-cache

echo "==> [5/6] Applying database migrations"
# One-shot: run `prisma migrate deploy` in a throwaway app container. Compose
# starts the db dependency and waits for it to be healthy first. This keeps the
# app's runtime CMD clean (just `node server.js`) and the migration step explicit.
docker compose run --rm app npx prisma migrate deploy

echo "==> [6/6] Starting the stack"
docker compose up -d

echo "==> Status"
docker compose ps

# ---------------------------------------------------------------------------
# One-time seeding (NOT run automatically — do this by hand the first time only):
#   docker compose run --rm app npx prisma db seed
# It reads SEED_ADMIN_PASSWORD / SEED_MEMBER_PASSWORD from .env.
# ---------------------------------------------------------------------------
