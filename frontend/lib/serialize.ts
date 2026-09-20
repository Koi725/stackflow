import "server-only";
import type { Card as DbCard, User as DbUser } from "@prisma/client";
import type { Card, User } from "./types";

// Map DB records to the exact JSON shapes the frontend expects (frontend/lib/types.ts).
// Prisma enum values are the same lowercase strings as the frontend unions, so
// role/label/priority/column pass straight through. passwordHash/email are dropped.

export function toUser(u: DbUser): User {
  return { id: u.id, name: u.name, initials: u.initials, role: u.role };
}

export function toCard(c: DbCard): Card {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    label: c.label,
    priority: c.priority,
    column: c.column,
    ownerId: c.ownerId,
    needsHelp: c.needsHelp,
    createdAt: c.createdAt.toISOString(),
  };
}
