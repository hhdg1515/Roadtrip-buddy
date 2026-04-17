import { cn } from "@/lib/utils";

export type RiskKind =
  | "heat"
  | "snow"
  | "road-closure"
  | "fire-smoke"
  | "crowding"
  | "remote-services"
  | "wind"
  | "shoulder-season"
  | "generic";

type RiskMeta = {
  label: string;
  tone: string;
};

const riskMeta: Record<RiskKind, RiskMeta> = {
  heat: { label: "Heat risk", tone: "text-sun" },
  snow: { label: "Snow risk", tone: "text-ocean" },
  "road-closure": { label: "Road closure", tone: "text-danger" },
  "fire-smoke": { label: "Fire / smoke", tone: "text-danger" },
  crowding: { label: "Crowded", tone: "text-sun" },
  "remote-services": { label: "Remote services", tone: "text-muted" },
  wind: { label: "Wind", tone: "text-ocean" },
  "shoulder-season": { label: "Shoulder season", tone: "text-muted" },
  generic: { label: "Note", tone: "text-muted" },
};

export function inferRiskKind(raw: string): RiskKind {
  const text = raw.toLowerCase();
  if (text.includes("heat")) return "heat";
  if (text.includes("snow") || text.includes("icy")) return "snow";
  if (text.includes("road") || text.includes("closure") || text.includes("highway")) return "road-closure";
  if (text.includes("fire") || text.includes("smoke")) return "fire-smoke";
  if (text.includes("crowd") || text.includes("parking") || text.includes("traffic")) return "crowding";
  if (text.includes("remote") || text.includes("sparse") || text.includes("service")) return "remote-services";
  if (text.includes("wind")) return "wind";
  if (text.includes("shoulder") || text.includes("access")) return "shoulder-season";
  return "generic";
}

export function RiskBadge({
  kind,
  label,
  className,
}: Readonly<{
  kind?: RiskKind;
  label?: string;
  className?: string;
}>) {
  const resolvedKind = kind ?? (label ? inferRiskKind(label) : "generic");
  const meta = riskMeta[resolvedKind];
  const text = label ?? meta.label;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 text-xs font-medium",
        meta.tone,
        className,
      )}
      role="status"
      aria-label={text}
    >
      {text}
    </span>
  );
}
