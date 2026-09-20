"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Board } from "@/components/Board";
import { api } from "@/lib/api";
import { MOCK_CARDS, MOCK_USERS } from "@/lib/mock"; // MOCK — remove once api.session()/listCards() exist
import type { Card, User } from "@/lib/types";

export default function BoardPage() {
  const router = useRouter();
  const [data, setData] = useState<{ user: User; members: User[]; cards: Card[] } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ user, members }, cards] = await Promise.all([api.session(), api.listCards()]);
        setData({ user, members, cards });
      } catch {
        // MOCK fallback so the UI runs before the backend exists. Delete this branch (and redirect to /login) once wired.
        setData({ user: MOCK_USERS[0], members: MOCK_USERS, cards: MOCK_CARDS });
      }
    })();
  }, []);

  if (!data) return <div className="flex flex-1 items-center justify-center text-sm text-faint">Loading…</div>;

  return (
    <Board key={data.user.role} user={data.user} members={data.members} initialCards={data.cards}
      onSignOut={async () => { try { await api.signOut(); } finally { router.push("/login"); } }}
      // DEMO ONLY — flips the role client-side to preview the member UI. Remove in production.
      onSwitchRole={() => setData((d) => d && { ...d, user: { ...d.user, role: d.user.role === "admin" ? "member" : "admin" } })} />
  );
}
