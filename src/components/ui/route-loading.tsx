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
    <div className="animate-pulse space-y-6 py-8" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-muted-soft" />
        <div className="h-8 max-w-xl rounded-md bg-muted-soft" />
        <p className="sr-only">
          {eyebrow}. {title}. {description}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[220px] rounded-lg bg-muted-soft" />
        <div className="h-[220px] rounded-lg bg-muted-soft" />
      </div>

      <div className={`grid gap-4 ${panelCount >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        {Array.from({ length: panelCount }).map((_, index) => (
          <div key={index} className="h-[240px] rounded-lg bg-muted-soft" />
        ))}
      </div>
    </div>
  );
}
