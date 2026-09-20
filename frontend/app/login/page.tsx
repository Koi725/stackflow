"use client";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { KineticBoard } from "@/components/KineticBoard";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try { await api.signIn(email, password); router.push("/board"); }
    catch { setError("Couldn't sign you in. Check your email and password."); }
    finally { setBusy(false); }
  };

  const input = "min-h-[46px] w-full border border-rule bg-surface px-3.5 py-3 text-[15px]";
  return (
    <main className="relative flex min-h-full flex-1 items-center">
      <KineticBoard />
      <div className="relative z-10 my-auto flex w-full max-w-[520px] flex-col gap-8 p-[clamp(28px,6vw,72px)] animate-rise">
        <Logo size={30} />
        <div>
          <div className="mb-3.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-accent"><span className="h-2 w-2 bg-accent animate-pulse2" />Open-source kanban</div>
          <h1 className="mb-[18px] text-[clamp(40px,6.5vw,76px)] font-extrabold leading-[0.98] tracking-[-0.035em] [text-wrap:balance]">Move work.<br />Nothing else.</h1>
          <p className="max-w-[36ch] text-base text-muted [text-wrap:pretty]">Four columns, a few cards, one drag. The whole app fits on one screen — and looks good doing it.</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-xs text-muted">Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@team.dev" className={input} /></label>
          <label className="flex flex-col gap-1.5 text-xs text-muted">Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={input} /></label>
          {error && <div role="alert" className="border border-accent-soft/50 px-3.5 py-3 text-[13px] text-accent-soft">{error}</div>}
          <button type="submit" disabled={busy} className="mt-2 flex min-h-[50px] items-center justify-between gap-3 bg-accent px-[18px] py-3.5 text-left text-[15px] font-extrabold text-ink transition-colors hover:bg-accent-hover active:bg-accent-active disabled:opacity-45">
            <span>Enter the board</span><ArrowRight size={18} strokeWidth={2.2} />
          </button>
          <div className="text-xs text-faint">Open source · <a href="https://github.com/Koi725/stackflow" className="text-accent-soft">Self-host guide</a></div>
        </form>
      </div>
    </main>
  );
}
