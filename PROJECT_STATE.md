# Union Sahélienne — Project State

> Snapshot: 2026-06-14 · Branch: `feat/web-frontend` · MVP target: Auth + Matches (Postgres-only)

## Overall: ~65% to first launchable MVP

| Tier | Done | Status |
|------|-----:|--------|
| Backend API (NestJS) | **90%** | 🟢 Green build, deployed infra ready |
| Mobile app (Flutter) | **70%** | 🟡 Auth + Matches wired to live API |
| Admin web panel | **75%** | 🟡 Exists, lives in branches, needs merge |
| Public web frontend (`web/`) | **5%** | 🔴 Scaffold only — no pages yet |
| Deployment / infra | **80%** | 🟡 Docker+PM2+nginx ready, redeploy pending |

---

## ✅ Done

### Backend API (~90%)
- Hexagonal NestJS API builds green (TypeScript errors resolved).
- **Auth** — JWT access/refresh, hashed sessions, social (Apple/Facebook/Google).
- **OTP signup (no-SMTP beta)** — code logged on server + returned in API response, shown on mobile screen. No SMTP crash. Inactive-account resend handled.
- **Matches** — API shapes finalized and mapped for mobile.
- Modules present: users, profiles, matches, messages, subscriptions, payments, reports, waitlist, admin, statuses, roles, files, i18n.
- Repo cleaned: build artifacts removed from git, `.gitignore` fixed, pushed to origin/main.

### Mobile app (~70%)
- Auth flow end-to-end: register → OTP on screen → verify → tokens → /home.
- Matches data layer wired to live backend API.

### Deployment (~80%)
- `prod` branch holds full infra: `deploy.sh`, `docker-compose.prod`, PM2, nginx, SSL.
- `deploy.sh` branch bug fixed (now deploys from `prod`).

---

## ⏳ Waiting / Remaining

### Public web frontend (`web/`) — 5%
- ⬜ Only config + env files exist (`next.config.ts`, `package.json`, `.env.*`).
- ⬜ No `app/` directory, no pages, no `node_modules` installed.
- ⬜ Build entire public site + inscription (sign-up) journey.

### Backend — 10%
- ⬜ **Redeploy** required for OTP/auth fixes to reach live API.
- ⬜ Payment / subscription flow — pre-existing blockers, out of MVP scope.

### Mobile — 30%
- ⬜ Remaining core features beyond Auth + Matches.
- ⬜ Test build blockers (pre-existing).

### Admin web panel — 25%
- ⬜ Spread across branches (`origin/prod` most complete: 71 frontend files).
- ⬜ Consolidate / merge into a single canonical branch.

### Cross-cutting
- ⬜ Branch consolidation: `backend`, `dev`, `prod`, `feat/web-frontend` diverged; needs merge plan.
- ⬜ SMTP/email delivery (currently beta no-SMTP).

---

## Critical path to MVP
1. Build public `web/` frontend (sign-up journey) — largest gap.
2. Redeploy backend so live API has auth/OTP fixes.
3. Consolidate branches into `main`/`prod`.
4. Finish remaining mobile core features.
