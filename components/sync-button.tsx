"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function SyncButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setMessage(null);
    setError(null);

    const res = await fetch("/api/strava/sync", { method: "POST" });
    const data = (await res.json()) as {
      error?: string;
      upserted?: number;
      retryAfterSeconds?: number;
    };

    if (!res.ok) {
      setError(
        data.error ??
          (res.status === 429
            ? "Strava is busy — try again later"
            : "Sync failed")
      );
      return;
    }

    setMessage(
      data.upserted === 0
        ? "Synced — no new foot miles"
        : `Synced ${data.upserted} activities`
    );
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={handleSync} disabled={pending} size="lg">
        {pending ? "Syncing…" : "Sync Strava"}
      </Button>
      {message ? (
        <p className="text-sm text-[var(--leaf)]">{message}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-[var(--ash-red)]">{error}</p>
      ) : null}
    </div>
  );
}
