import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  userName?: string | null;
};

export function SiteHeader({ userName }: SiteHeaderProps) {
  return (
    <header className="relative z-10 flex items-center justify-between gap-4 px-6 py-5 md:px-10">
      <Link
        href={userName ? "/dashboard" : "/"}
        className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-lg tracking-wide text-[var(--ember)] transition-opacity hover:opacity-80"
      >
        <Image
          src="/site-logo.png"
          alt=""
          width={36}
          height={36}
          priority
          suppressHydrationWarning
          className="size-9 rounded-full border border-[var(--ember)]/60 object-cover shadow-sm"
        />
        <span>Journey to Mordor</span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        {userName ? (
          <>
            <Link
              href="/dashboard"
              className="hidden text-sm text-[var(--mist)] transition-colors hover:text-[var(--parchment)] sm:inline"
            >
              Path
            </Link>
            <Link
              href="/fellowship"
              className="hidden text-sm text-[var(--mist)] transition-colors hover:text-[var(--parchment)] sm:inline"
            >
              Fellowship
            </Link>
            <span className="hidden text-sm text-[var(--mist)]/70 md:inline">
              {userName}
            </span>
            <a
              href="/api/auth/logout"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Sign out
            </a>
          </>
        ) : null}
      </nav>
    </header>
  );
}
