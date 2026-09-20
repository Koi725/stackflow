# Contributing to Stackflow

Thanks for your interest! Stackflow is deliberately small — the goal is a clean,
readable, self-hostable Kanban board, not a feature kitchen sink.

## Getting set up

Follow the [Getting started](./README.md#getting-started) steps in the root
README (install, `.env`, Postgres via Docker, `prisma migrate deploy`, seed, run).

## Before you open a PR

Run these from `frontend/` and make sure they're clean:

```bash
npx tsc --noEmit     # type-check
npm run build        # production build (also runs lint)
```

- **Keep the design system intact.** Colours, spacing, radius (0) and motion are
  defined in `app/globals.css`, `tailwind.config.ts` and `lib/tokens.ts`. Reuse the
  existing primitives (`Modal`, `Seg`, `Avatar`, etc.) rather than adding new styles.
- **Security is non-negotiable.** All authorization is enforced server-side from
  the session user (see `lib/rbac.ts` and the API routes) — never trust a
  client-supplied id or role. Validate every write (`lib/validate.ts`).
- **No secrets in code.** Anything environment-specific goes through `.env`
  (documented in `.env.example`).
- Prefer small, focused PRs with a clear description.

## Reporting bugs & vulnerabilities

Open an issue for ordinary bugs. For anything security-sensitive, please report it
privately instead of filing a public issue.

By contributing, you agree that your contributions are licensed under the project's
[MIT License](./LICENSE).
