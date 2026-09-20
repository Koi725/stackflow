import "server-only";
import type { Card as DbCard, User as DbUser } from "@prisma/client";
import type { Card, Profile, User } from "./types";

// Map DB records to the exact JSON shapes the frontend expects (frontend/lib/types.ts).
// Prisma enum values are the same lowercase strings as the frontend unions, so
// role/label/priority/column pass straight through. passwordHash is never exposed.

export function toUser(u: DbUser): User {
  return { id: u.id, name: u.name, initials: u.initials, role: u.role, avatarUrl: u.avatarUrl };
}

// The self-profile shape: adds email + editable fields. Only ever returned for
// the session user's own record (see /api/profile). Role is included but the
// PATCH handler never writes it, so it is display-only.
export function toProfile(u: DbUser): Profile {
  return {
    id: u.id,
    name: u.name,
    initials: u.initials,
    role: u.role,
    avatarUrl: u.avatarUrl,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    age: u.age,
  };
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
