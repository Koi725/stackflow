import "server-only";
import type { Role } from "@prisma/client";

// Server-side RBAC — the authoritative guard. Mirrors frontend/lib/permissions.ts
// but is always evaluated against the session user loaded from the DB, never
// against any role/id sent by the client. The frontend copy is UX only.

type SessionUser = { id: string; role: Role };
type OwnedCard = { ownerId: string };

export const canEdit = (user: SessionUser, card: OwnedCard) => user.role === "admin" || card.ownerId === user.id;
export const canMove = canEdit;
export const canDelete = (user: SessionUser) => user.role === "admin";
export const canManageBoard = (user: SessionUser) => user.role === "admin";
// Assignment = setting a card's ownerId. Only admins may assign to anyone;
// members are always the owner of their own cards and cannot reassign.
export const canAssign = (user: SessionUser) => user.role === "admin";
// A member may raise/lower the help flag on their OWN card; admins on any card.
export const canToggleHelp = (user: SessionUser, card: OwnedCard) => user.role === "admin" || card.ownerId === user.id;
