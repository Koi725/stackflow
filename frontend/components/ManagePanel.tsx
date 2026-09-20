"use client";
import { GripVertical, Plus } from "lucide-react";
import { COLUMNS, LABELS } from "@/lib/tokens";
import type { Card, LabelId } from "@/lib/types";
import { Kicker, Modal, ModalHeader } from "./Modal";
import { LabelTag } from "./Primitives";

/** Admin only. Columns and labels are fixed enums defined in lib/tokens.ts; the
 *  "Add column/label" buttons are intentionally inert placeholders for now. */
export function ManagePanel({ open, cards, onClose }: { open: boolean; cards: Card[]; onClose: () => void }) {
  const Section = ({ title }: { title: string }) => <div className="mb-2.5 border-b-2 border-rule pb-2"><Kicker>{title}</Kicker></div>;
  const AddBtn = ({ label }: { label: string }) => (
    <button type="button" className="flex min-h-[40px] items-center gap-2 py-2.5 text-xs font-semibold text-faint hover:text-ink"><Plus size={13} strokeWidth={2.4} />{label}</button>
  );
  return (
    <Modal open={open} onClose={onClose} width={520}>
      <ModalHeader onClose={onClose}><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">Admin · Manage board</span></ModalHeader>
      <div className="grid grid-cols-2 gap-6 p-6">
        <div>
          <Section title="Columns" />
          {COLUMNS.map((c) => (
            <div key={c.id} className="flex items-center gap-2 border-b border-hairline py-2 text-sm"><GripVertical size={14} className="text-faint" />{c.name}<span className="ml-auto text-[11px] text-faint">{cards.filter((x) => x.column === c.id).length}</span></div>
          ))}
          <AddBtn label="Add column" />
        </div>
        <div>
          <Section title="Labels" />
          {(Object.keys(LABELS) as LabelId[]).map((id) => (
            <div key={id} className="flex items-center gap-2 border-b border-hairline py-2 text-sm"><LabelTag id={id} /><span className="ml-auto text-[11px] text-faint">{cards.filter((x) => x.label === id).length}</span></div>
          ))}
          <AddBtn label="Add label" />
        </div>
      </div>
      <div className="px-6 pb-5 pt-3 text-xs text-faint">Members never see this panel — they get the board and their own cards, nothing more.</div>
    </Modal>
  );
}
