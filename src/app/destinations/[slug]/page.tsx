import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationHeroImage } from "@/components/destinations/destination-hero-image";
import { DestinationMapCard } from "@/components/destinations/destination-map-card";
import { ActivityChip, inferActivityKind } from "@/components/ui/activity-chip";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DecisionStatusCard } from "@/components/ui/decision-status-card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { PlanBCard } from "@/components/ui/plan-b-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { getUserPreferences } from "@/lib/account";
import { buildScoringContext } from "@/lib/data/openseason";
import { getDestinationBySlugFromRepository } from "@/lib/data/repository";
import { getDestinationDecisionStatus } from "@/lib/decision-layer";
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
  const decision = getDestinationDecisionStatus(destination);

  return (
    <div className="space-y-10 py-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-4">
          <p className="text-xs text-muted">{destination.region}</p>
          <h1 className="display-title text-4xl font-semibold leading-[1.05] sm:text-5xl">
            {destination.name}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-foreground">
            {destination.currentVerdict}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
            <span>{destination.driveHours[planningState.origin]}h from {labelOrigin(planningState.origin)}</span>
            <span>·</span>
            <span>{destination.seasonalWindow}</span>
            <span>·</span>
            <span>{destination.bestActivity}</span>
          </div>

          {destination.riskBadges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {destination.riskBadges.slice(0, 3).map((risk) => (
                <RiskBadge key={risk} label={risk} />
              ))}
            </div>
          ) : null}
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-muted">Current decision</p>
                <h2 className="text-lg font-semibold">{destination.bestActivity}</h2>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-3xl font-semibold tabular-nums">{contextualFitScore}</p>
                <p className="text-xs text-muted">{contextualFitLabel}</p>
              </div>
            </div>
            <FitScoreBadge score={contextualFitScore} showScore={false} size="sm" />
          </CardHeader>
          <CardBody className="space-y-3 text-sm leading-6">
            {weatherMetrics.length > 0 ? (
              <p className="text-foreground">{weatherMetrics.slice(0, 3).join(" · ")}</p>
            ) : null}
            <p className="text-muted">
              <span className="text-foreground">Watch out · </span>
              {destination.mainWarning}
            </p>
            {primaryAlert ? (
              <p className="text-danger">⚠ {primaryAlert.title}</p>
            ) : null}
            {destination.updatedAt ? (
              <p className="text-xs text-muted">Updated {formatUpdatedAt(destination.updatedAt)}</p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/plans/${destination.slug}?${planQueryString}`}
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                Generate plan
              </Link>
              <Link
                href={`/split-group/${destination.slug}?${planQueryString}`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Split group
              </Link>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <DestinationHeroImage
          slug={destination.slug}
          name={destination.name}
          region={destination.region}
          summary={destination.summary}
          priority
        />
        <DestinationMapCard destination={destination} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <DecisionStatusCard decision={decision} />
        <PlanBCard plan={destination.planB} />
      </section>

      <section className="space-y-3">
        <DetailSection
          eyebrow="Current conditions"
          title="Weather & alerts"
          defaultOpen
        >
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3 text-sm leading-6">
              {destination.liveWeather ? (
                <>
                  <p className="font-medium">{weatherMetrics.join(" · ")}</p>
                  <dl className="grid gap-2 text-muted sm:grid-cols-2">
                    <Row label="Snapshot" value={destination.liveWeather.snapshotDate} />
                    <Row label="Heat" value={`${destination.liveWeather.heatRisk ?? 0} / 100`} />
                    <Row label="Snow" value={`${destination.liveWeather.snowRisk ?? 0} / 100`} />
                    <Row label="Wind max" value={`${destination.liveWeather.windSpeed ?? 0} mph`} />
                  </dl>
                </>
              ) : (
                <p className="text-muted">
                  Live weather not yet ingested. Seed guidance still applies.
                </p>
              )}
            </div>

            <div className="space-y-3">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <div
                    key={`${alert.source}-${alert.title}-${alert.effectiveDate ?? "now"}`}
                    className="rounded-lg border border-line p-4"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={getAlertTone(alert.severity)}>{alert.severity}</Badge>
                      <span className="text-xs text-muted">{alert.source.toUpperCase()} · {alert.alertType}</span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold">{alert.title}</h3>
                    {alert.description ? (
                      <p className="mt-1 text-sm leading-6 text-muted">{alert.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted">
                      {formatAlertDate(alert.effectiveDate) ?? "Now"} → {formatAlertDate(alert.expirationDate) ?? "—"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No active alerts.</p>
              )}
            </div>
          </div>
        </DetailSection>

        <DetailSection
          eyebrow="Score breakdown"
          title="Why it lands here"
          defaultOpen
        >
          <div className="grid gap-2 md:grid-cols-2">
            {scoreRows.map(([label, score]) => (
              <ScoreBar key={label} label={label} score={score} />
            ))}
          </div>
        </DetailSection>

        <DetailSection eyebrow="Best now" title="Top activities">
          <div className="grid gap-3 lg:grid-cols-2">
            {destination.activities.map((activity) => (
              <div
                key={activity.name}
                className="rounded-lg border border-line p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-semibold">{activity.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <ActivityChip
                      label={activity.name}
                      kind={inferActivityKind(activity.name)}
                      size="sm"
                    />
                    <span className="text-xs text-muted">{activity.difficulty}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted">Best time · {activity.bestTime}</p>
                <p className="mt-1.5 text-sm leading-6 text-foreground">{activity.whyItFits}</p>
              </div>
            ))}
          </div>
        </DetailSection>

        <DetailSection eyebrow="Logistics" title="Avoids, stops, town & lodging">
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs text-muted">What to avoid</p>
                <ul className="space-y-1.5 text-sm leading-6">
                  {destination.avoid.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-danger">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted">Suggested stops</p>
                <ul className="space-y-1.5 text-sm leading-6">
                  {destination.suggestedStops.map((stop) => (
                    <li key={stop} className="flex gap-2">
                      <span className="text-muted">·</span>
                      <span>{stop}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted">Food / town</p>
                <h3 className="mt-1 text-base font-semibold">{destination.foodSupport.nearbyTown}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{destination.foodSupport.note}</p>
                <dl className="mt-2 space-y-1 text-sm leading-6">
                  <Row label="Cafes" value={destination.foodSupport.cafes.join(" · ")} />
                  <Row label="Dinner" value={destination.foodSupport.dinner.join(" · ")} />
                  <Row label="Hangouts" value={destination.foodSupport.hangouts.join(" · ")} />
                </dl>
              </div>

              <div>
                <p className="text-xs text-muted">Lodging</p>
                <dl className="mt-2 space-y-1 text-sm leading-6">
                  <Row label="Best base" value={destination.lodging.bestBase} />
                  <Row label="Best for" value={destination.lodging.bestFor} />
                  <Row label="Alternative" value={destination.lodging.alternative} />
                  <Row label="Tradeoff" value={destination.lodging.tradeoff} />
                </dl>
              </div>
            </div>
          </div>
        </DetailSection>
      </section>
    </div>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function DetailSection({
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
      className="group rounded-lg border border-line bg-card px-5 py-4"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted">{eyebrow}</p>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        <span className="text-xs text-muted group-open:hidden">Expand</span>
        <span className="hidden text-xs text-muted group-open:inline">Collapse</span>
      </summary>
      <div className="pt-4">{children}</div>
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold tabular-nums">{score}</span>
      </div>
      <div
        className="h-1.5 rounded-full bg-muted-soft"
        role="progressbar"
        aria-label={`${label} score`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
      >
        <div
          className="h-1.5 rounded-full bg-ocean"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
