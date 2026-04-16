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
        "rounded-[24px] border p-5",
        isDark
          ? "border-white/20 bg-white/8 text-white"
          : "border-sun/30 bg-[linear-gradient(135deg,rgba(223,200,160,0.28),rgba(197,109,42,0.1))] text-foreground",
        className,
      )}
      role="group"
      aria-label="Plan B fallback"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] uppercase",
            isDark ? "bg-white/18 text-white" : "bg-sun/18 text-sun",
          )}
        >
          <span aria-hidden>↺</span> Plan B
        </span>
        <span
          className={cn(
            "text-xs font-semibold tracking-[0.14em] uppercase",
            isDark ? "text-white/70" : "text-muted",
          )}
        >
          {plan.timeDifference}
        </span>
      </div>

      <dl className="mt-4 space-y-3 text-sm leading-6">
        <PlanBRow label="If this happens" value={plan.trigger} dark={isDark} accent />
        <PlanBRow label="Switch to" value={plan.alternative} dark={isDark} />
        <PlanBRow label="Why it still works" value={plan.whyItWorks} dark={isDark} />
      </dl>
    </div>
  );
}

function PlanBRow({
  label,
  value,
  dark,
  accent = false,
}: Readonly<{
  label: string;
  value: string;
  dark: boolean;
  accent?: boolean;
}>) {
  return (
    <div className="grid gap-1 sm:grid-cols-[130px_1fr] sm:gap-3">
      <dt
        className={cn(
          "text-[0.68rem] font-semibold tracking-[0.16em] uppercase",
          dark ? "text-white/65" : accent ? "text-sun" : "text-ocean",
        )}
      >
        {label}
      </dt>
      <dd className={cn(dark ? "text-white/88" : "text-foreground")}>{value}</dd>
    </div>
  );
}
