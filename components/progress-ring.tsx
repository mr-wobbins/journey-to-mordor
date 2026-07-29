"use client";

type ProgressRingProps = {
  percent: number;
  label: string;
  sublabel: string;
};

export function ProgressRing({ percent, label, sublabel }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative mx-auto flex size-40 items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="color-mix(in oklch, var(--mist) 20%, transparent)"
          strokeWidth="6"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--ember)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--parchment)]">
          {label}
        </span>
        <span className="text-xs text-[var(--mist)]">{sublabel}</span>
      </div>
    </div>
  );
}
