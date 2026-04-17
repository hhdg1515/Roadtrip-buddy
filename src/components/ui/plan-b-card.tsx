import { cn } from "@/lib/utils";

export type PlanBFields = {
  trigger: string;
  alternative: string;
  whyItWorks: string;
  timeDifference: string;
};

export function PlanBCard({
  plan,
  variant = "light",
  className,
}: Readonly<{
  plan: PlanBFields;
  variant?: "light" | "dark";
  className?: string;
}>) {
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "rounded-lg border-l-2 p-4",
        isDark
          ? "border-l-white border-white/15 bg-white/5 text-white"
          : "border-l-sun border-line bg-card text-foreground",
        "border",
        className,
      )}
      role="group"
      aria-label="Plan B fallback"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-xs font-semibold",
            isDark ? "text-white" : "text-sun",
          )}
        >
          Plan B
        </span>
        <span className={cn("text-xs", isDark ? "text-white/70" : "text-muted")}>
          {plan.timeDifference}
        </span>
      </div>

      <dl className="mt-3 space-y-2 text-sm leading-6">
        <PlanBRow label="If" value={plan.trigger} dark={isDark} />
        <PlanBRow label="Switch to" value={plan.alternative} dark={isDark} />
        <PlanBRow label="Why it works" value={plan.whyItWorks} dark={isDark} />
      </dl>
    </div>
  );
}

function PlanBRow({
  label,
  value,
  dark,
}: Readonly<{
  label: string;
  value: string;
  dark: boolean;
}>) {
  return (
    <div className="grid gap-1 sm:grid-cols-[100px_1fr] sm:gap-3">
      <dt className={cn("text-xs", dark ? "text-white/60" : "text-muted")}>{label}</dt>
      <dd className={cn(dark ? "text-white/88" : "text-foreground")}>{value}</dd>
    </div>
  );
}
