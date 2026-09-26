"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Board } from "@/components/Board";
import { api, ApiError } from "@/lib/api";
import type { Card, User } from "@/lib/types";

// Never statically prerender or CDN-cache this page: it's an authenticated,
// per-user view. force-dynamic makes Next render it per-request and emit
// Cache-Control: no-store, so the WCDN can't cache and serve a stale shell.
// The middleware.ts matcher is the actual auth guard (307 → /login).
export const dynamic = "force-dynamic";

export default function BoardPage() {
  const router = useRouter();
  const [data, setData] = useState<{ user: User; members: User[]; cards: Card[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Real session guard: load the session + cards. If unauthenticated, go to /login.
  useEffect(() => {
    (async () => {
      try {
        const [{ user, members }, cards] = await Promise.all([api.session(), api.listCards()]);
        setData({ user, members, cards });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setError("Couldn't load the board. Please refresh to try again.");
      }
    })();
  }, [router]);

  if (error) return <div className="flex flex-1 items-center justify-center text-sm text-faint">{error}</div>;
  if (!data) return <div className="flex flex-1 items-center justify-center text-sm text-faint">Loading…</div>;

  return (
    <Board
      user={data.user}
      members={data.members}
      initialCards={data.cards}
      onSignOut={async () => { try { await api.signOut(); } finally { router.push("/login"); } }}
    />
  );
}
