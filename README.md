# stackflow

A small, beautiful open-source Kanban board.

One board, four columns (To Do → In Progress → Blocked → Done), cards you drag
between them. Nothing else.

## Structure

```
stackflow/
├── frontend/   # Next.js 14 (App Router) + Tailwind + dnd-kit + Framer Motion
├── backend/    # FastAPI + SQLAlchemy + Postgres (coming next)
├── reference/  # design mockups
├── LICENSE
└── README.md
```

## Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

See `frontend/README.md` for the component map, design tokens, and the list of
mocks/placeholders still to be wired to the backend.

## Backend

Not built yet — the `backend/` folder is a placeholder while the schema and API
are designed.

## License

MIT — see [LICENSE](./LICENSE).
