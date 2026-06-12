# MVP Plan — Auth + Matches (1 Week, PostgreSQL-only)

> Goal: first launchable build. Scope locked to **Auth + Matches**. Payments,
> subscriptions, messages, waitlist deferred to v1.1.
> Created 2026-06-10. Backend builds green as of this date.

## Scope decision (locked)

- **In:** Register → OTP login → browse candidates → express interest → accept/reject → view my matches.
- **Out (v1.1):** payments, subscriptions, in-app chat, waitlist gender-balance, social login (Google/Apple).
- **Stack:** PostgreSQL only. Mongo/document path is stubbed and never bootstrapped.

## Verified starting state (2026-06-10)

| Tier | State |
|------|-------|
| Backend | ✅ Compiles green. Auth (16 routes) + Matches (7 routes) fully implemented. |
| Admin (`frontend/`) | ⚠️ Next.js app, uncommitted rename from `admin/`. Not on MVP critical path. |
| Mobile Auth | ✅ Full data/domain/presentation + DI. `auth_api_datasource` real (only Google/Apple throw `UnimplementedError` — out of scope). |
| Mobile Matches | ❌ **Presentation-only.** Cubit runs on `Future.delayed` mocks. No domain/data/datasource/DI. |
| Mobile OTP | ⚠️ Cubit exists, **not registered in DI** (0 refs). |
| Mobile endpoints | ✅ All 7 `/matches/*` constants already in `ApiEndpoints`. |

**Backend match routes (consume these):**
`GET /matches/candidates` · `POST /matches/:userId/interest` · `PATCH /matches/:id/accept` · `PATCH /matches/:id/reject` · `GET /matches/me` · `GET /matches/requests` · `PATCH /matches/:id/interrupt`

## The critical path (what actually blocks launch)

1. **Build the Matches data layer on mobile** — biggest item. Mirror the `auth` feature's structure (domain entities → repository port → remote datasource → repository impl → DI), then replace the cubit's mock `Future.delayed` with real repository calls.
2. **Wire OTP into DI** — small, unblocks the login→verify flow end-to-end.
3. **End-to-end smoke test against a running backend** (Postgres + seed) on a real flavor (`staging`/`customApi`).

---

## Day-by-day

### Day 1 — Backend ready to serve + verify Auth end-to-end
- Bring up Postgres locally (`docker compose up -d postgres adminer maildev`), run migrations + seed (`npm run prisma:migrate:deploy`, `npm run seed:run:relational`).
- Confirm `npm run start:dev` boots; hit `/docs` (Swagger).
- Manually exercise Auth via Swagger/curl: register → otp/send → otp/verify → me → refresh. Note exact request/response JSON shapes (the mobile models must match).
- **Fix the `start:prod` path mismatch** (`dist/main` → `dist/src/main`) OR adjust nest output — pick one, since prod deploy needs it.
- Deliverable: a running backend + a captured JSON contract for matches & auth.

### Day 2 — Mobile Matches: domain + data models
- Create `lib/features/matches/domain/`: `match_entity`, `candidate_entity`, `match_request_entity`, `matches_repository` (port) with methods: `getCandidates`, `expressInterest(userId)`, `acceptRequest(id)`, `rejectRequest(id)`, `getMyMatches`, `getRequests`, `interrupt(id)`.
- Create `lib/features/matches/data/models/` with `fromJson`/`toJson` matching Day-1 captured shapes.
- Mirror conventions from the existing `auth` and `messages` features exactly (freezed/json_serializable as used there).
- Deliverable: compiling domain + models, `build_runner` clean.

### Day 3 — Mobile Matches: datasource + repository impl + DI
- `matches_remote_datasource` (Dio, using the existing `ApiEndpoints.match*` constants) + `matches_repository_impl` with the 3-tier exception handling pattern used in `payment`/`messages`.
- Register everything in `lib/core/di/injection.dart` (datasource → repository → cubit), matching the `Payment`/`Reports` registration blocks.
- **Wire `OtpCubit` + its deps into DI** (currently 0 refs).
- Deliverable: `MatchesRepository` resolvable from `sl<>()`; OTP resolvable.

### Day 4 — Mobile Matches: replace mocks in cubit + pages
- Rewrite `matches_cubit` to call the injected repository instead of `Future.delayed`.
- Wire `my_matches_page`, `candidate_profile_page` to live state (loading/error/empty via existing `app_*` widgets).
- Ensure `MatchesCubit` is provided via DI at the router level (check `app_router.dart` for the `sl<>()` vs inline pattern).
- Deliverable: Matches screens render real backend data on `staging`/`customApi` flavor.

### Day 5 — End-to-end integration on device/emulator
- Run mobile on `staging` flavor pointed at the running backend (or `dev` at `localhost:3020/api/v1`).
- Walk the full loop on a real device/emulator: register → OTP → browse candidates → interest → (second account) accept → see match.
- Fix contract mismatches (field names, nullability, date formats) surfaced by real calls.
- Deliverable: the core loop works against live backend.

### Day 6 — Hardening + edge cases
- Auth token refresh on 401 (verify `auth_interceptor` handles expiry mid-session).
- Empty states (no candidates, no matches, no requests), network-off behavior (`connectivity_cubit`), error toasts.
- Logout clears session + routes to login.
- Basic guard coverage: `auth_guard` blocks match screens when unauthenticated.
- Deliverable: no dead-ends or unhandled errors in the core loop.

### Day 7 — Build, smoke, ship-candidate
- Backend: green `npm run build`, confirm prod start command works, deploy to staging URL (`api-unionsahel.alfajarsoft.com`).
- Mobile: release build per flavor (`flutter build apk --flavor staging` / iOS equivalent), install, full smoke pass.
- Tag a ship candidate. Write release notes.
- Deliverable: installable MVP build hitting the staging backend.

---

## Out-of-scope guardrails (do NOT pull into this week)
- Don't implement Google/Apple social login (leave `UnimplementedError`; hide buttons if needed).
- Don't finish waitlist gender-balance (document stubs stay throwing).
- Don't wire payments/subscriptions/messages cubits to live APIs.
- Admin `frontend/` rename: commit it separately, not part of MVP gating.

## Risks
- **Contract drift** between backend JSON and mobile models — mitigated by capturing real shapes Day 1 before writing models.
- **Matches business rules** (e.g. subscription gating on candidate browsing) — confirm backend doesn't 402/403 the MVP flow without a subscription; if it does, add a dev bypass or seed a free tier.
- **OTP delivery** — confirm `otp/send` actually delivers (SMS provider configured?) or use the dev/maildev path for testing.
