import type { CardInput, ProfilePatch } from "./types";

// Server-side input validation for card writes. Enum sets mirror
// frontend/lib/types.ts. Returns a discriminated result so routes can answer
// 400 on bad input instead of throwing / crashing.

export const LABELS = ["bug", "feature", "docs"] as const;
export const PRIORITIES = ["high", "med", "low"] as const;
export const COLUMNS = ["todo", "progress", "blocked", "done"] as const;

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;

// The two RBAC-sensitive fields (assignment + help flag) travel with card writes
// but are gated in the routes, not here — validation only checks their shape.
export type CardWrite = CardInput & { ownerId?: string; needsHelp?: boolean };

const isEnum = <T extends readonly string[]>(set: T, v: unknown): v is T[number] =>
  typeof v === "string" && (set as readonly string[]).includes(v);

/** Validate a full card write (POST /api/cards). */
export function validateCardInput(body: unknown): Result<CardWrite> {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Body must be a JSON object" };
  const b = body as Record<string, unknown>;

  if (typeof b.title !== "string" || b.title.trim() === "") return { ok: false, error: "title is required" };
  if (b.description !== undefined && typeof b.description !== "string") return { ok: false, error: "description must be a string" };
  if (!isEnum(LABELS, b.label)) return { ok: false, error: `label must be one of ${LABELS.join(", ")}` };
  if (!isEnum(PRIORITIES, b.priority)) return { ok: false, error: `priority must be one of ${PRIORITIES.join(", ")}` };
  if (b.column !== undefined && !isEnum(COLUMNS, b.column)) return { ok: false, error: `column must be one of ${COLUMNS.join(", ")}` };
  if (b.ownerId !== undefined && (typeof b.ownerId !== "string" || b.ownerId.trim() === "")) return { ok: false, error: "ownerId must be a non-empty string" };
  if (b.needsHelp !== undefined && typeof b.needsHelp !== "boolean") return { ok: false, error: "needsHelp must be a boolean" };

  return {
    ok: true,
    value: {
      title: b.title.trim(),
      description: typeof b.description === "string" ? b.description : "",
      label: b.label,
      priority: b.priority,
      column: (b.column ?? "todo") as CardInput["column"],
      ...(typeof b.ownerId === "string" ? { ownerId: b.ownerId } : {}),
      ...(typeof b.needsHelp === "boolean" ? { needsHelp: b.needsHelp } : {}),
    },
  };
}

/** Validate a partial card write (PATCH /api/cards/[id]) — only provided fields. */
export function validateCardPatch(body: unknown): Result<Partial<CardWrite>> {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Body must be a JSON object" };
  const b = body as Record<string, unknown>;
  const patch: Partial<CardWrite> = {};

  if (b.title !== undefined) {
    if (typeof b.title !== "string" || b.title.trim() === "") return { ok: false, error: "title must be a non-empty string" };
    patch.title = b.title.trim();
  }
  if (b.description !== undefined) {
    if (typeof b.description !== "string") return { ok: false, error: "description must be a string" };
    patch.description = b.description;
  }
  if (b.label !== undefined) {
    if (!isEnum(LABELS, b.label)) return { ok: false, error: `label must be one of ${LABELS.join(", ")}` };
    patch.label = b.label;
  }
  if (b.priority !== undefined) {
    if (!isEnum(PRIORITIES, b.priority)) return { ok: false, error: `priority must be one of ${PRIORITIES.join(", ")}` };
    patch.priority = b.priority;
  }
  if (b.column !== undefined) {
    if (!isEnum(COLUMNS, b.column)) return { ok: false, error: `column must be one of ${COLUMNS.join(", ")}` };
    patch.column = b.column;
  }
  if (b.ownerId !== undefined) {
    if (typeof b.ownerId !== "string" || b.ownerId.trim() === "") return { ok: false, error: "ownerId must be a non-empty string" };
    patch.ownerId = b.ownerId;
  }
  if (b.needsHelp !== undefined) {
    if (typeof b.needsHelp !== "boolean") return { ok: false, error: "needsHelp must be a boolean" };
    patch.needsHelp = b.needsHelp;
  }

  if (Object.keys(patch).length === 0) return { ok: false, error: "No valid fields to update" };
  return { ok: true, value: patch };
}

/** Validate the { column } body for POST /api/cards/[id]/move. */
export function validateColumn(body: unknown): Result<CardInput["column"]> {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Body must be a JSON object" };
  const col = (body as Record<string, unknown>).column;
  if (!isEnum(COLUMNS, col)) return { ok: false, error: `column must be one of ${COLUMNS.join(", ")}` };
  return { ok: true, value: col };
}

/**
 * Validate a self-profile PATCH (PATCH /api/profile). Only firstName, lastName and
 * age are ever accepted — role, email and id are intentionally NOT read here, so
 * they can never be changed through this endpoint. Empty strings clear a name.
 */
export function validateProfilePatch(body: unknown): Result<ProfilePatch> {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Body must be a JSON object" };
  const b = body as Record<string, unknown>;
  const patch: ProfilePatch = {};

  for (const field of ["firstName", "lastName"] as const) {
    if (b[field] !== undefined) {
      if (b[field] === null) { patch[field] = null; continue; }
      if (typeof b[field] !== "string") return { ok: false, error: `${field} must be a string or null` };
      const trimmed = (b[field] as string).trim();
      if (trimmed.length > 80) return { ok: false, error: `${field} must be 80 characters or fewer` };
      patch[field] = trimmed || null; // empty → clear
    }
  }

  if (b.age !== undefined) {
    if (b.age === null) patch.age = null;
    else if (typeof b.age !== "number" || !Number.isInteger(b.age) || b.age < 0 || b.age > 120) {
      return { ok: false, error: "age must be a whole number between 0 and 120, or null" };
    } else patch.age = b.age;
  }

  return { ok: true, value: patch };
}
