import type { Role } from "@prisma/client";

// Role mapping between an external identity platform and stackflow's own enum.
// stackflow only ever has two roles: admin | member. External platforms speak
// their own vocabulary (e.g. mentor / student), which we translate on every login.
//
//   mentor  -> admin
//   student -> member
//
// Anything already spoken in stackflow's own terms (admin | member) passes
// through, and anything unrecognised falls back to the least-privileged role.

const EXTERNAL_ROLE_MAP: Record<string, Role> = {
  mentor: "admin",
  student: "member",
  admin: "admin",
  member: "member",
};

/** Translate an external role string into a stackflow Role (default: member). */
export function mapExternalRole(external: unknown): Role {
  if (typeof external === "string") {
    const mapped = EXTERNAL_ROLE_MAP[external.trim().toLowerCase()];
    if (mapped) return mapped;
  }
  return "member";
}
