import { cn } from "@/lib/utils";
import { labelTripFitScore } from "@/lib/scoring/trip-fit";

type FitScoreBadgeSize = "sm" | "md" | "lg";

type FitScoreTone = "excellent" | "good" | "mixed" | "weak";

function toneForScore(score: number): FitScoreTone {
  if (score >= 85) return "excellent";
  if (score >= 74) return "good";
  if (score >= 62) return "mixed";
  return "weak";
}

const toneClasses: Record<FitScoreTone, string> = {
  excellent: "bg-pine/15 text-pine",
  good: "bg-ocean/12 text-ocean",
  mixed: "bg-sun/14 text-sun",
  weak: "bg-danger/12 text-danger",
};

const sizeClasses: Record<FitScoreBadgeSize, string> = {
  sm: "px-2.5 py-1 text-[0.65rem]",
  md: "px-3 py-1.5 text-xs",
  lg: "px-4 py-2 text-sm",
};

export function FitScoreBadge({
  score,
  showScore = true,
  size = "md",
  className,
}: Readonly<{
  score: number;
  showScore?: boolean;
  size?: FitScoreBadgeSize;
  className?: string;
}>) {
  const tone = toneForScore(score);
  const label = labelTripFitScore(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-semibold tracking-[0.14em] uppercase",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      aria-label={`Trip fit ${label.toLowerCase()}, score ${score} of 100`}
    >
      <span>{label}</span>
      {showScore ? (
        <span className="rounded-full bg-white/55 px-2 py-0.5 text-[0.65em] font-bold tabular-nums text-foreground">
          {score}
        </span>
      ) : null}
    </span>
  );
}
