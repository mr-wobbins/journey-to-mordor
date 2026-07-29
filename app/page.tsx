import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { TOTAL_JOURNEY_MILES } from "@/lib/journey";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, string> = {
  strava_denied: "Strava authorization was cancelled.",
  strava_state: "Security check failed. Please try connecting again.",
  strava_athlete: "Could not read your Strava athlete profile.",
  strava_token:
    "Strava rejected the token exchange. Check STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.",
  strava_callback: "Strava login failed. Check your API credentials.",
  strava_config:
    "Strava is not configured on this server. STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET is missing.",
  strava_rate_limit: "Strava is busy — try again in a few minutes.",
  database:
    "Signed in with Strava, but the database rejected the write. Run migrations against Neon.",
};

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const errorMessage = params.error
    ? (ERROR_MESSAGES[params.error] ?? "Something went wrong.")
    : null;

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="mist-layer pointer-events-none absolute inset-x-0 top-0 h-[55vh] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--mist)_12%,transparent),transparent_70%)]"
      />
      <SiteHeader />
      <main className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-16 pt-8 md:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <p className="animate-rise text-sm uppercase tracking-[0.25em] text-[var(--leaf)]">
            A fellowship walking challenge
          </p>
          <h1 className="animate-rise-delay mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--parchment)] md:text-7xl">
            Journey to Mordor
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-[var(--mist)]">
            Sync your walks and runs from Strava, add the odd manual mile, and
            track {TOTAL_JOURNEY_MILES.toLocaleString()} miles from Hobbiton to
            Mount Doom — together.
          </p>
          <div className="animate-rise-delay-2 mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/api/auth/strava"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Connect with Strava
            </a>
          </div>
          {errorMessage ? (
            <p className="mt-6 text-sm text-[var(--ash-red)]">{errorMessage}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
