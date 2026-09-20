"use client";
import type { ReactNode } from "react";

export interface SegOption<T extends string> { id: T; label: ReactNode; }

/** Modernist segmented control: 1px rule box, active option is a solid fill. `tone="ink"` for filters, default red. */
export function Seg<T extends string>({ options, value, onChange, tone = "accent", size = "md", className = "" }: {
  options: SegOption<T>[]; value: T; onChange: (v: T) => void; tone?: "accent" | "ink"; size?: "sm" | "md"; className?: string;
}) {
  const active = tone === "accent" ? "bg-accent text-ink" : "bg-ink text-bg";
  const pad = size === "sm" ? "px-3 min-h-[36px] text-xs" : "px-3.5 min-h-[40px] text-xs";
  return (
    <div role="radiogroup" className={`inline-flex max-w-full overflow-x-auto border border-rule ${className}`}>
      {options.map((o, i) => (
        <button key={o.id} type="button" role="radio" aria-checked={o.id === value} onClick={() => onChange(o.id)}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap font-semibold transition-colors duration-150 ${pad} ${i ? "border-l border-rule" : ""} ${o.id === value ? active : "bg-transparent text-ink hover:bg-ink/[.08]"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
