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

export function InviteFriendForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      setSent(false);

      const phone = String(formData.get("phone") ?? "");
      const res = await fetch("/api/fellowship/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not send the invite");
        return;
      }
      setSent(true);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <label className="block space-y-1 text-sm">
        <span className="text-[var(--mist)]">Friend&apos;s mobile number</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          required
          className="w-full rounded-xl border border-[var(--mist)]/25 bg-[var(--deep)]/60 px-3 py-2 text-[var(--parchment)] outline-none focus:border-[var(--ember)]"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Text invite"}
      </Button>
      <p className="text-xs text-[var(--mist)]">
        Include the country code. Up to 5 invites per hour.
      </p>
      {sent ? <p className="text-sm text-[var(--leaf)]">Invite sent.</p> : null}
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
