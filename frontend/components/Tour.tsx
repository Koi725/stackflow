"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal, ModalFooter, ModalHeader } from "./Modal";

// A tiny, dismissible "how this works" tour for non-technical users. Plain
// language, four short steps, closes fully — it only ever opens from the "?"
// button, so it never nags.
const STEPS: { title: string; body: string }[] = [
  {
    title: "Welcome to your board",
    body: "This board tracks work as simple cards. Each card moves left to right across four columns as it gets done. That's the whole idea.",
  },
  {
    title: "What the columns mean",
    body: "To Do is work not started yet. In Progress is what you're doing now. Blocked means you're stuck and waiting on something. Done is finished.",
  },
  {
    title: "Add and move cards",
    body: "Click “New card” to add a task. To change its status, just drag a card from one column to another — or open it and pick a column.",
  },
  {
    title: "Ask for help",
    body: "Stuck on your own card? Open it and tap “Ask for help” to raise your hand. A little marker appears so an admin knows to lend a hand.",
  },
];

export function Tour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => { if (open) setStep(0); }, [open]);

  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <Modal open={open} onClose={onClose} width={460}>
      <ModalHeader onClose={onClose}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">Quick tour</span>
        <span className="text-[11px] text-faint">{step + 1} / {STEPS.length}</span>
      </ModalHeader>
      <div className="flex flex-col gap-3 p-6">
        <h2 className="text-[22px] font-extrabold leading-tight tracking-[-0.01em]">{s.title}</h2>
        <p className="text-[15px] leading-[1.55] text-muted">{s.body}</p>
        <div className="mt-1 flex gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => <span key={i} className={`h-1.5 w-6 ${i === step ? "bg-accent" : "bg-surface-3"}`} />)}
        </div>
      </div>
      <ModalFooter>
        <button type="button" onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0}
          className="inline-flex min-h-[44px] items-center gap-2 px-3 text-[13px] font-semibold text-muted hover:text-ink disabled:opacity-40">
          <ArrowLeft size={15} />Back
        </button>
        {last ? (
          <button type="button" onClick={onClose}
            className="ml-auto inline-flex min-h-[44px] items-center gap-2 bg-accent px-[18px] text-[13px] font-extrabold text-ink hover:bg-accent-hover">
            Got it
          </button>
        ) : (
          <button type="button" onClick={() => setStep((n) => Math.min(STEPS.length - 1, n + 1))}
            className="ml-auto inline-flex min-h-[44px] items-center gap-2 bg-accent px-[18px] text-[13px] font-extrabold text-ink hover:bg-accent-hover">
            Next<ArrowRight size={15} />
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
}
