import { MILESTONES, type JourneyProgress } from "@/lib/journey";
import { cn } from "@/lib/utils";

type MilestonePathProps = {
  progress: JourneyProgress;
};

export function MilestonePath({ progress }: MilestonePathProps) {
  return (
    <ol className="relative space-y-0 border-l border-[var(--mist)]/25 pl-6">
      {MILESTONES.map((milestone, index) => {
        const arrived =
          progress.totalMiles >= milestone.cumulativeMiles ||
          milestone.cumulativeMiles === 0;
        const isCurrent = progress.currentMilestone.id === milestone.id;
        const isNext = progress.nextMilestone?.id === milestone.id;

        return (
          <li
            key={milestone.id}
            className={cn(
              "relative pb-6 last:pb-0 transition-opacity duration-700",
              arrived || isNext ? "opacity-100" : "opacity-40"
            )}
            style={{ transitionDelay: `${index * 40}ms` }}
          >
            <span
              className={cn(
                "absolute -left-[1.9rem] top-1 size-3 rounded-full border-2",
                isCurrent &&
                  "border-[var(--ember)] bg-[var(--ember)] shadow-[0_0_12px_color-mix(in_oklch,var(--ember)_50%,transparent)]",
                arrived &&
                  !isCurrent &&
                  "border-[var(--leaf)] bg-[var(--leaf)]",
                !arrived &&
                  "border-[var(--mist)]/40 bg-[var(--deep)]"
              )}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3
                className={cn(
                  "font-[family-name:var(--font-display)] text-lg",
                  isCurrent ? "text-[var(--ember)]" : "text-[var(--parchment)]"
                )}
              >
                {milestone.name}
              </h3>
              <span className="text-xs tabular-nums text-[var(--mist)]">
                {milestone.cumulativeMiles} mi
              </span>
            </div>
            <p className="mt-1 max-w-prose text-sm text-[var(--mist)]">
              {milestone.description}
            </p>
            {isCurrent && progress.nextMilestone ? (
              <p className="mt-2 text-sm text-[var(--leaf)]">
                {progress.milesToNext.toFixed(1)} miles to{" "}
                {progress.nextMilestone.name}
              </p>
            ) : null}
            {isCurrent && progress.ringDestroyed ? (
              <p className="mt-2 text-sm text-[var(--ember)]">
                The Ring is destroyed. The journey is complete.
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
