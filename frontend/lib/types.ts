export type Role = "admin" | "member";
export type ColumnId = "todo" | "progress" | "blocked" | "done";
export type LabelId = "bug" | "feature" | "docs";
export type Priority = "high" | "med" | "low";

export interface User { id: string; name: string; initials: string; role: Role; }

export interface Card {
  id: string;
  title: string;
  description: string;
  label: LabelId;
  priority: Priority;
  column: ColumnId;
  ownerId: string;
  createdAt: string; // ISO
}

export type CardInput = Pick<Card, "title" | "description" | "label" | "priority" | "column">;
export type Filter = "all" | "mine" | "high";
