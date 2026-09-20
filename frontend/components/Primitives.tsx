import { LABELS, PRIORITIES, avatarClass } from "@/lib/tokens";
import type { LabelId, Priority, User } from "@/lib/types";

export function LabelTag({ id }: { id: LabelId }) {
  const l = LABELS[id];
  return <span className={`inline-flex self-start border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${l.className}`}>{l.name}</span>;
}

export function PriorityDot({ id, size = "sm" }: { id: Priority; size?: "sm" | "md" }) {
  const p = PRIORITIES[id];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${size === "sm" ? "text-[11px]" : "text-[13px]"}`} style={{ color: p.hex }}>
      <span className="h-2 w-2" style={{ background: p.hex }} />{p.name}
    </span>
  );
}

export function Avatar({ user, size = 22 }: { user: User; size?: number }) {
  return (
    <span className={`grid place-items-center font-extrabold ${avatarClass(user.id)}`} style={{ width: size, height: size, fontSize: size * 0.4 }} title={user.name}>
      {user.initials}
    </span>
  );
}
