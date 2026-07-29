"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function CreateFellowshipForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const name = String(formData.get("name") ?? "");
    const res = await fetch("/api/fellowship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not create fellowship");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <label className="block space-y-1 text-sm">
        <span className="text-[var(--mist)]">Fellowship name</span>
        <input
          name="name"
          type="text"
          placeholder="Nine Walkers"
          required
          className="w-full rounded-xl border border-[var(--mist)]/25 bg-[var(--deep)]/60 px-3 py-2 text-[var(--parchment)] outline-none focus:border-[var(--ember)]"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create fellowship"}
      </Button>
      {error ? <p className="text-sm text-[var(--ash-red)]">{error}</p> : null}
    </form>
  );
}

export function JoinFellowshipForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const inviteCode = String(formData.get("inviteCode") ?? "");
    const res = await fetch("/api/fellowship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", inviteCode }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not join fellowship");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <label className="block space-y-1 text-sm">
        <span className="text-[var(--mist)]">Invite code</span>
        <input
          name="inviteCode"
          type="text"
          placeholder="A1B2C3D4"
          required
          className="w-full rounded-xl border border-[var(--mist)]/25 bg-[var(--deep)]/60 px-3 py-2 uppercase tracking-widest text-[var(--parchment)] outline-none focus:border-[var(--ember)]"
        />
      </label>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Joining…" : "Join fellowship"}
      </Button>
      {error ? <p className="text-sm text-[var(--ash-red)]">{error}</p> : null}
    </form>
  );
}

export function LeaveFellowshipButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleLeave() {
    await fetch("/api/fellowship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave" }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={handleLeave}
    >
      {pending ? "Leaving…" : "Leave fellowship"}
    </Button>
  );
}
