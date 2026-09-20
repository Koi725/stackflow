// Data layer: typed fetch wrappers over the real Next.js API routes
// (/api/auth/*, /api/cards/*). The session is an httpOnly cookie, so every
// request sends credentials. Non-2xx responses throw an ApiError carrying the
// status and the server's error message — callers surface/handle it, never swallow.
import type { Card, CardInput, ColumnId, User } from "./types";

/** A card write can also carry assignment (ownerId) and the help flag. */
export type CardPatch = Partial<CardInput> & { ownerId?: string; needsHelp?: boolean };
export type NewCard = CardInput & { ownerId?: string };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function j<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, {
    ...init,
    credentials: "include", // send the session cookie
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!r.ok) {
    // Prefer the API's { error } message; fall back to the status line.
    let message = `${r.status} ${r.statusText}`;
    try {
      const body = await r.json();
      if (body && typeof body.error === "string") message = body.error;
    } catch {
      /* no JSON body */
    }
    throw new ApiError(r.status, message);
  }
  // 204 (logout, delete) and any empty body return nothing.
  if (r.status === 204) return undefined as T;
  const text = await r.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  signIn: (email: string, password: string) =>
    j<User>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signOut: () => j<void>("/api/auth/logout", { method: "POST" }),
  session: () => j<{ user: User; members: User[] }>("/api/auth/session"),
  listCards: () => j<Card[]>("/api/cards"),
  createCard: (input: NewCard) => j<Card>("/api/cards", { method: "POST", body: JSON.stringify(input) }),
  updateCard: (id: string, patch: CardPatch) =>
    j<Card>(`/api/cards/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  moveCard: (id: string, column: ColumnId) =>
    j<Card>(`/api/cards/${id}/move`, { method: "POST", body: JSON.stringify({ column }) }),
  deleteCard: (id: string) => j<void>(`/api/cards/${id}`, { method: "DELETE" }),
};
