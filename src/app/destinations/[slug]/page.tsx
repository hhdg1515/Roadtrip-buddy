import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationHeroImage } from "@/components/destinations/destination-hero-image";
import { DestinationMapCard } from "@/components/destinations/destination-map-card";
import { ActivityChip, inferActivityKind } from "@/components/ui/activity-chip";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { PlanBCard } from "@/components/ui/plan-b-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { getUserPreferences } from "@/lib/account";
import { buildScoringContext } from "@/lib/data/openseason";
import { getDestinationBySlugFromRepository } from "@/lib/data/repository";
import {
  formatAlertDate,
  formatUpdatedAt,
  formatWeatherMetrics,
  getAlertTone,
  getPrimaryAlert,
} from "@/lib/live-conditions";
import {
  getPlanningState,
  labelOrigin,
  rankingContextFromPlanning,
  toPlanningQueryString,
} from "@/lib/planning";
import { calculateTripFitScore, labelTripFitScore } from "@/lib/scoring/trip-fit";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DestinationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [{ preferences }, destination] = await Promise.all([
    getUserPreferences(),
    getDestinationBySlugFromRepository(slug),
  ]);

  if (!destination) {
    notFound();
  }

  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const rankingContext = rankingContextFromPlanning(planningState);
  const scoringContext = buildScoringContext(
    destination,
    planningState.origin,
    planningState.tripLength,
    rankingContext,
  );
  const contextualFitScore = calculateTripFitScore(destination.breakdown, scoringContext);
  const contextualFitLabel = labelTripFitScore(contextualFitScore);
  const planQueryString = toPlanningQueryString(planningState);

  const scoreRows = [
    ["Seasonality", destination.breakdown.seasonality],
    ["Weather", destination.breakdown.weather],
    ["Activity match", destination.breakdown.activityMatch],
    ["Drive time", destination.breakdown.driveTime],
    ["Alerts", destination.breakdown.alerts],
    ["Group fit", destination.breakdown.groupFit],
    ["Lodging", destination.breakdown.lodging],
    ["Plan B", destination.breakdown.planB],
  ] as const;
  const weatherMetrics = formatWeatherMetrics(destination.liveWeather);
  const activeAlerts = destination.activeAlerts ?? [];
  const primaryAlert = getPrimaryAlert(activeAlerts);

  return (
    <div className="space-y-10 py-10">
      <section
        className="rounded-[34px] border border-white/20 p-6 text-white sm:p-8"
        style={{
          backgroundImage: `linear-gradient(135deg, ${destination.palette[0]}, ${destination.palette[1]} 52%, ${destination.palette[2]})`,
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <p className="eyebrow text-white/68">{destination.region}</p>
            <h1 className="display-title text-5xl font-semibold leading-[0.95] sm:text-6xl">
              {destination.name}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-white/84">
              {destination.currentVerdict}
            </p>
            <p className="max-w-3xl text-base leading-7 text-white/76">{destination.summary}</p>

            <div className="flex flex-wrap gap-2">
              <FitScoreBadge score={contextualFitScore} className="bg-white/15 text-white" />
              <Badge className="bg-white/15 text-white">{destination.bestActivity}</Badge>
              <Badge className="bg-white/15 text-white">
                {destination.driveHours[planningState.origin]}h from {labelOrigin(planningState.origin)}
              </Badge>
              <Badge className="bg-white/15 text-white">{destination.seasonalWindow}</Badge>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {destination.riskBadges.map((risk) => (
                <RiskBadge key={risk} label={risk} className="bg-white/12 text-white" />
              ))}
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="border-white/10 bg-white/10 text-white shadow-none">
              <CardHeader>
                <p className="eyebrow text-white/65">Current decision</p>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold">{destination.bestActivity}</h2>
                    <p className="text-sm leading-6 text-white/80">{destination.whyNow}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">{contextualFitScore}</p>
                    <FitScoreBadge
                      score={contextualFitScore}
                      showScore={false}
                      size="sm"
                      className="mt-2 bg-white/20 text-white"
                    />
                    <p className="mt-1 text-xs text-white/68">{contextualFitLabel}</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-4 text-sm text-white/82">
                {weatherMetrics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {weatherMetrics.slice(0, 3).map((metric) => (
                      <Badge key={metric} className="bg-white/15 text-white">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                <p>
                  <span className="font-semibold">Main risk:</span> {destination.mainWarning}
                </p>
                {primaryAlert ? (
                  <p>
                    <span className="font-semibold">Top alert:</span> {primaryAlert.title}
                  </p>
                ) : null}
                {destination.updatedAt ? (
                  <p>
                    <span className="font-semibold">Last refreshed:</span>{" "}
                    {formatUpdatedAt(destination.updatedAt)}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={`/plans/${destination.slug}?${planQueryString}`}
                    className={buttonVariants({ variant: "primary" })}
                  >
                    Generate trip plan
                  </Link>
                  <Link
                    href={`/split-group/${destination.slug}?${planQueryString}`}
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    Split group plan
                  </Link>
                </div>
              </CardBody>
            </Card>

            <PlanBCard plan={destination.planB} variant="dark" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <DestinationHeroImage
          slug={destination.slug}
          name={destination.name}
          region={destination.region}
          summary={destination.summary}
          priority
        />
        <DestinationMapCard destination={destination} />
      </section>

      <section className="space-y-4">
        <AccordionSection
          eyebrow="Current conditions"
          title="Weather, alerts, and what changes the call"
          defaultOpen
        >
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              {destination.liveWeather ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {weatherMetrics.map((metric) => (
                      <Badge key={metric} tone="soft">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
                    <p>
                      <span className="font-semibold">Snapshot date:</span>{" "}
                      {destination.liveWeather.snapshotDate}
                    </p>
                    <p>
                      <span className="font-semibold">Heat risk:</span>{" "}
                      {destination.liveWeather.heatRisk ?? 0} / 100
                    </p>
                    <p>
                      <span className="font-semibold">Snow risk:</span>{" "}
                      {destination.liveWeather.snowRisk ?? 0} / 100
                    </p>
                    <p>
                      <span className="font-semibold">Wind max:</span>{" "}
                      {destination.liveWeather.windSpeed ?? 0} mph
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  Live weather has not been ingested for this destination yet. The seeded guidance
                  is still available, but the decision gets better after the next sync.
                </p>
              )}
            </div>

            <div className="space-y-4">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <div
                    key={`${alert.source}-${alert.title}-${alert.effectiveDate ?? "now"}`}
                    className="rounded-[24px] border border-white/40 bg-white/55 p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={getAlertTone(alert.severity)}>{alert.severity}</Badge>
                      <Badge tone="soft">{alert.source.toUpperCase()}</Badge>
                      <Badge>{alert.alertType}</Badge>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold">{alert.title}</h3>
                    {alert.description ? (
                      <p className="mt-2 text-sm leading-6 text-muted">{alert.description}</p>
                    ) : null}
                    <div className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-foreground">Effective:</span>{" "}
                        {formatAlertDate(alert.effectiveDate) ?? "Current"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Expires:</span>{" "}
                        {formatAlertDate(alert.expirationDate) ?? "Not specified"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] bg-muted-soft px-5 py-5 text-sm leading-6 text-muted">
                  No active weather, park, or route alerts are currently being tracked for this destination.
                </div>
              )}
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          eyebrow="Explainable scoring"
          title="Why this destination lands here"
          defaultOpen
        >
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted">
              The fit score is just the top-line answer. These breakdown rows show where the current
              verdict is being supported versus where it is carrying risk.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {scoreRows.map(([label, score]) => (
                <ScoreBar key={label} label={label} score={score} />
              ))}
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          eyebrow="Best right now"
          title="Top activities in the current window"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {destination.activities.map((activity) => (
              <div
                key={activity.name}
                className="rounded-[24px] border border-white/40 bg-white/55 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">{activity.name}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <ActivityChip
                      label={activity.name}
                      kind={inferActivityKind(activity.name)}
                      size="sm"
                    />
                    <Badge tone="soft">{activity.difficulty}</Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">Best time: {activity.bestTime}</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{activity.whyItFits}</p>
              </div>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          eyebrow="Trip logistics"
          title="Avoids, stops, town support, and lodging"
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="eyebrow">What to avoid</p>
                {destination.avoid.map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] bg-danger/6 px-4 py-4 text-sm leading-6"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <p className="eyebrow">Suggested stops</p>
                {destination.suggestedStops.map((stop) => (
                  <div key={stop} className="rounded-[20px] bg-muted-soft px-4 py-4 text-sm">
                    {stop}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] border border-white/40 bg-white/55 p-5">
                <p className="eyebrow">Food / town support</p>
                <h3 className="mt-2 text-2xl font-semibold">{destination.foodSupport.nearbyTown}</h3>
                <p className="mt-3 text-sm leading-6">{destination.foodSupport.note}</p>
                <div className="mt-4 space-y-3 text-sm leading-6">
                  <p>
                    <span className="font-semibold">Cafes:</span>{" "}
                    {destination.foodSupport.cafes.join(" · ")}
                  </p>
                  <p>
                    <span className="font-semibold">Dinner:</span>{" "}
                    {destination.foodSupport.dinner.join(" · ")}
                  </p>
                  <p>
                    <span className="font-semibold">Low-effort hangouts:</span>{" "}
                    {destination.foodSupport.hangouts.join(" · ")}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/40 bg-white/55 p-5">
                <p className="eyebrow">Lodging guidance</p>
                <h3 className="mt-2 text-2xl font-semibold">Base town, not hotel promises</h3>
                <div className="mt-4 space-y-3 text-sm leading-6">
                  <p>
                    <span className="font-semibold">Best base:</span> {destination.lodging.bestBase}
                  </p>
                  <p>
                    <span className="font-semibold">Best for:</span> {destination.lodging.bestFor}
                  </p>
                  <p>
                    <span className="font-semibold">Alternative:</span>{" "}
                    {destination.lodging.alternative}
                  </p>
                  <p>
                    <span className="font-semibold">Tradeoff:</span>{" "}
                    {destination.lodging.tradeoff}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>
      </section>
    </div>
  );
}

function AccordionSection({
  eyebrow,
  title,
  children,
  defaultOpen = false,
}: Readonly<{
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}>) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[28px] border border-white/45 bg-white/70 px-6 py-5 shadow-[0_20px_80px_rgba(24,50,58,0.08)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-title text-3xl font-semibold text-foreground">{title}</h2>
        </div>
        <span className="text-sm font-semibold uppercase tracking-[0.16em] text-muted group-open:hidden">
          Expand
        </span>
        <span className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-muted group-open:block">
          Collapse
        </span>
      </summary>
      <div className="pt-5">{children}</div>
    </details>
  );
}

function ScoreBar({
  label,
  score,
}: Readonly<{
  label: string;
  score: number;
}>) {
  return (
    <div className="space-y-2 rounded-[22px] bg-white/55 p-4">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span>{label}</span>
        <span className="font-semibold">{score}</span>
      </div>
      <div
        className="h-2 rounded-full bg-muted-soft"
        role="progressbar"
        aria-label={`${label} score`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
      >
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,#255d6c,#c56d2a)]"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
