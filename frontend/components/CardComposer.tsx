"use client";
import { useEffect, useState } from "react";
import { COLUMNS, LABELS, PRIORITIES } from "@/lib/tokens";
import type { CardInput, ColumnId, LabelId, Priority } from "@/lib/types";
import { Kicker, Modal, ModalFooter, ModalHeader } from "./Modal";
import { Seg } from "./Seg";

const EMPTY: CardInput = { title: "", description: "", label: "feature", priority: "med", column: "todo" };

export function CardComposer({ open, initial, defaultColumn, onClose, onSave }: {
  open: boolean; initial?: CardInput | null; defaultColumn?: ColumnId; onClose: () => void; onSave: (input: CardInput) => Promise<void> | void;
}) {
  const [form, setForm] = useState<CardInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setForm(initial ?? { ...EMPTY, column: defaultColumn ?? "todo" }); }, [open, initial, defaultColumn]);
  const set = <K extends keyof CardInput>(k: K) => (v: CardInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.title.trim().length > 0;

  return (
    <Modal open={open} onClose={onClose} width={560}>
      <form onSubmit={async (e) => { e.preventDefault(); if (!valid || busy) return; setBusy(true); try { await onSave({ ...form, title: form.title.trim() }); } finally { setBusy(false); } }}>
        <ModalHeader onClose={onClose}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">{initial ? "Edit card" : "New card"}</span>
        </ModalHeader>
        <div className="flex flex-col gap-5 p-6">
          <input autoFocus value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder="What needs doing?"
            className="w-full border-b-2 border-rule bg-transparent pb-3 pt-1.5 text-[clamp(22px,3.5vw,28px)] font-extrabold tracking-[-0.02em] outline-offset-[6px]" />
          <textarea value={form.description} onChange={(e) => set("description")(e.target.value)} rows={3} placeholder="Add a short description (optional)"
            className="w-full resize-y border border-rule bg-bg px-3.5 py-3 text-sm leading-normal" />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px]">
            <div><Kicker>Label</Kicker>
              <Seg<LabelId> value={form.label} onChange={set("label")} options={(Object.keys(LABELS) as LabelId[]).map((id) => ({ id, label: LABELS[id].name }))} /></div>
            <div><Kicker>Priority</Kicker>
              <Seg<Priority> value={form.priority} onChange={set("priority")} options={(Object.keys(PRIORITIES) as Priority[]).map((id) => ({
                id, label: <><span className="h-2 w-2" style={{ background: id === form.priority ? "#f3f2f2" : PRIORITIES[id].hex }} />{PRIORITIES[id].name}</> }))} /></div>
          </div>
          <div><Kicker>Column</Kicker><Seg<ColumnId> value={form.column} onChange={set("column")} options={COLUMNS.map((c) => ({ id: c.id, label: c.name }))} /></div>
        </div>
        <ModalFooter>
          <button type="submit" disabled={!valid || busy} className="inline-flex min-h-[44px] items-center gap-2 bg-accent px-[18px] text-[13px] font-extrabold text-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-45">
            {initial ? "Save changes" : "Create card"}
          </button>
          <button type="button" onClick={onClose} className="ml-auto min-h-[44px] px-3 text-[13px] font-semibold text-muted hover:text-ink">Cancel</button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
