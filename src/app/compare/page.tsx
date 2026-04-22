import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import { getRankedDestinations } from "@/lib/data/repository";
import { getDestinationDecisionStatus } from "@/lib/decision-layer";
import type { DecisionLevel } from "@/lib/decision-layer";
import {
  getCompareSlugs,
  getPlanningState,
  labelDrivingTolerance,
  labelGroupProfile,
  labelOrigin,
  labelTripLength,
  toComparisonQueryString,
  toPlanningQueryString,
  withCompareSlugs,
  withPlanningQuery,
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

  const requestedSlugs = getCompareSlugs(resolvedSearchParams);
  const hasExplicitSelection = requestedSlugs.length > 0;
  const rankedLookup = new Map(recommendations.map((destination) => [destination.slug, destination]));
  const selectedDestinations = requestedSlugs
    .map((slug) => rankedLookup.get(slug))
    .filter((destination): destination is NonNullable<typeof destination> => Boolean(destination));

  const comparisonSet = hasExplicitSelection ? selectedDestinations : recommendations.slice(0, 4);
  const leader = comparisonSet[0];
  const runnerUp = comparisonSet[1];
  const scoreGap = leader && runnerUp ? leader.rankingScore - runnerUp.rankingScore : null;
  const planQueryString = toPlanningQueryString(planningState);
  const browseHref = `/explore?${planQueryString}`;

  if (comparisonSet.length === 0) {
    return (
      <div className="space-y-8 py-8">
        <SectionHeading
          eyebrow="Shortlist"
          title="Save a few places first"
          description="Keep interesting destinations in play from Explore or the home feed, then review them here."
        />
        <Card>
          <CardBody className="space-y-4 py-8">
            <p className="text-sm leading-6 text-[#6b5c44]">
              Your shortlist is empty. Browse destinations, save the ones that feel promising,
              then come back here to narrow them down.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={browseHref} className={buttonVariants({ variant: "primary", size: "sm" })}>
                Browse destinations
              </Link>
              <Link href={`/?${planQueryString}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                Back home
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-8">
      <SectionHeading
        eyebrow="Shortlist"
        title={hasExplicitSelection ? "Places you are considering" : "Current top contenders"}
        description="Save first, compare later. Start with the shortlist cards, then use the table only if you need a final tie-breaker."
      />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <p className="eyebrow">Current brief</p>
            <h2 className="display-title text-[22px] text-foreground">
              {labelOrigin(planningState.origin)} · {labelTripLength(planningState.tripLength).toLowerCase()} · {labelGroupProfile(planningState.groupProfile).toLowerCase()} · {labelDrivingTolerance(planningState.drivingTolerance).toLowerCase()}
            </h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm leading-6">
            {leader ? (
              <p className="text-foreground">
                <span className="text-[#1e1610]">{leader.name}</span> leads
                {scoreGap != null ? ` by ${scoreGap} pts over ${runnerUp?.name}.` : "."}
              </p>
            ) : null}
            <p className="text-[#6b5c44]">
              {hasExplicitSelection
                ? "These came from your shortlist. Remove weak fits until the right trip becomes obvious."
                : "No shortlist was passed in, so this page is showing the current top recommendations for this brief."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/plan?${planQueryString}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                Edit brief
              </Link>
              <Link href={browseHref} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Keep browsing
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Shortlist</p>
            <h2 className="display-title text-[22px] text-foreground">
              {comparisonSet.length} destination{comparisonSet.length === 1 ? "" : "s"}
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {comparisonSet.map((destination) => (
                <SelectionChip
                  key={destination.slug}
                  destinationName={destination.name}
                  removeHref={comparisonSet.length > 1 ? removeDestinationHref(planningState, comparisonSet, destination.slug) : null}
                />
              ))}
            </div>
            {comparisonSet.length < 2 ? (
              <p className="text-sm leading-6 text-[#6b5c44]">
                Save one or two more places from Explore, or just open this brief and commit if the answer is already clear.
              </p>
            ) : (
              <p className="text-sm leading-6 text-[#6b5c44]">
                Open any destination below for the full brief, or trim this set until one option clearly wins.
              </p>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a8878]">Review</p>
          <h2 className="display-title text-[24px] leading-[1.1] text-[#1e1610]">
            Shortlist cards
          </h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {comparisonSet.map((destination) => {
            const decision = getDestinationDecisionStatus(destination);

            return (
              <Card key={destination.slug} className="border border-[rgba(26,22,18,0.06)]">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#9a8878]">
                        {destination.region}
                      </p>
                      <h3
                        className="display-title text-[24px] leading-[1.1] text-[#1e1610]"
                        style={{ fontWeight: 500 }}
                      >
                        {destination.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-semibold tabular-nums text-[#1e1610]">
                        {destination.fitScore}
                      </p>
                      <FitScoreBadge score={destination.fitScore} showScore={false} size="sm" />
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="space-y-2">
                    <SignalRow label="Drive" value={`${destination.driveHours[planningState.origin]}h from ${labelOrigin(planningState.origin)}`} />
                    <SignalRow label="Best now" value={destination.bestActivity} />
                    <SignalRow label="Risk" value={destination.mainWarning} tone={riskColorFor(decision.level)} />
                    <SignalRow label="Plan B" value={destination.planB.alternative} />
                  </div>

                  <div className="space-y-2 border-t border-[rgba(26,22,18,0.06)] pt-4">
                    <ScoreBar label="Seasonality" value={destination.breakdown.seasonality} />
                    <ScoreBar label="Weather" value={destination.breakdown.weather} />
                    <ScoreBar label="Drive fit" value={destination.breakdown.driveTime} />
                    <ScoreBar label="Group fit" value={destination.breakdown.groupFit} />
                    <ScoreBar label="Alerts" value={destination.breakdown.alerts} />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href={withCompareSlugs(
                        withPlanningQuery(`/destinations/${destination.slug}`, planningState),
                        comparisonSet.map((item) => item.slug),
                      )}
                      className={buttonVariants({ variant: "primary", size: "sm" })}
                    >
                      Open brief
                    </Link>
                    {comparisonSet.length > 1 ? (
                      <Link
                        href={removeDestinationHref(planningState, comparisonSet, destination.slug)}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Remove from shortlist
                      </Link>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a8878]">Tie-breaker</p>
          <h2 className="display-title text-[24px] leading-[1.1] text-[#1e1610]">
            Final tradeoff table
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6b5c44]">
            Use this only when the shortlist is down to a few realistic options and you want the cleanest side-by-side read.
          </p>
        </div>
        <div className="overflow-x-auto rounded-[20px] border border-[rgba(26,22,18,0.06)] bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr
                className="text-left text-[10px] uppercase text-[#9a8878]"
                style={{ letterSpacing: "0.14em" }}
              >
                <th className="whitespace-nowrap p-4" style={{ fontWeight: 500 }}>Destination</th>
                <th className="whitespace-nowrap p-4" style={{ fontWeight: 500 }}>Fit</th>
                <th className="whitespace-nowrap p-4" style={{ fontWeight: 500 }}>Drive</th>
                <th className="p-4" style={{ fontWeight: 500 }}>Best reason</th>
                <th className="p-4" style={{ fontWeight: 500 }}>Biggest risk</th>
                <th className="p-4" style={{ fontWeight: 500 }}>Plan B</th>
                <th className="p-4" style={{ fontWeight: 500 }}>Base town</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {comparisonSet.map((destination, index) => {
                const decision = getDestinationDecisionStatus(destination);
                const riskColor = riskColorFor(decision.level);

                return (
                  <tr key={destination.slug} className="align-top border-t border-[rgba(26,22,18,0.06)]">
                    <td className="p-4">
                      <Link
                        href={withCompareSlugs(
                          withPlanningQuery(`/destinations/${destination.slug}`, planningState),
                          comparisonSet.map((item) => item.slug),
                        )}
                        className="display-title text-[18px] leading-[1.2] text-[#1e1610] hover:text-[#8856d0]"
                        style={{ fontWeight: 500 }}
                      >
                        {destination.name}
                      </Link>
                      <p
                        className="mt-1 text-[10px] uppercase text-[#9a8878]"
                        style={{ letterSpacing: "0.14em" }}
                      >
                        Rank {index + 1} · {destination.region}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className="display-title text-[26px] leading-[1] text-[#1e1610] tabular-nums"
                          style={{ fontWeight: 300 }}
                        >
                          {destination.fitScore}
                        </span>
                        <FitScoreBadge score={destination.fitScore} showScore={false} size="sm" />
                      </div>
                    </td>
                    <td className="whitespace-nowrap p-4 text-[#6b5c44]">
                      {destination.driveHours[planningState.origin]}h
                    </td>
                    <td className="p-4 text-[#3a2e20]">{destination.bestActivity}</td>
                    <td className="p-4" style={{ color: riskColor }}>
                      {destination.mainWarning}
                    </td>
                    <td className="p-4 text-[#6b5c44]">{destination.planB.alternative}</td>
                    <td className="p-4 text-[#6b5c44]">{destination.lodging.bestBase}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={withCompareSlugs(
                            withPlanningQuery(`/destinations/${destination.slug}`, planningState),
                            comparisonSet.map((item) => item.slug),
                          )}
                          className={buttonVariants({ variant: index === 0 ? "primary" : "secondary", size: "sm" })}
                        >
                          Open
                        </Link>
                        {comparisonSet.length > 1 ? (
                          <Link
                            href={removeDestinationHref(planningState, comparisonSet, destination.slug)}
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                          >
                            Remove
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SelectionChip({
  destinationName,
  removeHref,
}: Readonly<{
  destinationName: string;
  removeHref: string | null;
}>) {
  if (!removeHref) {
    return (
      <span className="inline-flex items-center rounded-full bg-[rgba(26,22,18,0.06)] px-3 py-1.5 text-sm text-[#1e1610]">
        {destinationName}
      </span>
    );
  }

  return (
    <Link
      href={removeHref}
      className="inline-flex items-center gap-2 rounded-full bg-[rgba(26,22,18,0.06)] px-3 py-1.5 text-sm text-[#1e1610] transition hover:bg-[rgba(26,22,18,0.1)]"
    >
      <span>{destinationName}</span>
      <span aria-hidden className="text-[#9a8878]">
        ×
      </span>
    </Link>
  );
}

function SignalRow({
  label,
  value,
  tone = "#3a2e20",
}: Readonly<{
  label: string;
  value: string;
  tone?: string;
}>) {
  return (
    <div className="flex gap-3">
      <p className="w-[72px] shrink-0 text-[10px] uppercase tracking-[0.14em] text-[#9a8878]">
        {label}
      </p>
      <p className="flex-1 text-sm leading-6" style={{ color: tone }}>
        {value}
      </p>
    </div>
  );
}

function ScoreBar({ label, value }: Readonly<{ label: string; value: number }>) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = scoreBarColor(clamped);

  return (
    <div className="flex items-center gap-3">
      <p
        className="w-[72px] shrink-0 text-[10px] uppercase text-[#9a8878]"
        style={{ letterSpacing: "0.12em", fontWeight: 500 }}
      >
        {label}
      </p>
      <div className="relative h-[2px] flex-1 rounded-full bg-[rgba(26,22,18,0.08)]">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="w-[26px] shrink-0 text-right text-[12px] tabular-nums text-[#3a2e20]"
        style={{ fontWeight: 400 }}
      >
        {clamped}
      </span>
    </div>
  );
}

function scoreBarColor(value: number): string {
  if (value >= 85) return "#335c50";
  if (value >= 62) return "#b08060";
  return "#9a8878";
}

function riskColorFor(level: DecisionLevel): string {
  if (level === "block") return "#7a2e20";
  if (level === "warn") return "#8a5a32";
  return "#6b5c44";
}

function removeDestinationHref(
  planningState: Parameters<typeof toPlanningQueryString>[0],
  comparisonSet: Array<{ slug: string }>,
  slugToRemove: string,
) {
  const nextSlugs = comparisonSet
    .map((destination) => destination.slug)
    .filter((slug) => slug !== slugToRemove);

  const query = toComparisonQueryString(planningState, nextSlugs);
  return query ? `/compare?${query}` : "/compare";
}
