import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationHeroImage } from "@/components/destinations/destination-hero-image";
import { DestinationMapCard } from "@/components/destinations/destination-map-card";
import { SelectedRouteMap } from "@/components/destinations/selected-route-map";
import { ActivityChip, inferActivityKind } from "@/components/ui/activity-chip";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DecisionStatusCard } from "@/components/ui/decision-status-card";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { PlanBCard } from "@/components/ui/plan-b-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { getCurrentUser, getUserPreferences } from "@/lib/account";
import { saveTripPlanAction } from "@/app/plans/actions";
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
  const [{ preferences }, destination, user] = await Promise.all([
    getUserPreferences(),
    getDestinationBySlugFromRepository(slug),
    getCurrentUser(),
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
  const saveReturnTo = `/destinations/${destination.slug}?${planQueryString}`;
  const saved = getFirstValue(resolvedSearchParams.saved);
  const status = getFirstValue(resolvedSearchParams.status);

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
  const companionFit =
    planningState.groupProfile === "mixed" ? buildCompanionFit(destination) : null;

  return (
    <div className="space-y-10 py-8">
      {saved === "1" ? (
        <StatusNote tone="default" label="Plan saved" message="This trip is now in your saved list." />
      ) : null}
      {status === "save-error" ? (
        <StatusNote tone="danger" label="Save failed" message="Confirm your session and try again." />
      ) : null}
      {status === "signed-in" ? (
        <StatusNote tone="default" label="Signed in" message="Session active — save when ready." />
      ) : null}

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
          <CardHeader className="space-y-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted">Current decision</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-3xl font-semibold tabular-nums">{contextualFitScore}</p>
                <p className="text-xs text-muted">{contextualFitLabel}</p>
              </div>
            </div>
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
              {user ? (
                <form action={saveTripPlanAction}>
                  <input type="hidden" name="slug" value={destination.slug} />
                  <input type="hidden" name="returnTo" value={saveReturnTo} />
                  <input type="hidden" name="origin" value={planningState.origin} />
                  <input type="hidden" name="tripLength" value={planningState.tripLength} />
                  <input type="hidden" name="startDate" value={planningState.startDate ?? ""} />
                  <input type="hidden" name="drivingTolerance" value={planningState.drivingTolerance} />
                  <input type="hidden" name="groupProfile" value={planningState.groupProfile} />
                  <input type="hidden" name="tripFormat" value={planningState.tripFormat} />
                  <input type="hidden" name="tripIntensity" value={planningState.tripIntensity} />
                  <input type="hidden" name="lodgingStyle" value={planningState.lodgingStyle} />
                  <input type="hidden" name="interestMode" value={planningState.interestMode} />
                  {planningState.interests.map((interest) => (
                    <input key={interest} type="hidden" name="interests" value={interest} />
                  ))}
                  <FormSubmitButton size="sm" pendingLabel="Saving...">
                    Save plan
                  </FormSubmitButton>
                </form>
              ) : (
                <Link
                  href={`/profile?next=${encodeURIComponent(saveReturnTo)}`}
                  className={buttonVariants({ variant: "primary", size: "sm" })}
                >
                  Sign in to save
                </Link>
              )}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-stretch">
        <SelectedRouteMap
          destination={destination}
          origin={planningState.origin}
        />
        <DestinationHeroImage
          slug={destination.slug}
          name={destination.name}
          region={destination.region}
          summary={destination.summary}
          className="h-full"
          fillHeight
          framed
          priority
        />
      </section>

      <section>
        <DestinationMapCard destination={destination} focusOrigin={planningState.origin} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <DecisionStatusCard decision={decision} />
        <PlanBCard plan={destination.planB} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Day by day</h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {destination.itinerary.map((day) => (
            <Card key={day.day}>
              <CardHeader>
                <p className="text-xs text-muted">{day.day}</p>
              </CardHeader>
              <CardBody className="space-y-1.5 text-sm leading-6">
                <ItineraryRow label="Morning" value={day.morning} />
                <ItineraryRow label="Midday" value={day.midday} />
                <ItineraryRow label="Afternoon" value={day.afternoon} />
                <ItineraryRow label="Evening" value={day.evening} />
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <DetailSection title="Conditions" defaultOpen>
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
                    className="rounded-lg bg-muted-soft p-4"
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

        <DetailSection title="Scores" defaultOpen>
          <div className="grid gap-3 md:grid-cols-2">
            {scoreRows.map(([label, score]) => (
              <ScoreBreakdownCard key={label} label={label} score={score} />
            ))}
          </div>
        </DetailSection>

        <DetailSection title="Activities">
          <div className="grid gap-3 lg:grid-cols-2">
            {destination.activities.map((activity) => (
              <div
                key={activity.name}
                className="rounded-[18px] bg-[linear-gradient(180deg,rgba(250,247,241,0.98)_0%,rgba(247,242,234,0.92)_100%)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ActivityChip
                    label={activity.name}
                    kind={inferActivityKind(activity.name)}
                    size="sm"
                  />
                  <span className="text-xs text-muted">{activity.difficulty}</span>
                </div>
                <p className="mt-2 text-xs text-muted">Best time · {activity.bestTime}</p>
                <p className="mt-1.5 text-sm leading-6 text-foreground">{activity.whyItFits}</p>
              </div>
            ))}
          </div>
        </DetailSection>

        {companionFit ? (
          <Card>
            <CardHeader>
              <p className="text-xs text-muted">Companion fit</p>
            </CardHeader>
            <CardBody className="grid gap-4 text-sm leading-6 md:grid-cols-3">
              <CompanionFitBlock label="Works for" value={companionFit.worksFor} />
              <CompanionFitBlock label="Easy side" value={companionFit.easySide} />
              <CompanionFitBlock label="Rejoin" value={companionFit.rejoin} />
            </CardBody>
          </Card>
        ) : null}

        <DetailSection title="Logistics">
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
                <p className="text-xs text-muted">Food</p>
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

function ItineraryRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function CompanionFitBlock({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-foreground">{value}</p>
    </div>
  );
}

function StatusNote({
  tone,
  label,
  message,
}: Readonly<{
  tone: "default" | "danger";
  label: string;
  message: string;
}>) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-muted-soft px-4 py-3 text-sm">
      <Badge tone={tone}>{label}</Badge>
      <span className="text-muted">{message}</span>
    </div>
  );
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function DetailSection({
  title,
  children,
  defaultOpen = false,
}: Readonly<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}>) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg bg-card px-5 py-4"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        <span className="text-xs text-muted group-open:hidden">Expand</span>
        <span className="hidden text-xs text-muted group-open:inline">Collapse</span>
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  );
}

function ScoreBreakdownCard({
  label,
  score,
}: Readonly<{
  label: string;
  score: number;
}>) {
  const clamped = Math.max(0, Math.min(100, score));
  const segments = 5;
  const activeSegments = Math.round((clamped / 100) * segments);
  const tone = scoreBreakdownTone(clamped);

  return (
    <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(250,247,241,0.98)_0%,rgba(247,242,234,0.92)_100%)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p
            className="mt-1 text-[10px] uppercase text-[#9a8878]"
            style={{ letterSpacing: "0.16em", fontWeight: 500 }}
          >
            {tone.label}
          </p>
        </div>
        <div className="text-sm font-semibold tabular-nums text-[#1e1610]">
          {clamped}
        </div>
      </div>
      <div
        className="mt-3 flex gap-1.5"
        role="progressbar"
        aria-label={`${label} score`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        {Array.from({ length: segments }, (_, index) => (
          <span
            key={`${label}-${index}`}
            className="h-2.5 flex-1 rounded-full transition"
            style={{
              backgroundColor:
                index < activeSegments ? tone.fill : "rgba(26,22,18,0.08)",
              boxShadow:
                index < activeSegments ? "inset 0 1px 0 rgba(255,255,255,0.28)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function scoreBreakdownTone(score: number) {
  if (score >= 88) {
    return {
      label: "Excellent",
      fill: "#335c50",
    };
  }

  if (score >= 76) {
    return {
      label: "Strong",
      fill: "#4d7264",
    };
  }

  if (score >= 64) {
    return {
      label: "Solid",
      fill: "#9b7656",
    };
  }

  if (score >= 50) {
    return {
      label: "Mixed",
      fill: "#b28f72",
    };
  }

  return {
    label: "Weak",
    fill: "#9a8878",
  };
}

function buildCompanionFit(destination: Awaited<ReturnType<typeof getDestinationBySlugFromRepository>>) {
  if (!destination) {
    return null;
  }

  const easyActivities = destination.activities.filter((activity) =>
    /very easy|easy/i.test(activity.difficulty),
  );
  const easyActivity = easyActivities[0]?.name ?? destination.activities[0]?.name ?? destination.bestActivity;
  const easySide = compactJoin([
    easyActivity,
    destination.foodSupport.hangouts[0] ?? destination.foodSupport.cafes[0],
  ]);

  const rejoin = compactJoin([
    destination.foodSupport.cafes[0] ?? destination.foodSupport.dinner[0],
    destination.foodSupport.dinner[0] ?? destination.suggestedStops[0],
  ]);

  return {
    worksFor: companionFitLabel(destination.breakdown.groupFit),
    easySide,
    rejoin,
  };
}

function companionFitLabel(groupFit: number) {
  if (groupFit >= 88) {
    return `Hiker + low-key companion`;
  }

  if (groupFit >= 78) {
    return `Mixed-energy pair`;
  }

  if (groupFit >= 68) {
    return `Flexible group, with tradeoffs`;
  }

  return `Best if everyone wants the same plan`;
}

function compactJoin(items: Array<string | undefined>) {
  return items.filter(Boolean).slice(0, 2).join(" · ");
}
