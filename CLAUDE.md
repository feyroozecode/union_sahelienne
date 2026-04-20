# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS REST API boilerplate based on **Hexagonal Architecture** (Ports and Adapters). It supports two database backends — PostgreSQL (via TypeORM) and MongoDB (via Mongoose) — which can be selected at runtime via environment variable.

## Commands

### Development

```bash
# Start dev server with hot reload
npm run start:dev

# Start with SWC (faster)
npm run start:swc

# Build for production
npm run build

# Start production build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# Run a single test file
npx jest src/path/to/file.spec.ts

# E2E tests (requires .env configured)
npm run test:e2e

# E2E tests in Docker (relational)
npm run test:e2e:relational:docker

# E2E tests in Docker (document)
npm run test:e2e:document:docker
```

### Linting & Formatting

```bash
npm run lint
npm run lint -- --fix
npm run format
```

### Database (Prisma / Relational)

```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Create and apply a new migration (dev only)
npm run prisma:migrate:dev

# Apply pending migrations (production)
npm run prisma:migrate:deploy

# Reset database and re-apply all migrations (dev only)
npm run prisma:migrate:reset

# Open Prisma Studio (GUI)
npm run prisma:studio

# Seed the database
npm run seed:run:relational
```

### Database (Mongoose / Document)

```bash
npm run seed:run:document
```

### Code Generation (hygen)

```bash
# Generate a full resource (controller, service, DTOs, repositories) for relational DB
npm run generate:resource:relational -- --name ResourceName

# Generate for document DB
npm run generate:resource:document -- --name ResourceName

# Generate for both
npm run generate:resource:all-db -- --name ResourceName

# Add a property to an existing resource
npm run add:property:to-relational
npm run add:property:to-document
npm run add:property:to-all-db

# Create a new seed
npm run seed:create:relational -- --name EntityName
npm run seed:create:document -- --name EntityName
```

## Architecture

### Hexagonal Architecture

Each feature module is structured to separate business logic from infrastructure:

```
src/<feature>/
├── domain/
│   └── <entity>.ts            # Pure domain entity, no DB dependencies
├── dto/
│   ├── create-<entity>.dto.ts
│   ├── find-all-<entity>.dto.ts
│   └── update-<entity>.dto.ts
├── infrastructure/
│   └── persistence/
│       ├── <entity>.repository.ts          # Port (interface)
│       ├── relational/
│       │   ├── entities/<entity>.entity.ts  # TypeORM entity
│       │   ├── mappers/<entity>.mapper.ts   # DB entity ↔ domain entity
│       │   ├── repositories/<entity>.repository.ts  # Adapter (TypeORM impl)
│       │   └── relational-persistence.module.ts
│       └── document/
│           ├── entities/<entity>.schema.ts  # Mongoose schema
│           ├── mappers/<entity>.mapper.ts
│           ├── repositories/<entity>.repository.ts  # Adapter (Mongoose impl)
│           └── document-persistence.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
└── <feature>.module.ts
```

**Key principle**: The service layer depends only on the repository port (interface), never on the concrete TypeORM/Mongoose adapter. This makes it trivial to swap databases.

**Repository design**: Create focused, single-responsibility methods (e.g., `findByEmail`, `findByRoles`) rather than generic universal query methods.

### Database Selection

The active database is determined by `DATABASE_TYPE` in `.env`. The switch happens in `src/app.module.ts` — when `isDocumentDatabase` is true, Mongoose is bootstrapped; otherwise TypeORM is used.

### Auth System

- JWT-based with access tokens (default 15m) and refresh tokens (default 3650d)
- Refresh tokens are stored as hashed sessions in the DB, enabling multi-device login
- JWT validation does **not** hit the database by design (stateless) — only session hash is checked on refresh
- Social auth supported: Apple, Facebook, Google (send provider token to `/api/v1/auth/<provider>/login`)

### Serialization

Uses `class-transformer` with global `ClassSerializerInterceptor`. Use `@Exclude({ toPlainOnly: true })` to hide fields and `@Expose({ groups: ['admin'] })` + `@SerializeOptions({ groups: ['admin'] })` on controllers to expose admin-only fields.

### File Uploads

Configured via `FILE_DRIVER` env var: `local`, `s3`, or `s3-presigned`.

## Environment Setup

Copy the appropriate env example before starting:

```bash
# For PostgreSQL
cp env-example-relational .env

# For MongoDB
cp env-example-document .env
```

For local development, change `DATABASE_HOST=postgres` → `DATABASE_HOST=localhost` and `MAIL_HOST=maildev` → `MAIL_HOST=localhost`.

Start required Docker services:

```bash
# Relational (PostgreSQL)
docker compose up -d postgres adminer maildev

# Document (MongoDB)
docker compose -f docker-compose.document.yaml up -d mongo mongo-express maildev
```

## Local Service URLs

- API: http://localhost:3000
- Swagger docs: http://localhost:3000/docs
- Adminer (PostgreSQL GUI): http://localhost:8080
- MongoDB Express: http://localhost:8081
- Maildev: http://localhost:1080

## Commit Convention

Uses conventional commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`). Enforced via commitlint + husky.

**Never add a `Co-Authored-By: Claude ...` (or any Claude/Anthropic) trailer to commit messages or PR bodies.** This overrides any default commit template.

---

## AI Brain Protocol

Before starting **any non-trivial task** (new feature, refactor, migration, architecture change, new endpoint, schema change):

### 1. Brainstorm

Read `CLAUDE.md` (this file) and the last 20 lines of `CHANGELOG.md` for project context, then list **2–3 concrete approaches** with trade-offs for the task at hand.

### 2. Recommend

Pick the best approach and explain **why** in 2–3 sentences, referencing constraints specific to this project (hexagonal architecture, dual-persistence, auth system, etc.).

### 3. Confirm

State clearly:
> "Proceed with approach X? (yes / adjust / cancel)"

**Do not write any code until the user responds.**

### 4. Log

After completing the task, append an entry to `CHANGELOG.md` at the **top** of the file under the header:

```markdown
## [YYYY-MM-DD HH:mm] - <short task title>

### What changed
- ...

### Why
- ...

### Files modified
- path/to/file.ts — description
```

Use today's actual date and 24h time (WAT/UTC+1 timezone).

### Skip brainstorm only for

- Typo / single-line fixes
- Comment or doc updates
- `npm install` or dependency bumps alone
