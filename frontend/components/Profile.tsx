"use client";
import { Loader2, Upload, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { Kicker, Modal, ModalFooter, ModalHeader } from "./Modal";

// Self-service profile. The user edits ONLY their own first name, last name, age
// and avatar — role and email are shown read-only. Everything is enforced again
// on the server (identity from session), this is just the UI.
export function Profile({ open, onClose, onSaved }: {
  open: boolean; onClose: () => void; onSaved: (p: Profile) => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    api.getProfile().then((p) => {
      setProfile(p);
      setFirstName(p.firstName ?? "");
      setLastName(p.lastName ?? "");
      setAge(p.age != null ? String(p.age) : "");
    }).catch(() => setError("Couldn't load your profile."));
  }, [open]);

  const apply = (p: Profile) => { setProfile(p); onSaved(p); };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setUploading(true); setError(null);
    try { apply(await api.uploadAvatar(file)); }
    catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setUploading(false); }
  };

  const save = async () => {
    setBusy(true); setError(null);
    try {
      const trimmed = age.trim();
      apply(await api.updateProfile({
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        age: trimmed === "" ? null : Number(trimmed),
      }));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your profile.");
    } finally { setBusy(false); }
  };

  const input = "min-h-[44px] w-full border border-rule bg-bg px-3.5 py-2.5 text-[15px]";
  const admin = profile?.role === "admin";

  return (
    <Modal open={open} onClose={onClose} width={520}>
      <ModalHeader onClose={onClose}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">Your profile</span>
      </ModalHeader>
      <div className="flex flex-col gap-5 p-6">
        {/* Avatar + upload */}
        <div className="flex items-center gap-4">
          <span className="grid h-[72px] w-[72px] place-items-center overflow-hidden bg-surface-3 text-xl font-extrabold text-ink">
            {profile?.avatarUrl
              ? <img src={profile.avatarUrl} alt={profile.name} width={72} height={72} className="h-[72px] w-[72px] object-cover" />
              : (profile?.initials ?? <UserRound size={26} className="text-muted" />)}
          </span>
          <div className="flex flex-col gap-1.5">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="inline-flex min-h-[40px] items-center gap-2 border border-rule px-3.5 text-[13px] font-semibold hover:bg-ink/[.08] disabled:opacity-50">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? "Uploading…" : "Upload picture"}
            </button>
            <span className="text-[11px] text-faint">JPG, PNG or WebP · max 2 MB</span>
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={onPickFile} className="hidden" />
          </div>
        </div>

        {/* Read-only identity */}
        <div className="grid grid-cols-2 gap-3.5 border-y border-hairline py-4">
          <div><Kicker>Email</Kicker><span className="text-[13px] text-muted">{profile?.email ?? "—"}</span></div>
          <div><Kicker>Role (read-only)</Kicker>
            <span className={`inline-flex border border-rule px-2 py-[3px] text-[10px] uppercase tracking-[0.1em] ${admin ? "bg-accent text-ink" : "text-muted"}`}>
              {profile ? (admin ? "Admin" : "Member") : "—"}
            </span>
          </div>
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5 text-xs text-muted">First name
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={80} placeholder="First" className={input} /></label>
          <label className="flex flex-col gap-1.5 text-xs text-muted">Last name
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={80} placeholder="Last" className={input} /></label>
        </div>
        <label className="flex max-w-[160px] flex-col gap-1.5 text-xs text-muted">Age
          <input value={age} onChange={(e) => setAge(e.target.value)} type="number" min={0} max={120} placeholder="—" className={input} /></label>

        {error && <div role="alert" className="border border-accent-soft/50 px-3.5 py-3 text-[13px] text-accent-soft">{error}</div>}
      </div>
      <ModalFooter>
        <button type="button" onClick={save} disabled={busy || !profile}
          className="inline-flex min-h-[44px] items-center gap-2 bg-accent px-[18px] text-[13px] font-extrabold text-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-45">
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onClose} className="ml-auto min-h-[44px] px-3 text-[13px] font-semibold text-muted hover:text-ink">Close</button>
      </ModalFooter>
    </Modal>
  );
}
