/** Login background: a tilted ghost board with three cards drifting between columns and a red scan line. Decorative only. */
export function KineticBoard() {
  const Head = ({ children, red }: { children: string; red?: boolean }) => (
    <div className={`mb-[22px] border-b-2 pb-2.5 text-[11px] uppercase tracking-[0.12em] ${red ? "border-accent text-accent" : "border-ink/35 text-muted"}`}>{children}</div>
  );
  const Ghost = ({ h, red, anim }: { h: number; red?: boolean; anim?: string }) => (
    <div className={`mb-3.5 bg-surface ${red ? "border-t-[3px] border-accent" : ""} ${anim ?? ""}`} style={{ height: h }} />
  );
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute -inset-[10%] -left-[5%] overflow-hidden opacity-55 [--cw:25vw]"
        style={{ transform: "perspective(1400px) rotateX(14deg) rotateY(-10deg) rotateZ(2deg) scale(1.08)", transformOrigin: "60% 40%",
          maskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.35) 30%,#000 60%)", WebkitMaskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.35) 30%,#000 60%)" }}>
        <div className="absolute inset-0 grid grid-cols-4">
          <div className="border-r-2 border-rule-soft px-7 py-14"><Head>To Do</Head><Ghost h={78} /><Ghost h={96} anim="animate-driftA" /><Ghost h={64} /></div>
          <div className="border-r-2 border-rule-soft px-7 py-14"><Head>In Progress</Head><Ghost h={110} red anim="animate-driftC" /><Ghost h={70} /></div>
          <div className="border-r-2 border-rule-soft px-7 py-14"><Head red>Blocked</Head><Ghost h={84} red anim="animate-driftB" /></div>
          <div className="px-7 py-14"><Head>Done</Head><Ghost h={66} /><Ghost h={88} /><Ghost h={60} /><Ghost h={74} /></div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-bg/60" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 h-0.5 bg-accent/35 animate-scan" />
    </>
  );
}
