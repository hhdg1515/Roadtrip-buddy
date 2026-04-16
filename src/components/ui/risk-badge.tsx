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
  icon: string;
  tone: string;
};

const riskMeta: Record<RiskKind, RiskMeta> = {
  heat: { label: "Heat risk", icon: "☀", tone: "bg-sun/14 text-sun" },
  snow: { label: "Snow risk", icon: "❄", tone: "bg-ocean/12 text-ocean" },
  "road-closure": {
    label: "Road closure risk",
    icon: "⚠",
    tone: "bg-danger/12 text-danger",
  },
  "fire-smoke": {
    label: "Fire / smoke risk",
    icon: "🔥",
    tone: "bg-danger/14 text-danger",
  },
  crowding: {
    label: "Crowding risk",
    icon: "●",
    tone: "bg-sun/12 text-sun",
  },
  "remote-services": {
    label: "Remote services",
    icon: "◎",
    tone: "bg-muted-soft text-muted",
  },
  wind: { label: "Wind risk", icon: "↯", tone: "bg-ocean/10 text-ocean" },
  "shoulder-season": {
    label: "Shoulder-season access",
    icon: "◐",
    tone: "bg-muted-soft text-muted",
  },
  generic: { label: "Condition note", icon: "•", tone: "bg-muted-soft text-muted" },
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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase",
        meta.tone,
        className,
      )}
      role="status"
      aria-label={text}
    >
      <span aria-hidden className="text-sm leading-none">
        {meta.icon}
      </span>
      <span>{text}</span>
    </span>
  );
}
