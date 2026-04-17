#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# start-backend.sh — Run migrations, seed, then start the NestJS
#                    dev server (hot-reload via SWC).
# Usage: ./scripts/start-backend.sh
# ─────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Colour helpers ────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[backend]${NC} $*"; }
warn()  { echo -e "${YELLOW}[backend]${NC} $*"; }
error() { echo -e "${RED}[backend]${NC} $*"; exit 1; }

# ── Check .env ────────────────────────────────────────────────────
[[ -f .env ]] || error ".env not found — copy env-example-relational to .env first"

# ── Check PostgreSQL reachable ────────────────────────────────────
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5433}"
info "Checking PostgreSQL on ${DB_HOST}:${DB_PORT}…"
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -q 2>/dev/null; then
  warn "pg_isready not available or DB not ready — continuing anyway"
fi

# ── Prisma: generate client ───────────────────────────────────────
info "Generating Prisma client…"
npm run prisma:generate

# ── Prisma: apply pending migrations ─────────────────────────────
info "Applying Prisma migrations…"
npm run prisma:migrate:deploy

# ── Seed database ────────────────────────────────────────────────
info "Seeding database…"
npm run seed:run:relational

# ── Start dev server ─────────────────────────────────────────────
info "Starting NestJS dev server (SWC hot-reload)…"
info "API:    http://localhost:${APP_PORT:-3000}/api/v1"
info "Docs:   http://localhost:${APP_PORT:-3000}/docs"
npm run start:swc
