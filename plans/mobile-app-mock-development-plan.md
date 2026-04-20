# Mobile App Development Plan: Union Sahelienne
## Mock-First Development Strategy

**Document Version**: 1.0
**Date**: 2026-04-18
**Target Audience**: Product Managers, UX/UI Designers, Mobile Developers
**Platform**: Cross-platform (Flutter)

---

## Table of Contents

1. [Introduction](#introduction)
2. [App Overview](#app-overview)
3. [User Journey Map](#user-journey-map)
4. [Development Phases](#development-phases)
5. [Mock Data Strategy](#mock-data-strategy)
6. [Testing & Quality Assurance](#testing--quality-assurance)

---

## Introduction

### Purpose of This Document

This plan guides the mobile app development for **Union Sahelienne**, a matrimonial matchmaking platform serving the Sahel region. It focuses on:

- **User-facing features** and workflows (no technical implementation details)
- **Mock data strategy** to enable frontend development before backend completion
- **Phased delivery** aligned with backend R2 roadmap
- **Complete edge case coverage** for robust user experience

### Development Approach

**Mock-First Philosophy**: Build the entire mobile app using realistic mock data, allowing parallel development with the backend team. Once backend APIs are ready, swap mock services with real API calls without refactoring UI logic.

### Timeline Alignment

- **Phase 0**: Syncs with backend R1 (already complete)
- **Phases 1-5**: Sync with backend R2 sprints (in progress)

---

## App Overview

### What is Union Sahelienne?

A **Sahel-focused matrimonial platform** connecting users seeking marriage partners within their cultural context. The platform enforces:

- **Identity verification** (national ID/passport upload)
- **Payment validation** (subscription fee via receipt upload or Wave mobile money)
- **Gender balance** (max 75% of one gender in active pool)
- **Credit-based matching** (LITE plan: 3 match credits)
- **Time-limited chats** (30-day window after match acceptance)

### Core User Flow

```
1. Register (email/phone + basic profile)
   ↓
2. Complete detailed profile (6-step form)
   ↓
3. Upload identity document (CNI/passport)
   ↓
4. Submit payment (receipt or Wave)
   ↓
5. Wait for admin validation
   ↓
6. Get LITE subscription (3 credits)
   ↓
7. Browse opposite-gender candidates
   ↓
8. Send interest (costs 1 credit when accepted)
   ↓
9. If accepted → 30-day chat unlocked
   ↓
10. Match, interrupt, or expire
```

### Key Business Rules

- **Age minimum**: 18 years
- **Match limit**: 3 active matches maximum
- **Gender filtering**: Opposite gender only
- **Chat window**: 30 days from acceptance
- **Interruption cooldown**: 14 days before re-matching same person
- **Credit deduction**: 1 credit per accepted match (both users)
- **Waitlist trigger**: Gender exceeding 75% of validated pool

---

## User Journey Map

### User States

| State | Description | Can Browse? | Can Match? | Credits |
|-------|-------------|-------------|------------|---------|
| **Anonymous** | Not logged in | No | No | N/A |
| **Registered** | Account created, email/phone unverified | No | No | 0 |
| **Verified** | OTP confirmed | No | No | 0 |
| **Profile Incomplete** | Missing required profile fields | No | No | 0 |
| **Profile Complete, Unpaid** | Ready to pay | No | No | 0 |
| **Payment Pending** | Receipt submitted, awaiting admin | No | No | 0 |
| **Waitlisted** | Gender balance limit hit | No | No | 0 |
| **Validated** | Payment approved, subscription active | Yes | Yes | 3 |
| **Active User (1-2 matches)** | Can send more interests | Yes | Yes | 1-2 |
| **Maxed Out (3 matches)** | All credits used | Yes (read-only) | No | 0 |
| **Inactive (30+ days)** | Requires OTP on next login | Yes | Yes | Varies |

### State Transition Diagram (Text)

```
[Anonymous]
    → Register → [Registered]
                     → Verify OTP → [Verified]
                                       → Complete Profile → [Profile Complete]
                                                               → Pay → [Payment Pending]
                                                                          ├─ Admin Approves → [Validated]
                                                                          ├─ Admin Rejects → [Payment Rejected]
                                                                          └─ Gender Balance Hit → [Waitlisted]

[Validated]
    → Send Interest → [Active User (1-2 matches)]
    → Send 3rd Interest → [Maxed Out (3 matches)]
    → 30+ days no login → [Inactive]
```

---

## Development Phases

### Phase 0: Authentication & Onboarding (MVP - R1)

**Backend Status**: ✅ Complete
**Estimated Effort**: 4-6 weeks
**Priority**: Critical (blocks all other features)

#### Features to Build

1. **Splash Screen** with app logo (2s animation)
2. **Login Screen** (email OR phone toggle)
3. **Registration Screen** (multi-step form: 3 steps)
4. **OTP Verification Screen** (6-digit code input)
5. **Profile Completion Flow** (6 steps: personal → location → health → search criteria → identity doc → terms)
6. **Payment Submission Screens** (manual receipt upload + Wave mobile money)
7. **Waiting for Validation Screen** (polling animation)

#### Screens Breakdown

##### Screen 1: Splash Screen
**Purpose**: App branding + auto-login check
**Duration**: 2 seconds
**Logic**:
- Check if JWT token exists in secure storage
- If valid → redirect to Dashboard
- If expired → redirect to Login
- If none → redirect to Login

**Mock Data**: None (static assets only)

**User Flow**:
```
[App Launch]
  → Show logo animation (2s)
  → Check stored JWT
     ├─ Valid → [Dashboard]
     ├─ Expired → [Login]
     └─ None → [Login]
```

---

##### Screen 2: Login Screen
**Purpose**: Authenticate existing users
**Fields**:
- Email OR Phone (toggle switch)
- Password (hidden, show/hide icon)
- "Forgot Password?" link
- "Login" button (primary)
- "Don't have an account? Register" link

**Validation Rules**:
- Email: Valid email format
- Phone: International format (+XXX...)
- Password: Minimum 6 characters

**User Flow (Success)**:
```
[Login Screen]
  → Enter credentials
  → Tap "Login"
  → Show loading spinner
  → API call (mock)
  → Response:
     ├─ Success (no OTP required) → Store JWT → [Dashboard]
     ├─ Success (OTP required) → [OTP Screen]
     └─ Error → Show error message inline
```

**User Flow (OTP Required - 30+ days inactive)**:
```
[Login Screen]
  → Enter credentials
  → Tap "Login"
  → API returns { otpRequired: true, destination: "email" }
  → Redirect to [OTP Screen] with message:
     "For security, we've sent a code to your email/phone"
```

**User Flow (Forgot Password)**:
```
[Login Screen]
  → Tap "Forgot Password?"
  → [Forgot Password Screen]
     → Enter email/phone
     → Tap "Send Code"
     → OTP sent
     → [OTP Screen]
        → Enter code
        → Verify
        → [Reset Password Screen]
           → Enter new password (2 fields: password + confirm)
           → Tap "Reset"
           → Success → [Login Screen] with success message
```

**Mock Data Required**:
```
Mock Users for Login Testing:
1. User with no OTP required
   - Email: alice@example.com
   - Phone: +22376543210
   - Password: password123
   - State: Validated, 0 matches

2. User requiring OTP (30+ days inactive)
   - Email: bob@example.com
   - Password: password123
   - Last login: 35 days ago
   - OTP: 123456 (always accept this code in mock)

3. User with incomplete profile
   - Email: charlie@example.com
   - Password: password123
   - Profile completion: 40%
   - Should redirect to Profile Completion

4. User with pending payment
   - Email: diana@example.com
   - Password: password123
   - Payment status: pending
   - Should redirect to Waiting Screen

5. Invalid credentials test
   - Any email/password → Error: "Invalid credentials"
```

**Edge Cases to Handle**:
- [ ] Invalid email format → "Invalid email address"
- [ ] Invalid phone format → "Phone must start with +"
- [ ] Empty password → "Password is required"
- [ ] Wrong password → "Invalid credentials"
- [ ] Account not found → "No account with this email/phone"
- [ ] Network timeout → "Connection failed. Please try again."
- [ ] Account deleted → "This account has been deactivated"

---

##### Screen 3: Registration Screen (Multi-Step)

**Purpose**: Create new user account
**Steps**: 3 steps in a stepper UI (Step 1/3, Step 2/3, Step 3/3)

**Step 1: Account Info**
- First Name (text)
- Last Name (text)
- Email OR Phone (toggle, at least one required)
- Password (min 6 chars, show/hide icon)
- Confirm Password (must match)

**Step 2: Basic Profile**
- Gender (dropdown: Male / Female)
- Age (number picker, min 18, max 120)
- Profession (text)
- Country (dropdown: Mali, Niger, Burkina Faso, Chad, Mauritania, Senegal)
- City (text)

**Step 3: Terms & Conditions**
- Checkbox: "I accept the Terms & Conditions"
- Link to T&C (opens webview/PDF)
- "Create Account" button (disabled until checkbox checked)

**User Flow**:
```
[Registration Screen]
  → Step 1: Enter account info → Tap "Next"
     → Validate fields → Show errors OR proceed
  → Step 2: Enter basic profile → Tap "Next"
     → Validate fields → Show errors OR proceed
  → Step 3: Accept terms → Tap "Create Account"
     → Show loading
     → API call (mock creates user)
     → Response:
        ├─ Success → Show success toast → [OTP Screen] with message:
           "We've sent a verification code to your email/phone"
        └─ Error → Show error (e.g., "Email already exists")
```

**Mock Data Required**:
```
Mock Registration Scenarios:
1. Successful registration
   - Any new email/phone → Create user → Send to OTP screen

2. Email already exists
   - Email: existing@example.com → Error: "This email is already registered"

3. Phone already exists
   - Phone: +22376543210 → Error: "This phone number is already registered"

4. Network failure
   - Simulate 50% success rate → Sometimes show "Network error"
```

**Validation Rules**:
- First/Last Name: Min 2 characters, letters only
- Email: Valid format (user@domain.com)
- Phone: International format (+[1-9]\\d{7,14})
- Password: Min 6 characters
- Confirm Password: Must match password
- Age: 18-120
- Terms checkbox: Must be checked

**Edge Cases**:
- [ ] Email and phone both empty → "Email or phone required"
- [ ] Password mismatch → "Passwords don't match"
- [ ] Age below 18 → "You must be at least 18 years old"
- [ ] Special characters in name → "Name can only contain letters"
- [ ] Terms not accepted → "Please accept the terms to continue"

---

##### Screen 4: OTP Verification Screen

**Purpose**: Verify email/phone ownership
**Trigger**: After registration OR after login (if 30+ days inactive)

**UI Elements**:
- Title: "Enter Verification Code"
- Subtitle: "We sent a 6-digit code to [email/phone]"
- 6 input boxes (auto-focus next box on digit entry)
- "Didn't receive code? Resend" link (enabled after 60s countdown)
- "Verify" button

**User Flow**:
```
[OTP Screen]
  → Auto-filled from SMS (if phone registration)
  → OR manually enter 6 digits
  → Tap "Verify"
  → Show loading
  → API call (mock)
  → Response:
     ├─ Success → Store JWT → Redirect based on user state:
        ├─ Profile incomplete → [Profile Completion Flow]
        ├─ Profile complete, not paid → [Payment Screen]
        ├─ Payment pending → [Waiting Screen]
        └─ Validated → [Dashboard]
     └─ Error → Show error "Invalid or expired code"
```

**Resend Flow**:
```
[OTP Screen]
  → Tap "Resend" (after 60s countdown)
  → Show loading
  → API call → Send new OTP
  → Show toast "New code sent to [destination]"
  → Reset countdown to 60s
```

**Mock Data Required**:
```
Mock OTP Codes (always accept these in dev):
- 123456 → Valid, accepts immediately
- 000000 → Expired code error
- 999999 → Invalid code error
- Any other 6 digits → "Invalid code"

Resend Behavior:
- Always succeeds
- Generate new mock code (but 123456 still works)
```

**Edge Cases**:
- [ ] Code expires after 10 minutes → "Code expired. Please resend."
- [ ] Wrong code 3 times → "Too many failed attempts. Please resend code."
- [ ] Network error during verification → "Connection failed"
- [ ] Resend clicked before 60s → Button disabled with countdown
- [ ] Auto-detect SMS code (platform-specific)

---

##### Screen 5: Profile Completion Flow (6 Steps)

**Purpose**: Collect detailed profile data before payment
**Entry Point**: After OTP verification if profile is incomplete
**Steps**: Multi-screen flow with progress indicator (Step 1/6... 6/6)

**Step 1/6: Personal Details**
- Marital Status (dropdown: Single, Divorced, Widowed, Separated)
- Number of Children (number picker, 0-20)
- Ethnicity (dropdown: Peulh, Hausa, Tuareg, Wolof, Bambara, Songhay, Other)
- "Next" button

**Step 2/6: Additional Info**
- Blood Type (dropdown: O+, O-, A+, A-, B+, B-, AB+, AB-, Prefer not to say)
- HIV Test Done? (toggle: Yes/No)
- Hepatitis Test Done? (toggle: Yes/No)
- "Back" + "Next" buttons

**Step 3/6: Photo Upload**
- "Upload Profile Photo" button
- Opens camera/gallery picker
- Preview uploaded image
- "Skip for now" link (optional)
- "Back" + "Next" buttons

**Step 4/6: Search Preferences**
- Searched Age Min (number picker, 18-120)
- Searched Age Max (number picker, 18-120)
- Searched Marital Status (multi-select: Single, Divorced, Widowed, Separated, Any)
- "Back" + "Next" buttons

**Step 5/6: Search Criteria**
- Free text area: "Describe what you're looking for in a partner" (max 500 chars)
- Example placeholder: "I'm looking for someone who values family, is kind..."
- "Back" + "Next" buttons

**Step 6/6: Identity Document Upload**
- Document Type (dropdown: National ID Card, Passport, Residence Permit, School Card)
- "Upload Document Photo" button (camera/gallery)
- Preview uploaded image
- Info text: "Your identity will be verified by our admin team"
- "Back" + "Submit Profile" button

**User Flow (Completion)**:
```
[Profile Completion Flow]
  → Step 1/6 → Fill fields → "Next"
  → Step 2/6 → Fill fields → "Next"
  → Step 3/6 → Upload photo (optional) → "Next"
  → Step 4/6 → Set age range → "Next"
  → Step 5/6 → Write criteria → "Next"
  → Step 6/6 → Upload ID document → "Submit Profile"
     → Show loading
     → API saves all 6 steps
     → Mark profile as complete
     → Redirect to [Payment Screen]
```

**Progress Saving**:
- Each step auto-saves on "Next"
- User can exit and resume later (loads last completed step)

**Mock Data Required**:
```
Mock Profile States:
1. Fresh user (step 0/6) → Start from Step 1
2. Partially completed (step 3/6) → Resume at Step 4
3. Fully completed (step 6/6) → Skip to Payment Screen

Mock Dropdowns:
Marital Status: Single, Divorced, Widowed, Separated
Ethnicity: Peulh, Hausa, Tuareg, Wolof, Bambara, Songhay, Other
Blood Type: O+, O-, A+, A-, B+, B-, AB+, AB-, Prefer not to say
Document Types: National ID Card, Passport, Residence Permit, School Card
Countries: Mali, Niger, Burkina Faso, Chad, Mauritania, Senegal
```

**Edge Cases**:
- [ ] Searched Age Min > Max → "Minimum age cannot exceed maximum"
- [ ] Required field left empty → Disable "Next" button
- [ ] Image upload failure → "Failed to upload. Please try again."
- [ ] Image too large (>5MB) → "Image must be less than 5MB"
- [ ] Exit mid-flow → Save progress, show "Complete your profile" reminder on Dashboard
- [ ] Back button on Step 1 → Return to Dashboard with incomplete profile

---

##### Screen 6: Payment Submission Screen

**Purpose**: Submit payment for account validation
**Entry Point**: After profile completion OR from Dashboard if unpaid
**Payment Methods**: Manual Receipt Upload OR Wave Mobile Money

**UI Layout**:
- Title: "Activate Your Account"
- Subtitle: "One-time payment: 5,000 CFA"
- Tab selector: [Manual Payment] [Wave Mobile Money]

**Tab 1: Manual Payment (Receipt Upload)**
- Instructions: "Pay via bank transfer or cash deposit, then upload your receipt"
- Bank details (read-only):
  - Bank: Banque Atlantique
  - Account: 012345678
  - Name: Union Sahelienne SARL
- Amount input (pre-filled: 5000 CFA)
- "Upload Receipt Photo" button (camera/gallery)
- Preview uploaded receipt
- "Submit Payment" button (disabled until receipt uploaded)

**Tab 2: Wave Mobile Money**
- Instructions: "Pay using Wave mobile money"
- Deposit Number: [Auto-generated, e.g., #WAV1234567]
- Amount: 5,000 CFA
- Steps:
  1. Open your Wave app
  2. Send 5,000 CFA to deposit number: #WAV1234567
  3. Return here and tap "I've Completed Payment"
- "I've Completed Payment" button

**User Flow (Manual Payment)**:
```
[Payment Screen]
  → Select "Manual Payment" tab
  → Tap "Upload Receipt Photo"
  → Choose camera/gallery
  → Crop/rotate image
  → Preview receipt
  → Tap "Submit Payment"
     → Show loading
     → Upload image + amount to API
     → Success → Redirect to [Waiting for Validation Screen]
     → Error → Show error message
```

**User Flow (Wave Payment)**:
```
[Payment Screen]
  → Select "Wave Mobile Money" tab
  → Read deposit number (#WAV1234567)
  → Exit app → Open Wave → Send money
  → Return to app → Tap "I've Completed Payment"
     → Show loading
     → API creates payment record with status "pending"
     → Success → Redirect to [Waiting for Validation Screen]
```

**Mock Data Required**:
```
Mock Payment Scenarios:
1. Manual payment successful upload
   - Receipt image → Upload succeeds → Create payment with status "pending"

2. Wave payment successful
   - Deposit number: #WAV1234567 → Create payment → Status "pending"

3. Upload failure (simulated 20% of the time)
   - Error: "Upload failed. Please check your connection."

4. Payment already exists
   - Error: "You already have a pending payment. Please wait for validation."
```

**Edge Cases**:
- [ ] Image file too large → Compress before upload OR show error
- [ ] Amount field modified → Validate min 5000 CFA
- [ ] Receipt upload timeout → Show retry button
- [ ] User clicks back → Confirm dialog "Are you sure? Payment not submitted."
- [ ] Wave payment: User doesn't actually pay → Admin will reject later

---

##### Screen 7: Waiting for Validation Screen

**Purpose**: Inform user their payment is under review
**Entry Point**: After payment submission OR if payment status is "pending"

**UI Elements**:
- Icon: Hourglass or clock animation
- Title: "Payment Under Review"
- Message: "Our team is verifying your payment. You'll be notified within 24-48 hours."
- Payment details:
  - Type: Manual Receipt / Wave Mobile Money
  - Amount: 5,000 CFA
  - Submitted: [Date and time]
  - Status: Pending (yellow badge)
- "Check Status" button (triggers manual refresh)
- "Contact Support" link (opens email/WhatsApp)

**Auto-Polling Logic**:
- Poll payment status every 30 seconds while screen is open
- If status changes → Update UI immediately

**User Flow (Approved)**:
```
[Waiting Screen]
  → Auto-poll every 30s
  → Payment status changes to "validated"
  → Show success animation + confetti
  → Message: "Payment Approved! Your account is now active."
  → "Continue to Dashboard" button
  → Redirect to [Dashboard] with 3 LITE credits
```

**User Flow (Rejected)**:
```
[Waiting Screen]
  → Auto-poll every 30s
  → Payment status changes to "rejected"
  → Show error icon
  → Message: "Payment Rejected. Reason: [admin rejection reason]"
  → "Upload New Receipt" button → Returns to [Payment Screen]
```

**Mock Data Required**:
```
Mock Payment Status Polling:
1. Always pending (default for 5 polling cycles)
2. Auto-approve after 6th poll (simulates admin approval after 3 minutes)
3. Random rejection (5% chance) → Reason: "Receipt unclear. Please reupload."
4. Manual approval via "Check Status" button → Instant approval

Mock Admin Rejection Reasons:
- "Receipt unclear. Please upload a clearer photo."
- "Amount does not match. Expected 5,000 CFA."
- "Payment not found in our records."
```

**Edge Cases**:
- [ ] Network timeout during polling → Show "Connection lost. Retrying..."
- [ ] User exits app → Stop polling, resume on return
- [ ] User force-kills app → Resume polling on next launch
- [ ] Payment approved while user offline → Show notification when back online
- [ ] Payment rejected but user doesn't see → Email notification sent (backend)

---

#### Mock Data Set 1: Authentication & Onboarding

**Test User Personas (12 users)**:

```
1. Alice (New User - Needs to Register)
   - Email: alice@test.com
   - Phone: +22370000001
   - State: Not yet registered
   - Journey: Register → OTP → Profile Completion → Payment → Validated

2. Bob (Registered, Unverified)
   - Email: bob@test.com
   - Phone: +22370000002
   - State: Account created, OTP not verified
   - Journey: Login → OTP → Profile Completion → Payment → Validated

3. Charlie (Verified, Profile Incomplete - 2/6 steps)
   - Email: charlie@test.com
   - Password: password123
   - State: OTP verified, profile 33% complete
   - Journey: Login → Resume Profile (Step 3/6) → Payment → Validated

4. Diana (Profile Complete, Unpaid)
   - Email: diana@test.com
   - Password: password123
   - Profile: 100% complete
   - Payment: None
   - Journey: Login → Payment Screen → Submit → Wait → Validated

5. Eve (Payment Pending)
   - Email: eve@test.com
   - Password: password123
   - Profile: Complete
   - Payment: Pending (submitted 2 hours ago)
   - Journey: Login → Waiting Screen → [Auto-approve in 3 min] → Validated

6. Frank (Payment Rejected)
   - Email: frank@test.com
   - Password: password123
   - Payment: Rejected
   - Reason: "Receipt unclear"
   - Journey: Login → Rejected Screen → Reupload Receipt → Wait → Validated

7. Grace (Validated, 0 Matches)
   - Email: grace@test.com
   - Password: password123
   - Profile: Complete, validated
   - Credits: 3/3 remaining
   - Journey: Login → Dashboard → Browse Candidates

8. Henry (Active, 1 Match)
   - Email: henry@test.com
   - Password: password123
   - Matches: 1 accepted
   - Credits: 2/3 remaining
   - Journey: Login → Dashboard → Active Matches Tab

9. Iris (Maxed Out, 3 Matches)
   - Email: iris@test.com
   - Password: password123
   - Matches: 3 accepted
   - Credits: 0/3 remaining
   - Journey: Login → Dashboard → Cannot send more interests

10. Jack (Inactive, Requires OTP)
    - Email: jack@test.com
    - Password: password123
    - Last Login: 35 days ago
    - Journey: Login → OTP Challenge → Dashboard

11. Karen (Waitlisted - Gender Balance)
    - Email: karen@test.com
    - Password: password123
    - State: Payment approved but waitlisted (75% female limit hit)
    - Journey: Login → Waitlist Screen → [Wait for male users to join]

12. Leo (Admin User)
    - Email: admin@union.com
    - Password: admin123
    - Role: Administrator
    - Journey: Login → Admin Dashboard → Validate Payments/Identities
```

**Mock Images Needed**:
- 12 profile photos (diverse Sahel demographics: various ages, genders)
- 6 identity documents (CNI, passport samples - watermarked "MOCK DATA")
- 6 payment receipts (bank slips, Wave screenshots - watermarked)

**Mock API Responses**:

```json
// POST /auth/email/register
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "otpSent": true,
  "destination": "alice@test.com"
}

// POST /auth/otp/verify
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "alice@test.com",
    "firstName": "Alice",
    "profile": {
      "isComplete": false,
      "completionPercentage": 0
    }
  }
}

// POST /auth/email/login (OTP required)
{
  "otpRequired": true,
  "destination": "jack@test.com",
  "message": "For security, we've sent a verification code to your email"
}

// POST /auth/email/login (Success)
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 7,
    "email": "grace@test.com",
    "profile": {
      "isComplete": true,
      "isValidated": true,
      "matchCreditsTotal": 3,
      "matchCreditsUsed": 0
    }
  }
}

// GET /profile/me (Incomplete)
{
  "id": 3,
  "userId": 3,
  "isComplete": false,
  "completionPercentage": 33,
  "completedSteps": ["personal", "additional"],
  "nextStep": "photo",
  "gender": "male",
  "age": 28,
  "maritalStatus": "single",
  "childrenCount": 0,
  "ethnicity": "Hausa"
  // ... missing fields
}

// POST /payments/manual
{
  "success": true,
  "payment": {
    "id": 5,
    "type": "manual",
    "status": "pending",
    "amount": 5000,
    "createdAt": "2026-04-18T14:30:00Z"
  },
  "message": "Payment submitted. Our team will review it within 24-48 hours."
}

// GET /payments/me/status (Pending)
{
  "payment": {
    "id": 5,
    "status": "pending",
    "type": "manual",
    "amount": 5000,
    "submittedAt": "2026-04-18T14:30:00Z"
  },
  "estimatedReviewTime": "24-48 hours"
}

// GET /payments/me/status (Validated)
{
  "payment": {
    "id": 5,
    "status": "validated",
    "type": "manual",
    "amount": 5000,
    "validatedAt": "2026-04-18T15:00:00Z",
    "validatedBy": 12
  },
  "subscriptionActivated": true,
  "creditsGranted": 3
}

// GET /payments/me/status (Rejected)
{
  "payment": {
    "id": 6,
    "status": "rejected",
    "type": "manual",
    "amount": 5000,
    "rejectedAt": "2026-04-18T15:00:00Z",
    "rejectionReason": "Receipt unclear. Please upload a clearer photo."
  }
}
```

---

#### Phase 0 Testing Scenarios

**Authentication Tests** (20 scenarios):
- [ ] Login with valid email → Success
- [ ] Login with valid phone → Success
- [ ] Login with invalid password → Error
- [ ] Login with non-existent email → Error
- [ ] Login requiring OTP (30+ days) → OTP screen
- [ ] Registration with new email → Success
- [ ] Registration with existing email → Error
- [ ] Registration with invalid phone format → Error
- [ ] Registration password mismatch → Error
- [ ] Registration under 18 years → Error
- [ ] OTP verification with correct code → Success
- [ ] OTP verification with wrong code → Error
- [ ] OTP verification with expired code → Error
- [ ] OTP resend → Success (60s countdown)
- [ ] Forgot password flow → Success
- [ ] Reset password with valid OTP → Success
- [ ] Auto-login on app launch (valid JWT) → Dashboard
- [ ] Auto-login with expired JWT → Refresh token OR login
- [ ] Logout → Clear tokens → Login screen
- [ ] Session timeout (15 min inactive) → Login screen

**Profile Completion Tests** (15 scenarios):
- [ ] Start profile from step 1 → Complete all 6 steps → Payment screen
- [ ] Resume incomplete profile (step 3/6) → Continue from step 4
- [ ] Exit profile mid-flow → Save progress
- [ ] Back button on step 1 → Dashboard (incomplete profile)
- [ ] Back button on step 3 → Return to step 2
- [ ] Skip photo upload → Proceed to next step
- [ ] Upload photo >5MB → Error
- [ ] Set age min > age max → Error
- [ ] Leave required field empty → Disable "Next" button
- [ ] Upload identity document (CNI) → Success
- [ ] Upload identity document (Passport) → Success
- [ ] Identity upload failure → Retry button
- [ ] Submit profile → Mark as complete → Redirect to payment
- [ ] Profile 100% complete → Show checkmark in UI
- [ ] Edit profile after completion → Update fields

**Payment Tests** (12 scenarios):
- [ ] Manual payment: Upload receipt → Success
- [ ] Manual payment: Upload failure → Error + retry
- [ ] Manual payment: Receipt too large → Compress OR error
- [ ] Wave payment: Generate deposit number → Success
- [ ] Wave payment: Mark as paid → Pending status
- [ ] Payment already exists → Error message
- [ ] Waiting screen: Auto-poll every 30s → Status updates
- [ ] Waiting screen: Payment approved → Success animation → Dashboard
- [ ] Waiting screen: Payment rejected → Error + reupload button
- [ ] Waiting screen: Network timeout → Retry message
- [ ] Contact support → Opens email/WhatsApp
- [ ] Check status manually → Refresh payment status

---

### Phase 1: Subscription Credits Display (R2)

**Backend Status**: ⏳ In Progress (R2 Sprint 1)
**Estimated Effort**: 1 week
**Priority**: Medium (enhances Phase 0)

#### Features to Build

1. **Credits Display in Profile Screen**
2. **Credits Widget on Dashboard**
3. **Credit Depletion Warning**

#### Screens Breakdown

##### Screen 8: Enhanced Profile Screen (with Credits)

**Purpose**: Show current subscription status and credits
**Enhancements to existing Profile Screen**:

**New UI Section**: Subscription Card
- **Position**: Top of profile (above personal details)
- **Content**:
  - Subscription Type: "LITE" (badge)
  - Credits Remaining: "2 of 3 credits" (progress bar)
  - Credits Used: "1 credit used"
  - Started: "April 18, 2026"
  - Expiry: "Unlimited" (LITE has no expiry)
  - "Upgrade to PRO" button (disabled, coming soon)

**Visual Design Notes**:
- Progress bar: Green (3/3) → Yellow (2/3) → Orange (1/3) → Red (0/3)
- Icon: Star for LITE tier, Crown for PRO tier (future)

**User Flow**:
```
[Dashboard]
  → Tap Profile icon → [Profile Screen]
  → See Subscription Card at top
  → Shows credits remaining (e.g., "2 of 3")
  → Tap anywhere outside subscription card → Returns to Dashboard
```

**Mock Data Required**:
```
Mock Subscription States:
1. Full credits (3/3) → User: Grace
   {
     "type": "lite",
     "matchCreditsTotal": 3,
     "matchCreditsUsed": 0,
     "startedAt": "2026-04-18T10:00:00Z",
     "expiresAt": null
   }

2. Partial credits (2/3) → User: Henry
   {
     "type": "lite",
     "matchCreditsTotal": 3,
     "matchCreditsUsed": 1,
     "startedAt": "2026-04-15T08:00:00Z",
     "expiresAt": null
   }

3. Low credits (1/3) → User: Iris (before 3rd match)
   {
     "type": "lite",
     "matchCreditsTotal": 3,
     "matchCreditsUsed": 2,
     "startedAt": "2026-04-12T12:00:00Z",
     "expiresAt": null
   }

4. Zero credits (0/3) → User: Iris
   {
     "type": "lite",
     "matchCreditsTotal": 3,
     "matchCreditsUsed": 3,
     "startedAt": "2026-04-10T09:00:00Z",
     "expiresAt": null
   }
```

**Edge Cases**:
- [ ] User with 0 credits → Show "No credits remaining. Upgrade or wait for PRO tier."
- [ ] User not validated yet → Don't show subscription card (no subscription exists)
- [ ] Admin user → Show different subscription UI (unlimited access)

---

##### Screen 9: Dashboard with Credits Widget

**Purpose**: Persistent credit count visible on main screen
**Enhancements to Dashboard**:

**New UI Element**: Credits Badge
- **Position**: Top-right corner of Dashboard
- **Content**: Icon (star) + "2/3" text
- **Behavior**:
  - Tap → Opens [Profile Screen] scrolled to Subscription section
  - Changes color based on credits: Green (3) → Yellow (2) → Red (1) → Gray (0)

**User Flow**:
```
[Dashboard]
  → User sees credits badge "2/3" in top-right
  → Sends interest → Match accepted → Credits update to "1/3"
  → Badge color changes to red
  → If credits hit 0 → Badge shows "0/3" (gray) + lock icon
```

**Real-Time Update Logic**:
- When user sends interest → Optimistic UI update (deduct 1 credit immediately)
- When match is accepted → Confirm deduction via API
- When match is rejected → Refund credit (no deduction)

**Mock Data**: (Same as Screen 8)

---

##### Screen 10: Credit Depletion Warning Modal

**Purpose**: Warn user before sending last interest
**Trigger**: User attempts to send interest when credits = 1 (last credit)

**UI Elements**:
- Icon: Warning triangle
- Title: "Using Your Last Credit"
- Message: "You have 1 credit remaining. If this match is accepted, you won't be able to send more interests until you upgrade to PRO or this match expires."
- Buttons:
  - "Cancel" (secondary)
  - "Send Interest Anyway" (primary, yellow)

**User Flow**:
```
[Dashboard - Candidate Detail]
  → User taps "Send Interest" with 1 credit remaining
  → Show [Credit Warning Modal]
  → User reads warning
     ├─ Tap "Cancel" → Close modal, no action
     └─ Tap "Send Anyway" → Send interest → Credits become 0/3
```

**Edge Cases**:
- [ ] User already at 0 credits → Show different modal: "No credits. Cannot send interest."
- [ ] User at 2 credits → No warning (still has 1 left after this match)
- [ ] Match gets rejected later → Credits remain 0 (no refund in R2 scope)

---

#### Mock Data Set 2: Subscription States

**Subscription Scenarios**:

```
1. Grace (Full Credits)
   - Credits: 3/3
   - Can send 3 interests
   - No warnings shown

2. Henry (Partial Credits)
   - Credits: 2/3
   - Can send 2 more interests
   - Warning shown on 2nd interest

3. Iris (Low Credits)
   - Credits: 1/3
   - Can send 1 more interest
   - Warning shown immediately

4. Jack (Zero Credits)
   - Credits: 0/3
   - Cannot send interests
   - "No credits" modal on attempt
```

**Mock API Responses**:

```json
// GET /profile/me (with subscription)
{
  "id": 7,
  "userId": 7,
  "isValidated": true,
  "subscription": {
    "type": "lite",
    "matchCreditsTotal": 3,
    "matchCreditsUsed": 1,
    "matchCreditsRemaining": 2,
    "startedAt": "2026-04-15T08:00:00Z",
    "expiresAt": null
  }
}

// POST /matches/:userId/interest (Success, credits deducted)
{
  "success": true,
  "match": {
    "id": 42,
    "requesterId": 7,
    "targetId": 15,
    "status": "pending"
  },
  "subscription": {
    "matchCreditsRemaining": 1
  },
  "message": "Interest sent. If accepted, 1 credit will be deducted."
}

// POST /matches/:userId/interest (No credits)
{
  "success": false,
  "error": "insufficient_credits",
  "message": "You have no credits remaining. Please upgrade or wait for PRO tier.",
  "subscription": {
    "matchCreditsRemaining": 0
  }
}
```

---

#### Phase 1 Testing Scenarios

**Subscription Display Tests** (8 scenarios):
- [ ] Validated user sees subscription card on profile → Success
- [ ] Subscription card shows correct credits (3/3, 2/3, 1/3, 0/3) → Success
- [ ] Credits badge on dashboard updates in real-time → Success
- [ ] Credits badge color changes (green → yellow → red → gray) → Success
- [ ] Tap credits badge → Opens profile scrolled to subscription → Success
- [ ] User with 0 credits → Badge shows lock icon → Success
- [ ] Unvalidated user → No subscription card shown → Success
- [ ] Admin user → Shows "Unlimited" subscription → Success

**Credit Depletion Tests** (6 scenarios):
- [ ] Send interest with 2+ credits → No warning → Success
- [ ] Send interest with 1 credit → Warning modal → Success
- [ ] Warning modal: Cancel → No interest sent → Success
- [ ] Warning modal: Send anyway → Interest sent, credits = 0 → Success
- [ ] Attempt interest with 0 credits → Error modal → Success
- [ ] Match rejected later → Credits remain unchanged (no refund) → Success

---

### Phase 2: Gender Balance & Waitlist (R2)

**Backend Status**: ⏳ Planned (R2 Sprint 2)
**Estimated Effort**: 1-2 weeks
**Priority**: High (business-critical rule)

#### Features to Build

1. **Waitlist Screen** (when user hits gender balance limit)
2. **Gender Balance Notification**
3. **Admin Waitlist Management** (if building mobile admin)

#### Screens Breakdown

##### Screen 11: Waitlist Screen

**Purpose**: Inform users they're waitlisted due to gender balance
**Entry Point**: After payment validation if gender balance limit (75%) is hit
**Trigger**: Backend sets `user.waitlistReason = "gender_balance"`

**UI Elements**:
- Icon: Hourglass with gender symbols (♀/♂)
- Title: "You're on the Waitlist"
- Message: "We're maintaining a balanced community. You'll be activated when more [opposite gender] users join. We've sent an email with more details."
- Info Card:
  - Your Gender: Female
  - Current Platform Ratio: 77% Female / 23% Male
  - Waitlist Position: #12
  - Estimated Wait: 2-4 weeks (based on average signup rate)
- "Learn More" link (opens FAQ about gender balance)
- "Contact Support" button (email/WhatsApp)
- "Logout" link

**Auto-Refresh Logic**:
- Poll waitlist status every 60 seconds while screen is open
- If status changes to "unblocked" → Show success animation → Redirect to Dashboard

**User Flow (Waitlisted)**:
```
[Payment Validation]
  → Admin approves payment
  → Backend checks gender ratio
     ├─ Ratio OK (≤75%) → Activate user → Dashboard
     └─ Ratio exceeds 75% → Set waitlistReason → [Waitlist Screen]
        → User sees waitlist message
        → Email notification sent
        → User waits (auto-poll every 60s)
```

**User Flow (Unblocked)**:
```
[Waitlist Screen]
  → Auto-poll every 60s
  → Backend unblocks user (ratio now allows)
  → Screen updates → Show success animation
  → Message: "Great news! Your account is now active. Start browsing profiles!"
  → "Continue to Dashboard" button → [Dashboard]
```

**Mock Data Required**:
```
Mock Waitlist Scenarios:
1. Karen (Female, Waitlisted)
   - Gender: Female
   - waitlistReason: "gender_balance"
   - waitlistedAt: "2026-04-18T10:00:00Z"
   - Current ratio: 77% female / 23% male
   - Position: #12
   - Auto-unblock after 10 polling cycles (10 minutes)

2. Leo (Male, Not Waitlisted)
   - Gender: Male
   - waitlistReason: null
   - Ratio: 77% female / 23% male (males needed, no waitlist)

3. Maria (Female, Waitlisted, Then Unblocked)
   - Initially waitlisted
   - After 5 minutes → Ratio drops to 74% female
   - Auto-unblocked → Redirect to Dashboard

Mock Gender Ratios:
- Initial: 77% female / 23% male (females waitlisted)
- After unblock: 74% female / 26% male (balanced)
- Edge case: 50% / 50% (no waitlist for either gender)
```

**Edge Cases**:
- [ ] User manually blocked by admin (not gender balance) → Different waitlist reason
- [ ] User tries to access Dashboard while waitlisted → Redirect to Waitlist Screen
- [ ] User logs out and back in while waitlisted → Still see Waitlist Screen
- [ ] Network timeout during polling → Show "Connection lost. Retrying..."
- [ ] Waitlist position changes (new users waitlisted) → Update position in real-time

---

##### Screen 12: Gender Balance Notification

**Purpose**: In-app notification when user is unblocked
**Trigger**: Backend unblocks user (via admin OR automatic rebalance)
**Delivery**: Push notification + in-app notification banner

**Push Notification**:
- Title: "Account Activated!"
- Body: "Great news! You can now access Union Sahelienne and start matching."
- Tap → Opens app → Dashboard

**In-App Banner (if app is open)**:
- Position: Top of screen (toast/snackbar)
- Message: "Your account is now active! Start browsing profiles."
- Duration: 5 seconds
- Action: Auto-dismiss OR tap to close

**Mock Data**: None (static notification content)

---

##### Screen 13: Admin Waitlist Management (Optional)

**Purpose**: Allow admins to view and manually unblock waitlisted users
**Entry Point**: Admin Dashboard → Waitlist tab
**Note**: Only needed if building mobile admin panel (otherwise use web admin)

**UI Elements**:
- List of waitlisted users:
  - Profile photo
  - Name (first + last)
  - Gender
  - Waitlist reason
  - Waitlisted since (date)
  - "Unblock" button (admin action)
- Filter by gender (Male/Female)
- Sort by waitlist date (oldest first)

**Admin Flow**:
```
[Admin Dashboard]
  → Tap "Waitlist" tab → [Waitlist Management Screen]
  → See list of 12 waitlisted users
  → Tap "Unblock" on Karen
     → Confirmation dialog: "Unblock Karen? This will activate her account."
     → Tap "Confirm"
        → API call → POST /admin/waitlist/11/unblock
        → Success → Remove Karen from list
        → Karen receives notification
        → Karen can now access Dashboard
```

**Mock Data Required**:
```
Mock Waitlisted Users (for admin view):
1. Karen (Female, waitlisted 2 days)
2. Sarah (Female, waitlisted 5 days)
3. Emily (Female, waitlisted 1 day)
4. Rachel (Female, waitlisted 3 days)
... (12 total female users waitlisted)

Current ratio: 77% female / 23% male
```

**Edge Cases**:
- [ ] Admin unblocks user → Ratio exceeds 75% again → Warning shown
- [ ] Admin unblocks multiple users → Batch API calls
- [ ] No waitlisted users → Show empty state "No users waitlisted"

---

#### Mock Data Set 3: Gender Balance & Waitlist

**Waitlist User Personas**:

```
1. Karen (Waitlisted Female)
   - Email: karen@test.com
   - Gender: Female
   - Payment: Validated
   - waitlistReason: "gender_balance"
   - waitlistedAt: "2026-04-16T10:00:00Z"
   - Position: #12
   - Journey: Payment Validated → Waitlist Screen → [Wait 10 min] → Unblocked → Dashboard

2. Maria (Waitlisted Female, Unblocked After 5 Min)
   - Email: maria@test.com
   - Gender: Female
   - waitlistReason: "gender_balance" → null (after unblock)
   - waitlistedAt: "2026-04-18T09:00:00Z" → null
   - Journey: Waitlist Screen → [5 min] → Unblocked → Dashboard

3. Leo (Male, Never Waitlisted)
   - Email: leo@test.com
   - Gender: Male
   - waitlistReason: null
   - Journey: Payment Validated → Dashboard (males needed, no waitlist)

4. Sarah (Waitlisted, Manually Unblocked by Admin)
   - Email: sarah@test.com
   - Gender: Female
   - waitlistReason: "gender_balance"
   - waitlistedAt: "2026-04-13T08:00:00Z"
   - Journey: Waitlist → Admin manually unblocks → Dashboard
```

**Mock API Responses**:

```json
// GET /auth/me (Waitlisted user)
{
  "id": 11,
  "email": "karen@test.com",
  "waitlistReason": "gender_balance",
  "waitlistedAt": "2026-04-16T10:00:00Z",
  "profile": {
    "isValidated": true,
    "gender": "female"
  },
  "genderRatio": {
    "female": 77,
    "male": 23
  },
  "waitlistPosition": 12
}

// GET /auth/me (Unblocked user)
{
  "id": 11,
  "email": "karen@test.com",
  "waitlistReason": null,
  "waitlistedAt": null,
  "profile": {
    "isValidated": true,
    "gender": "female"
  }
}

// POST /admin/waitlist/:userId/unblock (Admin action)
{
  "success": true,
  "message": "User karen@test.com has been unblocked.",
  "user": {
    "id": 11,
    "waitlistReason": null
  }
}
```

---

#### Phase 2 Testing Scenarios

**Waitlist Tests** (10 scenarios):
- [ ] Female user payment validated, ratio 77% → Waitlisted → Success
- [ ] Male user payment validated, ratio 77% female → Not waitlisted → Dashboard
- [ ] Waitlisted user sees waitlist screen → Success
- [ ] Waitlist screen shows correct ratio (77% / 23%) → Success
- [ ] Waitlist screen shows position (#12) → Success
- [ ] Auto-poll every 60s → Status updates → Success
- [ ] User unblocked (ratio drops to 74%) → Success animation → Dashboard
- [ ] User tries to access Dashboard while waitlisted → Redirected to Waitlist Screen
- [ ] User logs out and back in while waitlisted → Still waitlisted → Success
- [ ] Network timeout during waitlist polling → Retry message → Success

**Gender Balance Tests** (5 scenarios):
- [ ] Platform ratio exactly 75% female → New female user → Waitlisted
- [ ] Platform ratio 74% female → New female user → Not waitlisted
- [ ] Platform ratio 80% male → New male user → Waitlisted
- [ ] Admin manually unblocks waitlisted user → Success → Dashboard
- [ ] Empty waitlist → Admin sees "No users waitlisted" → Success

---

### Phase 3: Notifications (R2)

**Backend Status**: ⏳ Planned (R2 Sprint 3)
**Estimated Effort**: 1 week
**Priority**: Medium (engagement & retention)

#### Features to Build

1. **Push Notification Handler** (match requests, payment validated, etc.)
2. **Email Notification Viewer** (Terms update, weekly reminders)
3. **Notification Settings** (toggle preferences)

#### Notification Types

##### Notification 1: Weekly Reminder (Unverified Accounts)

**Trigger**: Weekly cron (every Monday 9:00 AM WAT)
**Target**: Users with `isComplete = true` AND `isValidated = false` (paid but pending validation)
**Channels**: Email + Push notification

**Email Content**:
- Subject: "Complete Your Union Sahelienne Verification"
- Body: "Your profile is ready, but we're still waiting to verify your payment. Upload a clearer receipt or contact support if you need help."
- CTA: "Upload New Receipt" (deeplink to Payment Screen)

**Push Notification**:
- Title: "Complete Your Verification"
- Body: "Your payment is pending. Need help? Contact support."
- Tap → Opens app → Payment Waiting Screen

**User Flow**:
```
[Backend Cron - Monday 9 AM]
  → Query users: isComplete = true, isValidated = false
  → Send email to each user
  → Send push notification to each user

[User Receives Notification]
  → Tap push notification → App opens → [Payment Waiting Screen]
  → OR: Open email → Tap CTA → Deeplink to [Payment Screen]
```

**Mock Data**: Not applicable (automated backend cron, no user action needed)

---

##### Notification 2: Terms & Conditions Update

**Trigger**: Admin triggers bulk email via `POST /admin/terms/notify`
**Target**: All active users (`deletedAt = null`)
**Channels**: Email + In-app banner

**Email Content**:
- Subject: "Important: Terms & Conditions Updated"
- Body: "We've updated our Terms & Conditions. Please review the new terms at your earliest convenience."
- CTA: "Read New Terms" (deeplink to Terms screen in app)

**In-App Banner**:
- Position: Top of Dashboard (persistent until dismissed)
- Message: "Terms & Conditions updated. Tap to review."
- Icon: Info icon
- Tap → Opens Terms screen (webview or native)
- Dismiss → Hide banner (but user must accept terms eventually)

**User Flow**:
```
[Admin Panel]
  → Admin publishes new CG version
  → Tap "Notify All Users"
     → API: POST /admin/terms/notify
     → Backend sends bulk email to all users
     → Backend flags all users: termsNeedsReview = true

[User Opens App]
  → Dashboard loads
  → See banner: "Terms updated. Tap to review."
  → Tap banner → [Terms Screen]
     → Scroll to bottom
     → "I Accept" button
     → API: POST /profile/me/terms
     → Success → Remove banner → Dashboard
```

**Mock Data Required**:
```
Mock Terms Update Scenarios:
1. User with old terms (termsAcceptedAt = "2026-01-01")
   - termsNeedsReview: true
   - Banner shown on Dashboard

2. User who already accepted new terms
   - termsAcceptedAt: "2026-04-18"
   - termsNeedsReview: false
   - No banner shown

3. New user (never accepted terms)
   - termsAcceptedAt: null
   - Must accept during profile completion (Step 3/6)
```

**Edge Cases**:
- [ ] User dismisses banner but doesn't accept → Show banner again on next launch
- [ ] User must accept new terms to continue using app → Block access until accepted (optional strict mode)
- [ ] Email delivery failure → Log error, retry later

---

##### Notification 3: Match Request Received

**Trigger**: Another user sends interest (`POST /matches/:userId/interest`)
**Target**: The user receiving the interest
**Channels**: Push notification + In-app notification badge

**Push Notification**:
- Title: "New Match Request!"
- Body: "[FirstName] is interested in matching with you. View their profile now."
- Tap → Opens app → [Match Requests Screen]

**In-App Badge**:
- Position: "Matches" tab icon (red badge with count)
- Count: Number of pending incoming requests (e.g., "3")
- Tap → [Match Requests Screen]

**User Flow**:
```
[User A Sends Interest to User B]
  → API: POST /matches/15/interest (User A → User B)
  → Backend creates match with status "pending"
  → Backend sends push notification to User B

[User B Receives Notification]
  → Push notification appears
  → Tap notification → App opens → [Match Requests Screen]
  → See User A's profile card
  → Tap "Accept" OR "Reject"
     ├─ Accept → Match status = "accepted" → Credits deducted (both users) → Chat unlocked
     └─ Reject → Match status = "rejected" → User A notified
```

**Mock Data**: (Covered in Phase 4 - Matching)

---

##### Notification 4: Match Accepted

**Trigger**: User B accepts User A's match request
**Target**: User A (who sent the original interest)
**Channels**: Push notification + In-app notification

**Push Notification**:
- Title: "Match Accepted!"
- Body: "[FirstName] accepted your request. Start chatting now! (30 days remaining)"
- Tap → Opens app → [Chat Screen with User B]

**In-App Notification**:
- Position: Notification center (bell icon)
- Message: "[FirstName] accepted your match. Chat expires in 30 days."
- Tap → [Chat Screen]

**User Flow**:
```
[User B Accepts Match]
  → User A receives push notification
  → Tap notification → [Chat Screen]
  → See countdown: "Chat expires in 29 days 23 hours"
  → Start conversation
```

**Mock Data**: (Covered in Phase 4 - Matching)

---

##### Notification 5: Payment Validated

**Trigger**: Admin validates payment (`PATCH /payments/:id/validate`)
**Target**: User who submitted the payment
**Channels**: Push notification + Email

**Push Notification**:
- Title: "Payment Approved!"
- Body: "Your account is now active. Start browsing profiles!"
- Tap → Opens app → [Dashboard]

**Email Content**:
- Subject: "Welcome to Union Sahelienne!"
- Body: "Your payment has been validated. You now have 3 LITE credits to start matching. Good luck!"
- CTA: "Start Matching" (deeplink to Dashboard)

**User Flow**:
```
[Admin Validates Payment]
  → User receives push notification + email
  → Tap push → App opens → [Dashboard]
  → See 3/3 credits → Start browsing candidates
```

**Mock Data**: (Covered in Phase 0 - Payment)

---

#### Screen 14: Notification Settings

**Purpose**: Allow users to toggle notification preferences
**Entry Point**: Settings → Notifications

**UI Elements**:
- Toggle switches for each notification type:
  - [ ] Match requests (push + in-app)
  - [ ] Match accepted (push + in-app)
  - [ ] Payment updates (push + email)
  - [ ] Weekly reminders (email only)
  - [ ] Terms updates (email + banner)
  - [ ] Chat messages (push, future)
- "Save Preferences" button

**User Flow**:
```
[Dashboard]
  → Tap Settings icon → [Settings Screen]
  → Tap "Notifications" → [Notification Settings Screen]
  → Toggle "Match requests" OFF
  → Toggle "Weekly reminders" OFF
  → Tap "Save Preferences"
     → API: PATCH /users/me/notification-preferences
     → Success → Show toast "Preferences saved"
     → Return to Settings
```

**Mock Data Required**:
```
Mock Notification Preferences:
Default (all enabled):
{
  "matchRequests": true,
  "matchAccepted": true,
  "paymentUpdates": true,
  "weeklyReminders": true,
  "termsUpdates": true
}

User with some disabled:
{
  "matchRequests": true,
  "matchAccepted": true,
  "paymentUpdates": false,
  "weeklyReminders": false,
  "termsUpdates": true
}
```

**Edge Cases**:
- [ ] User disables all notifications → Confirm dialog "Are you sure?"
- [ ] User disables push but not email → Email still sent
- [ ] User changes preferences → Apply immediately (no app restart needed)

---

#### Mock Data Set 4: Notifications

**Notification Scenarios**:

```
1. Grace (Receives Match Request)
   - User: Henry sends interest to Grace
   - Push notification: "Henry is interested in matching with you."
   - In-app badge: "1" on Matches tab

2. Henry (Match Accepted)
   - User: Grace accepts Henry's request
   - Push notification: "Grace accepted your request. Start chatting!"
   - Credits deducted: 2/3 remaining

3. Eve (Payment Validated)
   - Admin approves Eve's payment
   - Push notification: "Payment approved! Your account is now active."
   - Email: "Welcome to Union Sahelienne!"

4. Charlie (Weekly Reminder - Unverified)
   - Profile complete, payment pending for 7 days
   - Weekly email: "Complete your verification"
   - Push notification: "Your payment is still pending"

5. All Users (Terms Update)
   - Admin publishes new CG
   - Email: "Terms & Conditions updated"
   - In-app banner: "Terms updated. Tap to review."
```

**Mock Push Notification Payloads** (for testing):

```json
// Match Request Notification
{
  "type": "match_request",
  "title": "New Match Request!",
  "body": "Henry is interested in matching with you.",
  "data": {
    "matchId": 42,
    "requesterId": 8,
    "deeplink": "app://matches/requests"
  }
}

// Match Accepted Notification
{
  "type": "match_accepted",
  "title": "Match Accepted!",
  "body": "Grace accepted your request. Chat expires in 30 days.",
  "data": {
    "matchId": 42,
    "targetId": 7,
    "deeplink": "app://chat/42"
  }
}

// Payment Validated Notification
{
  "type": "payment_validated",
  "title": "Payment Approved!",
  "body": "Your account is now active. Start browsing profiles!",
  "data": {
    "paymentId": 5,
    "creditsGranted": 3,
    "deeplink": "app://dashboard"
  }
}
```

---

#### Phase 3 Testing Scenarios

**Push Notification Tests** (10 scenarios):
- [ ] Match request received → Push notification → Tap → Match Requests Screen
- [ ] Match accepted → Push notification → Tap → Chat Screen
- [ ] Payment validated → Push notification → Tap → Dashboard
- [ ] User disables match notifications → No push sent → Success
- [ ] User enables notifications after disabling → Push sent → Success
- [ ] App in background → Push notification appears → Tap → Deeplink works
- [ ] App in foreground → In-app notification banner → Tap → Navigate
- [ ] Multiple notifications queued → Badge count updates → Success
- [ ] Notification permission denied → Show settings prompt → Success
- [ ] Push token expired → Re-register token → Success

**Email Notification Tests** (6 scenarios):
- [ ] Weekly reminder sent to unverified users → Email received → Success
- [ ] Terms update → All users emailed → Success
- [ ] Payment validated → Welcome email sent → Success
- [ ] User clicks email CTA → Deeplink opens app → Correct screen → Success
- [ ] Email delivery failure → Retry logged → Success
- [ ] User unsubscribes from weekly emails → No more emails → Success

**In-App Notification Tests** (4 scenarios):
- [ ] Terms update banner shown on Dashboard → Tap → Terms Screen → Accept → Banner dismissed
- [ ] Match request badge on Matches tab → Shows count "3" → Tap → Requests list
- [ ] Notification center (bell icon) → Shows unread count → Tap → Notification list
- [ ] Mark notification as read → Badge count decreases → Success

---

### Phase 4: Matching & Chat (Core Feature)

**Backend Status**: ✅ R1 Complete (basic matching), ⏳ R2 Interruption Feature
**Estimated Effort**: 3-4 weeks
**Priority**: Critical (core value proposition)

#### Features to Build

1. **Dashboard / Browse Candidates** (swipeable cards OR list view)
2. **Candidate Profile Detail** (blurred vs full view)
3. **Send Interest** (with credit check)
4. **Match Requests** (incoming interests)
5. **My Matches** (active matches list)
6. **Chat Screen** (30-day countdown, text + images only)
7. **Chat Interruption** (14-day cooldown)

#### Screens Breakdown

##### Screen 15: Dashboard (Browse Candidates)

**Purpose**: Main discovery interface for browsing opposite-gender candidates
**Entry Point**: After login (if validated) OR from bottom navigation
**Layout Options**: Tinder-style swipeable cards OR scrollable list (choose one or offer toggle)

**UI Elements (Card View)**:
- Swipeable cards showing:
  - Profile photo (full size if validated, blurred if not)
  - First name + age (e.g., "Amina, 26")
  - City, Country (e.g., "Niamey, Niger")
  - Profession (e.g., "Teacher")
  - Marital status badge (e.g., "Single")
  - "View Profile" button (tap to see full profile)
  - "Send Interest" button (heart icon)
- Swipe gestures:
  - Swipe right → Send interest (same as tap heart)
  - Swipe left → Skip (load next candidate)
- Bottom navigation: Home | Matches | Profile | Settings
- Top-right: Credits badge (e.g., "2/3")

**UI Elements (List View)**:
- Scrollable list of candidate cards:
  - Thumbnail photo (120x120)
  - Name, age, city
  - Profession
  - "View" button → Full profile
  - "♥ Send Interest" button
- Infinite scroll (load 10 candidates per page)
- Pull-to-refresh to reload candidates

**User Flow (Card View)**:
```
[Dashboard]
  → See first candidate card (Amina, 26, Niamey)
  → Swipe right OR tap heart icon
     → Check credits (2/3 remaining)
     → Show confirmation toast "Interest sent to Amina"
     → Load next candidate card
  → Swipe left → Skip to next candidate
  → Tap "View Profile" → [Candidate Detail Screen]
  → No more candidates → Show empty state "No more profiles. Check back later!"
```

**User Flow (Zero Credits)**:
```
[Dashboard]
  → Tap heart icon on candidate
  → Credits = 0/3
  → Show modal: "No credits remaining. You cannot send more interests until you upgrade or an existing match expires."
  → Button: "View My Matches" → [My Matches Screen]
```

**Filtering Logic (Backend, UI shows results)**:
- Only opposite gender shown (male users see females, female users see males)
- Only validated users shown (`isValidated = true`)
- Exclude self
- Exclude users already matched (pending, accepted, or interrupted)
- Pagination: 10 candidates per page

**Mock Data Required** (Covered in Mock Data Set 5 below)

---

##### Screen 16: Candidate Profile Detail

**Purpose**: Full profile view of a candidate before sending interest
**Entry Point**: Tap "View Profile" on candidate card

**UI Elements (Validated User Viewing Validated Candidate)**:
- **Photo Gallery**: Swipeable photos (profile photo + additional uploads, if any)
- **Basic Info**:
  - Name: "Amina Diallo"
  - Age: 26
  - Gender: Female
  - City, Country: "Niamey, Niger"
  - Profession: "Teacher"
- **Personal Details**:
  - Marital Status: Single
  - Children: 0
  - Ethnicity: Hausa
- **Health Info** (if provided):
  - Blood Type: O+
  - HIV Test: Yes
  - Hepatitis Test: Yes
- **Search Criteria**:
  - Looking for: Ages 25-35
  - Preferred Marital Status: Single, Divorced
  - "What I'm looking for": "I'm looking for someone who values family and is kind..."
- **Actions**:
  - "♥ Send Interest" button (primary, bottom fixed)
  - "← Back" button (top-left)

**UI Elements (Blurred/Limited View - Non-Validated User)**:
- Profile photo: Blurred
- Name: First name only (no last name)
- Age: Shown
- City/Country: Shown
- All other fields: Hidden with lock icon
- Message: "Complete your verification to view full profiles"
- "Upgrade Now" button → [Payment Screen]

**User Flow (Send Interest from Detail)**:
```
[Candidate Detail Screen]
  → User scrolls through photos
  → Reads profile details
  → Taps "♥ Send Interest"
     → Check credits (2/3 remaining)
     → Show confirmation modal:
        "Send interest to Amina? If accepted, 1 credit will be deducted."
        [Cancel] [Send Interest]
     → Tap "Send Interest"
        → API: POST /matches/15/interest
        → Success → Show toast "Interest sent!"
        → Return to Dashboard → Load next candidate
```

**Edge Cases**:
- [ ] User already sent interest to this candidate → Show "Interest already sent" message
- [ ] Candidate deleted/deactivated account → Show "Profile no longer available"
- [ ] Candidate's photos fail to load → Show placeholder image
- [ ] User at credit limit → Disable "Send Interest" button, show "No credits"

---

##### Screen 17: Match Requests (Incoming Interests)

**Purpose**: Show users who sent interest to the current user
**Entry Point**: Dashboard → Matches tab → "Requests" sub-tab
**Badge**: Red notification badge on Matches tab icon (count of pending requests)

**UI Elements**:
- List of incoming match requests:
  - Profile photo (thumbnail)
  - Name + age (e.g., "Ibrahim, 30")
  - City, country
  - Profession
  - "View Profile" button
  - Action buttons:
    - "✓ Accept" (green)
    - "✕ Reject" (red)
- Empty state: "No match requests yet. Keep your profile active!"

**User Flow (Accept Match)**:
```
[Match Requests Screen]
  → See Ibrahim's request
  → Tap "View Profile" → [Candidate Detail Screen]
  → Read Ibrahim's profile
  → Return to Requests
  → Tap "✓ Accept"
     → Show confirmation modal:
        "Accept Ibrahim's match request? 1 credit will be deducted."
        [Cancel] [Accept]
     → Tap "Accept"
        → API: PATCH /matches/42/accept
        → Success:
           - Credits deducted (both users): 2/3 remaining
           - Chat unlocked for 30 days
           - Match moves to "Active Matches" tab
           - Show toast "Match accepted! Start chatting now."
           - Push notification sent to Ibrahim
        → Redirect to [Chat Screen with Ibrahim]
```

**User Flow (Reject Match)**:
```
[Match Requests Screen]
  → Tap "✕ Reject" on Ibrahim's request
  → Show confirmation modal: "Reject Ibrahim's request? This cannot be undone."
     [Cancel] [Reject]
  → Tap "Reject"
     → API: PATCH /matches/42/reject
     → Success:
        - Match status = "rejected"
        - Remove from requests list
        - Show toast "Match request rejected"
        - No credit deduction for either user
```

**Mock Data**: (Covered in Mock Data Set 5 below)

---

##### Screen 18: My Matches (Active Matches)

**Purpose**: Show all accepted matches with chat access
**Entry Point**: Dashboard → Matches tab → "Active" sub-tab

**UI Elements**:
- Tabs: [Requests] [Active] [History]
- List of active matches:
  - Profile photo
  - Name + age
  - Last message preview (future: "Hey, how are you?")
  - Chat expiry countdown: "28 days remaining" (green → yellow → red as expiry approaches)
  - Tap anywhere → [Chat Screen]
- Empty state: "No active matches yet. Send interests to start matching!"

**User Flow**:
```
[My Matches - Active Tab]
  → See 2 active matches:
     1. Amina (28 days remaining)
     2. Fatima (15 days remaining, yellow badge)
  → Tap on Amina → [Chat Screen with Amina]
  → Send messages
  → Return to Active Matches
  → See countdown updated in real-time
```

**Expiry Countdown Color Logic**:
- 30-15 days remaining: Green badge
- 14-7 days remaining: Yellow badge
- 6-1 days remaining: Red badge
- 0 days (expired): Gray badge + "Expired" label + "Renew" button (future feature)

**Mock Data**: (Covered in Mock Data Set 5 below)

---

##### Screen 19: Chat Screen

**Purpose**: Text-based conversation between matched users
**Entry Point**: Tap active match OR accept match request
**Features**: Text messages + image sharing (no video/voice/docs in R1)

**UI Elements**:
- Header:
  - Back button
  - Matched user's name + photo
  - Chat expiry countdown: "28 days 14 hours remaining"
  - Menu icon (3 dots) → Opens [Chat Options Menu]
- Message list (scrollable, newest at bottom):
  - My messages: Right-aligned, blue bubble
  - Their messages: Left-aligned, gray bubble
  - Timestamps (grouped by day: "Today", "Yesterday", "April 15")
  - Image messages: Thumbnail + tap to full screen
  - Read receipts: "Sent", "Delivered", "Read" (future)
- Input area:
  - Text input field
  - "+" button → Attach image (camera/gallery)
  - Send button (icon: paper plane)
- Info banner (top, dismissible): "This chat expires in 28 days. Make the most of it!"

**User Flow (Send Text Message)**:
```
[Chat Screen with Amina]
  → Type message: "Hi Amina, how are you?"
  → Tap send button
     → Message appears in chat (right-aligned blue bubble)
     → API: POST /chats/42/messages (future backend)
     → Success → Show "Sent" checkmark
     → Amina receives push notification (if enabled)
```

**User Flow (Send Image)**:
```
[Chat Screen]
  → Tap "+" button
  → Select "Camera" OR "Gallery"
  → Choose/take photo
  → Preview image → Tap "Send"
     → Upload image to backend
     → Show image in chat with loading spinner
     → Success → Image thumbnail displayed
     → Tap image → Full screen viewer
```

**User Flow (Chat Expiry)**:
```
[Chat Screen - Day 30]
  → Countdown reaches 0
  → Chat input disabled
  → Show banner: "This chat has expired. You can no longer send messages."
  → Options:
     - "Interrupt" button (ends chat early with cooldown)
     - Message history remains read-only
```

**Chat Options Menu** (3-dot menu):
- **View Profile**: Opens [Candidate Detail Screen] for matched user
- **Interrupt Chat**: Ends chat early (triggers 14-day cooldown, see Screen 20)
- **Report User**: (Future: opens report form)
- **Block User**: (Future: blocks future matching)

**Mock Data Required**:
```
Mock Chat Messages (Conversation between Henry and Grace):
[
  {
    "id": 1,
    "matchId": 42,
    "senderId": 8,
    "senderName": "Henry",
    "message": "Hi Grace, how are you?",
    "type": "text",
    "sentAt": "2026-04-18T10:00:00Z",
    "isRead": true
  },
  {
    "id": 2,
    "matchId": 42,
    "senderId": 7,
    "senderName": "Grace",
    "message": "I'm good, thanks! How about you?",
    "type": "text",
    "sentAt": "2026-04-18T10:05:00Z",
    "isRead": true
  },
  {
    "id": 3,
    "matchId": 42,
    "senderId": 8,
    "senderName": "Henry",
    "message": "[IMAGE: photo.jpg]",
    "type": "image",
    "imageUrl": "https://mock-cdn.com/photo123.jpg",
    "sentAt": "2026-04-18T10:10:00Z",
    "isRead": false
  }
]

Mock Chat States:
1. Fresh chat (no messages yet) → Show "Start the conversation!"
2. Active chat (10+ messages) → Normal conversation
3. Chat expiring soon (2 days left) → Red countdown banner
4. Chat expired (0 days) → Input disabled, read-only
5. Chat interrupted → Show "Chat interrupted" banner
```

**Edge Cases**:
- [ ] Message send failure → Show retry button
- [ ] Image upload >5MB → Compress OR error
- [ ] User blocks sender → Chat grayed out
- [ ] Network timeout → Show "Sending..." with retry
- [ ] Chat screen open when expiry hits 0 → Live update UI (disable input)

---

##### Screen 20: Interrupt Chat Confirmation

**Purpose**: Confirm chat interruption and explain 14-day cooldown
**Trigger**: User taps "Interrupt Chat" in chat options menu

**UI Elements**:
- Icon: Warning triangle
- Title: "Interrupt Chat?"
- Message: "Ending this chat will prevent both of you from re-matching for 14 days. Are you sure?"
- Info:
  - Cooldown period: 14 days
  - Re-match available after: [Date]
- Buttons:
  - "Cancel" (secondary)
  - "Interrupt Chat" (destructive, red)

**User Flow**:
```
[Chat Screen]
  → Tap 3-dot menu → "Interrupt Chat"
  → [Interrupt Confirmation Modal]
  → Read warning
     ├─ Tap "Cancel" → Close modal, return to chat
     └─ Tap "Interrupt Chat"
        → API: PATCH /matches/42/interrupt
        → Success:
           - Match status = "interrupted"
           - cooldownUntil = now + 14 days
           - Chat input disabled
           - Show banner: "Chat interrupted. You can re-match after [Date]."
           - Return to [My Matches - History Tab]
```

**Cooldown Enforcement**:
- If user tries to send interest to same person within 14 days:
  - API returns error: `cooldown_active`
  - Show modal: "You cannot match with [Name] until [Date]. Cooldown period: X days remaining."

**Mock Data Required**:
```
Mock Interrupted Match:
{
  "id": 42,
  "requesterId": 8,
  "targetId": 7,
  "status": "interrupted",
  "interruptedAt": "2026-04-18T12:00:00Z",
  "interruptedBy": 8,
  "cooldownUntil": "2026-05-02T12:00:00Z",
  "chatExpiresAt": "2026-05-18T10:00:00Z"
}

Cooldown Remaining Calculation:
- cooldownUntil: May 2, 2026
- Current date: April 18, 2026
- Days remaining: 14
```

**Edge Cases**:
- [ ] User interrupts chat → Partner receives notification → "Chat interrupted by [Name]"
- [ ] Both users try to interrupt simultaneously → First request wins
- [ ] User tries to re-match during cooldown → Error modal with countdown
- [ ] Cooldown expires → Users can re-match normally

---

#### Mock Data Set 5: Matching & Chat

**Candidate Profiles (20 diverse users for browsing)**:

```
1. Amina Diallo (Female, 26, Niamey, Niger)
   - Profession: Teacher
   - Marital Status: Single
   - Children: 0
   - Ethnicity: Hausa
   - Search: Ages 25-35, Single/Divorced
   - Criteria: "Looking for someone family-oriented and kind"

2. Fatima Traoré (Female, 29, Bamako, Mali)
   - Profession: Nurse
   - Marital Status: Divorced
   - Children: 1
   - Ethnicity: Bambara
   - Search: Ages 28-40, Any
   - Criteria: "Seeking a responsible partner who loves children"

3. Aisha Mahamadou (Female, 24, Niamey, Niger)
   - Profession: Accountant
   - Marital Status: Single
   - Children: 0
   - Ethnicity: Tuareg
   - Search: Ages 24-32, Single
   - Criteria: "Interested in someone educated and respectful"

4. Ibrahim Cissé (Male, 30, Ouagadougou, Burkina Faso)
   - Profession: Engineer
   - Marital Status: Single
   - Children: 0
   - Ethnicity: Fulani (Peulh)
   - Search: Ages 25-32, Single
   - Criteria: "Looking for an intelligent, caring partner"

5. Omar Sanogo (Male, 35, Bamako, Mali)
   - Profession: Doctor
   - Marital Status: Widowed
   - Children: 2
   - Ethnicity: Songhay
   - Search: Ages 28-38, Any
   - Criteria: "Seeking a loving mother figure for my children"

... (15 more candidates with diverse demographics)

Mock Candidate Distribution:
- Gender: 10 male, 10 female
- Age range: 24-45
- Countries: Mali (8), Niger (6), Burkina Faso (4), Chad (1), Senegal (1)
- Marital Status: Single (12), Divorced (5), Widowed (3)
- Ethnicities: Hausa (6), Peulh (4), Bambara (3), Tuareg (2), Wolof (2), Songhay (2), Other (1)
```

**Match Scenarios**:

```
1. Henry → Grace (Accepted, Active Chat)
   - Status: accepted
   - Credits deducted: 1 (both users)
   - Chat opened: April 15, 2026
   - Chat expires: May 15, 2026 (28 days remaining)
   - Messages: 12 messages exchanged

2. Henry → Amina (Pending)
   - Status: pending
   - Henry sent interest on April 18
   - Amina hasn't responded yet
   - Shows in Henry's "Pending" and Amina's "Requests"

3. Grace → Ibrahim (Rejected)
   - Status: rejected
   - Grace sent interest on April 10
   - Ibrahim rejected on April 11
   - No credits deducted
   - Shows in "History" tab for both

4. Iris → Omar (Accepted, Interrupted)
   - Status: interrupted
   - Chat opened: April 1, 2026
   - Interrupted by: Iris on April 10, 2026
   - Cooldown until: April 24, 2026 (6 days remaining)
   - Cannot re-match until cooldown expires

5. Jack → Fatima (Accepted, Expiring Soon)
   - Status: accepted
   - Chat opened: March 22, 2026
   - Chat expires: April 21, 2026 (3 days remaining, RED badge)
   - Messages: 45 messages
```

**Mock API Responses**:

```json
// GET /matches/candidates?page=1&limit=10
{
  "candidates": [
    {
      "id": 15,
      "firstName": "Amina",
      "lastName": "Diallo",
      "age": 26,
      "gender": "female",
      "city": "Niamey",
      "country": "Niger",
      "profession": "Teacher",
      "maritalStatus": "single",
      "photo": "https://mock-cdn.com/amina.jpg",
      "isValidated": true
    },
    // ... 9 more candidates
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 127,
    "hasNext": true
  }
}

// POST /matches/15/interest (Success)
{
  "success": true,
  "match": {
    "id": 43,
    "requesterId": 8,
    "targetId": 15,
    "status": "pending",
    "createdAt": "2026-04-18T14:00:00Z"
  },
  "message": "Interest sent to Amina. You'll be notified if she accepts."
}

// POST /matches/15/interest (Already exists)
{
  "success": false,
  "error": "match_already_exists",
  "message": "You already sent interest to this user."
}

// POST /matches/15/interest (No credits)
{
  "success": false,
  "error": "insufficient_credits",
  "message": "You have no credits remaining.",
  "subscription": {
    "matchCreditsRemaining": 0
  }
}

// PATCH /matches/42/accept (Success)
{
  "success": true,
  "match": {
    "id": 42,
    "status": "accepted",
    "chatOpenedAt": "2026-04-18T14:05:00Z",
    "chatExpiresAt": "2026-05-18T14:05:00Z"
  },
  "subscription": {
    "matchCreditsRemaining": 2
  },
  "message": "Match accepted! You can now chat for 30 days."
}

// PATCH /matches/42/reject (Success)
{
  "success": true,
  "match": {
    "id": 42,
    "status": "rejected"
  },
  "message": "Match request rejected."
}

// PATCH /matches/42/interrupt (Success)
{
  "success": true,
  "match": {
    "id": 42,
    "status": "interrupted",
    "interruptedAt": "2026-04-18T15:00:00Z",
    "interruptedBy": 8,
    "cooldownUntil": "2026-05-02T15:00:00Z"
  },
  "message": "Chat interrupted. You can re-match after May 2, 2026."
}

// GET /matches/me (My Matches - Active)
{
  "matches": [
    {
      "id": 42,
      "status": "accepted",
      "matchedUser": {
        "id": 7,
        "firstName": "Grace",
        "photo": "https://mock-cdn.com/grace.jpg"
      },
      "chatOpenedAt": "2026-04-15T10:00:00Z",
      "chatExpiresAt": "2026-05-15T10:00:00Z",
      "daysRemaining": 28
    }
  ]
}

// GET /matches/requests (Incoming Requests)
{
  "requests": [
    {
      "id": 43,
      "status": "pending",
      "requester": {
        "id": 4,
        "firstName": "Ibrahim",
        "age": 30,
        "city": "Ouagadougou",
        "profession": "Engineer",
        "photo": "https://mock-cdn.com/ibrahim.jpg"
      },
      "createdAt": "2026-04-18T09:00:00Z"
    }
  ]
}
```

---

#### Phase 4 Testing Scenarios

**Browse Candidates Tests** (12 scenarios):
- [ ] Dashboard loads 10 candidates → Success
- [ ] Infinite scroll loads next page → Success
- [ ] Pull-to-refresh reloads candidates → Success
- [ ] Swipe right on candidate → Interest sent → Success
- [ ] Swipe left on candidate → Skip to next → Success
- [ ] Tap "View Profile" → Candidate detail screen → Success
- [ ] No candidates available → Empty state shown → Success
- [ ] Only opposite gender shown → Success (male sees females, female sees males)
- [ ] Candidate already matched → Not shown in list → Success
- [ ] User at 0 credits → Cannot send interest → Error modal → Success
- [ ] Candidate deactivated account → Removed from list → Success
- [ ] Candidate photo fails to load → Placeholder shown → Success

**Send Interest Tests** (8 scenarios):
- [ ] Send interest with 3 credits → Success → Credits become 2/3
- [ ] Send interest with 1 credit → Warning modal → Confirm → Success → Credits become 0/3
- [ ] Send interest with 0 credits → Error modal → Cannot send
- [ ] Send interest to already matched user → Error "Already matched"
- [ ] Send interest during network timeout → Retry button → Success
- [ ] Send interest during cooldown (interrupted match) → Error modal with countdown
- [ ] Send interest to same-gender user → Error (should never happen, backend filters)
- [ ] Send interest to deleted user → Error "Profile no longer available"

**Match Request Tests** (6 scenarios):
- [ ] Receive match request → Push notification → Badge count increases
- [ ] Tap notification → Opens Match Requests screen → Success
- [ ] Accept match request → Credits deducted → Chat unlocked → Success
- [ ] Reject match request → No credits deducted → Request removed → Success
- [ ] View requester's profile before accepting → Success
- [ ] Accept request with 0 credits → Error (should have credits to accept)

**Chat Tests** (15 scenarios):
- [ ] Send text message → Appears in chat → Success
- [ ] Receive message → Push notification → Chat updates → Success
- [ ] Send image → Upload → Thumbnail shown → Tap → Full screen → Success
- [ ] Image upload failure → Retry button → Success
- [ ] Chat countdown updates in real-time → Success
- [ ] Chat expires (30 days) → Input disabled → Read-only mode → Success
- [ ] Chat expiring soon (3 days) → Red badge shown → Success
- [ ] Interrupt chat → Confirmation modal → Confirm → Cooldown set → Success
- [ ] View matched user's profile from chat → Success
- [ ] Network timeout during message send → Retry → Success
- [ ] Empty chat (no messages) → Show "Start the conversation!" → Success
- [ ] Scroll to load older messages → Success (pagination)
- [ ] Return to chat after leaving → Messages preserved → Success
- [ ] Chat interrupted by partner → Notification received → Input disabled → Success
- [ ] Cooldown active → Cannot re-match → Error modal with countdown → Success

---

### Phase 5: Security Features (R2)

**Backend Status**: ⏳ Planned (R2 Sprint 5)
**Estimated Effort**: 3-5 days
**Priority**: High (privacy & compliance)

#### Features to Build

1. **Screen Capture Blocking** (on sensitive screens)
2. **API Response Header Detection** (`X-Sensitive-Data`)
3. **Screenshot Warning** (if blocking fails)

#### Implementation Notes

**Screen Capture Blocking**:
- **Platform-specific**:
  - **Android**: `FLAG_SECURE` on Activity/Window
  - **iOS**: `UITextField.isSecureTextEntry` workaround OR hide content when app enters background
- **Screens to block**:
  - Candidate Profile Detail (when viewing other users)
  - Chat Screen (all messages)
  - Identity Document Upload (preview)
  - Payment Receipt Upload (preview)
  - My Profile (if contains sensitive health info)

**API Header Detection**:
- Backend sends `X-Sensitive-Data: true` header on:
  - `GET /profile/:id` (other user's profile)
  - `GET /users/:id`
  - `GET /chats/:id/messages` (future)
- Mobile app reads this header and enables screen capture blocking for that screen

**Screenshot Warning** (Fallback):
- If blocking is not supported (some Android ROMs disable FLAG_SECURE):
  - Detect screenshot event (Android: `OnUserLeaveHintListener`, iOS: `UIApplicationUserDidTakeScreenshotNotification`)
  - Show warning dialog: "Screenshots are not allowed on this screen. Your account may be suspended for repeated violations."
  - Log screenshot event (send to backend for admin review)

**User Flow**:
```
[Dashboard]
  → Tap candidate → [Candidate Detail Screen]
  → API call: GET /profile/15
  → Response header: X-Sensitive-Data: true
  → App enables screen capture blocking on this screen
  → User tries to take screenshot
     ├─ Android: Screen content blanks out in screenshot (FLAG_SECURE works)
     ├─ iOS: Screenshot shows placeholder "Content Protected" overlay
     └─ Fallback (if blocking fails): Screenshot succeeds → Warning dialog shown
```

**Mock Data**: Not applicable (OS-level feature, no API data needed)

---

#### Screen 21: Screenshot Warning Dialog

**Purpose**: Warn users about prohibited screenshots
**Trigger**: Screenshot detected on sensitive screen (if blocking fails)

**UI Elements**:
- Icon: Shield with exclamation mark
- Title: "Screenshot Detected"
- Message: "Screenshots are not allowed on this screen to protect user privacy. Repeated violations may result in account suspension."
- Checkbox: "I understand"
- Button: "OK"

**User Flow**:
```
[Chat Screen - User takes screenshot]
  → Screenshot event detected (OS notification)
  → [Screenshot Warning Dialog] shown
  → User reads warning
  → Tap "OK" → Close dialog
  → Log event: POST /users/me/security-events (screenshot_taken)
  → Backend tracks violations
  → If violations > 3 → Admin review → Possible suspension
```

**Mock Data**:
```
Mock Security Event Log:
{
  "userId": 8,
  "eventType": "screenshot_taken",
  "screen": "chat",
  "timestamp": "2026-04-18T15:30:00Z",
  "deviceInfo": "iPhone 14 Pro, iOS 17.2"
}
```

---

#### Phase 5 Testing Scenarios

**Screen Capture Blocking Tests** (10 scenarios):
- [ ] Candidate detail screen → Attempt screenshot → Blocked (blank screenshot) → Success
- [ ] Chat screen → Attempt screenshot → Blocked → Success
- [ ] Identity upload preview → Attempt screenshot → Blocked → Success
- [ ] Payment receipt preview → Attempt screenshot → Blocked → Success
- [ ] Dashboard (candidate list) → Attempt screenshot → Allowed (not sensitive) → Success
- [ ] My profile screen → Attempt screenshot → Blocked (if contains health info) → Success
- [ ] API header `X-Sensitive-Data: true` → Blocking enabled → Success
- [ ] API header absent → No blocking → Success
- [ ] Android FLAG_SECURE → Screenshot shows black screen → Success
- [ ] iOS background mode → Screen content hidden → Success

**Screenshot Warning Tests** (5 scenarios):
- [ ] Screenshot on sensitive screen (fallback) → Warning dialog shown → Success
- [ ] User taps "OK" → Dialog dismissed → Event logged → Success
- [ ] 3 screenshots taken → Account flagged for admin review → Success
- [ ] Admin reviews violations → Warning email sent → Success
- [ ] 5+ violations → Account suspended → Success

---

## Mock Data Strategy

### Centralized Mock Data Repository

**Structure**:
```
/app/mock-data/
├── users.json (12 test users with all states)
├── candidates.json (20 browsable profiles)
├── matches.json (5 match scenarios: pending, accepted, interrupted, expired)
├── chats.json (mock message threads)
├── payments.json (payment states: pending, validated, rejected)
├── notifications.json (push notification payloads)
└── api-responses.json (mock API responses for all endpoints)
```

### Mock Data Generation Tool (Future)

**Recommended**: Build a simple script to generate realistic mock data:
- **Faker.js** (or equivalent): Generate names, ages, professions, cities
- **Sahel Demographics**: Use realistic names (Hausa, Fulani, Bambara, etc.)
- **Profile Photos**: Use placeholder services (e.g., `https://i.pravatar.cc/300?img=X`)
- **Randomization**: Randomize marital status, children count, blood type, etc.

### Mock API Service Layer

**Approach**: Create a mock API service that mimics backend responses without hitting real servers.

**Features**:
- **Configurable delays**: Simulate network latency (e.g., 500ms-2s random delay)
- **Error simulation**: Randomly fail 10% of requests to test error handling
- **State persistence**: Save mock data to local storage (simulate CRUD operations)
- **Pagination**: Mock paginated responses (candidates, matches)
- **Polling**: Mock payment status changes after X polling cycles

**Example Mock Service**:
```typescript
class MockAuthService {
  async login(email, password) {
    await simulateDelay(1000); // 1s network delay
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user || user.password !== password) {
      throw new Error("Invalid credentials");
    }
    if (user.requiresOTP) {
      return { otpRequired: true, destination: email };
    }
    return { accessToken: "mock-jwt-token", user };
  }
}
```

**Switch to Real API**: When backend is ready, replace `MockAuthService` with `ApiAuthService` (same interface, real HTTP calls).

---

## Testing & Quality Assurance

### Manual Testing Checklist

**Authentication** (Phase 0):
- [ ] Login with valid credentials → Success
- [ ] Login with invalid credentials → Error
- [ ] Login requiring OTP → OTP screen → Verify → Success
- [ ] Registration → OTP → Profile completion → Payment → Validated
- [ ] Forgot password → OTP → Reset → Success

**Profile** (Phase 0):
- [ ] Profile completion (6 steps) → All fields saved → Success
- [ ] Resume incomplete profile → Correct step loaded → Success
- [ ] Upload identity document → Preview → Submit → Success
- [ ] Edit profile after completion → Updates saved → Success

**Payment** (Phase 0):
- [ ] Manual payment → Upload receipt → Pending → Validated → 3 credits granted
- [ ] Wave payment → Deposit number → Mark paid → Pending → Validated
- [ ] Payment rejected → Reupload → Success
- [ ] Waiting screen auto-poll → Status updates → Success

**Subscription** (Phase 1):
- [ ] Profile shows correct credits (3/3, 2/3, 1/3, 0/3) → Success
- [ ] Credits badge updates in real-time → Success
- [ ] Send interest with 1 credit → Warning modal → Success
- [ ] Send interest with 0 credits → Error modal → Success

**Waitlist** (Phase 2):
- [ ] Female user waitlisted (77% female ratio) → Waitlist screen → Success
- [ ] Male user not waitlisted (23% male ratio) → Dashboard → Success
- [ ] Waitlist auto-unblock → Success animation → Dashboard → Success
- [ ] Admin manually unblocks → Notification → Dashboard → Success

**Notifications** (Phase 3):
- [ ] Match request → Push notification → Tap → Match Requests screen
- [ ] Match accepted → Push notification → Tap → Chat screen
- [ ] Payment validated → Push notification → Tap → Dashboard
- [ ] Terms update → Email + banner → Accept → Banner dismissed

**Matching** (Phase 4):
- [ ] Browse candidates → Swipe right → Interest sent → Success
- [ ] View candidate profile → Full details shown → Success
- [ ] Receive match request → Accept → Chat unlocked → Success
- [ ] Reject match request → Request removed → Success
- [ ] Send message in chat → Appears → Success
- [ ] Chat expires → Input disabled → Read-only → Success
- [ ] Interrupt chat → Cooldown set → Success
- [ ] Re-match during cooldown → Error modal → Success

**Security** (Phase 5):
- [ ] Screenshot on chat screen → Blocked → Success
- [ ] Screenshot on candidate profile → Blocked → Success
- [ ] Screenshot on dashboard → Allowed → Success
- [ ] Screenshot warning (fallback) → Dialog shown → Success

---

### Automated Testing Strategy

**Unit Tests**:
- Mock service logic (login, registration, payment status polling)
- Form validation (email format, phone format, age min/max)
- Credit calculation (deduction, remaining)
- Countdown logic (chat expiry, cooldown)

**Widget/Component Tests**:
- Candidate card rendering (photo, name, age, city)
- Match request card (accept/reject buttons)
- Chat message bubble (text, image, timestamp)
- Credits badge (color changes based on count)

**Integration Tests**:
- Full user journey: Register → OTP → Profile → Payment → Validated → Dashboard
- Match flow: Send interest → Accept → Chat → Interrupt → Cooldown
- Payment flow: Upload receipt → Poll → Validated → Credits granted

**E2E Tests** (Future):
- Use Appium or Detox
- Test critical paths: Login → Browse → Match → Chat
- Test error recovery: Network failure → Retry → Success

---

## Appendix: Screen Index

| # | Screen Name | Phase | Priority |
|---|-------------|-------|----------|
| 1 | Splash Screen | 0 | Critical |
| 2 | Login Screen | 0 | Critical |
| 3 | Registration Screen | 0 | Critical |
| 4 | OTP Verification | 0 | Critical |
| 5 | Profile Completion (6 steps) | 0 | Critical |
| 6 | Payment Submission | 0 | Critical |
| 7 | Waiting for Validation | 0 | Critical |
| 8 | Enhanced Profile (Credits) | 1 | Medium |
| 9 | Dashboard (Credits Widget) | 1 | Medium |
| 10 | Credit Warning Modal | 1 | Medium |
| 11 | Waitlist Screen | 2 | High |
| 12 | Gender Balance Notification | 2 | High |
| 13 | Admin Waitlist Management | 2 | Low |
| 14 | Notification Settings | 3 | Medium |
| 15 | Dashboard (Browse Candidates) | 4 | Critical |
| 16 | Candidate Profile Detail | 4 | Critical |
| 17 | Match Requests | 4 | Critical |
| 18 | My Matches (Active) | 4 | Critical |
| 19 | Chat Screen | 4 | Critical |
| 20 | Interrupt Chat Confirmation | 4 | High |
| 21 | Screenshot Warning Dialog | 5 | High |

---

## Summary

This mobile app development plan provides a complete roadmap for building **Union Sahelienne** using a **mock-first approach**. The plan is structured into **6 phases** synchronized with backend R2 development, covering:

✅ **21 Screens** with detailed user flows and edge cases
✅ **5 Mock Data Sets** (12 user personas, 20 candidate profiles, 5 match scenarios)
✅ **80+ Testing Scenarios** for comprehensive QA
✅ **Mock API Strategy** for parallel frontend/backend development

### Next Steps

1. **Design Phase**: Create UI mockups for Screens 1-7 (Phase 0)
2. **Mock Data Preparation**: Generate 12 test users + 20 candidate profiles
3. **Development Kickoff**: Build Phase 0 (Authentication & Onboarding) first
4. **Backend Coordination**: Align R2 Sprint delivery with Phases 1-5

### Key Success Metrics

- **Phase 0 Completion**: Users can register → validate payment → access Dashboard
- **Phase 4 Completion**: Users can browse → match → chat
- **All 80+ Test Scenarios Pass**: Robust, production-ready app

---

**Document Maintained By**: AI Planning Agent
**For Questions**: Refer to backend team for API clarifications
**Version History**: 1.0 (Initial Release - 2026-04-18)
