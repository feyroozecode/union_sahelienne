# Union Sahélienne — Site public (web)

Modern, production-ready public-facing web app for the Union Sahélienne matrimonial
platform. Next.js 16 (App Router) + React 19 + TypeScript. French (`fr`).

Aesthetic: **"Sahel Editorial"** — warm sand grounds, deep Sahel indigo, terracotta
clay and millet-gold accents, Fraunces serif display + Hanken Grotesk, grain texture
and woven diamond motifs. Deliberately distinct from the admin dashboard in `../frontend`.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing — hero, valeurs, parcours, offres (pricing), CTA |
| `/inscription` | Multi-step signup → `POST /auth/email/register` |
| `/otp` | OTP verification (shows the beta code on screen) → `POST /auth/otp/verify` |
| `/connexion` | Login → `POST /auth/email/login` |
| `/espace` | Authenticated landing (token-gated) |

## Backend wiring

API base comes from `NEXT_PUBLIC_API_BASE_URL`:

- `.env.development` → `http://localhost:3020/api/v1`
- `.env.production` → `https://api-unionsahel.alfajarsoft.com/api/v1`

The signup flow matches the closed-beta backend: `register` returns
`{ requiresOtp, channel, target, expiresAt, code }`; the `code` is displayed on the
OTP screen (no email/SMS delivery). `verifyOtp` activates the account and returns
tokens, persisted in `localStorage` (`lib/session.ts`).

## Develop

```bash
npm install
npm run dev      # http://localhost:3030
```

## Build

```bash
npm run build && npm run start
```
