"use client";
import { HelpCircle, Lock, Pencil, Trash2 } from "lucide-react";
import { COLUMNS, PRIORITIES } from "@/lib/tokens";
import type { Card, ColumnId, User } from "@/lib/types";
import { Kicker, Modal, ModalFooter, ModalHeader } from "./Modal";
import { Avatar, LabelTag, PriorityDot } from "./Primitives";
import { Seg } from "./Seg";

const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

export function CardDetail({ card, owner, canEdit, canDelete, onClose, onMove, onEdit, onDelete, onToggleHelp }: {
  card: Card | null; owner?: User; canEdit: boolean; canDelete: boolean;
  onClose: () => void; onMove: (col: ColumnId) => void; onEdit: () => void; onDelete: () => void;
  onToggleHelp: (needsHelp: boolean) => void;
}) {
  return (
    <Modal open={!!card} onClose={onClose} width={640} accentTop={card ? PRIORITIES[card.priority].hex : undefined}>
      {card && owner && (
        <>
          <ModalHeader onClose={onClose}>
            <LabelTag id={card.label} />
            <span className="whitespace-nowrap text-[11px] text-faint">#{card.id} · {COLUMNS.find((c) => c.id === card.column)?.name}</span>
          </ModalHeader>
          <div className="flex flex-col gap-5 p-6">
            <h2 className="text-[clamp(24px,4vw,34px)] font-extrabold leading-[1.08] tracking-[-0.03em] [text-wrap:balance]">{card.title}</h2>
            <p className="text-[15px] leading-[1.55] text-[#d7d3d3] [text-wrap:pretty]">{card.description || "No description."}</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3.5 border-t border-hairline pt-4">
              <div><Kicker>Priority</Kicker><PriorityDot id={card.priority} size="md" /></div>
              <div><Kicker>Owner</Kicker><span className="inline-flex items-center gap-2 text-[13px]"><Avatar user={owner} />{owner.name}</span></div>
              <div><Kicker>Created</Kicker><span className="text-[13px]">{fmt.format(new Date(card.createdAt))}</span></div>
            </div>
            {canEdit ? (
              <div><Kicker>Move to</Kicker><Seg value={card.column} onChange={onMove} options={COLUMNS.map((c) => ({ id: c.id, label: c.name }))} /></div>
            ) : (
              <div className="flex items-center gap-2.5 border border-ink/20 px-3.5 py-3 text-[13px] text-muted"><Lock size={14} />This card belongs to {owner.name}. Only they or an admin can change it.</div>
            )}
            {canEdit && (
              <div><Kicker>Help</Kicker>
                <button type="button" onClick={() => onToggleHelp(!card.needsHelp)}
                  className={`inline-flex min-h-[40px] items-center gap-2 border px-3.5 text-[13px] font-semibold transition-colors ${card.needsHelp ? "border-accent bg-accent/15 text-accent-soft hover:bg-accent/20" : "border-rule text-muted hover:bg-ink/[.08]"}`}>
                  <HelpCircle size={15} />{card.needsHelp ? "Needs help — tap to clear" : "Ask for help"}
                </button>
              </div>
            )}
          </div>
          <ModalFooter>
            {canEdit && <button type="button" onClick={onEdit} className="inline-flex min-h-[44px] items-center gap-2 bg-ink px-4 text-[13px] font-extrabold text-bg hover:bg-[#d7d3d3]"><Pencil size={14} />Edit</button>}
            {canDelete && <button type="button" onClick={onDelete} className="inline-flex min-h-[44px] items-center gap-2 border border-accent-soft/50 px-4 text-[13px] font-semibold text-accent-soft hover:bg-accent/15"><Trash2 size={14} />Delete</button>}
            <button type="button" onClick={onClose} className="ml-auto min-h-[44px] px-3 text-[13px] font-semibold text-muted hover:text-ink">Close</button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
