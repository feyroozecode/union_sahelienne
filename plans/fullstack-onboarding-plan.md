# Full-Stack Onboarding Plan: Union Sahelienne

## Context

Union Sahelienne is a matchmaking platform with a NestJS backend (hexagonal architecture, Prisma/PostgreSQL) and a Flutter mobile frontend (separate repo). The backend modules (auth, otp, profiles, payments, matches) and Prisma migrations already exist from R1. This plan completes all business logic, seeds realistic test data, and defines the Flutter frontend flow — from login screen to dashboard.

**OTP strategy**: Console.log OTP codes in dev mode (no real SMS/email provider). Keep `OtpGateway` port abstracted for future provider swap.

---

## Phase 1 — Auth System Completion

**Goal**: Bullet-proof auth flow: register, login (email/phone), OTP challenge, forgot/reset password, 30-day OTP re-trigger.

### Backend Tasks

| Task | Files | Details |
|------|-------|---------|
| 1.1 Registration with full fields | `src/auth/dto/auth-register-login.dto.ts`, `src/auth/auth.service.ts` | Add `phone`, `firstName`, `lastName`, `age`, `profession`, `country`, `city`, `gender` (required) to registration DTO. Service creates User + empty Profile row |
| 1.2 OTP console logger | `src/otp/otp.service.ts` | On `generateOtp()`, hash + store in DB, **console.log** the plain code with user identifier. Abstract behind `OtpGateway` port (`src/otp/otp-gateway.port.ts`) with `ConsoleOtpAdapter` |
| 1.3 Phone login with OTP challenge | `src/auth/auth.controller.ts`, `src/auth/auth.service.ts` | `POST /auth/phone/login` — verify phone+password → if valid, send OTP → return `{ otpRequired: true }`. `POST /auth/otp/verify` completes login and returns JWT |
| 1.4 Email login with OTP after 30 days | `src/auth/auth.service.ts` | On email login: check `lastLoginAt`. If > 30 days ago → trigger OTP challenge instead of direct JWT |
| 1.5 Forgot/reset password | `src/auth/auth.service.ts` | `POST /auth/forgot-password` sends OTP to email/phone. `POST /auth/reset-password` takes OTP + new password |
| 1.6 Email/phone confirmation | `src/auth/auth.service.ts`, `src/auth/auth.controller.ts` | `POST /auth/email/confirm` and `POST /auth/phone/confirm` — verify OTP, set status to active |
| 1.7 Update `lastLoginAt` | `src/auth/auth.service.ts` | On every successful login/OTP verify, update `user.lastLoginAt = now()` |

### Key DTOs
- `AuthRegisterDto`: email, phone?, password, firstName, lastName, age, profession, country, city, gender (required)
- `OtpChallengeResponseDto`: `{ otpRequired: true, destination: "email" | "phone" }`
- `LoginResponseDto`: `{ token, refreshToken, tokenExpires, user }`

### Frontend Screens (Flutter)
- **Login Screen**: email/phone toggle + password field + "Forgot password?" link
- **OTP Verification Screen**: 6-digit input, countdown timer, "Resend OTP" button
- **Registration Screen**: multi-step form (Step 1: email/phone + password, Step 2: name + age + gender + profession, Step 3: country/city)
- **Reset Password Screen**: email/phone input → OTP → new password

---

## Phase 2 — Profile Module Completion

**Goal**: Full profile CRUD, completeness check, identity verification, blurred profiles for non-validated users.

### Backend Tasks

| Task | Files | Details |
|------|-------|---------|
| 2.1 Profile DTO with all fields | `src/profiles/dto/update-profile.dto.ts` | Add: `maritalStatus`, `childrenCount`, `ethnicity`, `country`, `city`, `bloodType`, `hivTest`, `hepatitisTest`, `searchedAgeMin`, `searchedAgeMax`, `searchedMarital`, `searchedCriteria`, `gender` |
| 2.2 Profile completeness check | `src/profiles/profiles.service.ts` | Compute `isComplete` = all required fields filled (gender, maritalStatus, country, city, termsAcceptedAt). Auto-update on every save |
| 2.3 Terms acceptance | `src/profiles/profiles.controller.ts` | `POST /profile/me/terms` — already exists, verify it sets `termsAcceptedAt` and checks `isComplete` |
| 2.4 Identity document upload | `src/profiles/profiles.controller.ts`, `src/profiles/profiles.service.ts` | `POST /profile/me/identity` — upload doc (reuse FileModule), store `identityDocFileId` on Profile. Admin endpoint: `PATCH /admin/profiles/:id/verify-identity` sets `isIdentityVerified = true` |
| 2.5 Blurred profile serialization | `src/profiles/domain/profile.ts`, `src/users/domain/user.ts` | Use `@Expose({ groups: ['validated'] })` on sensitive fields (photo, contact info). Controller checks if requesting user's `profile.isValidated` and sets serialization group accordingly |
| 2.6 List users endpoint | `src/users/users.controller.ts` | `GET /users` — paginated, returns blurred profiles for non-validated viewers. Filter by gender (opposite of viewer) |
| 2.7 Prisma migration for identity fields | `prisma/schema.prisma` | Add `identityDocFileId`, `isIdentityVerified`, `identityDocType` to Profile model |

### Frontend Screens (Flutter)
- **Profile Completion Flow** (multi-step after registration):
  - Step 1: Marital status, children count
  - Step 2: Ethnicity, residence (country/city)
  - Step 3: Photo upload + optional health info
  - Step 4: Searched profile criteria
  - Step 5: Identity document upload (camera/gallery)
  - Step 6: Accept Terms & Conditions → redirect to payment
- **Profile View Screen**: own profile with completeness indicator
- **Profile Edit Screen**: edit individual sections
- **Other User Profile Screen**: blurred if viewer not validated

---

## Phase 3 — Payment & Account Validation

**Goal**: Manual receipt upload, Wave mobile money stub, admin validation flow.

### Backend Tasks

| Task | Files | Details |
|------|-------|---------|
| 3.1 Manual payment upload | `src/payments/payments.controller.ts`, `src/payments/payments.service.ts` | `POST /payments/manual` — multipart file upload (receipt image via FileModule), create Payment record with `type: 'manual'`, `status: 'pending'` |
| 3.2 Wave payment stub | `src/payments/payments.controller.ts`, `src/payments/payments.service.ts` | `POST /payments/wave/initiate` — return deposit number + instructions. `POST /payments/wave/callback` — webhook stub (log + update status). Real Wave API deferred |
| 3.3 My payments | `src/payments/payments.controller.ts` | `GET /payments/me` — list user's payments with status |
| 3.4 Admin validate/reject | `src/payments/payments.controller.ts` | `PATCH /payments/:id/validate` and `PATCH /payments/:id/reject` — admin-only (RoleGuard). On validate: set `payment.status = 'validated'`, `profile.isValidated = true`, assign LITE subscription (3 credits) |
| 3.5 Subscription credits | `prisma/schema.prisma`, `src/profiles/profiles.service.ts` | Add `subscriptionType` (LITE/PRO), `matchCreditsTotal`, `matchCreditsUsed` to Profile. LITE = 3 credits on payment validation |
| 3.6 Waiting screen API | `src/payments/payments.controller.ts` | `GET /payments/me/status` — returns latest payment status (for polling from "waiting for validation" screen) |

### Frontend Screens (Flutter)
- **Payment Screen**: choose payment method (Manual / Wave)
  - Manual: instructions + receipt upload (camera/gallery)
  - Wave: deposit number display + "I've paid" button
- **Waiting for Validation Screen**: animated pending state, auto-poll every 30s, push notification when validated
- **Subscription Info** (in profile): type, credits remaining, credits used

---

## Phase 4 — Match System

**Goal**: Candidate browsing, interest requests, accept/reject, chat unlock with countdown.

### Backend Tasks

| Task | Files | Details |
|------|-------|---------|
| 4.1 List candidates | `src/matches/matches.controller.ts`, `src/matches/matches.service.ts` | `GET /matches/candidates` — opposite gender, `isValidated = true`, paginated, exclude already matched/self |
| 4.2 Send interest | `src/matches/matches.controller.ts` | `POST /matches/:userId/interest` — check: max 3 active matches (`matchCreditsUsed < matchCreditsTotal`), no duplicate request. Create Match with `status: 'pending'` |
| 4.3 Accept/reject | `src/matches/matches.controller.ts` | `PATCH /matches/:id/accept` — set `status: 'accepted'`, `chatOpenedAt = now()`, `chatExpiresAt = now() + 30 days`. Increment `matchCreditsUsed` for both users. `PATCH /matches/:id/reject` — set `status: 'rejected'` |
| 4.4 My matches | `src/matches/matches.controller.ts` | `GET /matches/me` — list active/pending matches with countdown info |
| 4.5 Interrupt chat | `src/matches/matches.controller.ts` | `PATCH /matches/:id/interrupt` — set `status: 'interrupted'`, `cooldownUntil = now() + 14 days`. Business rule: can't re-match before cooldown |
| 4.6 Match limit guard | `src/matches/matches.service.ts` | Enforce 3-match limit at service layer using `matchCreditsUsed` vs `matchCreditsTotal` |

### Frontend Screens (Flutter)
- **Dashboard/Home**: profile summary card + match credits + candidate cards (swipeable or list)
- **Candidate Profile Screen**: full details (or blurred), "I'm Interested" button
- **My Matches Screen**: tabs (Pending / Active / History), countdown display per match
- **Chat Screen**: text + image only (no video/voice/docs), interrupt button
- **Match Request Notification**: accept/reject inline

---

## Phase 5 — Admin Features & Seed Data

**Goal**: Admin endpoints, realistic seed data, gender ratio enforcement.

### Backend Tasks

| Task | Files | Details |
|------|-------|---------|
| 5.1 Admin dashboard endpoints | `src/admin/admin.controller.ts` (new) | `GET /admin/stats` — user count, pending payments, active matches. `GET /admin/payments/pending` — list pending payments. `GET /admin/users` — list all users with filters |
| 5.2 Admin identity verification | `src/admin/admin.controller.ts` | `PATCH /admin/profiles/:id/verify-identity` — set `isIdentityVerified = true`, add verified badge |
| 5.3 Gender ratio check | `src/auth/auth.service.ts` | On registration: count male vs female. If ratio > 75/25 → reject with "waitlist" status and notification |
| 5.4 Enhanced seed data | `src/database/seeds/relational/` | See Seed Data section below |

### Seed Data Strategy

**Admin user:**
```
email: admin@union-sahelienne.com
password: Admin@2026!
role: admin
firstName: Administrateur
lastName: Système
status: active
profile: complete, validated
```

**Test users (12 users):**

| # | Name | Gender | Email | Status | Profile | Payment | Matches |
|---|------|--------|-------|--------|---------|---------|---------|
| 1 | Amadou Diallo | male | amadou@test.com | active | complete, validated | validated | 1 active |
| 2 | Fatoumata Traoré | female | fatoumata@test.com | active | complete, validated | validated | 1 active (with #1) |
| 3 | Ibrahim Keita | male | ibrahim@test.com | active | complete, validated | validated | 0 |
| 4 | Mariam Coulibaly | female | mariam@test.com | active | complete, not validated | pending | 0 |
| 5 | Ousmane Sanogo | male | ousmane@test.com | active | incomplete | none | 0 |
| 6 | Aïssata Diarra | female | aissata@test.com | active | complete, validated | validated | 2 active |
| 7 | Moussa Sidibé | male | moussa@test.com | active | complete, validated | validated | 1 active (with #6) |
| 8 | Kadiatou Bah | female | kadiatou@test.com | active | complete, validated | validated | 1 active (with #6) |
| 9 | Sékou Camara | male | sekou@test.com | active | complete, validated | rejected | 0 |
| 10 | Djénéba Koné | female | djeneba@test.com | inactive | none | none | 0 |
| 11 | Boubacar Cissé | male | boubacar@test.com | active | complete, validated | validated | 3 active (maxed out) |
| 12 | Aminata Sylla | female | aminata@test.com | waitlist | none | none | 0 |

All test user passwords: `Test@2026!`

---

## Phase 6 — Frontend App Structure (Flutter)

**Goal**: Plan the complete Flutter app architecture and screen flow.

### Navigation Flow

```
Splash Screen
  ├─ [not authenticated] → Login Screen
  │     ├─ Login (email/phone + password)
  │     │    └─ [OTP required] → OTP Screen → Dashboard
  │     │    └─ [success] → Dashboard
  │     ├─ "Create Account" → Registration Flow
  │     │    ├─ Step 1: Email/Phone + Password
  │     │    ├─ Step 2: OTP Verification
  │     │    ├─ Step 3: Personal Info (name, age, gender, profession)
  │     │    ├─ Step 4: Location (country, city)
  │     │    └─ → Profile Completion Flow
  │     └─ "Forgot Password" → Reset Flow
  │          ├─ Enter email/phone → OTP → New password
  │          └─ → Login Screen
  │
  ├─ [authenticated, profile incomplete] → Profile Completion Flow
  │     ├─ Step 1: Marital status, children
  │     ├─ Step 2: Ethnicity, residence
  │     ├─ Step 3: Photo + optional health info
  │     ├─ Step 4: Search criteria
  │     ├─ Step 5: Identity document upload
  │     ├─ Step 6: Accept Terms & Conditions
  │     └─ → Payment Screen
  │
  ├─ [authenticated, profile complete, not paid] → Payment Screen
  │     ├─ Manual (upload receipt)
  │     ├─ Wave (deposit number)
  │     └─ → Waiting for Validation Screen (poll status)
  │
  ├─ [authenticated, validated] → Dashboard
  │     ├─ Home Tab: candidate cards, match credits
  │     ├─ Matches Tab: pending/active/history
  │     ├─ Chat Tab: active conversations
  │     └─ Profile Tab: edit profile, subscription info, settings
  │
  └─ [waitlisted] → Waitlist Screen (gender ratio exceeded)
```

### Flutter Architecture (recommended)
- **State management**: Riverpod or BLoC
- **API layer**: Dio with interceptors (JWT refresh, error handling)
- **Navigation**: GoRouter with redirect guards based on auth/profile/payment state
- **Storage**: SharedPreferences for tokens, Hive for offline cache

### Key API Integration Points

| Screen | API Calls |
|--------|-----------|
| Login | `POST /auth/email/login` or `POST /auth/phone/login` |
| OTP | `POST /auth/otp/verify` |
| Register | `POST /auth/email/register` |
| Profile completion | `PUT /profile/me` (multiple calls) |
| Terms | `POST /profile/me/terms` |
| Identity upload | `POST /profile/me/identity` |
| Payment | `POST /payments/manual` or `POST /payments/wave/initiate` |
| Payment status | `GET /payments/me/status` (poll) |
| Dashboard | `GET /matches/candidates`, `GET /matches/me`, `GET /profile/me` |
| Send interest | `POST /matches/:userId/interest` |
| Accept/reject | `PATCH /matches/:id/accept` or `reject` |
| Chat | `PATCH /matches/:id/interrupt` |

---

## What's Deferred

| Item | Reason |
|------|--------|
| Real SMS/WhatsApp OTP | Use console.log. OtpGateway port ready for Twilio/Africa's Talking |
| Wave production API | Stub endpoints. Real integration when API keys available |
| Push notifications | Plan for Firebase FCM later |
| Chat messages persistence | Phase 2 feature (R2) — for now just unlock/countdown |
| OPTION PRO subscription | TBD per R2 notes |
| Video/voice in chat | Explicitly excluded per R1 story |
| Document-based (MongoDB) adapters | Focus on Prisma/relational only |

---

## Prisma Schema Changes Needed

```prisma
// Add to Profile model:
identityDocFileId   Int?
identityDocFile     File?     @relation(...)
identityDocType     String?   // 'cni' | 'passport' | 'permit' | 'school_card'
isIdentityVerified  Boolean   @default(false)
subscriptionType    String?   // 'lite' | 'pro'
matchCreditsTotal   Int       @default(0)
matchCreditsUsed    Int       @default(0)

// Add to Match model:
cooldownUntil       DateTime?
```

**Migration name**: `add_identity_verification_and_subscription`

---

## Implementation Order & Dependencies

```
Phase 1 (Auth) ← no dependencies, start here
  ↓
Phase 2 (Profile) ← depends on auth being solid
  ↓
Phase 3 (Payment) ← depends on profile completeness check
  ↓
Phase 4 (Matches) ← depends on payment validation (isValidated)
  ↓
Phase 5 (Admin + Seeds) ← depends on all models being final
  ↓
Phase 6 (Frontend) ← depends on all APIs being stable
```

Each phase is independently testable via Swagger at `http://localhost:3000/docs`.

---

## Verification Plan

1. **After Phase 1**: Register a user via Swagger, check console for OTP, verify OTP, get JWT, login again
2. **After Phase 2**: Complete profile via PUT, verify `isComplete` flips, upload identity doc, check blurred response
3. **After Phase 3**: Upload receipt, admin-validate, verify `isValidated` + subscription credits assigned
4. **After Phase 4**: List candidates (opposite gender only), send interest, accept, verify countdown, test 3-match limit
5. **After Phase 5**: Run `npm run seed:run:relational`, verify 12 users + admin exist with correct relationships
6. **After Phase 6**: Full Flutter flow: splash → login → OTP → dashboard → browse → match → chat
