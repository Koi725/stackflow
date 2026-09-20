export type Role = "admin" | "member";
export type ColumnId = "todo" | "progress" | "blocked" | "done";
export type LabelId = "bug" | "feature" | "docs";
export type Priority = "high" | "med" | "low";

export interface User {
  id: string;
  name: string;
  initials: string;
  role: Role;
  avatarUrl?: string | null; // uploaded avatar served from /api/avatar/<uuid>; null → initials fallback
}

// The logged-in user's own editable profile. Role is display-only (never patched).
export interface Profile extends User {
  email: string;
  firstName: string | null;
  lastName: string | null;
  age: number | null;
}
// Fields a user may change about themselves (never role/email/id).
export type ProfilePatch = { firstName?: string | null; lastName?: string | null; age?: number | null };

export interface Card {
  id: string;
  title: string;
  description: string;
  label: LabelId;
  priority: Priority;
  column: ColumnId;
  ownerId: string; // the assignee — who the card is assigned to
  needsHelp?: boolean; // owner raised a hand for help; admins can see it (always set by the API)
  createdAt: string; // ISO
}

export type CardInput = Pick<Card, "title" | "description" | "label" | "priority" | "column">;
export type Filter = "all" | "mine" | "high";
