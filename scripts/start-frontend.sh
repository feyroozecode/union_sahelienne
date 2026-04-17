#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# start-frontend.sh — Launch the admin web frontend and/or the
#                      Flutter mobile frontend.
#
# Usage:
#   ./scripts/start-frontend.sh              # admin + Flutter (if FLUTTER_APP_PATH set)
#   ./scripts/start-frontend.sh --admin-only # admin panel only
#   ./scripts/start-frontend.sh --flutter-only # Flutter only
# ─────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Colour helpers ────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[frontend]${NC} $*"; }
warn()  { echo -e "${YELLOW}[frontend]${NC} $*"; }
error() { echo -e "${RED}[frontend]${NC} $*"; exit 1; }

# ── Parse flags ───────────────────────────────────────────────────
RUN_ADMIN=true
RUN_FLUTTER=true
case "${1:-}" in
  --admin-only)   RUN_FLUTTER=false ;;
  --flutter-only) RUN_ADMIN=false ;;
esac

# ── Load .env ─────────────────────────────────────────────────────
[[ -f .env ]] && set -o allexport && source .env && set +o allexport || true

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

API_URL="${API_BASE_URL:-http://localhost:${APP_PORT:-3000}/api/v1}"

# ─────────────────────────────────────────────────────────────────
# ADMIN WEB FRONTEND (Next.js on port 3001)
# ─────────────────────────────────────────────────────────────────
ADMIN_DIR="$ROOT/admin"

if $RUN_ADMIN; then
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
fi

# ─────────────────────────────────────────────────────────────────
# FLUTTER MOBILE FRONTEND
# ─────────────────────────────────────────────────────────────────
FLUTTER_APP="${FLUTTER_APP_PATH:-}"

if $RUN_FLUTTER; then
  if [[ -z "$FLUTTER_APP" ]]; then
    warn "FLUTTER_APP_PATH is not set — skipping Flutter."
    warn "Set FLUTTER_APP_PATH in .env to enable the mobile frontend."
  elif [[ ! -d "$FLUTTER_APP" ]]; then
    warn "Directory not found: $FLUTTER_APP — skipping Flutter."
  elif [[ ! -f "$FLUTTER_APP/pubspec.yaml" ]]; then
    warn "Not a Flutter project (no pubspec.yaml): $FLUTTER_APP — skipping."
  else
    command -v flutter >/dev/null 2>&1 || error "flutter CLI not found — install Flutter SDK first"
    info "API base URL: $API_URL"
    info "Getting Flutter packages…"
    cd "$FLUTTER_APP"
    flutter pub get
    info "Launching Flutter app…"
    flutter run --dart-define=API_BASE_URL="$API_URL" &
    FLUTTER_PID=$!
    PIDS+=("$FLUTTER_PID")
    cd "$ROOT"
  fi
fi

# ── Wait for all frontends ────────────────────────────────────────
if [[ ${#PIDS[@]} -eq 0 ]]; then
  warn "No frontends started. Set up admin/ or FLUTTER_APP_PATH."
  exit 0
fi

info "All frontends running — Ctrl-C to stop."
wait "${PIDS[@]}"
