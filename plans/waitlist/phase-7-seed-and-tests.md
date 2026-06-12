# Phase 7 — Seed data + one happy-path e2e

## Goal

Demonstrate the full loop in dev: validate a payment → user goes to waitlist → admin
manually unblocks → user is now validated.

## Files to modify

| Path | Change |
|---|---|
| `src/database/seeds/relational/user/user-seed.service.ts` | pre-seed 2 waitlisted users (1 male, 1 female) to mirror the spec's 12 personas + edge cases |
| `test/waitlist/waitlist.e2e-spec.ts` (new) | one e2e: register → pay → admin validates (with 76/24 ratio) → poll /auth/me → see waitlisted → admin unblocks → poll /auth/me → no waitlist block |

## Seed delta

Two new personas (in addition to the existing 12):

```
- mariam@test.com  /  Female / Payment: validated / waitlistReason: gender_balance (since 5 days ago)
- souleymane@test.com / Male / Payment: validated / waitlistReason: gender_balance (since 1 day ago)
```

To force the ratio, the existing 12 personas skew one way. We add 6 opposite-gender
validated users to seed 60/40, then add these 2 to the over-represented side to
trigger the rule.

## E2e test (one only)

```ts
describe('Waitlist flow (e2e)', () => {
  it('waitlists a new user then unblocks them on admin action', async () => {
    // 1. Bootstrap ratio 76/24 with 76 opposite-gender validated users (seed).
    // 2. New user registers + pays (POST /payments/manual).
    // 3. Admin validates (PATCH /payments/:id/validate).
    // 4. GET /auth/me -> response has waitlist block.
    // 5. Admin POST /admin/waitlist/:userId/unblock.
    // 6. GET /auth/me -> no waitlist block, isValidated true.
  });
});
```

This is the only e2e. No need for more — the unit tests cover the rules.

## Done when

- Seed re-runs cleanly: `npm run seed:run:relational`.
- E2e green: `npm run test:e2e` (or `npx jest test/waitlist`).
- CHANGELOG entry written per AI Brain Protocol.
