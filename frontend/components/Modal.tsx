"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

const ease = [0.2, 0.8, 0.2, 1] as const;

/** Scrim + surface. Always centered (vertically + horizontally) over a dimmed,
 *  blurred backdrop, with a max-height and internal scroll for tall content. */
export function Modal({ open, onClose, width = 560, children, accentTop }: {
  open: boolean; onClose: () => void; width?: number; children: ReactNode; accentTop?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="scrim" onClick={onClose} role="presentation"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[var(--scrim)] p-4 backdrop-blur-[6px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
            className="my-auto flex max-h-[90vh] w-full flex-col overflow-y-auto bg-surface shadow-dialog"
            style={{ maxWidth: width, borderTop: accentTop ? `3px solid ${accentTop}` : undefined }}
            initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease }}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ModalHeader({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-center gap-2.5 border-b-2 border-rule px-6 py-4">
      {children}
      <button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid h-9 w-9 place-items-center text-muted hover:text-ink"><X size={18} /></button>
    </div>
  );
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2.5 border-t-2 border-rule px-6 py-4">{children}</div>;
}

export const Kicker = ({ children }: { children: ReactNode }) => <div className="mb-2 text-[10px] uppercase tracking-[0.1em] text-faint">{children}</div>;
