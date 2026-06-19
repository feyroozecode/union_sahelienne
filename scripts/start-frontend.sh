#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# start-frontend.sh — Launch the admin web frontend (Next.js).
#
# Usage:
#   ./scripts/start-frontend.sh
# ─────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Colour helpers ────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[frontend]${NC} $*"; }
warn()  { echo -e "${YELLOW}[frontend]${NC} $*"; }
error() { echo -e "${RED}[frontend]${NC} $*"; exit 1; }

# ── Load .env ─────────────────────────────────────────────────────
[[ -f .env ]] && set -o allexport && source .env && set +o allexport || true

API_PORT="${APP_PORT:-3000}"
if ! lsof -nP -iTCP:"$API_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  warn "No backend detected on port $API_PORT."
  warn "Admin pages need the API at http://localhost:$API_PORT/api/v1."
  warn "Start it with ./scripts/start-backend.sh or ./scripts/start-all.sh."
fi

# ── Track child PIDs for clean shutdown ───────────────────────────
PIDS=()
cleanup() {
  echo ""
  info "Shutting down frontends…"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  info "Done."
}
trap cleanup INT TERM EXIT

# ─────────────────────────────────────────────────────────────────
# ADMIN WEB FRONTEND (Next.js on port 3001)
# ─────────────────────────────────────────────────────────────────
ADMIN_DIR="$ROOT/frontend"

if [[ -d "$ADMIN_DIR" && -f "$ADMIN_DIR/package.json" ]]; then
  info "Starting admin panel (Next.js)…"
  cd "$ADMIN_DIR"
  npm install --silent 2>/dev/null || npm install
  npm run dev &
  ADMIN_PID=$!
  PIDS+=("$ADMIN_PID")
  info "Admin panel: http://localhost:3001"
  cd "$ROOT"
else
  warn "Admin panel not found at $ADMIN_DIR — skipping."
  warn "Run the admin setup first to create the admin/ directory."
fi

# ── Wait for all frontends ────────────────────────────────────────
if [[ ${#PIDS[@]} -eq 0 ]]; then
  warn "No frontends started. Set up admin/ directory."
  exit 0
fi

info "All frontends running — Ctrl-C to stop."
wait "${PIDS[@]}"
