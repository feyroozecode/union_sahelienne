# Phase 5 — Admin endpoints: GET /admin/waitlist, POST /admin/waitlist/:userId/unblock

## Goal

Admins can see who's waitlisted and force-unblock anyone (e.g. customer support
case, or to manually rebalance).

## Files to modify

| Path | Change |
|---|---|
| `src/users/infrastructure/persistence/user.repository.ts` | add `findWaitlisted({ gender?, order? }): Promise<User[]>` |
| `src/users/infrastructure/persistence/relational/repositories/user.repository.ts` | implement |
| `src/admin/admin.service.ts` | add `listWaitlisted({ gender })` and `unblockWaitlisted(userId)` |
| `src/admin/admin.controller.ts` | add 2 endpoints |
| `src/admin/admin.service.spec.ts` (new or extend) | one test: `unblockWaitlisted` calls `waitlistService.activate` |

## Endpoints

```
GET  /admin/waitlist?gender=male|female
   → [{ id, email, firstName, waitlistReason, waitlistedAt, position, profile: { gender } }, …]

POST /admin/waitlist/:userId/unblock
   → { success: true, userId: <id> }
   → 404 if user not found, 409 if user not currently waitlisted
```

`position` is computed server-side as 1-based, same logic as Phase 1.

## Unit test (TDD)

```ts
describe('AdminService.unblockWaitlisted', () => {
  it('returns success and calls waitlistService.activate', async () => {
    const userRepo = { findById: jest.fn().mockResolvedValue({ id: 11, waitlistReason: 'gender_balance' }) };
    const waitlistService = { activate: jest.fn().mockResolvedValue({}) };
    const service = new AdminService(/* deps */);
    const result = await service.unblockWaitlisted(11);
    expect(waitlistService.activate).toHaveBeenCalledWith(11);
    expect(result).toEqual({ success: true, userId: 11 });
  });

  it('throws 404 if the user does not exist', async () => {
    const userRepo = { findById: jest.fn().mockResolvedValue(null) };
    const service = new AdminService(/* deps */);
    await expect(service.unblockWaitlisted(11)).rejects.toBeInstanceOf(NotFoundException);
  });
});
```

## Done when

- 2 specs green.
- Admin can list + unblock via Swagger.
- `findWaitlisted` respects `gender` filter and orders by `waitlistedAt ASC`.
