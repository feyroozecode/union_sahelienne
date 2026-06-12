# Gender Balance / Waitlist — Implementation Plan

> Scope: implement the 75% / 25% gender-balance rule from `plans/epic_10_05_26.txt:132`
> and the Waitlist feature from `plans/mobile-app-mock-development-plan.md` (Phase 2).

## Goal

- Backend: any newly validated user whose gender would push the validated pool past 75/25 is held in a `waitlist` state instead of being activated. They become eligible for activation as soon as the ratio drops back to ≤ 75%.
- Admin can list waitlisted users and manually unblock any of them.
- Mobile (Flutter) gets a `waitlist` block on `GET /auth/me` and `GET /payments/me/status` so the Waitlist Screen (60s poll) can react.
- Hard-cap on `findCandidates`: a waitlisted user never sees candidates.

## Approach recap (A1 + B1)

- **Schema**: 2 nullable fields on `User` (`waitlistReason`, `waitlistedAt`) + a composite index.
- **Activation**: eager in `validatePayment` (recompute ratio, decide activate vs waitlist, optionally auto-unblock oldest), plus lazy re-check on every `GET /auth/me` so a poll alone can unblock.

## Phases

| # | File | What | Tests |
|---|---|---|---|
| 1 | [`phase-1-schema-and-service.md`](./phase-1-schema-and-service.md) | Migration + `User` domain fields + `WaitlistService` (state machine: waitlist/activate, position query) | Unit tests for `WaitlistService` |
| 2 | [`phase-2-gender-balance.md`](./phase-2-gender-balance.md) | `GenderBalanceService` (ratio, would-exceed, auto-unblock loop) | Unit tests for `GenderBalanceService` (ratio edge cases: 0/0, 75/25, 76/24, 100/0) |
| 3 | [`phase-3-wire-payments.md`](./phase-3-wire-payments.md) | `PaymentsService.validatePayment` calls `GenderBalanceService`; subscription tier still assigned but `isValidated` flipped only if not waitlisted | Service unit test for the two branches |
| 4 | [`phase-4-wire-auth-me.md`](./phase-4-wire-auth-me.md) | `AuthService.me` + `GET /payments/me/status` return waitlist block; lazy re-check on every call | Unit test on `me()` shape |
| 5 | [`phase-5-admin-endpoints.md`](./phase-5-admin-endpoints.md) | `GET /admin/waitlist`, `POST /admin/waitlist/:userId/unblock` | Light unit test on admin service method |
| 6 | [`phase-6-block-candidates.md`](./phase-6-block-candidates.md) | `MatchesService.findCandidates` + `sendInterest` 403 if requester waitlisted | Unit test on `findCandidates` rejection |
| 7 | [`phase-7-seed-and-tests.md`](./phase-7-seed-and-tests.md) | Seed a few waitlisted users, add e2e happy-path test for validate→waitlist→unblock | One e2e test |

## TDD discipline (light)

Per request: **light unit tests only**, focused on service-level rules.

For each phase:
1. Write a single small spec file covering the rule boundaries (yes, the obvious cases; not exhaustive).
2. Run `npx jest <path>`. Watch it fail.
3. Implement the minimum code to pass.
4. Move on.

No e2e except one happy-path in Phase 7. No extensive happy/sad matrix. No integration test infra.

## Endpoints added (cumulative)

| Method | Path | Phase |
|---|---|---|
| `GET  /admin/waitlist` | 5 |
| `POST /admin/waitlist/:userId/unblock` | 5 |

Existing endpoints **extended** (no new path):

- `GET /auth/me` — adds `waitlist: { reason, since, position, genderRatio }` if waitlisted
- `GET /payments/me/status` — adds `userStatus: 'active' | 'waitlisted'` and the same `waitlist` block
- `GET /matches/candidates` — 403 with `error: 'waitlisted'` for waitlisted users

## Schema delta (Phase 1)

```prisma
model User {
  // …existing fields…
  waitlistReason  String?
  waitlistedAt    DateTime?

  @@index([waitlistReason, waitlistedAt])
}
```

## Risks / non-goals

- No waitlist *history* table (could add later if admin needs it).
- No `progressive reveal` of opposite-gender profiles (1/5 same-gender peek from the epic) — that's a separate feature, tracked elsewhere.
- No push notification when unblocked (depends on the not-yet-built push infra).
- No cron-driven re-evaluation. Eager + lazy is enough.
