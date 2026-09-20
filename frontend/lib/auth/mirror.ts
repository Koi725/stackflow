import "server-only";
import type { User } from "@prisma/client";
import { prisma } from "../db";
import type { ExternalIdentity } from "./types";

// Mirror a verified external identity into stackflow's own User table.
//
// stackflow's DB is always the source of truth for the session (see lib/session.ts),
// so every successful login — local OR external — upserts the user here first.
// For external (darsman) users we store NO password; local users keep the bcrypt
// hash they already have (this upsert never touches passwordHash).

/** Derive 2-letter initials from a display name, e.g. "Alex Kim" -> "AK". */
export function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Upsert the mirrored stackflow user for a verified identity and return the DB
 * record. Name, role and initials are re-synced on every login; passwordHash is
 * left untouched (existing local users keep theirs; new mirrored users get none).
 */
export async function upsertMirroredUser(identity: ExternalIdentity): Promise<User> {
  const email = identity.email.toLowerCase();
  const initials = initialsFrom(identity.name);

  return prisma.user.upsert({
    where: { email },
    update: { name: identity.name, role: identity.role, initials },
    // Only external logins reach the create branch (local users already exist),
    // so a brand-new mirrored user is created without a password.
    create: { email, name: identity.name, role: identity.role, initials, passwordHash: null },
  });
}
