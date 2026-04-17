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
  excellent: "text-pine",
  good: "text-ocean",
  mixed: "text-sun",
  weak: "text-danger",
};

const sizeClasses: Record<FitScoreBadgeSize, string> = {
  sm: "px-2 py-0.5 text-[0.65rem]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
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

  if (tone === "good") {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      aria-label={`Trip fit ${label.toLowerCase()}, score ${score} of 100`}
    >
      <span>{label}</span>
      {showScore ? (
        <span className="text-foreground/70 tabular-nums">
          {score}
        </span>
      ) : null}
    </span>
  );
}
