type RouteLoadingProps = Readonly<{
  eyebrow?: string;
  title?: string;
  description?: string;
  panelCount?: number;
}>;

export function RouteLoading({
  eyebrow = "Loading",
  title = "Pulling the latest trip context",
  description = "This route is still resolving live conditions, fit scoring, and saved state.",
  panelCount = 3,
}: RouteLoadingProps) {
  return (
    <div className="animate-pulse space-y-8 py-10" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <p className="eyebrow text-transparent">{eyebrow}</p>
        <div className="h-12 max-w-2xl rounded-[20px] bg-muted-soft" />
        <div className="h-6 max-w-3xl rounded-[16px] bg-muted-soft" />
        <p className="sr-only">
          {title}. {description}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[280px] rounded-[28px] bg-muted-soft" />
        <div className="h-[280px] rounded-[28px] bg-muted-soft" />
      </div>

      <div className={`grid gap-5 ${panelCount >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        {Array.from({ length: panelCount }).map((_, index) => (
          <div key={index} className="h-[320px] rounded-[28px] bg-muted-soft" />
        ))}
      </div>
    </div>
  );
}
