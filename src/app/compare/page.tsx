import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import { getRankedDestinations } from "@/lib/data/repository";
import { getDestinationDecisionStatus } from "@/lib/decision-layer";
import { formatWeatherMetrics, getPrimaryAlert } from "@/lib/live-conditions";
import {
  getPlanningState,
  labelDrivingTolerance,
  labelGroupProfile,
  labelOrigin,
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
    selectedDestinations.length >= 2 ? selectedDestinations.slice(0, 6) : recommendations.slice(0, 5);

  const leader = comparisonSet[0];
  const runnerUp = comparisonSet[1];
  const scoreGap = leader && runnerUp ? leader.rankingScore - runnerUp.rankingScore : null;
  const planQueryString = toPlanningQueryString(planningState);

  return (
    <div className="space-y-10 py-8">
      <SectionHeading
        eyebrow="Comparison"
        title="Shortlist side by side"
        description="Tradeoffs in one table — pick the one that fits your brief."
      />

      <Card>
        <CardHeader>
          <p className="text-xs text-muted">Current brief</p>
          <h2 className="text-lg font-semibold">
            {labelOrigin(planningState.origin)} · {labelTripLength(planningState.tripLength).toLowerCase()} · {labelGroupProfile(planningState.groupProfile).toLowerCase()} · {labelDrivingTolerance(planningState.drivingTolerance).toLowerCase()}
          </h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm leading-6">
          {leader ? (
            <p className="text-foreground">
              <span className="font-semibold">{leader.name}</span> leads
              {scoreGap != null ? ` by ${scoreGap} pts over ${runnerUp?.name}.` : "."}
            </p>
          ) : null}
          <div>
            <Link href={`/plan?${planQueryString}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
              Retune brief
            </Link>
          </div>
        </CardBody>
      </Card>

      <section className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="whitespace-nowrap p-3 font-medium">Destination</th>
              <th className="whitespace-nowrap p-3 font-medium">Fit</th>
              <th className="whitespace-nowrap p-3 font-medium">Drive</th>
              <th className="p-3 font-medium">Best reason</th>
              <th className="p-3 font-medium">Biggest risk</th>
              <th className="p-3 font-medium">Plan B</th>
              <th className="p-3 font-medium">Base town</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {comparisonSet.map((destination, index) => {
              const weatherMetrics = formatWeatherMetrics(destination.liveWeather).slice(0, 2);
              const primaryAlert = getPrimaryAlert(destination.activeAlerts);
              const decision = getDestinationDecisionStatus(destination);

              return (
                <tr key={destination.slug} className="border-b border-line/60 align-top last:border-0">
                  <td className="p-3">
                    <Link href={`/destinations/${destination.slug}`} className="font-semibold hover:text-ocean">
                      {destination.name}
                    </Link>
                    <p className="text-xs text-muted">Rank {index + 1} · {destination.region}</p>
                    {weatherMetrics.length > 0 ? (
                      <p className="mt-1 text-xs text-muted">{weatherMetrics.join(" · ")}</p>
                    ) : null}
                    {primaryAlert ? (
                      <p className="mt-1 text-xs text-danger">⚠ {primaryAlert.title}</p>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xl font-semibold tabular-nums">{destination.fitScore}</span>
                      <FitScoreBadge score={destination.fitScore} showScore={false} size="sm" />
                      {decision.level !== "inform" ? (
                        <span className={decision.level === "block" ? "text-xs text-danger" : "text-xs text-sun"}>
                          {decision.label}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-3 text-muted">
                    {destination.driveHours[planningState.origin]}h
                  </td>
                  <td className="p-3 text-foreground">{destination.bestActivity}</td>
                  <td className="p-3 text-muted">{destination.mainWarning}</td>
                  <td className="p-3 text-muted">{destination.planB.alternative}</td>
                  <td className="p-3 text-muted">{destination.lodging.bestBase}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/plans/${destination.slug}?${planQueryString}`}
                        className={buttonVariants({ variant: index === 0 ? "primary" : "secondary", size: "sm" })}
                      >
                        Plan
                      </Link>
                      <Link
                        href={`/destinations/${destination.slug}`}
                        className="text-xs text-muted hover:text-foreground"
                      >
                        Detail →
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {comparisonSet.map((destination) => (
          <Card key={destination.slug}>
            <CardBody className="space-y-2 pt-5 text-sm leading-6">
              <h3 className="font-semibold">{destination.name}</h3>
              <p className="text-muted">{destination.currentVerdict}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted">
                <dt>Seasonality</dt>
                <dd className="text-foreground tabular-nums">{destination.breakdown.seasonality}</dd>
                <dt>Weather</dt>
                <dd className="text-foreground tabular-nums">{destination.breakdown.weather}</dd>
                <dt>Drive fit</dt>
                <dd className="text-foreground tabular-nums">{destination.breakdown.driveTime}</dd>
                <dt>Group fit</dt>
                <dd className="text-foreground tabular-nums">{destination.breakdown.groupFit}</dd>
                <dt>Alerts</dt>
                <dd className="text-foreground tabular-nums">{destination.breakdown.alerts}</dd>
              </dl>
            </CardBody>
          </Card>
        ))}
      </section>
    </div>
  );
}

function getValues(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}
