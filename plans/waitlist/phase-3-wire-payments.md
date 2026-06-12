# Phase 3 — Wire GenderBalanceService into PaymentsService

## Goal

`PATCH /payments/:id/validate` (admin) currently:
1. Marks the payment `validated`.
2. Marks the profile `isValidated = true`.
3. Creates a `Subscription` row (LITE / etc.).

After this phase, step 2 becomes conditional: only set `isValidated = true` if the
new user's gender doesn't push the ratio over 75%. Otherwise set
`waitlistReason = 'gender_balance'` and `waitlistedAt = now()` on the user, leave
`isValidated = false`, and skip the subscription.

> Note: subscription creation is still tied to *payment validation*, not profile
> activation. The waitlisted user has paid but cannot use the credits yet. If they
> are auto-unblocked later (Phase 4 lazy check or admin action), the subscription
> already exists — we'll flip `isValidated` at that moment.

## Files to modify

| Path | Change |
|---|---|
| `src/payments/payments.service.ts` | inject `GenderBalanceService`; after subscription creation, call `wouldExceedThreshold(profile.gender)`; branch on result |
| `src/payments/payments.service.spec.ts` (new) | two tests: under-threshold → `isValidated=true`; over-threshold → `isValidated=false` + `waitlistReason` set |
| `src/payments/payments.module.ts` | import the waitlist module/provider |

## Unit tests (TDD)

```ts
describe('PaymentsService.validatePayment (gender balance)', () => {
  const make = ({ wouldExceed = false } = {}) => {
    const paymentRepo = {
      findById: jest.fn().mockResolvedValue({
        id: 99,
        userId: 5,
        status: 'pending',
      }),
      update: jest.fn().mockResolvedValue({ id: 99, status: 'validated' }),
    };
    const usersService = {
      findById: jest.fn().mockResolvedValue({
        id: 5,
        profile: { id: 10, gender: 'male', isValidated: false },
      }),
    };
    const profileRepo = {
      update: jest.fn().mockResolvedValue({ id: 10, isValidated: true }),
    };
    const subscriptionsService = {
      grantFromPayment: jest.fn().mockResolvedValue({}),
    };
    const genderBalance = {
      wouldExceedThreshold: jest.fn().mockResolvedValue(wouldExceed),
    };
    const waitlistService = {
      waitlist: jest.fn().mockResolvedValue({}),
    };

    return {
      service: new PaymentsService(
        paymentRepo as never,
        usersService as never,
        profileRepo as never,
        subscriptionsService as never,
        genderBalance as never,
        waitlistService as never,
      ),
      profileRepo,
      waitlistService,
    };
  };

  it('activates the profile when under the 75% threshold', async () => {
    const { service, profileRepo, waitlistService } = make({ wouldExceed: false });
    await service.validatePayment(99, 1);
    expect(profileRepo.update).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ isValidated: true }),
    );
    expect(waitlistService.waitlist).not.toHaveBeenCalled();
  });

  it('waitlists the user when their gender would exceed 75%', async () => {
    const { service, profileRepo, waitlistService } = make({ wouldExceed: true });
    await service.validatePayment(99, 1);
    expect(profileRepo.update).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ isValidated: false }),
    );
    expect(waitlistService.waitlist).toHaveBeenCalledWith(5, 'gender_balance');
  });
});
```

## Done when

- 2 specs green.
- Manual smoke: validate a payment in admin → check DB: `profile.isValidated` and
  `user.waitlistReason` reflect the decision.
- Subscription is still created in both cases (we don't refund — we just gate usage).
