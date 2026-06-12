# Phase 4 — Surface waitlist state in /auth/me and /payments/me/status

## Goal

Mobile Waitlist Screen polls `GET /auth/me` (or `GET /payments/me/status`) and needs to
see whether the user is now active or still waitlisted. We also implement the
**lazy re-check**: if the platform's ratio has since shifted, we can flip the user
out of the waitlist right there in the handler.

## Files to modify

| Path | Change |
|---|---|
| `src/auth/auth.service.ts` | `me()` adds `waitlist` block; runs `GenderBalanceService.findUsersToAutoUnblock()` for the requester's gender; if requester is in the returned list, calls `waitlistService.activate()` |
| `src/auth/auth.service.spec.ts` (extend) | one test: waitlisted user with id in the auto-unblock list gets activated and the next call returns no `waitlist` block |
| `src/payments/payments.service.ts` | `getMyPaymentStatus()` also returns the same `waitlist` block (reuses `auth.service.me()` shape, or duplicates the lookup) |

## Response shape (additions)

```ts
// GET /auth/me when waitlisted
{
  id: 11,
  email: "...",
  profile: { isValidated: false, gender: "female" },
  waitlist: {
    reason: "gender_balance",
    since: "2026-05-20T10:00:00Z",
    position: 12,
    genderRatio: { male: 23, female: 77 }
  }
}

// when not waitlisted
{ id: 11, email: "...", profile: { isValidated: true } }
// (no `waitlist` key)
```

## Unit test (TDD)

```ts
describe('AuthService.me — waitlist auto-unblock', () => {
  it('activates a waitlisted user when the balance service includes them', async () => {
    const userRepo = {
      findById: jest.fn().mockResolvedValue({
        id: 11, profile: { isValidated: false, gender: 'female' },
      }),
    };
    const sessionRepo = {};
    const genderBalance = {
      findUsersToAutoUnblock: jest.fn().mockResolvedValue([11, 12]),
    };
    const waitlistService = {
      activate: jest.fn().mockResolvedValue({}),
      getState: jest.fn(),
    };

    const service = new AuthService(/* …deps… */);
    await service.me({ id: 11 });

    expect(waitlistService.activate).toHaveBeenCalledWith(11);
  });
});
```

(We mock only what we need, following the existing `auth.service.spec.ts` pattern.)

## Done when

- 1 spec green.
- `GET /auth/me` returns the `waitlist` block only for waitlisted users.
- A user that gets auto-unblocked on one call no longer shows up in the waitlist on
  the next call (subsequent poll).
