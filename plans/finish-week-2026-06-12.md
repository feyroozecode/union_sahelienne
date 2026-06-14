# Finish Week Plan — 2026-06-12 → 2026-06-19

**Goal:** A testable, deployed MVP (Auth + Matches) across backend, admin panel, and mobile, with a signed release-candidate APK in testers' hands by Day 7.

**Supersedes:** `mvp-auth-matches-1week.md` (Days 1–4 of that plan are done; this plan absorbs its remaining Days 5–7 plus the regressions introduced by today's merge).

---

## State of the world (verified 2026-06-12)

| Tier | Status | Detail |
|------|--------|--------|
| Backend API | 🔴 **Build broken** | 13 TS errors introduced by today's merge (b92fa0ec): missing `Logger` import in `otp.service.ts:18`, `return null` vs return type in `auth.service.ts:281`, `{{SPACE}}` artifact in `user-seed.service.ts:411`, Prisma client not regenerated after waitlist migration. Plus pre-existing `start:prod` → `dist/main` path bug. |
| Backend (deployed) | 🟢 Live | `https://api-unionsahel.alfajarsoft.com` responds (running a pre-merge build). |
| Admin panel (`frontend/`) | 🟢 Builds green | All MVP pages work against real endpoints. Stubs: `/settings` page missing, `/config` not persisted, edit/delete/view-profile buttons are `console.log`. |
| Mobile app | 🟡 Partially ready | 0 analyze errors, debug APK builds, wired to live API. Gaps: **no OTP verification UI** (backend now requires OTP to activate accounts → registration dead-ends), `candidate_profile_page` 100% hardcoded, ~28 files uncommitted, `main.dart` default flavor hits prod API, release build signs with debug keys. |
| Docs/deploy | 🟡 Partial | Good architecture docs, Swagger at `/docs`, CI green. Missing: deployment guide, env-var reference, health endpoint. 21 secret placeholders in `.env.production`/`.env.staging`. |

**Single biggest risk:** the OTP signup change (b94d3e92) made activation OTP-gated, but mobile has no OTP screen. New users literally cannot finish signup on the app. This is the critical path.

---

## Operating rules

- Two parallel tracks: **Track A (backend + web + deploy)** and **Track B (mobile)**. Each day has a gate — do not start the next day's work until the gate passes.
- Scope is LOCKED to Auth + Matches MVP. Cut list at the bottom is final for this week.
- Every day ends with a commit (mobile repo included — no more 28-file uncommitted trees) and a CHANGELOG entry.

---

## Day 1 — Fri Jun 13: Stop the bleeding (both tracks)

**Track A — restore green backend (½ day):**
1. `npm run prisma:generate` (fixes 8 of 13 errors).
2. Add `Logger` import to `src/otp/otp.service.ts`.
3. `auth.service.ts:281` — `return null` → `return undefined` (or widen return type).
4. Remove `{{SPACE}}` artifact from `user-seed.service.ts:411`.
5. Fix `package.json` `start:prod` → `node dist/src/main.js` (Procfile depends on it).
6. `npm run build` green, `npm run test` green, push, CI green, redeploy API.

**Track B — commit + stabilize mobile:**
1. Review and commit the ~28-file working tree (auth datasources, gradle-kts migration, package rename).
2. Fix the footgun: `main.dart` hardcodes `Flavor.dev` whose defaults point at **prod**. Make dev default to `localhost`/mock unless `--dart-define-from-file` says otherwise; document `make run-dev/staging/prod`.

**Gate 1:** backend `npm run build` exit 0 + deployed API on the new build; mobile tree clean; `flutter analyze` still 0 errors.

## Day 2 — Sat Jun 14: OTP signup UI (mobile, critical path)

1. Build `otp_verification_page.dart` (code input, resend with cooldown, masked target from `OtpChallengeResponseDto`).
2. Wire `RegisterCubit`: register → navigate to OTP page → `verifyOtp` → receive `LoginResponseDto` → store tokens → home. Handle wrong/expired code states.
3. Wire forgot-password to the same OTP flow (backend reset is OTP-based now) — replaces the fake-success `resetPassword` at `auth_repository_impl.dart:188`.
4. Test against staging with `AUTH_OTP_DEBUG_CODE` (pre-beta mode returns the code in the response — no SMS/email infra needed).

**Gate 2:** full signup → OTP → active account → login loop works on emulator against the live API.

## Day 3 — Sun Jun 15: Candidate profile + matches polish (mobile)

1. Wire `candidate_profile_page.dart` to real data: take the `CandidateEntity` already fetched by `GET /matches/candidates` (pass via constructor/route args — no new backend endpoint needed). Kill the hardcoded "Amina Diallo".
2. "Send interest" button on the profile page → `MatchesRepository.sendInterest`, with the no-credits `ForbiddenException` mapped to a friendly message.
3. Sweep matches UI states: empty lists, error retry, accept/reject/interrupt confirmations, chat-window expiry display.

**Gate 3:** browse candidates → open profile → send interest → other account accepts → match appears in "My matches", end-to-end on two test accounts.

## Day 4 — Mon Jun 16: Full E2E + contract fixes (both tracks)

1. Seed staging with realistic data (`npm run seed:run:relational` via Procfile release or manually).
2. Run the complete loop on a real Android device: signup(♂), signup(♀), browse, interest, accept, message within chat window, interrupt, cooldown.
3. Fix every contract drift found (ids int→String coercion, `photo.path`, InfinityPagination wrapper — known shapes in memory).
4. Backend: add `GET /health` endpoint (trivial, unblocks uptime monitoring).
5. Track A in parallel: admin panel — wire the three `console.log` "View profile / View details" buttons to the existing drawers (small), defer `/settings` page entirely.

**Gate 4:** one full user journey passes on a physical device with zero manual DB intervention.

## Day 5 — Tue Jun 17: Deployment day (Track A)

1. Inject the 21 real secrets into staging + production envs (DB, JWT, S3, SES, Wave). Confirm S3 buckets and SES domain exist; if SES is not ready, keep `preBetaMode` ON for launch (OTP in response) — explicit decision, not a blocker.
2. Deploy backend production build; run migrations + seed via Procfile release phase; verify `/health` and `/docs`.
3. Deploy admin panel (`frontend/`) to `admin-unionsahel.alfajarsoft.com` with `.env.production`.
4. Mobile release signing: generate upload keystore, wire `signingConfigs` in `build.gradle.kts` (currently signs release with debug keys).

**Gate 5:** prod API + prod admin both reachable and logging in; a signed release APK installs and runs.

## Day 6 — Wed Jun 18: Hardening + documentation

1. Bug-fix day for everything found Days 4–5 (reserve the whole morning).
2. Write `docs/deployment.md`: step-by-step deploy for API + admin, env-var reference table (all 21), troubleshooting section.
3. Update mobile `IMPLEMENTATION_PROGRESS.md` and `CHANGELOG.md` (both stale — claim mock-only state that no longer exists).
4. Smoke-test matrix: signup, login, refresh-token expiry, OTP wrong code, no-credits interest, waitlist-blocked user, admin payment validation.

**Gate 6:** smoke matrix all green on staging; deployment guide followed start-to-finish by re-deploying staging from scratch.

## Day 7 — Thu Jun 19: Release candidate

1. `flutter build apk --release` (signed) against prod env; final smoke on device.
2. Distribute to testers (Firebase App Distribution or direct APK).
3. Tag `v1.0.0-mvp` on both repos; final CHANGELOG entries.
4. Write known-issues list for testers (cut list below = expected gaps).

**Gate 7 (ship):** testers can install the APK, sign up, and match — unassisted.

---

## Cut list (explicitly NOT this week)

- Social login (Google/Apple/Facebook) — stubs stay stubs (v1.1)
- Push notifications, Sentry, analytics, RevenueCat — mocks stay (v1.1)
- Admin `/settings` page and `/config` persistence (v1.1)
- Payments/subscription mobile UI beyond what exists (backend endpoints are live; admin can validate manually)
- Messages feature polish beyond the chat-window happy path
- MongoDB/document adapter (PostgreSQL-only, already decided)

## Standing risks

1. **SES/SMS not provisioned** → mitigated: launch with `preBetaMode` OTP-in-response for the closed tester group.
2. **Infra placeholders** (`postgres-prod.internal`, S3 buckets) may not exist yet → Day 5 has the whole day; if infra is missing, staging-only launch is the fallback ship target.
3. **Today's merge pattern repeating** — b92fa0ec shipped a broken build to main. Rule for the week: no push without local `npm run build` green.
