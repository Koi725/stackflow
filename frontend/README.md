# Stackflow — frontend & API

This is the whole Stackflow app: a **Next.js 14 (App Router)** project that serves
both the UI and the API (route handlers under `app/api/*`), backed by **Prisma +
PostgreSQL**. For setup, environment and run instructions see the
[root README](../README.md); this file is the developer map — architecture, file
layout, and the design tokens.

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Prisma ORM · PostgreSQL
- dnd-kit (drag & drop) · Framer Motion (motion) · lucide-react (icons)
- Auth: `jose` (JWT session cookie) · `bcryptjs` (password hashing)

## Architecture

- **Auth** is a signed JWT in an httpOnly cookie. The token holds only the user id;
  the session user (and role) is always reloaded from the database per request
  (`lib/session.ts`), so the client can never assert its own identity.
- **RBAC** is enforced server-side in every API route via `lib/rbac.ts`, evaluated
  against that session user. `lib/permissions.ts` is a client-side mirror used only
  to show/hide controls — it is never the source of truth.
- **Validation**: every write is validated in `lib/validate.ts` (400 on bad input),
  so routes never crash on malformed bodies.
- **Pluggable auth**: `lib/auth/` selects a provider from `AUTH_MODE` (`local` bcrypt
  by default; an optional external provider reads its URL from env only).

## File map

```
app/
  layout.tsx                Root layout: display font wiring, <body> resets
  globals.css               Design tokens (CSS vars), keyframes, focus/selection
  page.tsx                  Redirects to /login
  login/page.tsx            Login screen (kinetic background + form)
  board/page.tsx            Loads session + cards; guards on 401 → /login
  api/
    auth/{login,logout,session}/route.ts   Sign in/out, current session
    cards/route.ts                          GET (role-filtered) + POST (create)
    cards/[id]/route.ts                     PATCH (edit/assign) + DELETE (admin)
    cards/[id]/move/route.ts                Move a card between columns
    profile/route.ts                        GET + PATCH own profile (role read-only)
    profile/avatar/route.ts                 Hardened avatar upload (self only)
    avatar/[file]/route.ts                  Serve avatars (verified type + nosniff)
lib/
  db.ts                     Prisma client singleton
  session.ts                JWT cookie session (create / read / clear)
  auth/                     Pluggable auth providers + role mapping + user mirror
  rbac.ts                   Server-side authorization (source of truth)
  permissions.ts            Client-side mirror of RBAC (UX only)
  validate.ts               Input validation for every write
  serialize.ts              DB record → API JSON shapes
  avatar.ts                 Avatar hardening (magic bytes, size cap, name rules)
  types.ts                  Card / User / Profile / enums
  tokens.ts                 Columns, label + priority colour maps
  api.ts                    Client data layer (typed fetch wrappers)
components/
  Board.tsx                 DndContext + optimistic move + all modals
  BoardHeader.tsx           Logo, board name, role tag, filters, tour, profile
  Card.tsx / Column.tsx     Draggable card / droppable column
  CardDetail.tsx            Centered card modal (view / move / help / edit / delete)
  CardComposer.tsx          Create / edit form (admin owner-assign)
  ManagePanel.tsx           Admin columns + labels overview
  Profile.tsx               Self-service profile + avatar upload
  Tour.tsx                  Short dismissible guided tour
  Modal.tsx                 Centered scrim + surface (fade/pop transition)
  Seg.tsx / Primitives.tsx  Segmented control / LabelTag, PriorityDot, Avatar
  Toast.tsx / Logo.tsx / KineticBoard.tsx
prisma/
  schema.prisma             Models (User, Card) + enums
  migrations/               Ordered SQL migrations
  seed.ts                   Sample users + cards (passwords from env)
```

## Roles (enforced server-side)

| Capability | Admin | Member |
|---|---|---|
| View cards | all | only their own (`GET /api/cards` filters) |
| Create | ✓ (may assign `ownerId` to anyone) | ✓ (owner forced to self) |
| Edit / move | any card | own cards only |
| Reassign (change `ownerId`) | ✓ | ✗ (403) |
| Delete | ✓ | ✗ (403) |
| Toggle `needsHelp` | any card | own card only |
| Edit own profile | ✓ | ✓ (role is read-only) |

## Design tokens (dark cinematic mode)

Modernist system — ink/red, zero radius, 2px rules — on an ink ground. Body/UI text
uses the system UI font stack; a bold display face (Archivo) is used only for the
logo wordmark and the login headline. Light-mode values live under
`[data-theme=light]` in `globals.css`.

| Token | Dark (product) | Light |
|---|---|---|
| `--bg` ground | `#201e1d` | `#f3f2f2` |
| `--surface` cards, dialogs | `#2d2b2b` | `#eae9e9` |
| `--surface-2/3` hover / avatars | `#353232` / `#444141` | `#d7d3d3` / `#bab6b6` |
| `--ink` text | `#f3f2f2` | `#201e1d` |
| `--muted` secondary text | `#bab6b6` | `#605d5d` |
| `--faint` tertiary / placeholders | `#7d7979` | `#9b9797` |
| `--accent` | `#ec3013` | same |
| `--rule` / `--rule-soft` / `--hairline` | `rgba(243,242,242,.30/.18/.12)` | `rgba(32,30,29,.40/.18/.12)` |
| `--scrim` | `rgba(32,30,29,.72)` + blur(6px) | same |
| Radius | `0` everywhere | `0` |

**Priority**: high `#ec3013`, medium `#ff9783`, low `#9b9797`.
**Labels**: bug = solid red; feature = solid ink; docs = outline.

## Design references

The `reference/` folder at the repo root contains the original HTML design mockups
(`Stackflow.dc.html`, `Stackflow Mockups.dc.html`). They are historical design
artifacts, not part of the build.
