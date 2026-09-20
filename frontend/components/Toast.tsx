"use client";
import { AnimatePresence, motion } from "framer-motion";

export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div role="status" key={message}
          className="fixed bottom-6 left-[clamp(16px,3vw,32px)] z-40 flex items-center gap-3 bg-ink px-3.5 py-2.5 text-[13px] font-semibold text-bg shadow-dialog"
          initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
