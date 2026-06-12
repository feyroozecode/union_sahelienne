# Phase 6 — Block MatchesService for waitlisted users

## Goal

A waitlisted user must not be able to browse or send interests. Today the gate is
`profile.isValidated` (set in Phase 3 to `false` for waitlisted users), so the
existing check in `MatchesService.getValidatedUserWithProfile` *should* already 403
them. Verify and add a more specific error code so the mobile app can distinguish
"not validated yet" from "waitlisted".

## Files to modify

| Path | Change |
|---|---|
| `src/matches/matches.service.ts` | distinguish waitlisted (403 `waitlisted`) from unvalidated (403 `validatedProfileRequired`) |
| `src/matches/matches.service.spec.ts` (extend) | one test: waitlisted requester gets the new error code on `findCandidates` |

## Unit test (TDD)

```ts
it('rejects findCandidates for a waitlisted requester with code "waitlisted"', async () => {
  const { service } = makeService({
    usersServiceOverrides: {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        profile: { gender: 'female', isValidated: false },
      }),
    },
  });
  // Inject a peek into the requester via auth service OR pass userId directly
  await expect(service.findCandidates(1, { page: 1, limit: 10 })).rejects.toMatchObject({
    status: 403,
    response: { error: 'waitlisted' },
  });
});
```

## Decision: do we expose waitlist state via `findCandidates`?

**No.** The caller already has `GET /auth.me` for that. `findCandidates` 403s with
the specific code and lets the mobile client redirect to the Waitlist Screen.

## Done when

- 1 spec green.
- Mobile flow: tapping the Matches tab while waitlisted → 403 → app routes to
  Waitlist Screen (existing behavior, error code just clarifies intent).
