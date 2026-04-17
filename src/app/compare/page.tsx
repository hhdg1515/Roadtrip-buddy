import Link from "next/link";
import { ActivityChip, inferActivityKind } from "@/components/ui/activity-chip";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import { getRankedDestinations } from "@/lib/data/repository";
import {
  formatUpdatedAt,
  formatWeatherMetrics,
  getAlertTone,
  getPrimaryAlert,
} from "@/lib/live-conditions";
import {
  getPlanningState,
  labelDrivingTolerance,
  labelGroupProfile,
  labelInterest,
  labelLodgingStyle,
  labelOrigin,
  labelPlanningDate,
  labelTripFormat,
  labelTripIntensity,
  labelTripLength,
  toPlanningQueryString,
} from "@/lib/planning";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { preferences } = await getUserPreferences();
  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const recommendations = await getRankedDestinations(planningState.origin, planningState.tripLength, {
    startDate: planningState.startDate,
    drivingTolerance: planningState.drivingTolerance,
    groupProfile: planningState.groupProfile,
    tripFormat: planningState.tripFormat,
    tripIntensity: planningState.tripIntensity,
    lodgingStyle: planningState.lodgingStyle,
    interests: planningState.interests,
  });

  const requestedSlugs = getValues(resolvedSearchParams.slugs);
  const rankedLookup = new Map(recommendations.map((destination) => [destination.slug, destination]));
  const selectedDestinations = requestedSlugs
    .map((slug) => rankedLookup.get(slug))
    .filter((destination): destination is NonNullable<typeof destination> => Boolean(destination));

  const comparisonSet =
    selectedDestinations.length >= 2 ? selectedDestinations.slice(0, 8) : recommendations.slice(0, 6);

  const leader = comparisonSet[0];
  const runnerUp = comparisonSet[1];
  const scoreGap = leader && runnerUp ? leader.rankingScore - runnerUp.rankingScore : null;
  const planQueryString = toPlanningQueryString(planningState);

  return (
    <div className="space-y-12 py-10">
      <SectionHeading
        eyebrow="Comparison"
        title="Review the shortlist side by side"
        description="This screen is for the close call. Keep the same trip brief, compare the top options in one place, then open the plan you actually want to commit to."
      />

      <Card>
        <CardHeader>
          <p className="eyebrow">Current brief</p>
          <h2 className="display-title text-3xl font-semibold">
            {labelOrigin(planningState.origin)}, {labelTripLength(planningState.tripLength).toLowerCase()}
          </h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm leading-6">
          <div className="flex flex-wrap gap-2">
            {planningState.startDate ? <Badge>{labelPlanningDate(planningState.startDate)}</Badge> : null}
            <Badge tone="warm">{labelDrivingTolerance(planningState.drivingTolerance)}</Badge>
            <Badge tone="soft">{labelGroupProfile(planningState.groupProfile)}</Badge>
            <Badge tone="soft">{labelTripFormat(planningState.tripFormat)}</Badge>
            <Badge tone="soft">{labelTripIntensity(planningState.tripIntensity)}</Badge>
            <Badge tone="soft">{labelLodgingStyle(planningState.lodgingStyle)}</Badge>
            {planningState.interestMode === "open" ? (
              <Badge>Open to anything</Badge>
            ) : (
              planningState.interests.map((interest) => (
                <Badge key={interest}>{labelInterest(interest)}</Badge>
              ))
            )}
          </div>
          {leader ? (
            <div className="rounded-[24px] border border-white/40 bg-white/55 p-5">
              <p className="eyebrow">Current leader</p>
              <p className="mt-3 text-base leading-7 text-foreground">
                <span className="font-semibold">{leader.name}</span> is leading this shortlist
                {scoreGap != null ? ` by ${scoreGap} points over ${runnerUp?.name}.` : "."}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{leader.currentVerdict}</p>
            </div>
          ) : null}
          <div className="rounded-[24px] border border-white/40 bg-white/55 p-5">
            <p className="eyebrow">Comparison mode</p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              This view is meant to hold a longer shortlist. Scroll sideways on desktop or swipe on
              mobile to move across the cards.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Showing {comparisonSet.length} options from the current ranking.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/plan?${planQueryString}`} className={buttonVariants({ variant: "secondary" })}>
              Retune this shortlist
            </Link>
          </div>
        </CardBody>
      </Card>

      <section className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
        {comparisonSet.map((destination, index) => {
          const weatherMetrics = formatWeatherMetrics(destination.liveWeather).slice(0, 3);
          const primaryAlert = getPrimaryAlert(destination.activeAlerts);

          return (
            <Card
              key={destination.slug}
              className="h-full min-w-[320px] snap-start sm:min-w-[360px] xl:min-w-[380px]"
            >
              <CardHeader className="space-y-5">
                <div
                  className="rounded-[24px] border border-white/25 p-5 text-white"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${destination.palette[0]}, ${destination.palette[1]} 52%, ${destination.palette[2]})`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/78">
                        Rank {index + 1}
                      </p>
                      <h3 className="display-title text-3xl font-semibold">{destination.name}</h3>
                      <p className="text-sm leading-6 text-white/82">{destination.region}</p>
                    </div>
                    <div className="score-ring flex h-20 w-20 flex-col items-center justify-center rounded-full border border-white/25 text-center text-[#13313a]">
                      <span className="text-2xl font-bold">{destination.fitScore}</span>
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
                        fit
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <FitScoreBadge score={destination.fitScore} />
                  <ActivityChip
                    label={destination.bestActivity}
                    kind={inferActivityKind(destination.bestActivity)}
                  />
                  <Badge tone="warm">
                    {destination.driveHours[planningState.origin]}h from {labelOrigin(planningState.origin)}
                  </Badge>
                  {destination.riskBadges.slice(0, 2).map((risk) => (
                    <RiskBadge key={risk} label={risk} />
                  ))}
                </div>
              </CardHeader>

              <CardBody className="flex h-full flex-col gap-5">
                {weatherMetrics.length > 0 || primaryAlert ? (
                  <div className="space-y-3 rounded-[22px] border border-white/40 bg-muted-soft/65 p-4">
                    <p className="eyebrow">Live conditions</p>
                    {weatherMetrics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {weatherMetrics.map((metric) => (
                          <Badge key={metric} tone="soft">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    {primaryAlert ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={getAlertTone(primaryAlert.severity)}>{primaryAlert.severity}</Badge>
                        <p className="text-sm leading-6 text-foreground">{primaryAlert.title}</p>
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-muted">No active weather, park, or route alerts right now.</p>
                    )}
                    {destination.updatedAt ? (
                      <p className="text-xs text-muted">
                        Refreshed {formatUpdatedAt(destination.updatedAt)}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="grid gap-3 text-sm leading-6">
                  <Metric label="Why now" value={destination.whyNow} />
                  <Metric label="Main risk" value={destination.mainWarning} muted />
                  <Metric label="Best base" value={destination.lodging.bestBase} />
                  <Metric label="Plan B" value={destination.planB.alternative} />
                </div>

                <div className="grid gap-2 rounded-[22px] border border-white/35 bg-white/50 p-4 text-sm">
                  <p className="eyebrow">Decision signals</p>
                  <SignalRow label="Seasonality" value={destination.breakdown.seasonality} />
                  <SignalRow label="Weather" value={destination.breakdown.weather} />
                  <SignalRow label="Drive fit" value={destination.breakdown.driveTime} />
                  <SignalRow label="Group fit" value={destination.breakdown.groupFit} />
                  <SignalRow label="Alerts" value={destination.breakdown.alerts} />
                </div>

                <div className="mt-auto flex flex-wrap gap-3">
                  <Link
                    href={`/plans/${destination.slug}?${planQueryString}`}
                    className={buttonVariants({ variant: index === 0 ? "primary" : "secondary" })}
                  >
                    Review this plan
                  </Link>
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className={buttonVariants({ variant: "ghost" })}
                  >
                    Destination detail
                  </Link>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  muted = false,
}: Readonly<{
  label: string;
  value: string;
  muted?: boolean;
}>) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 ${muted ? "text-muted" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function SignalRow({
  label,
  value,
}: Readonly<{
  label: string;
  value: number;
}>) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getValues(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}
