import type { Card, User } from "./types";

// The entire RBAC. Mirror these checks server-side in every API route.
export const canEdit = (user: User, card: Card) => user.role === "admin" || card.ownerId === user.id;
export const canMove = canEdit;
export const canDelete = (user: User) => user.role === "admin";
export const canManageBoard = (user: User) => user.role === "admin";
export const canFilter = (user: User) => user.role === "admin";
