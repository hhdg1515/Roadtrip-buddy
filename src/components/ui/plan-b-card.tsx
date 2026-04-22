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
        "rounded-[18px] p-5",
        isDark
          ? "bg-white/5 text-white"
          : "bg-[linear-gradient(180deg,rgba(250,247,241,0.98)_0%,rgba(247,242,234,0.92)_100%)] text-foreground",
        className,
      )}
      role="group"
      aria-label="Plan B fallback"
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-xs",
            isDark ? "text-white" : "text-muted",
          )}
        >
          Plan B
        </span>
      </div>

      <dl className="mt-4 space-y-2 text-sm leading-6">
        <PlanBRow label="If" value={plan.trigger} dark={isDark} />
        <PlanBRow label="Pivot" value={plan.alternative} dark={isDark} />
        <PlanBRow label="Why" value={plan.whyItWorks} dark={isDark} />
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
    <div className="grid gap-1 sm:grid-cols-[72px_1fr] sm:gap-3">
      <dt className={cn("text-xs", dark ? "text-white/60" : "text-muted")}>{label}</dt>
      <dd className={cn(dark ? "text-white/88" : "text-foreground")}>{value}</dd>
    </div>
  );
}
