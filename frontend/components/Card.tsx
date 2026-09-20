"use client";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Lock, Trash2 } from "lucide-react";
import { PRIORITIES } from "@/lib/tokens";
import type { Card as CardT, User } from "@/lib/types";
import { Avatar, LabelTag, PriorityDot } from "./Primitives";

export interface CardProps {
  card: CardT; owner: User; canMove: boolean; canDelete: boolean; showDescription?: boolean;
  onOpen: (id: string) => void; onDelete?: (id: string) => void;
}

/** Shared visual so the DragOverlay ghost matches the resting card exactly. */
export function CardFace({ card, owner, canMove, canDelete, showDescription = true, onDelete, ghost, hint }: Omit<CardProps, "onOpen"> & { ghost?: boolean; hint?: string }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <LabelTag id={card.label} />
        {canDelete && !ghost && (
          <button type="button" title="Delete card" onClick={(e) => { e.stopPropagation(); onDelete?.(card.id); }} onPointerDown={(e) => e.stopPropagation()}
            className="grid h-[26px] w-[26px] place-items-center text-faint hover:text-accent"><Trash2 size={14} /></button>
        )}
      </div>
      <div className="text-[15px] font-semibold leading-[1.3] tracking-[-0.01em]">{card.title}</div>
      {ghost ? (
        <div className="text-[11px] text-muted">{hint}</div>
      ) : (
        <>
          {showDescription && card.description && <p className="line-clamp-2 text-xs leading-[1.45] text-muted">{card.description}</p>}
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <PriorityDot id={card.priority} />
            <span className="inline-flex items-center gap-1.5 text-faint">
              {!canMove && <Lock size={11} />}
              <Avatar user={owner} />
            </span>
          </div>
        </>
      )}
    </>
  );
}

export function Card(props: CardProps) {
  const { card, canMove, onOpen } = props;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id, disabled: !canMove });
  return (
    <motion.article ref={setNodeRef} layout layoutId={`card-${card.id}`} transition={{ type: "spring", stiffness: 500, damping: 40 }}
      {...listeners} {...attributes}
      onClick={() => onOpen(card.id)}
      className={`relative flex select-none flex-col gap-2 bg-surface px-3.5 py-3 shadow-card transition-colors duration-150 hover:bg-surface-2 touch-pan-y ${canMove ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      style={{ borderTop: `3px solid ${PRIORITIES[card.priority].hex}`, opacity: isDragging ? 0.25 : 1 }}
      data-card-id={card.id}>
      <CardFace {...props} />
    </motion.article>
  );
}
