// MOCK — sample data from the design. Delete once lib/api.ts is wired to a real backend.
import type { Card, User } from "./types";

export const MOCK_USERS: User[] = [
  { id: "u-you", name: "You", initials: "YO", role: "admin" },
  { id: "u-mara", name: "Mara K.", initials: "MK", role: "member" },
  { id: "u-tomas", name: "Tomas R.", initials: "TR", role: "member" },
];

export const MOCK_CARDS: Card[] = [
  { id: "101", title: "Fix login bug", description: "Session cookie expires immediately on Safari 17. Reproduce with a fresh profile, check SameSite handling.", label: "bug", priority: "high", column: "progress", ownerId: "u-you", createdAt: "2026-09-14T09:00:00Z" },
  { id: "102", title: "Write API docs", description: "Cover auth, boards, cards and the webhook payloads. Keep it to one page per resource.", label: "docs", priority: "med", column: "todo", ownerId: "u-mara", createdAt: "2026-09-15T09:00:00Z" },
  { id: "103", title: "Deploy v2", description: "Blocked on the database migration review. Ship once the rollback plan is signed off.", label: "feature", priority: "high", column: "blocked", ownerId: "u-tomas", createdAt: "2026-09-12T09:00:00Z" },
  { id: "104", title: "Design landing page", description: "Poster-style hero, one screenshot, install command. Nothing else.", label: "feature", priority: "low", column: "done", ownerId: "u-you", createdAt: "2026-09-08T09:00:00Z" },
  { id: "105", title: "Refactor auth", description: "Collapse the three token helpers into one module with tests.", label: "feature", priority: "med", column: "todo", ownerId: "u-you", createdAt: "2026-09-16T09:00:00Z" },
  { id: "106", title: "Drag drops cards on touch", description: "Cards jump back on iOS when the finger leaves the column early.", label: "bug", priority: "med", column: "todo", ownerId: "u-tomas", createdAt: "2026-09-17T09:00:00Z" },
  { id: "107", title: "Keyboard shortcuts", description: "N for new card, arrows to move focus, Enter to open.", label: "feature", priority: "low", column: "progress", ownerId: "u-mara", createdAt: "2026-09-13T09:00:00Z" },
  { id: "108", title: "Contributing guide", description: "How to run locally, code style, how to propose a column type.", label: "docs", priority: "low", column: "done", ownerId: "u-mara", createdAt: "2026-09-05T09:00:00Z" },
];
