import { cn } from "@/lib/utils";

export type ActivityKind =
  | "hiking"
  | "skiing"
  | "desert"
  | "coast"
  | "wildflowers"
  | "fall-colors"
  | "scenic-drive"
  | "cafe-town"
  | "family-friendly"
  | "non-hiker-friendly"
  | "waterfalls"
  | "photography"
  | "generic";

type ActivityMeta = {
  label: string;
};

const activityMeta: Record<ActivityKind, ActivityMeta> = {
  hiking: { label: "Hiking" },
  skiing: { label: "Skiing" },
  desert: { label: "Desert" },
  coast: { label: "Coast" },
  wildflowers: { label: "Wildflowers" },
  "fall-colors": { label: "Fall colors" },
  "scenic-drive": { label: "Scenic drive" },
  "cafe-town": { label: "Cafe / town" },
  "family-friendly": { label: "Family-friendly" },
  "non-hiker-friendly": { label: "Non-hiker friendly" },
  waterfalls: { label: "Waterfalls" },
  photography: { label: "Photography" },
  generic: { label: "Activity" },
};

export function inferActivityKind(raw: string): ActivityKind {
  const text = raw.toLowerCase();
  if (text.includes("ski") || text.includes("snow")) return "skiing";
  if (text.includes("hike") || text.includes("hiking") || text.includes("trail")) return "hiking";
  if (text.includes("desert")) return "desert";
  if (text.includes("coast") || text.includes("beach") || text.includes("ocean")) return "coast";
  if (text.includes("wildflower") || text.includes("bloom")) return "wildflowers";
  if (text.includes("fall") && text.includes("color")) return "fall-colors";
  if (text.includes("scenic") || text.includes("drive")) return "scenic-drive";
  if (text.includes("cafe") || text.includes("food") || text.includes("town")) return "cafe-town";
  if (text.includes("family")) return "family-friendly";
  if (text.includes("non-hiker") || text.includes("non hiker") || text.includes("easy")) return "non-hiker-friendly";
  if (text.includes("waterfall")) return "waterfalls";
  if (text.includes("photo")) return "photography";
  return "generic";
}

export function ActivityChip({
  kind,
  label,
  selected = false,
  size = "md",
  className,
}: Readonly<{
  kind?: ActivityKind;
  label?: string;
  selected?: boolean;
  size?: "sm" | "md";
  className?: string;
}>) {
  const resolvedKind = kind ?? (label ? inferActivityKind(label) : "generic");
  const meta = activityMeta[resolvedKind];
  const text = label ?? meta.label;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border text-xs font-medium",
        size === "sm" ? "px-2 py-0.5" : "px-2.5 py-0.5",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-line bg-transparent text-foreground",
        className,
      )}
      aria-pressed={selected}
    >
      {text}
    </span>
  );
}
