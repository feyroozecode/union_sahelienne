#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ────────────────────────────────────
REPO_DIR="/var/www/union_sahelienne"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"
# Deploy from prod: the deploy infra (this script, docker-compose.prod.yml,
# nginx/, certbot/) lives on the prod branch. Checking out main here would
# delete those files from the working tree and break the compose commands below.
# prod carries the merged app code, so it is the single source of truth for deploys.
GIT_BRANCH="prod"

# ── Colors ────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn()  { echo -e "${YELLOW}[deploy]${NC} $*"; }
error() { echo -e "${RED}[deploy]${NC} $*"; exit 1; }

# ── Pre-flight checks ────────────────────────────────
[[ -f "$REPO_DIR/$ENV_FILE" ]] || error ".env file not found at $REPO_DIR/$ENV_FILE"

cd "$REPO_DIR"

# ── 1. Pull latest code ──────────────────────────────
info "Pulling latest code from $GIT_BRANCH…"
git checkout "$GIT_BRANCH"
git pull origin "$GIT_BRANCH"

# ── 2. Ensure certbot directories exist ──────────────
mkdir -p ./certbot/conf ./certbot/www

# ── 3. Generate self-signed SSL cert if none exists ──
if [ ! -f ./certbot/conf/live/api-unionsahel.alfajarsoft.com/fullchain.pem ]; then
  info "Generating self-signed SSL cert for initial boot…"
  mkdir -p ./certbot/conf/live/api-unionsahel.alfajarsoft.com
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ./certbot/conf/live/api-unionsahel.alfajarsoft.com/privkey.pem \
    -out ./certbot/conf/live/api-unionsahel.alfajarsoft.com/fullchain.pem \
    -subj "/CN=api-unionsahel.alfajarsoft.com" 2>/dev/null
fi

# ── 4. Pull images & build ───────────────────────────
info "Building Docker images…"
docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" build --pull

# ── 5. Stop old containers ────────────────────────────
info "Stopping old containers…"
docker compose -f "$COMPOSE_FILE" down --remove-orphans || true

# ── 6. Start database first ──────────────────────────
info "Starting PostgreSQL…"
docker compose -f "$COMPOSE_FILE" up -d postgres
info "Waiting for PostgreSQL to be healthy…"
set -a; source "$REPO_DIR/$ENV_FILE"; set +a
docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${DATABASE_USERNAME}" -d "${DATABASE_NAME}" -t 30

# ── 7. Run database migrations ───────────────────────
info "Running Prisma migrations…"
docker compose -f "$COMPOSE_FILE" run --rm api npm run prisma:migrate:deploy

# ── 8. Seed database (if not already seeded) ─────────
info "Checking if database seed is needed…"
if docker compose -f "$COMPOSE_FILE" run --rm api node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient({ log: ['error'] });
  p.user.findFirst({ where: { email: 'admin@union-sahelienne.com', deletedAt: null } })
    .then(u => process.exit(u ? 0 : 1))
    .catch(() => process.exit(1));
" > /dev/null 2>&1; then
  info "Database already seeded, skipping."
else
  info "Seeding database…"
  docker compose -f "$COMPOSE_FILE" run --rm api \
    node dist/database/seeds/relational/run-seed.js
fi

# ── 9. Start all services ────────────────────────────
info "Starting all services…"
docker compose -f "$COMPOSE_FILE" up -d

# ── 10. Health check ─────────────────────────────────
info "Waiting for API to be ready…"
sleep 5
for i in {1..12}; do
  if docker compose -f "$COMPOSE_FILE" exec -T api node -e "const h=require('http');h.get('http://localhost:3002/api/v1',r=>{process.exit(r.statusCode<500?0:1)}).on('error',()=>process.exit(1))" > /dev/null 2>&1; then
    info "API is healthy!"
    break
  fi
  info "Waiting for API… ($i/12)"
  sleep 5
done

# ── 11. Clean up old images ───────────────────────────
info "Cleaning up unused Docker images…"
docker image prune -f

info "Deployment complete!"
info "API:   https://api-unionsahel.alfajarsoft.com"
info "Admin: https://union-sahel.alfajarsoft.com"
