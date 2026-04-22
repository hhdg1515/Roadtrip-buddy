import { Badge } from "@/components/ui/badge";
import type { DecisionStatus } from "@/lib/decision-layer";
import { cn } from "@/lib/utils";

function toneClasses(_level: DecisionStatus["level"], variant: "light" | "dark") {
  if (variant === "dark") {
    return "bg-white/5 text-white";
  }

  return "bg-[linear-gradient(180deg,rgba(250,247,241,0.98)_0%,rgba(247,242,234,0.92)_100%)] text-foreground";
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
  const visibleSignals = compact ? decision.signals.slice(0, 2) : decision.signals.slice(0, 2);
  const headline = headlineForLevel(decision.level);

  return (
    <div
      className={cn(
        "rounded-[18px] p-5",
        toneClasses(decision.level, variant),
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <DecisionStatusBadge decision={decision} />
          <h3 className={cn("text-lg font-semibold leading-6", headlineToneClasses(decision.level, variant))}>
            {headline}
          </h3>
        </div>
      </div>

      {visibleSignals.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm leading-5">
          {visibleSignals.map((signal) => (
            <li key={`${signal.level}-${signal.label}-${signal.detail}`} className="grid grid-cols-[72px_1fr] gap-3">
              <span className={cn("text-xs", variant === "dark" ? "text-white/60" : "text-muted")}>
                {compactSignalLabel(signal)}
              </span>
              <span className={cn(variant === "dark" ? "text-white/88" : "text-foreground")}>
                {compactSignalValue(signal)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function headlineToneClasses(level: DecisionStatus["level"], variant: "light" | "dark") {
  if (variant === "dark") {
    return "text-white";
  }

  if (level === "block") return "text-danger";
  if (level === "warn") return "text-sun";
  return "text-[#335c50]";
}

function headlineForLevel(level: DecisionStatus["level"]) {
  if (level === "block") return "Access blocked";
  if (level === "warn") return "Check access first";
  return "No hard blockers";
}

function compactSignalLabel(signal: DecisionStatus["signals"][number]) {
  if (signal.source === "route") return "Route";
  if (signal.source === "fire") return "Fire";
  if (signal.source === "park") return "Park";

  if (signal.source === "weather") {
    if (/heat risk/i.test(signal.detail)) return "Heat";
    if (/snow risk/i.test(signal.detail)) return "Snow";
    if (/peak wind/i.test(signal.detail)) return "Wind";
    if (/precipitation risk/i.test(signal.detail)) return "Rain";
    return "Weather";
  }

  return "Alert";
}

function compactSignalValue(signal: DecisionStatus["signals"][number]) {
  const detail = signal.detail.replace(/\.$/, "");

  const heatMatch = detail.match(/Heat risk is (.+)/i);
  if (heatMatch) return heatMatch[1];

  const snowMatch = detail.match(/Snow risk is (.+)/i);
  if (snowMatch) return snowMatch[1];

  const windMatch = detail.match(/Peak wind is (.+)/i);
  if (windMatch) return windMatch[1];

  const rainMatch = detail.match(/Precipitation risk is (.+)/i);
  if (rainMatch) return rainMatch[1];

  const forecastMatch = detail.match(/Forecast is roughly (.+)/i);
  if (forecastMatch) return forecastMatch[1];

  return detail;
}
