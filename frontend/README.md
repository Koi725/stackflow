# Handoff: Stackflow — Kanban board

## Overview
A tiny open-source Kanban: one board, four columns (To Do → In Progress → Blocked → Done), cards with title / description / label / priority, drag between columns. Two roles: **admin** (full control, Manage panel, filters, delete) and **member** (own cards only, calmer UI).

## About the design files
`Stackflow.dc.html` and `Stackflow Mockups.dc.html` are **design references built in HTML** — they show the intended look and behavior. The `src/` folder in this bundle is a **Next.js 14 (App Router) + Tailwind + dnd-kit + Framer Motion** implementation of those references, written to be dropped into a fresh `create-next-app --ts --tailwind --app` project. Fidelity: **hi-fi** — colors, type, spacing and motion are final.

## Dependencies
```
npm i @dnd-kit/core @dnd-kit/utilities framer-motion lucide-react
```
- `next` ≥ 14, `react` 18, `tailwindcss` 3 (from create-next-app)
- Font: Archivo 400/600/800 via `next/font/google` (already wired in `app/layout.tsx`)

## File map (`src/`)
```
app/layout.tsx              Archivo font, dark ground, <body> resets
app/globals.css             Tokens (CSS vars), keyframes, focus/selection rules
app/login/page.tsx          Login screen (kinetic board + flush-left form)
app/page.tsx                Redirects to /login
app/board/page.tsx          Board route — loads session + cards, renders <Board/> (has MOCK fallback)
tailwind.config.ts          Token → Tailwind mapping (colors, font, radius 0, shadows)
lib/types.ts                Card / Column / Label / Priority / Role / User
lib/tokens.ts               Label + priority color maps, column list
lib/permissions.ts          can(user, card) — the whole RBAC
lib/api.ts                  Data layer: fetch wrappers → your backend  (TODO)
lib/mock.ts                 Sample cards used until api.ts is wired      (MOCK)
components/Logo.tsx
components/Seg.tsx          Segmented control (filters, label/priority/column pickers, move-to)
components/Primitives.tsx   LabelTag (Bug / Feature / Docs), PriorityDot, Avatar
components/Modal.tsx        Scrim + surface with the fade/pop transition; `sheet` variant
components/Toast.tsx
components/Card.tsx         Draggable card (useDraggable + motion.article layout)
components/Column.tsx       Droppable column with hover tint
components/BoardHeader.tsx  Logo, board name, role tag, filters (admin), Manage (admin), New card, role/sign-out
components/Board.tsx        DndContext + DragOverlay ghost + optimistic move + modals
components/CardDetail.tsx   Bottom sheet
components/CardComposer.tsx Create / edit form
components/ManagePanel.tsx  Admin columns + labels
components/KineticBoard.tsx Login background animation
```

## Design tokens (dark cinematic mode)
Derived from the Modernist system (Archivo, ink/red, zero radius, 2px rules) flipped onto an ink ground. Light-mode values are the Modernist defaults and are kept in `globals.css` under `[data-theme=light]` for docs/marketing pages.

| Token | Dark (product) | Light (Modernist default) |
|---|---|---|
| `--bg` ground | `#201e1d` | `#f3f2f2` |
| `--surface` cards, dialogs | `#2d2b2b` | `#eae9e9` |
| `--surface-2` hover / avatars | `#353232` / `#444141` | `#d7d3d3` |
| `--ink` text | `#f3f2f2` | `#201e1d` |
| `--muted` secondary text | `#bab6b6` | `#605d5d` |
| `--faint` tertiary / placeholders | `#7d7979` | `#9b9797` |
| `--accent` | `#ec3013` | same |
| `--accent-hover` / `-active` | `#dd2b0f` / `#ae1800` | same |
| `--accent-soft` (medium priority, links) | `#ff9783` | `#ae1800` |
| `--rule` 2px dividers | `rgba(243,242,242,.30)` | `rgba(32,30,29,.40)` |
| `--rule-soft` column separators | `rgba(243,242,242,.18)` | `rgba(32,30,29,.18)` |
| `--hairline` | `rgba(243,242,242,.12)` | `rgba(32,30,29,.12)` |
| `--scrim` | `rgba(32,30,29,.72)` + `backdrop-filter: blur(6px)` | same |
| Radius | `0` everywhere | `0` |
| Shadow card / ghost / dialog | `0 1px 2px rgba(0,0,0,.2)` / `0 24px 48px rgba(0,0,0,.55), 0 0 0 2px #ec3013` / `0 12px 32px rgba(0,0,0,.5)` | Modernist `--shadow-sm/md/lg` |

**Priority** (card top rule 3px + dot + word): high `#ec3013`, medium `#ff9783`, low `#9b9797`.
**Labels** (10px uppercase, .08em, 2×8 padding): bug = solid `#ec3013`/`#f3f2f2`; feature = solid `#f3f2f2`/`#201e1d`; docs = outline `rgba(243,242,242,.4)`, text `#bab6b6`.

**Type (Archivo)**: display `clamp(40px,6.5vw,76px)/0.98`, −.035em, 800 · modal title `clamp(24px,4vw,34px)/1.08`, −.03em · card title 15px/1.3 600 · body 14–15px/1.55 · card desc 12px/1.45 muted · kicker/labels 10–11px uppercase .1–.14em · header brand 17px 800.

**Spacing**: 4-px scale (4/8/12/14/16/20/24/32); page gutter `clamp(16px,3vw,32px)`; column min width 250px; card padding 12×14; header 12px vertical; every hit target ≥ 36px (≥ 44px in modals, 46px inputs on login).

**Rules**: 2px `--rule` under header, column headers, modal header/footer; 2px `--rule-soft` between columns; 1px `--hairline` inside lists. Blocked column header + rule in `--accent`.

## Motion system
| Moment | Spec |
|---|---|
| Login → board | `clip-path: inset(0 100% 0 0) → inset(0)`, 700 ms, `cubic-bezier(.7,0,.2,1)` (`animate-wipe`) |
| Login form entrance | rise 24px + fade, 800 ms, `cubic-bezier(.2,.8,.2,1)` |
| Kinetic background | 3 ghost cards drift one/two column widths (`--cw`) on 9/11/13 s loops; a 2px red scan line sweeps 9 s linear; layer at `perspective(1400px) rotateX(14deg) rotateY(-10deg) rotateZ(2deg) scale(1.08)`, opacity .55, left-side gradient mask |
| Drag lift | after 6px move: `DragOverlay` ghost `rotate(1.5deg) scale(1.04)`, red 2px outline, source card opacity .25, target column `rgba(236,48,19,.08)` fill + red header rule |
| Drop / reflow | Framer Motion `layout` on cards (spring `stiffness 500, damping 40`) — siblings slide to close gap; ghost drops via `dropAnimation` 420 ms same ease |
| Modal | scrim fade 250 ms; surface `translateY(18px) scale(.97) → none` 350 ms `cubic-bezier(.2,.8,.2,1)`; card detail is a **bottom sheet** (place-items: end center) |
| Toast | pop 300 ms, auto-dismiss 2.2 s, bottom-left |
| Hover | background `.18s`; buttons darken one ramp step (`#dd2b0f`), press `#ae1800` |
| Reduced motion | `prefers-reduced-motion` disables kinetic background, wipe and layout springs (see `globals.css`) |

## Roles
| Capability | Admin | Member |
|---|---|---|
| See all cards | ✓ | ✓ (teammates' cards show a lock, read-only) |
| Create card | ✓ | ✓ (owner = self) |
| Edit / move | any | own only |
| Delete | ✓ | ✗ |
| Filters (All / Mine / High) | ✓ | ✗ |
| Manage columns & labels | ✓ | ✗ |
| Header hint bar | — | "Drag your own cards. Teammates' cards are read-only." |

## Authentication (backend)
Auth is pluggable via the `AUTH_MODE` env var; the provider layer lives in `lib/auth/`.

- **`local` (default, public path)** — credentials are checked against stackflow's
  own `User` table with bcrypt. This is the normal way to run the app: create users
  (see the seed) and sign in. Nothing external is required.
- **`darsman` (optional external mode)** — for private deployments that want to
  reuse an existing identity platform. Credentials are forwarded to an external
  login endpoint whose URL comes entirely from `DARSMAN_AUTH_URL` (never hardcoded);
  on success stackflow mirrors the returned profile (name, role) into its own `User`
  table and stores **no** password for that user. External roles are mapped to
  stackflow's two roles on every login (e.g. an elevated external role → `admin`,
  a standard one → `member`).

Either way the session is always minted from — and reloaded from — stackflow's own
DB, so the client can never assert its own identity or role. To enable the optional
mode set `AUTH_MODE=darsman` and `DARSMAN_AUTH_URL`; if the URL is missing the app
fails clearly instead of falling back.

## Server-side RBAC (backend)
Enforced in the API routes against the session user loaded from the DB — the
frontend `lib/permissions.ts` copy is UX only.

| Capability | Admin | Member |
|---|---|---|
| View cards | all | only their own (`GET /api/cards` filters) |
| Create | ✓ (may assign `ownerId` to anyone) | ✓ (owner forced to self) |
| Edit / move | any card | own cards only |
| Reassign (change `ownerId`) | ✓ | ✗ (403) |
| Delete | ✓ | ✗ (403) |
| Toggle `needsHelp` | any card | own card only |

`needsHelp` is a per-card flag a member can raise on their own card to ask for help;
admins can see it on every card.

## Mocks & placeholders — wire these before shipping
1. **`lib/mock.ts`** + the `catch` fallback in **`app/board/page.tsx`** — 8 sample cards + 3 users load whenever the API fails. Delete both once `lib/api.ts` talks to a real DB (redirect to `/login` on 401 instead).
2. **`lib/api.ts`** — every function is a `fetch` to `/api/...` routes that **do not exist yet**. Implement them (Prisma/Drizzle + Postgres, or Supabase). Shapes are in `lib/types.ts`.
3. **Auth** — `app/login/page.tsx` posts to `api.signIn()`; the **Admin/Member picker is demo-only** (marked `DEMO ONLY`). The header's "View as member/admin" button (`onSwitchRole`, wired in `app/board/page.tsx`) is also demo-only. Remove both; the role comes from `api.session()`. Add a middleware/route guard so `/board` requires a session.
4. **Optimistic move** — `Board.tsx` updates local state then calls `api.moveCard`; on failure it reverts and toasts. Keep, but make sure the API returns the canonical card.
5. **IDs** — new cards get a temporary `tmp-${Date.now()}` id until the server returns the real one (`Board.tsx › createCard`).
6. **Manage panel** — "Add column" / "Add label" buttons are UI only. Columns and labels are static in `lib/tokens.ts`; move them to the DB if admins should edit them.
7. **`created` date** — displayed from `card.createdAt`; the mock uses strings. Use ISO + `Intl.DateTimeFormat`.
8. **Toast timeout** (2.2 s) is real UI behavior, not a mock — keep.
9. The design reference's own drag/FLIP was hand-rolled; the code uses dnd-kit + Framer Motion instead — nothing to port.

## Assets
- Logo: inline SVG (`components/Logo.tsx`) — three stepped bars, last one red.
- Icons: `lucide-react` (Plus, X, Trash2, Pencil, Lock, LogOut, ArrowRight, Settings2, MoreHorizontal, GripVertical).
- No photography.

## Design reference files
- `Stackflow.dc.html` — interactive prototype (all screens, drag, roles)
- `Stackflow Mockups.dc.html` — canvas of screens 1a–1g
