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
  icon: string;
};

const activityMeta: Record<ActivityKind, ActivityMeta> = {
  hiking: { label: "Hiking", icon: "⛰" },
  skiing: { label: "Skiing", icon: "⛷" },
  desert: { label: "Desert", icon: "◌" },
  coast: { label: "Coast", icon: "≈" },
  wildflowers: { label: "Wildflowers", icon: "✿" },
  "fall-colors": { label: "Fall colors", icon: "🍂" },
  "scenic-drive": { label: "Scenic drive", icon: "→" },
  "cafe-town": { label: "Cafe / town", icon: "☕" },
  "family-friendly": { label: "Family-friendly", icon: "◆" },
  "non-hiker-friendly": { label: "Non-hiker friendly", icon: "◇" },
  waterfalls: { label: "Waterfalls", icon: "∿" },
  photography: { label: "Photography", icon: "◉" },
  generic: { label: "Activity", icon: "•" },
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
        "inline-flex items-center gap-1.5 rounded-full border text-xs font-semibold tracking-[0.08em]",
        size === "sm" ? "px-2.5 py-0.5" : "px-3 py-1",
        selected
          ? "border-ocean bg-ocean text-white shadow-[0_6px_18px_rgba(37,93,108,0.25)]"
          : "border-line bg-white/65 text-foreground hover:bg-white",
        className,
      )}
      aria-pressed={selected}
    >
      <span aria-hidden className="text-sm leading-none">
        {meta.icon}
      </span>
      <span>{text}</span>
    </span>
  );
}
