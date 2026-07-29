"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type InviteShareProps = {
  inviteUrl: string;
  fellowshipName: string;
};

export function InviteShare({ inviteUrl, fellowshipName }: InviteShareProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copyLink() {
    setError(null);
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link");
    }
  }

  async function shareLink() {
    setError(null);

    if (typeof navigator.share !== "function") {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: "Journey to Mordor",
        text: `Join “${fellowshipName}” on Journey to Mordor — connect Strava and walk to Mount Doom with us.`,
        url: inviteUrl,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copyLink();
    }
  }

  return (
    <div className="space-y-3">
      <label className="block space-y-1 text-sm">
        <span className="text-[var(--mist)]">Invite link</span>
        <input
          readOnly
          value={inviteUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-xl border border-[var(--mist)]/25 bg-[var(--deep)]/60 px-3 py-2 font-mono text-sm text-[var(--parchment)] outline-none focus:border-[var(--ember)]"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={copyLink}>
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button type="button" variant="secondary" onClick={shareLink}>
          Share
        </Button>
      </div>
      <p className="text-xs text-[var(--mist)]">
        Friends open the link, connect Strava, and join automatically.
      </p>
      {error ? <p className="text-sm text-[var(--ash-red)]">{error}</p> : null}
    </div>
  );
}
