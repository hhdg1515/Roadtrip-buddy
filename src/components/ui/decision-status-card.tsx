import { Badge } from "@/components/ui/badge";
import type { DecisionStatus } from "@/lib/decision-layer";
import { cn } from "@/lib/utils";

function toneClasses(level: DecisionStatus["level"], variant: "light" | "dark") {
  if (variant === "dark") {
    if (level === "block") return "border-danger/40 bg-transparent text-white";
    if (level === "warn") return "border-sun/40 bg-transparent text-white";
    return "border-white/20 bg-transparent text-white";
  }

  if (level === "block") return "border-danger/30 bg-transparent text-foreground";
  if (level === "warn") return "border-sun/35 bg-transparent text-foreground";
  return "border-line bg-transparent text-foreground";
}

function badgeTone(level: DecisionStatus["level"]) {
  if (level === "block") return "danger" as const;
  if (level === "warn") return "warm" as const;
  return "soft" as const;
}

export function DecisionStatusBadge({
  decision,
  className,
}: Readonly<{
  decision: DecisionStatus;
  className?: string;
}>) {
  return (
    <Badge tone={badgeTone(decision.level)} className={className}>
      {decision.label}
    </Badge>
  );
}

export function DecisionStatusCard({
  decision,
  variant = "light",
  compact = false,
  className,
}: Readonly<{
  decision: DecisionStatus;
  variant?: "light" | "dark";
  compact?: boolean;
  className?: string;
}>) {
  const visibleSignals = compact ? decision.signals.slice(0, 2) : decision.signals.slice(0, 3);

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        toneClasses(decision.level, variant),
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <DecisionStatusBadge decision={decision} />
          <h3 className="text-base font-semibold">{decision.headline}</h3>
        </div>
      </div>

      <p className={cn("mt-2 text-sm leading-6", variant === "dark" ? "text-white/80" : "text-muted")}>
        {decision.guidance}
      </p>

      {visibleSignals.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm leading-6">
          {visibleSignals.map((signal) => (
            <li
              key={`${signal.level}-${signal.label}-${signal.detail}`}
              className={cn(variant === "dark" ? "text-white/80" : "text-foreground")}
            >
              <span className="font-medium">{signal.label}:</span>{" "}
              <span className={cn(variant === "dark" ? "text-white/70" : "text-muted")}>
                {signal.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
