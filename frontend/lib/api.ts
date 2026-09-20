// TODO(backend): every function here hits an API route that does not exist yet.
// Implement /api/auth/*, /api/cards/* (e.g. Next route handlers + Prisma/Drizzle, or Supabase)
// and enforce lib/permissions.ts server-side. Shapes are in lib/types.ts.
import type { Card, CardInput, ColumnId, User } from "./types";

async function j<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export const api = {
  signIn: (email: string, password: string) => j<User>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signOut: () => j<void>("/api/auth/logout", { method: "POST" }),
  session: () => j<{ user: User; members: User[] }>("/api/auth/session"),
  listCards: () => j<Card[]>("/api/cards"),
  createCard: (input: CardInput) => j<Card>("/api/cards", { method: "POST", body: JSON.stringify(input) }),
  updateCard: (id: string, patch: Partial<CardInput>) => j<Card>(`/api/cards/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  moveCard: (id: string, column: ColumnId) => j<Card>(`/api/cards/${id}/move`, { method: "POST", body: JSON.stringify({ column }) }),
  deleteCard: (id: string) => j<void>(`/api/cards/${id}`, { method: "DELETE" }),
};
