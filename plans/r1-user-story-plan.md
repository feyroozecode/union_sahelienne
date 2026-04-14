# Plan: R1 User Story Implementation

## Context

This NestJS API uses Hexagonal Architecture with Prisma (PostgreSQL) for relational storage and Mongoose for MongoDB. The R1 user story defines a **matchmaking platform** (Union Sahélienne) with auth, profile management, payment validation, and a matching system.

All new features follow the same pattern as existing modules:
- Domain entity → Repository port → Prisma adapter → Service → Controller
- Hexagonal: service layer never touches Prisma directly

---

## Feature Breakdown

### Phase 1 — Extended Auth System
**Scope**: Login with email/phone + password, OTP (email + SMS/WhatsApp), 30-day OTP re-trigger, account creation, forgot/reset password

**What's needed on top of existing auth:**
1. Add `phone` field to User (Prisma schema + migration)
2. Add `otpSecret`, `otpExpiry`, `lastOtpAt` fields to User
3. OTP service: generate 6-digit code, store hashed, send via email (existing mailer) + SMS
4. SMS/WhatsApp provider: abstract `OtpGateway` port (Twilio or Africa's Talking adapter)
5. Auth controller: new endpoints
   - `POST /auth/email/login` (existing, keep)
   - `POST /auth/phone/login` (new)
   - `POST /auth/otp/send` (send OTP to email or phone)
   - `POST /auth/otp/verify` (verify OTP, return JWT)
   - `POST /auth/forgot-password` (send OTP)
   - `POST /auth/reset-password` (OTP + new password)
6. OTP re-trigger logic: if `lastLogin` > 30 days ago → require OTP on next login

**New Prisma fields:**
```prisma
model User {
  phone        String?   @unique
  otpHash      String?
  otpExpiry    DateTime?
  lastLoginAt  DateTime?
}
```

---

### Phase 2 — User Profile (Extended)
**Scope**: Matrimonial situation, children count, ethnicity, residence, blood type, health tests, searched profile criteria, T&C acceptance

**New Prisma models:**
```prisma
model Profile {
  id                  Int       @id @default(autoincrement())
  userId              Int       @unique
  user                User      @relation(...)
  
  // Identity info
  maritalStatus       String?   // Célibataire, Marié, Divorcé...
  childrenCount       Int?
  ethnicity           String?
  
  // Residence
  country             String?
  city                String?
  
  // Optional health
  bloodType           String?
  hivTest             Boolean?
  hepatitisTest       Boolean?
  
  // Search criteria
  searchedAgeMin      Int?
  searchedAgeMax      Int?
  searchedMarital     String?
  searchedCriteria    String?   // free text
  
  // Validation
  termsAcceptedAt     DateTime?
  isComplete          Boolean   @default(false)
  isValidated         Boolean   @default(false)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@map("profile")
}
```

**Endpoints:**
- `GET /profile/me` — get my profile
- `PUT /profile/me` — update profile fields
- `POST /profile/me/terms` — accept T&C
- `GET /users` — list users (blurred if viewer not validated — handled in serialization)

**Blurred profiles**: if `profile.isValidated = false` for the viewer → return users without contact/photo details (use `@SerializeOptions({ groups })` pattern already in place)

---

### Phase 3 — Payment & Validation
**Scope**: Manual payment (upload receipt), Wave mobile money, admin validation (24h)

**New Prisma model:**
```prisma
model Payment {
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(...)
  
  type        String    // 'manual' | 'wave'
  status      String    @default("pending")  // pending | validated | rejected
  receiptPath String?   // for manual upload
  waveRef     String?   // Wave transaction reference
  amount      Decimal?
  
  validatedAt DateTime?
  validatedBy Int?      // admin user id
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@map("payment")
}
```

**Endpoints:**
- `POST /payments/manual` — upload receipt (multipart, uses existing FileModule)
- `POST /payments/wave/initiate` — start Wave payment flow
- `POST /payments/wave/callback` — Wave webhook
- `GET /payments/me` — list my payments
- `PATCH /payments/:id/validate` — admin validates (sets `profile.isValidated = true`)
- `PATCH /payments/:id/reject` — admin rejects

---

### Phase 4 — Matching System
**Scope**: List profiles by opposite gender, 3-connection limit, interest request, accept/reject, chat unlock, countdown

**New Prisma models:**
```prisma
model Match {
  id          Int      @id @default(autoincrement())
  requesterId Int
  requester   User     @relation("Requester", ...)
  targetId    Int
  target      User     @relation("Target", ...)
  
  status      String   @default("pending")  // pending | accepted | rejected | expired
  
  // Countdown starts when both accepted
  chatOpenedAt DateTime?
  chatExpiresAt DateTime?  // configurable, e.g. 30 days
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([requesterId, targetId])
  @@map("match")
}
```

**Business rules:**
- A user can have max 3 active matches (`status = accepted`)
- Gender filter: men see women, women see men (based on `profile.gender`)
- Match flow: requester sends interest → target notified → target accepts → chat unlocked → countdown starts
- Countdown is per match, not global

**Endpoints:**
- `GET /matches/candidates` — list opposite-gender validated profiles (paginated)
- `POST /matches/:userId/interest` — send interest (checks 3-match limit)
- `PATCH /matches/:id/accept` — accept match request
- `PATCH /matches/:id/reject` — reject match request
- `GET /matches/me` — list my active matches with countdown

**Add `gender` to Profile (required):**
```prisma
gender String  // 'male' | 'female'
```

---

## Implementation Order

```
Phase 1: Auth extensions (OTP, phone login, reset-password)
  └─ Prisma migration: add phone, otpHash, otpExpiry, lastLoginAt to User

Phase 2: Profile module (new resource)
  └─ Prisma migration: create Profile table with gender

Phase 3: Payment module (new resource)
  └─ Prisma migration: create Payment table
  └─ Reuse existing FileModule for receipt upload

Phase 4: Match module (new resource)
  └─ Prisma migration: create Match table
  └─ Match limit guard (interceptor or service check)
```

---

## New Modules to Generate

```bash
npm run generate:resource:relational -- --name Profile
npm run generate:resource:relational -- --name Payment
npm run generate:resource:relational -- --name Match
```

Then wire each to Prisma following the same repository pattern as users/sessions.

---

## New Infrastructure Needed

| Concern | Implementation |
|---|---|
| SMS/OTP sending | `OtpModule` with `OtpGateway` port + Twilio or Africa's Talking adapter |
| Wave payment | `WaveModule` with HTTP client to Wave API |
| Match countdown | Stored `chatExpiresAt` field, computed on read |
| Admin guard | Existing `RoleEnum.admin` + `@Roles(RoleEnum.admin)` decorator |
| Profile blurring | Serialization groups (`@SerializeOptions`) |

---

## Prisma Schema Additions Summary

All new fields go into `prisma/schema.prisma`, then `npm run prisma:migrate:dev -- --name <name>`:

1. **Migration 1** — `add_user_auth_fields`: phone, otpHash, otpExpiry, lastLoginAt on User
2. **Migration 2** — `create_profile`: Profile model with gender + all profile fields
3. **Migration 3** — `create_payment`: Payment model
4. **Migration 4** — `create_match`: Match model with User self-relations

---

## Key Constraints from R1 Story

- OTP required after 30 days of disconnection
- Profile must be complete + payment validated before profile is visible unblurred
- Max **3 active matches** per user (hard business rule — enforce at service layer)
- Countdown only starts when **both** parties are in discussion
- Wave payment: `compte à compte` only (no card), with deposit number shown to user
- Admin manually validates payment (~24h)
