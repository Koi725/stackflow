"use client";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors, type DragEndEvent, type DragStartEvent, type DragOverEvent } from "@dnd-kit/core";
import { LayoutGroup } from "framer-motion";
import { Lock } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { canAssign, canDelete, canEdit, canManageBoard } from "@/lib/permissions";
import { COLUMNS, PRIORITIES } from "@/lib/tokens";
import type { Card as CardT, ColumnId, Filter, Profile as ProfileT, User } from "@/lib/types";
import { BoardHeader } from "./BoardHeader";
import { Card, CardFace } from "./Card";
import { CardComposer, type ComposerInput } from "./CardComposer";
import { CardDetail } from "./CardDetail";
import { Column } from "./Column";
import { ManagePanel } from "./ManagePanel";
import { Profile } from "./Profile";
import { Toast } from "./Toast";
import { Tour } from "./Tour";

type Modal =
  | { type: "detail"; id: string }
  | { type: "compose"; id?: string; column?: ColumnId }
  | { type: "manage" }
  | { type: "profile" }
  | { type: "tour" }
  | null;

export function Board({ user: initialUser, members: initialMembers, initialCards, onSignOut }: {
  user: User; members: User[]; initialCards: CardT[]; onSignOut: () => void;
}) {
  // user/members are stateful so a profile edit (name, avatar) reflects instantly
  // across the header and the board without a reload.
  const [user, setUser] = useState(initialUser);
  const [members, setMembers] = useState(initialMembers);
  const [cards, setCards] = useState(initialCards);
  const [filter, setFilter] = useState<Filter>("all");
  const [modal, setModal] = useState<Modal>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<ColumnId | null>(null);
  const [toast, setToastMsg] = useState<string | null>(null);

  const toastRef = useMemo(() => ({ t: 0 as ReturnType<typeof setTimeout> | 0 }), []);
  const showToast = useCallback((m: string) => { clearTimeout(toastRef.t); setToastMsg(m); toastRef.t = setTimeout(() => setToastMsg(null), 2200); }, [toastRef]);

  const byId = (id: string) => cards.find((c) => c.id === id);
  const ownerOf = (c: CardT) => members.find((m) => m.id === c.ownerId) ?? user;
  const visible = cards.filter((c) => (filter === "mine" ? c.ownerId === user.id : filter === "high" ? c.priority === "high" : true));

  // 6px activation distance = click vs drag threshold from the design
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }));

  const move = async (id: string, column: ColumnId) => {
    const prev = cards; const card = byId(id); if (!card || card.column === column) return;
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, column } : c))); // optimistic
    showToast(`Moved to ${COLUMNS.find((c) => c.id === column)!.name}`);
    try { await api.moveCard(id, column); } catch { setCards(prev); showToast("Couldn't move card"); }
  };
  const remove = async (id: string) => {
    const prev = cards; setCards((cs) => cs.filter((c) => c.id !== id)); setModal(null); showToast("Card deleted");
    try { await api.deleteCard(id); } catch { setCards(prev); showToast("Couldn't delete card"); }
  };
  const save = async (input: ComposerInput) => {
    if (modal?.type === "compose" && modal.id) {
      const id = modal.id; const prev = cards;
      setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...input } : c))); setModal({ type: "detail", id }); showToast("Card updated");
      try { const saved = await api.updateCard(id, input); setCards((cs) => cs.map((c) => (c.id === id ? saved : c))); } catch { setCards(prev); showToast("Couldn't save"); }
    } else {
      const tmpId = `tmp-${Date.now()}`;
      const tmp: CardT = { id: tmpId, ...input, ownerId: input.ownerId ?? user.id, needsHelp: false, createdAt: new Date().toISOString() };
      setCards((cs) => [...cs, tmp]); setModal(null); showToast("Card created");
      try { const saved = await api.createCard(input); setCards((cs) => cs.map((c) => (c.id === tmpId ? saved : c))); } catch { setCards((cs) => cs.filter((c) => c.id !== tmpId)); showToast("Couldn't create card"); }
    }
  };
  const toggleHelp = async (id: string, needsHelp: boolean) => {
    const prev = cards;
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, needsHelp } : c))); // optimistic
    try { const saved = await api.updateCard(id, { needsHelp }); setCards((cs) => cs.map((c) => (c.id === id ? saved : c))); }
    catch { setCards(prev); showToast("Couldn't update help flag"); }
  };

  // Reflect a saved profile everywhere: the current user + their entry in members
  // (so their own cards' avatars update too).
  const onProfileSaved = (p: ProfileT) => {
    const patch = { name: p.name, initials: p.initials, avatarUrl: p.avatarUrl };
    setUser((u) => ({ ...u, ...patch }));
    setMembers((ms) => ms.map((m) => (m.id === p.id ? { ...m, ...patch } : m)));
  };

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragOver = (e: DragOverEvent) => setOverCol((e.over?.id as ColumnId) ?? null);
  const onDragEnd = (e: DragEndEvent) => { const col = e.over?.id as ColumnId | undefined; if (col) move(String(e.active.id), col); setActiveId(null); setOverCol(null); };

  const active = activeId ? byId(activeId) : null;
  const detail = modal?.type === "detail" ? byId(modal.id) ?? null : null;
  const composeInitial = modal?.type === "compose" && modal.id ? byId(modal.id) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-wipe">
      <BoardHeader user={user} boardName="Launch v2" filter={filter} onFilter={setFilter} onManage={() => setModal({ type: "manage" })}
        onNew={() => setModal({ type: "compose" })} onSignOut={onSignOut}
        onHelp={() => setModal({ type: "tour" })} onProfile={() => setModal({ type: "profile" })} />
      {user.role === "member" && (
        <div className="flex items-center gap-2.5 border-b border-hairline px-[clamp(16px,3vw,32px)] py-2.5 text-[13px] text-muted"><Lock size={14} />Drag your own cards. Teammates' cards are read-only.</div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => { setActiveId(null); setOverCol(null); }}>
        <div className="min-h-0 flex-1 snap-x snap-proximity overflow-auto px-[clamp(16px,3vw,32px)] pb-8">
          <LayoutGroup>
            <div className="grid min-h-full grid-cols-[repeat(4,minmax(250px,1fr))]">
              {COLUMNS.map((col, i) => {
                const list = visible.filter((c) => c.column === col.id);
                return (
                  <Column key={col.id} id={col.id} name={col.name} count={list.length} isLast={i === COLUMNS.length - 1} emptyText={col.emptyText}
                    canManage={canManageBoard(user)} onManage={() => setModal({ type: "manage" })} onAdd={() => setModal({ type: "compose", column: col.id })}>
                    {list.map((c) => (
                      <Card key={c.id} card={c} owner={ownerOf(c)} canMove={canEdit(user, c)} canDelete={canDelete(user)}
                        onOpen={(id) => setModal({ type: "detail", id })} onDelete={remove} />
                    ))}
                  </Column>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
        <DragOverlay dropAnimation={{ duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }}>
          {active && (
            <div className="flex flex-col gap-2 bg-surface-2 px-3.5 py-3 shadow-ghost" style={{ transform: "rotate(1.5deg) scale(1.04)", borderTop: `3px solid ${PRIORITIES[active.priority].hex}` }}>
              <CardFace card={active} owner={ownerOf(active)} canMove canDelete={false} ghost
                hint={overCol && overCol !== active.column ? `Release → ${COLUMNS.find((c) => c.id === overCol)!.name}` : "Drag to a column"} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CardDetail card={detail} owner={detail ? ownerOf(detail) : undefined} canEdit={!!detail && canEdit(user, detail)} canDelete={canDelete(user)}
        onClose={() => setModal(null)} onMove={(col) => detail && move(detail.id, col)} onEdit={() => detail && setModal({ type: "compose", id: detail.id })} onDelete={() => detail && remove(detail.id)}
        onToggleHelp={(v) => detail && toggleHelp(detail.id, v)} />
      <CardComposer open={modal?.type === "compose"} initial={composeInitial ? { title: composeInitial.title, description: composeInitial.description, label: composeInitial.label, priority: composeInitial.priority, column: composeInitial.column, ownerId: composeInitial.ownerId } : null}
        defaultColumn={modal?.type === "compose" ? modal.column : undefined} currentUserId={user.id} members={members} canAssign={canAssign(user)} onClose={() => setModal(null)} onSave={save} />
      <ManagePanel open={modal?.type === "manage"} cards={cards} onClose={() => setModal(null)} />
      <Profile open={modal?.type === "profile"} onClose={() => setModal(null)} onSaved={onProfileSaved} />
      <Tour open={modal?.type === "tour"} onClose={() => setModal(null)} />
      <Toast message={toast} />
    </div>
  );
}
