# Union Sahélienne API

**Union Sahélienne** — plateforme de rencontre et de mariage pour la région du Sahel (Mali, Burkina Faso, Niger). Backend NestJS avec architecture hexagonale, admin panel Next.js, et application mobile Flutter.

## Architecture

```
src/
├── auth/              # JWT + OTP auth, multi-social (Apple, FB, Google)
├── users/             # Gestion utilisateurs
├── profiles/          # Profils, vérification d'identité, critères de recherche
├── matches/           # Matchmaking (candidats, intérêt, accept/rejet, cooldown)
├── messages/          # Chat text + images entre matchés
├── subscriptions/     # 4 paliers (LITE → ANNUEL), crédits, expiration
├── payments/          # Reçus Wave + validation admin
├── reports/           # Signalement (suspect/harassment/arnaque)
├── waitlist/          # File d'attente — quota 75/25 par genre
├── admin/             # Dashboard, gestion users/payments/profiles/matches
├── otp/               # Génération/vérification OTP (configurable gateways)
├── account-validation/# Validation de compte
├── files/             # Upload local / S3
├── session/           # Refresh tokens multi-device
└── i18n/              # Internationalization
```

## Stack

| Composant | Technologie |
|-----------|-------------|
| **API** | NestJS 11, Prisma 7 (PostgreSQL) |
| **Admin** | Next.js 16, React 19, Recharts |
| **Mobile** | Flutter |
| **Auth** | JWT (access + refresh), OTP email/phone |
| **Paiements** | Wave mobile money + reçus manuels |
| **Uploads** | Local ou S3 |

## Prérequis

- Node.js 20+
- PostgreSQL 15+
- Docker (optionnel — maildev, postgres)

## Installation

```bash
cp env-example-relational .env
# Éditer .env (DATABASE_HOST=localhost, etc.)
npm install
npx prisma migrate deploy
npm run seed:run:relational
npm run start:dev
```

## Services

| Service | URL |
|---------|-----|
| API | http://localhost:3020 |
| Swagger | http://localhost:3020/docs |
| Admin | http://localhost:3022 |
| Maildev | http://localhost:1080 |
| Adminer | http://localhost:8080 |

## Linting & Tests

```bash
npm run lint
npm run test
npm run test:e2e
```

## Admin Frontend

L'admin panel Next.js est dans [`frontend/`](./frontend/).

```bash
cd frontend
npm install
npm run dev        # → http://localhost:3022
```

## Application Mobile

Le code source Flutter est dans un dépôt séparé : `/Users/a/dev/mobile/all_apps/union_sahelien`.

## Déploiement

| Environnement | URL |
|---------------|-----|
| API | https://api-unionsahel.alfajarsoft.com |
| Admin | https://admin-unionsahel.alfajarsoft.com |

## Fonctionnalités clés

- **Inscription** par email/téléphone + OTP
- **Vérification d'identité** (pièce jointe, validation admin)
- **4 paliers d'abonnement** : LITE (5K FCFA), ESSENTIEL (10K), TRIMESTRIEL (25K), ANNUEL (75K)
- **Crédits de matching** par abonnement
- **Quota 75/25** — la file d'attente garantit l'équilibre des genres
- **Chat temporisé** entre matchés avec cooldown
- **Signalement** des utilisateurs
