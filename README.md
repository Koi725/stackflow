# Stackflow

A small, beautiful, open-source Kanban board. One board, four columns
(**To Do → In Progress → Blocked → Done**), cards you drag between them.
Nothing else.

Stackflow is intentionally tiny: it fits on one screen, reads clearly, and ships
with real authentication, role-based access control, and a hardened avatar
upload — a complete, self-hostable app rather than a toy.

## Features

- **Drag-and-drop board** — four fixed columns, cards with title, description,
  label (bug / feature / docs) and priority (high / med / low).
- **Roles & RBAC** — `admin` sees and manages everything; `member` sees and edits
  only their own cards. Enforced server-side from the session, not the client.
- **Assignment** — admins can assign a card's owner; members always own their own.
- **"Needs help" flag** — a member can raise a hand on their own card; admins see it.
- **Profiles** — each user edits their own name, age and avatar (role is read-only).
- **Hardened avatar upload** — magic-byte type checks, no SVG, UUID filenames,
  size cap, `nosniff` serving. No SSRF/IDOR.
- **Pluggable auth** — local bcrypt users by default; optional external identity
  provider via env for private deployments.
- **Guided tour** — a short, dismissible walkthrough for non-technical users.

## Screenshots

> _Add screenshots here (e.g. `docs/board.png`, `docs/login.png`)._

<!-- ![Board](docs/board.png) -->
<!-- ![Login](docs/login.png) -->

## Tech stack

- **Next.js 14** (App Router) — UI **and** API route handlers in one project
- **TypeScript**, **Tailwind CSS**
- **Prisma** ORM + **PostgreSQL**
- **dnd-kit** (drag and drop) + **Framer Motion** (motion)
- Auth: signed **JWT** session in an httpOnly cookie (`jose`), **bcrypt** password hashing

The whole app lives in [`frontend/`](./frontend) — the "backend" is the set of
Next.js API routes under `frontend/app/api/*`. See
[`frontend/README.md`](./frontend/README.md) for the component map and design tokens.

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database (Docker is easiest — see below)

### 1. Clone and install

```bash
git clone https://github.com/Koi725/stackflow.git
cd stackflow/frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then edit `.env`. At minimum set a strong `SESSION_SECRET`:

```bash
openssl rand -base64 32
```

Every variable is documented inline in [`.env.example`](./frontend/.env.example).

### 3. Start PostgreSQL (Docker)

```bash
docker run -d --name stackflow-pg \
  -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=stackflow \
  -p 5432:5432 postgres:16-alpine
```

This matches the default `DATABASE_URL` in `.env.example`. (Any Postgres works —
just point `DATABASE_URL` at it.)

### 4. Migrate and seed

```bash
npx prisma migrate deploy   # apply the schema
npm run db:seed             # optional: sample users + cards
```

The seed reads `SEED_ADMIN_PASSWORD` / `SEED_MEMBER_PASSWORD` from your `.env`
(no defaults) and creates a few accounts under `@stackflow.dev`.

### 5. Run

```bash
npm run dev     # http://localhost:3000
```

Sign in with one of the seeded accounts (e.g. `alex@stackflow.dev` = admin,
`sam@stackflow.dev` = member) using the passwords you set.

## Authentication modes

Auth is pluggable via the `AUTH_MODE` environment variable:

- **`local`** (default) — credentials are checked against Stackflow's own `User`
  table with bcrypt. This is the normal, public path; nothing external needed.
- **external** (optional, private deployments) — set `AUTH_MODE` to the external
  provider and point `DARSMAN_AUTH_URL` at your identity platform's login endpoint.
  Credentials are verified upstream; Stackflow mirrors the returned profile and
  stores **no** password locally. The URL comes only from env — never hardcoded.

Either way, the session is always minted from and reloaded from Stackflow's own
database, so the client can never assert its own identity or role.

## Security

- Sessions are signed JWTs in an **httpOnly**, `sameSite=lax` cookie (`secure` in
  production); identity/role are always reloaded from the DB per request.
- All writes are validated server-side (400 on bad input) and authorized against
  the session user (403 otherwise) — never against client-supplied id/role.
- Avatar uploads are verified by magic bytes (SVG rejected), stored under UUID
  filenames, size-capped, and served with `X-Content-Type-Options: nosniff`.
- App-wide security headers (CSP, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `X-Content-Type-Options`) are set in `frontend/next.config.mjs`.

Found a vulnerability? Please open a private report rather than a public issue.

## Contributing

Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
