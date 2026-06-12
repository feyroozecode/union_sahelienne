# Phase 1 — Schema, User domain, WaitlistService (TDD)

## Goal

Lay the foundation: migration, domain fields, and a `WaitlistService` that owns the
waitlist state machine (waitlist / activate / position). No business-rule logic yet —
that's Phase 2.

## Files to create / modify

| Action | Path | Notes |
|---|---|---|
| **new** | `prisma/migrations/2026MMDDHHMMSS_add_waitlist_fields/migration.sql` | adds 2 nullable cols + composite index |
| modify | `prisma/schema.prisma` | declare fields + index |
| modify | `src/users/domain/user.ts` | add `waitlistReason`, `waitlistedAt` (both `@Exclude`) |
| modify | `src/users/infrastructure/persistence/relational/mappers/user.mapper.ts` | map both fields in `toDomain` and `toPersistence` |
| modify | `src/users/infrastructure/persistence/user.repository.ts` | add `getWaitlistPosition(userId): Promise<number>` abstract method |
| modify | `src/users/infrastructure/persistence/relational/repositories/user.repository.ts` | implement using `count({ where: { waitlistReason, waitlistedAt: { lt } } })` |
| **new** | `src/waitlist/waitlist.service.ts` | the service (Phase 1) |
| **new** | `src/waitlist/waitlist.service.spec.ts` | unit tests (TDD) |
| **new** | `src/waitlist/waitlist.types.ts` | `WaitlistState`, `WaitlistReason` enum, etc. |

> No module wiring in `app.module.ts` yet. Service is a pure class with an injected
> `UserRepository`. Module file lands in Phase 2 once we need DI for the balance service.

## Unit tests (TDD — write first, then implement)

`src/waitlist/waitlist.service.spec.ts`:

```ts
describe('WaitlistService', () => {
  const makeService = ({ userRepoOverrides = {} } = {}) => {
    const userRepository = {
      getWaitlistPosition: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue({ id: 1, waitlistReason: null, waitlistedAt: null }),
      ...userRepoOverrides,
    };
    return {
      service: new WaitlistService(userRepository as never),
      userRepository,
    };
  };

  it('places a user on the waitlist with reason + timestamp', async () => {
    const { service, userRepository } = makeService();
    await service.waitlist(7, 'gender_balance');
    expect(userRepository.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        waitlistReason: 'gender_balance',
        waitlistedAt: expect.any(Date),
      }),
    );
  });

  it('clears waitlist fields on activate', async () => {
    const { service, userRepository } = makeService();
    await service.activate(7);
    expect(userRepository.update).toHaveBeenCalledWith(
      7,
      { waitlistReason: null, waitlistedAt: null },
    );
  });

  it('returns null state when the user is not waitlisted', async () => {
    const { service, userRepository } = makeService({
      userRepoOverrides: { getWaitlistPosition: jest.fn().mockResolvedValue(0) },
    });
    await expect(service.getState(7, null)).resolves.toBeNull();
    expect(userRepository.getWaitlistPosition).not.toHaveBeenCalled();
  });

  it('returns reason + since + 1-based position when the user is waitlisted', async () => {
    const { service } = makeService({
      userRepoOverrides: { getWaitlistPosition: jest.fn().mockResolvedValue(2) },
    });
    const since = new Date('2026-06-01T00:00:00Z');
    await expect(service.getState(7, 'gender_balance', since)).resolves.toEqual({
      reason: 'gender_balance',
      since,
      position: 3, // 0-based rank + 1
    });
  });
});
```

**That's it.** Four tests, all rule-boundary. No setup of DB.

## Run order

```bash
# 1. Confirm tests fail (red)
npx jest src/waitlist/waitlist.service.spec.ts

# 2. Implement service + types

# 3. Confirm tests pass (green)
npx jest src/waitlist/waitlist.service.spec.ts

# 4. Migrate
npm run prisma:migrate:dev -- --name add_waitlist_fields
npm run prisma:generate

# 5. (Sanity) all other tests still pass
npm run test
```

## Done when

- 4 specs green.
- `prisma migrate dev` produces a clean migration; `prisma generate` regenerates the client.
- `npm run test` still 100% green (no regression in matches / payments / auth specs).
- No change to any controller, no change to `app.module.ts`.
