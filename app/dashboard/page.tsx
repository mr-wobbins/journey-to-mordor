import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { MilestonePath } from "@/components/milestone-path";
import { ProgressRing } from "@/components/progress-ring";
import { SyncButton } from "@/components/sync-button";
import { ManualMilesForm } from "@/components/manual-miles-form";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMiles, TOTAL_JOURNEY_MILES } from "@/lib/journey";
import { getUserJourney } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const progress = await getUserJourney(user.id);

  const activities = await prisma.activity.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 12,
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader userName={user.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-20 pt-4 md:px-10">
        <div className="animate-rise flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--leaf)]">
              Your path
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--parchment)] md:text-5xl">
              {progress.currentMilestone.name}
            </h1>
            <p className="mt-3 text-[var(--mist)]">
              {formatMiles(progress.totalMiles)} of{" "}
              {TOTAL_JOURNEY_MILES.toLocaleString()} miles —{" "}
              {formatMiles(progress.milesRemaining)} remaining to Mount Doom.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <SyncButton />
              <Link
                href="/fellowship"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Fellowship
              </Link>
            </div>
          </div>
          <ProgressRing
            percent={progress.percentComplete}
            label={`${Math.round(progress.percentComplete)}%`}
            sublabel="to Mount Doom"
          />
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="animate-rise-delay">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--parchment)]">
              The Road
            </h2>
            <div className="mt-6">
              <MilestonePath progress={progress} />
            </div>
          </section>

          <div className="space-y-10">
            <section className="animate-rise-delay-2">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--parchment)]">
                Add miles
              </h2>
              <p className="mt-2 text-sm text-[var(--mist)]">
                For walks that never made it to Strava.
              </p>
              <div className="mt-4">
                <ManualMilesForm />
              </div>
            </section>

            <section className="animate-rise-delay-2">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--parchment)]">
                Recent steps
              </h2>
              {activities.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--mist)]">
                  No miles yet. Sync Strava or add a manual entry.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-[var(--mist)]/15">
                  {activities.map((activity) => (
                    <li
                      key={activity.id}
                      className="flex items-baseline justify-between gap-4 py-3"
                    >
                      <div>
                        <p className="text-[var(--parchment)]">{activity.name}</p>
                        <p className="text-xs text-[var(--mist)]">
                          {activity.source === "STRAVA" ? "Strava" : "Manual"} ·{" "}
                          {activity.sportType} ·{" "}
                          {activity.startedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <span className="tabular-nums text-[var(--ember)]">
                        {formatMiles(activity.distanceMiles)} mi
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
