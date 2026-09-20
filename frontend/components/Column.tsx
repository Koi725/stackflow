"use client";
import { useDroppable } from "@dnd-kit/core";
import { MoreHorizontal, Plus } from "lucide-react";
import type { ReactNode } from "react";
import type { ColumnId } from "@/lib/types";

export function Column({ id, name, count, isLast, canManage, onManage, onAdd, emptyText, children }: {
  id: ColumnId; name: string; count: number; isLast: boolean; canManage: boolean; onManage: () => void; onAdd: () => void; emptyText: string; children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const blocked = id === "blocked";
  const ruleColor = isOver || blocked ? "#ec3013" : "var(--rule)";
  return (
    <section ref={setNodeRef} data-col={id} aria-label={name}
      className={`mr-3.5 flex snap-start flex-col gap-3 py-5 pr-3.5 transition-colors duration-200 ${isLast ? "" : "border-r-2 border-rule-soft"} ${isOver ? "bg-accent/[.08]" : ""}`}>
      <div className="flex items-baseline justify-between gap-2 pb-2.5" style={{ borderBottom: `2px solid ${ruleColor}` }}>
        <div className="flex items-baseline gap-2.5">
          <h6 className={`text-[11px] uppercase tracking-[0.12em] ${blocked ? "text-accent" : "text-muted"}`}>{name}</h6>
          <span className="text-[11px] text-faint">{count}</span>
        </div>
        {canManage && (
          <button type="button" onClick={onManage} title="Column settings" className="grid h-6 w-6 place-items-center text-faint hover:text-ink"><MoreHorizontal size={14} /></button>
        )}
      </div>
      {children}
      {count === 0 && <div className="border border-dashed border-ink/25 px-3.5 py-[18px] text-xs text-faint">{emptyText}</div>}
      <button type="button" onClick={onAdd} className="flex min-h-[36px] items-center gap-2 py-2 text-left text-xs font-semibold text-faint hover:text-ink">
        <Plus size={13} strokeWidth={2.4} />Add card
      </button>
    </section>
  );
}
