import type { ColumnId, LabelId, Priority } from "./types";

export const COLUMNS: { id: ColumnId; name: string; emptyText: string }[] = [
  { id: "todo", name: "To Do", emptyText: "Drop a card here" },
  { id: "progress", name: "In Progress", emptyText: "Drop a card here" },
  { id: "blocked", name: "Blocked", emptyText: "Nothing blocked. Keep it that way." },
  { id: "done", name: "Done", emptyText: "Drop a card here" },
];

export const LABELS: Record<LabelId, { name: string; className: string }> = {
  bug: { name: "Bug", className: "bg-accent text-ink border-accent" },
  feature: { name: "Feature", className: "bg-ink text-bg border-ink" },
  docs: { name: "Docs", className: "bg-transparent text-muted border-[rgba(243,242,242,.4)]" },
};

export const PRIORITIES: Record<Priority, { name: string; hex: string }> = {
  high: { name: "High", hex: "#ec3013" },
  med: { name: "Medium", hex: "#ff9783" },
  low: { name: "Low", hex: "#9b9797" },
};

export const AVATAR_STYLES = [
  "bg-accent text-ink",
  "bg-ink text-bg",
  "bg-[#605d5d] text-ink",
];
export const avatarClass = (userId: string) => AVATAR_STYLES[[...userId].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_STYLES.length];
