"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function ManualMilesForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setOk(false);

    const miles = Number(formData.get("miles"));
    const name = String(formData.get("name") ?? "");
    const date = String(formData.get("date") ?? "");

    const res = await fetch("/api/activities/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ miles, name, date: date || undefined }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not add miles");
      return;
    }

    setOk(true);
    startTransition(() => router.refresh());
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--mist)]">Miles</span>
          <input
            name="miles"
            type="number"
            step="0.1"
            min="0.1"
            max="200"
            required
            className="w-full rounded-xl border border-[var(--mist)]/25 bg-[var(--deep)]/60 px-3 py-2 text-[var(--parchment)] outline-none focus:border-[var(--ember)]"
          />
        </label>
        <label className="block space-y-1 text-sm sm:col-span-2">
          <span className="text-[var(--mist)]">Label</span>
          <input
            name="name"
            type="text"
            placeholder="Evening walk, dog loop…"
            className="w-full rounded-xl border border-[var(--mist)]/25 bg-[var(--deep)]/60 px-3 py-2 text-[var(--parchment)] outline-none focus:border-[var(--ember)]"
          />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-[var(--mist)]">Date</span>
        <input
          name="date"
          type="date"
          className="w-full rounded-xl border border-[var(--mist)]/25 bg-[var(--deep)]/60 px-3 py-2 text-[var(--parchment)] outline-none focus:border-[var(--ember)] sm:max-w-xs"
        />
      </label>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Adding…" : "Add manual miles"}
      </Button>
      {ok ? (
        <p className="text-sm text-[var(--leaf)]">Miles added to the road.</p>
      ) : null}
      {error ? <p className="text-sm text-[var(--ash-red)]">{error}</p> : null}
    </form>
  );
}
