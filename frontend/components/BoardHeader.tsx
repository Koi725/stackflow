"use client";
import { LogOut, Plus, Settings2 } from "lucide-react";
import { canFilter, canManageBoard } from "@/lib/permissions";
import type { Filter, User } from "@/lib/types";
import { Logo } from "./Logo";
import { Seg } from "./Seg";

export function BoardHeader({ user, boardName, filter, onFilter, onManage, onNew, onSignOut }: {
  user: User; boardName: string; filter: Filter; onFilter: (f: Filter) => void; onManage: () => void; onNew: () => void; onSignOut: () => void;
}) {
  const admin = user.role === "admin";
  return (
    <header className="flex flex-wrap items-center gap-4 border-b-2 border-rule px-[clamp(16px,3vw,32px)] py-3">
      <div className="mr-auto flex items-center gap-2.5">
        <Logo size={24} />
        <span className="mx-1.5 h-5 w-0.5 bg-rule" />
        <span className="text-sm text-muted">{boardName}</span>
        <span className={`border border-rule px-2 py-[3px] text-[10px] uppercase tracking-[0.1em] ${admin ? "bg-accent text-ink" : "text-muted"}`}>{admin ? "Admin" : "Member"}</span>
      </div>
      {canFilter(user) && (
        <Seg size="sm" tone="ink" value={filter} onChange={onFilter}
          options={[{ id: "all", label: "All" }, { id: "mine", label: "Mine" }, { id: "high", label: "High" }]} />
      )}
      {canManageBoard(user) && (
        <button type="button" onClick={onManage} className="inline-flex min-h-[36px] items-center gap-2 whitespace-nowrap border border-rule px-3 text-[13px] font-semibold hover:bg-ink/[.08]">
          <Settings2 size={15} />Manage
        </button>
      )}
      <button type="button" onClick={onNew} className="inline-flex min-h-[36px] items-center gap-2 whitespace-nowrap bg-accent px-3.5 text-[13px] font-extrabold text-ink transition-colors duration-150 hover:bg-accent-hover active:bg-accent-active">
        <Plus size={15} strokeWidth={2.4} />New card
      </button>
      <div className="flex items-center gap-1">
        <span className="inline-flex min-h-[36px] items-center gap-2 whitespace-nowrap px-1.5 text-xs text-muted">
          <span className="grid h-7 w-7 place-items-center bg-surface-3 text-[11px] font-extrabold text-ink">{user.initials}</span>
          {user.name}
        </span>
        <button type="button" onClick={onSignOut} title="Sign out" className="grid h-9 w-9 place-items-center text-muted hover:text-accent"><LogOut size={16} /></button>
      </div>
    </header>
  );
}
