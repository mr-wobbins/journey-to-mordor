import { SiteHeader } from "@/components/site-header";
import {
  CreateFellowshipForm,
  InviteFriendForm,
  JoinFellowshipForm,
  LeaveFellowshipButton,
} from "@/components/fellowship-forms";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMiles, getJourneyProgress } from "@/lib/journey";

export const dynamic = "force-dynamic";

export default async function FellowshipPage() {
  const user = await requireUser();

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { fellowship: true },
  });

  let leaderboard: {
    userId: string;
    name: string;
    totalMiles: number;
    place: string;
  }[] = [];

  if (membership) {
    const members = await prisma.membership.findMany({
      where: { fellowshipId: membership.fellowshipId },
      include: { user: true },
    });

    const totals = await Promise.all(
      members.map(async (member) => {
        const agg = await prisma.activity.aggregate({
          where: { userId: member.userId },
          _sum: { distanceMiles: true },
        });
        const totalMiles = agg._sum.distanceMiles ?? 0;
        const progress = getJourneyProgress(totalMiles);
        return {
          userId: member.userId,
          name: member.user.name,
          totalMiles,
          place: progress.currentMilestone.name,
        };
      }),
    );

    leaderboard = totals.sort((a, b) => b.totalMiles - a.totalMiles);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader userName={user.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-20 pt-4 md:px-10">
        <p className="animate-rise text-sm uppercase tracking-[0.2em] text-[var(--leaf)]">
          Shared road
        </p>
        <h1 className="animate-rise-delay mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--parchment)] md:text-5xl">
          Fellowship
        </h1>
        <p className="animate-rise-delay-2 mt-3 max-w-xl text-[var(--mist)]">
          Create a company of walkers or join with an invite code. Rankings use
          Strava foot miles plus anything you log by hand.
        </p>

        {!membership ? (
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <section className="animate-rise space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--parchment)]">
                Found a fellowship
              </h2>
              <CreateFellowshipForm />
            </section>
            <section className="animate-rise-delay space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--parchment)]">
                Join one
              </h2>
              <JoinFellowshipForm />
            </section>
          </div>
        ) : (
          <div className="mt-12 space-y-10">
            <section className="animate-rise">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--parchment)]">
                    {membership.fellowship.name}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--mist)]">
                    Invite code{" "}
                    <span className="font-mono tracking-widest text-[var(--ember)]">
                      {membership.fellowship.inviteCode}
                    </span>
                  </p>
                </div>
                <LeaveFellowshipButton />
              </div>
            </section>

            <section className="animate-rise-delay max-w-md">
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--parchment)]">
                Invite a friend
              </h3>
              <p className="mt-2 text-sm text-[var(--mist)]">
                We&apos;ll text them a link to connect Strava and join this
                fellowship.
              </p>
              <div className="mt-4">
                <InviteFriendForm />
              </div>
            </section>

            <section className="animate-rise-delay">
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--parchment)]">
                Leaderboard
              </h3>
              <ol className="mt-6 divide-y divide-[var(--mist)]/15">
                {leaderboard.map((entry, index) => (
                  <li
                    key={entry.userId}
                    className="flex items-baseline justify-between gap-4 py-4"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="w-6 tabular-nums text-[var(--mist)]">
                        {index + 1}
                      </span>
                      <div>
                        <p
                          className={
                            entry.userId === user.id
                              ? "text-[var(--ember)]"
                              : "text-[var(--parchment)]"
                          }
                        >
                          {entry.name}
                          {entry.userId === user.id ? " (you)" : ""}
                        </p>
                        <p className="text-sm text-[var(--mist)]">
                          {entry.place}
                        </p>
                      </div>
                    </div>
                    <span className="tabular-nums text-[var(--leaf)]">
                      {formatMiles(entry.totalMiles)} mi
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
