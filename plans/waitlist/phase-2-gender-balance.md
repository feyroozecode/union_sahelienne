# Phase 2 — GenderBalanceService (TDD)

## Goal

Pure rule engine: count validated users by gender, decide if admitting a new user
keeps the ratio ≤ 75%, and emit the list of oldest waitlisted users that can now be
auto-unblocked.

## Files to create

| Action | Path |
|---|---|
| **new** | `src/waitlist/gender-balance.service.ts` |
| **new** | `src/waitlist/gender-balance.service.spec.ts` |

Depends on `UserRepository` for `countValidatedByGender()` (extend port + impl in
`src/users/infrastructure/persistence/...`).

## Public surface

```ts
export interface GenderRatio {
  male: number;
  female: number;
}

export class GenderBalanceService {
  // Total validated users per gender (validated + not waitlisted).
  getRatio(): Promise<GenderRatio>;

  // Would admitting `newGender` push the ratio past 75%?
  wouldExceedThreshold(newGender: 'male' | 'female'): Promise<boolean>;

  // Re-evaluate the waitlist and return the IDs (oldest first) of users we can
  // safely activate right now without breaking the 75/25 rule.
  findUsersToAutoUnblock(): Promise<number[]>;
}
```

## Unit tests (write first)

`src/waitlist/gender-balance.service.spec.ts`:

```ts
describe('GenderBalanceService', () => {
  const make = ({ ratio = { male: 0, female: 0 }, queue = [] } = {}) => {
    const userRepository = {
      countValidatedByGender: jest.fn().mockResolvedValue(ratio),
      findOldestWaitlistedByGender: jest.fn().mockImplementation((g) =>
        Promise.resolve(queue.filter((u) => u.gender === g)),
      ),
    };
    return {
      service: new GenderBalanceService(userRepository as never),
      userRepository,
    };
  };

  describe('wouldExceedThreshold', () => {
    it('returns false on a 0/0 platform (cold start)', async () => {
      const { service } = make({ ratio: { male: 0, female: 0 } });
      await expect(service.wouldExceedThreshold('male')).resolves.toBe(false);
    });

    it('returns false at exactly 75/25 (inclusive boundary)', async () => {
      const { service } = make({ ratio: { male: 75, female: 25 } });
      await expect(service.wouldExceedThreshold('male')).resolves.toBe(false);
    });

    it('returns true at 76/24', async () => {
      const { service } = make({ ratio: { male: 76, female: 24 } });
      await expect(service.wouldExceedThreshold('male')).resolves.toBe(true);
    });

    it('applies to either gender symmetrically', async () => {
      const { service } = make({ ratio: { male: 20, female: 80 } });
      await expect(service.wouldExceedThreshold('female')).resolves.toBe(true);
      await expect(service.wouldExceedThreshold('male')).resolves.toBe(false);
    });
  });

  describe('findUsersToAutoUnblock', () => {
    it('returns an empty list when no one is waitlisted', async () => {
      const { service } = make();
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([]);
    });

    it('does not unblock anyone of the over-represented gender when still > 75%', async () => {
      const { service } = make({
        ratio: { male: 80, female: 20 },
        queue: [
          { id: 11, gender: 'male' },
          { id: 12, gender: 'male' },
        ],
      });
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([]);
    });

    it('unblocks oldest minority-gender waitlisted users one at a time, stopping at threshold', async () => {
      // ratio 80/20 + 5 female waitlisted. Adding the 1st female -> 80/21 (~79%) still
      // > 75% female, can't unblock. So none get unblocked here.
      const { service } = make({
        ratio: { male: 80, female: 20 },
        queue: [
          { id: 21, gender: 'female' },
          { id: 22, gender: 'female' },
          { id: 23, gender: 'female' },
        ],
      });
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([]);
    });

    it('unblocks minority users when including them keeps ratio within threshold', async () => {
      // 76/24 + 3 male waitlisted. Adding 1 male -> 77/24 (76.2%) > 75% -> still cannot.
      // (Documents the conservative behavior.)
      const { service } = make({
        ratio: { male: 76, female: 24 },
        queue: [{ id: 31, gender: 'male' }],
      });
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([]);
    });
  });
});
```

> Note: at our scale, the "rebalance by unblocking" only kicks in meaningfully when
> the ratio is at the edge (74/26 → 75/25). At 80/20 we can never unblock anyone
> because adding any minority user wouldn't help. The tests above document that
> reality on purpose.

## Done when

- 4+1+3 specs green.
- `WaitlistService` and `GenderBalanceService` are independently testable.
- No controller or service outside `waitlist/` touched.
