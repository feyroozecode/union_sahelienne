# Plan: R2 User Story — Updates & New Features

**Date**: 2026-04-14  
**Source**: `plans/r2-user-story-update.txt` (Réunion 01 notes + addendum)  
**Context**: R1 delivered the base schema + auth/profile/payment/match modules. R2 addresses new business rules, subscription tiers, gender balance enforcement, notifications, and security notes that were clarified after R1.

---

## What's New in R2 vs R1

| # | Feature | Status in R1 |
|---|---------|-------------|
| 1 | Subscription tiers (LITE 3 credits / PRO TBD) | Partial — match limit was hardcoded to 3 |
| 2 | Credits display in Profile view | Not done |
| 3 | Gender balance rule (75%/25%) | Not done |
| 4 | Waitlist for overrepresented gender | Not done |
| 5 | Weekly notification for unverified accounts | Not done |
| 6 | Email on CG/Terms update | Not done |
| 7 | Chat interruption → 2-week cooldown | Not done |
| 8 | Match limit: cannot click "Interested" when at 3 | Partial — service-layer check only |
| 9 | Screen capture blocking (sensitive pages) | Mobile concern — API flag needed |

---

## Phase 1 — Subscription System

### Goal
Replace hardcoded "3 matches" limit with a proper subscription model that supports LITE and (future) PRO tiers. Track credits per user.

### Data Model Changes

```prisma
model Subscription {
  id           Int       @id @default(autoincrement())
  userId       Int       @unique
  user         User      @relation(...)

  type         String    @default("lite")   // "lite" | "pro"
  matchCredits Int       @default(3)        // remaining credits
  usedCredits  Int       @default(0)
  startedAt    DateTime  @default(now())
  expiresAt    DateTime?                    // null = LITE (undetermined)

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@map("subscription")
}
```

Migration: `20260415000100_create_subscription`

### Business Rules
- **LITE**: 3 match credits, no expiry (`expiresAt = null`), granted at payment validation
- **PRO**: TBD (credits and expiry defined later — schema is forward-compatible)
- Deduct 1 credit when a match request is sent (`status = pending → accepted`)
- Block interest request if `matchCredits = 0`

### New Endpoints
- `GET /subscriptions/me` — current subscription: type, credits remaining, credits used, start date
- `PATCH /subscriptions/:id` — admin can adjust tier/credits (admin-only)

### Profile View Credit Display
Extend `GET /profile/me` response to include embedded subscription summary:
```json
{
  "subscription": {
    "type": "lite",
    "matchCredits": 2,
    "usedCredits": 1,
    "startedAt": "2026-04-14T..."
  }
}
```

---

## Phase 2 — Gender Balance Rule (75/25)

### Goal
Prevent one gender from exceeding 75% of total validated users. Overrepresented new registrants are placed in a waitlist and notified.

### Data Model Changes

Add `waitlistReason` to User:
```prisma
model User {
  // existing fields...
  waitlistReason String?   // null = active, "gender_balance" = waiting
  waitlistedAt   DateTime?
}
```

Migration: `20260415000200_add_user_waitlist_fields`

### Business Rule (enforced at registration completion / payment validation)
```
After admin validates a payment (profile.isValidated = true):
  1. Count validated users by gender
  2. If new user's gender would push their group above 75% of total:
     → Set user.waitlistReason = "gender_balance"
     → Set user.waitlistedAt = now()
     → Send email/notification: "Waitlist notice"
     → Do NOT set profile.isValidated = true yet
  3. Else:
     → Set profile.isValidated = true normally
  4. When the minority gender grows (new validated user of minority gender):
     → Re-check waitlist for the majority gender
     → Unblock oldest-waiting user if ratio allows
```

### New Endpoints
- `GET /admin/waitlist` — list waitlisted users with reason (admin-only)
- `POST /admin/waitlist/:userId/unblock` — manually unblock a user (admin-only)

### Gender Ratio Service
New `GenderBalanceService` injectable in `AccountValidationModule`:
- `checkRatioAndBlock(userId, gender)` — called after payment validation
- `rebalanceWaitlist()` — called whenever a new user of minority gender is validated

---

## Phase 3 — Notifications

### 3a — Weekly Reminder for Unverified Accounts

**Trigger**: Weekly cron job  
**Target**: Users where `profile.isValidated = false` AND `profile.isComplete = true` (they completed the profile but haven't paid/been validated)  
**Channel**: Email (existing MailModule) + push notification (later)

**Implementation**:
- Add NestJS `@nestjs/schedule` cron task in a new `NotificationsModule`
- `@Cron('0 9 * * 1')` (every Monday at 9:00 WAT)
- Query: `prisma.user.findMany({ where: { profile: { isValidated: false, isComplete: true } } })`
- Send templated email: "Complete your verification to access all profiles"

### 3b — Email on Terms/CG Update

**Trigger**: Admin triggers a terms update via API  
**Target**: All active users (`deletedAt = null`)

**New Endpoint** (admin-only):
- `POST /admin/terms/notify` — sends bulk email to all users announcing new CG version

**Implementation**:
- Create mail template: `terms-update.hbs`
- BullMQ queue job to batch-send without blocking the request (reuse existing queue infra)

---

## Phase 4 — Chat Interruption Cooldown

### Goal
If a chat between matched users is interrupted by either party, it cannot be re-initiated for 2 weeks.

### Data Model Changes

Add to `Match`:
```prisma
model Match {
  // existing fields...
  interruptedAt   DateTime?
  interruptedBy   Int?       // userId who interrupted
  chatCooldownEnd DateTime?  // interruptedAt + 14 days
}
```

Migration: `20260415000300_add_match_cooldown`

### Business Rules
- `POST /matches/:id/interrupt` — sets `interruptedAt`, `interruptedBy`, `chatCooldownEnd = now + 14d`
- When user tries to re-send interest to same target: check if a Match record exists with `chatCooldownEnd > now` → block with 403 + message
- `chatCooldownEnd` is returned in match details so the mobile app can show remaining time

### Updated Endpoints
- `POST /matches/:id/interrupt` — new endpoint (authenticated user must be participant)
- `GET /matches/me` — now includes `cooldownEndsAt` for interrupted matches

---

## Phase 5 — API Security Flags for Sensitive Screens

### Goal
Mark sensitive API responses so the mobile app knows to block screen capture.

### Implementation
Add a custom response header `X-Sensitive-Data: true` on:
- `GET /matches/:id/chat` (future chat endpoint)
- `GET /profile/:id` (other user's full profile)
- `GET /users/:id` (user detail)

**NestJS approach**: Custom decorator `@SensitiveData()` + `SensitiveDataInterceptor` that adds the header when the decorator is present on the controller method. The mobile client reads this header to toggle screen capture blocking.

---

## Implementation Order

```
Sprint R2-1: Subscription System
  ├─ Migration: create_subscription table
  ├─ SubscriptionModule (domain + repo + service + controller)
  ├─ Integrate credit deduction in MatchesService
  ├─ Embed subscription in profile GET response
  └─ Admin endpoint to adjust tier

Sprint R2-2: Gender Balance
  ├─ Migration: add waitlist fields to User
  ├─ GenderBalanceService in AccountValidationModule
  ├─ Hook into payment validation flow
  └─ Admin waitlist endpoints

Sprint R2-3: Notifications
  ├─ Install @nestjs/schedule
  ├─ NotificationsModule with weekly cron
  ├─ Email template: unverified-reminder.hbs
  ├─ Admin terms-update endpoint
  └─ Email template: terms-update.hbs

Sprint R2-4: Chat Cooldown
  ├─ Migration: add cooldown fields to Match
  ├─ POST /matches/:id/interrupt endpoint
  ├─ Cooldown check in interest-send flow
  └─ Return cooldownEndsAt in match list

Sprint R2-5: Sensitive Data Header
  ├─ @SensitiveData() decorator
  ├─ SensitiveDataInterceptor
  └─ Apply to profile/user detail endpoints
```

---

## New Prisma Migrations Summary

| Migration | Name | Content |
|-----------|------|---------|
| `20260415000100` | `create_subscription` | Subscription table |
| `20260415000200` | `add_user_waitlist_fields` | waitlistReason, waitlistedAt on User |
| `20260415000300` | `add_match_cooldown` | interruptedAt, interruptedBy, chatCooldownEnd on Match |

---

## New Modules / Services

| Module | Purpose |
|--------|---------|
| `SubscriptionModule` | Credits tracking, tier management |
| `NotificationsModule` | Cron jobs, bulk email triggers |
| `GenderBalanceService` | Ratio check, waitlist logic (in AccountValidationModule) |
| `SensitiveDataInterceptor` | Response header for screen capture flag |

---

## Key Constraints from R2 Story

- LITE = 3 credits, **à durée indéterminée** (no expiry — confirmed)
- PRO tier is **TBD** — schema must be forward-compatible
- Gender balance: **max 75%** of one gender in validated pool
- Waitlisted users get email notification, shown in admin panel
- Chat cooldown: **14 days** after interruption by either party
- CG update → **all users** emailed (not just active matches)
- Screen capture blocking: **API signals mobile** via `X-Sensitive-Data` header
