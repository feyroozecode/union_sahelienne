#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# start-all.sh — Start backend (migrate + seed + dev server),
#                admin web panel (Next.js), and Flutter mobile
#                frontend in separate background processes.
#
# Usage: ./scripts/start-all.sh
#
# Ctrl-C kills all processes.
# ─────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS="$ROOT/scripts"

# ── Colour helpers ────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${CYAN}[all]${NC} $*"; }
section() { echo -e "\n${CYAN}══════════════════════════════════════════${NC}"; \
            echo -e "${CYAN} $*${NC}"; \
            echo -e "${CYAN}══════════════════════════════════════════${NC}\n"; }

# ── Track child PIDs for clean shutdown ──────────────────────────
PIDS=()
cleanup() {
  echo ""
  info "Shutting down…"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  info "Done."
}
trap cleanup INT TERM EXIT

# ── Load .env ────────────────────────────────────────────────────
[[ -f "$ROOT/.env" ]] && set -o allexport && source "$ROOT/.env" && set +o allexport || true

# ─────────────────────────────────────────────────────────────────
# STEP 1 — Run migrations and seed (blocking, must finish first)
# ─────────────────────────────────────────────────────────────────
section "Step 1/4 — Database setup"

cd "$ROOT"

info "Generating Prisma client…"
npm run prisma:generate

info "Applying migrations…"
npm run prisma:migrate:deploy

info "Seeding database…"
npm run seed:run:relational

# ─────────────────────────────────────────────────────────────────
# STEP 2 — Start backend in background
# ─────────────────────────────────────────────────────────────────
section "Step 2/4 — Backend (background)"

info "Starting NestJS dev server in background…"
npm run start:swc &
BACKEND_PID=$!
PIDS+=("$BACKEND_PID")
info "Backend PID: $BACKEND_PID"
info "API:  http://localhost:${APP_PORT:-3000}/api/v1"
info "Docs: http://localhost:${APP_PORT:-3000}/docs"

# Wait a few seconds for the backend to boot before starting frontend
info "Waiting 8s for backend to boot…"
sleep 8

# ─────────────────────────────────────────────────────────────────
# STEP 3 — Start admin web frontend (Next.js) in background
# ─────────────────────────────────────────────────────────────────
section "Step 3/4 — Admin Panel (background)"

ADMIN_DIR="$ROOT/admin"
if [[ -d "$ADMIN_DIR" && -f "$ADMIN_DIR/package.json" ]]; then
  info "Installing admin dependencies…"
  cd "$ADMIN_DIR"
  npm install --silent 2>/dev/null || npm install
  info "Starting admin panel (Next.js)…"
  npm run dev &
  ADMIN_PID=$!
  PIDS+=("$ADMIN_PID")
  info "Admin PID: $ADMIN_PID"
  info "Admin panel: http://localhost:3001"
  cd "$ROOT"
else
  echo -e "${YELLOW}[admin]${NC} Admin panel not found at $ADMIN_DIR — skipping."
  echo -e "${YELLOW}[admin]${NC} Build it first, then re-run this script."
fi

# ─────────────────────────────────────────────────────────────────
# STEP 4 — Start Flutter mobile frontend
# ─────────────────────────────────────────────────────────────────
section "Step 4/4 — Flutter Frontend"

FLUTTER_APP="${FLUTTER_APP_PATH:-}"

if [[ -z "$FLUTTER_APP" ]]; then
  echo -e "${YELLOW}[frontend]${NC} FLUTTER_APP_PATH is not set — skipping Flutter."
  echo -e "${YELLOW}[frontend]${NC} Set FLUTTER_APP_PATH in .env or environment to enable."
  echo -e "${YELLOW}[frontend]${NC} Backend + admin running — Ctrl-C to stop."
  wait "${PIDS[@]}"
elif [[ ! -d "$FLUTTER_APP" ]]; then
  echo -e "${YELLOW}[frontend]${NC} Directory not found: $FLUTTER_APP — skipping."
  wait "${PIDS[@]}"
else
  API_URL="${API_BASE_URL:-http://localhost:${APP_PORT:-3000}/api/v1}"
  info "Flutter app: $FLUTTER_APP"
  info "API base URL: $API_URL"

  cd "$FLUTTER_APP"
  flutter pub get
  flutter run --dart-define=API_BASE_URL="$API_URL" &
  FRONTEND_PID=$!
  PIDS+=("$FRONTEND_PID")

  # Wait for all processes
  wait "${PIDS[@]}"
fi
