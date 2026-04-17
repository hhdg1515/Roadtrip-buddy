import Link from "next/link";
import { DestinationCard } from "@/components/home/destination-card";
import { NowPlanningControls } from "@/components/home/now-planning-controls";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import { getRankedDestinations } from "@/lib/data/repository";
import {
  cautionList,
  currentWindowLabel,
  seasonalCollections,
} from "@/lib/data/openseason";
import {
  getPlanningState,
  labelGroupProfile,
  labelOrigin,
  labelTripLength,
  toComparisonQueryString,
  toPlanningQueryString,
} from "@/lib/planning";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const { preferences, user } = await getUserPreferences();
  const resolvedSearchParams = (await searchParams) ?? {};
  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const queryString = toPlanningQueryString(planningState);
  const hasSavedDefaults = Boolean(user && preferences.updatedAt);
  const recommendations = await getRankedDestinations(planningState.origin, planningState.tripLength, {
    startDate: planningState.startDate,
    drivingTolerance: planningState.drivingTolerance,
    groupProfile: planningState.groupProfile,
    tripFormat: planningState.tripFormat,
    tripIntensity: planningState.tripIntensity,
    lodgingStyle: planningState.lodgingStyle,
    interests: planningState.interests,
  });
  const topRecommendations = recommendations.slice(0, 5);
  const comparisonSet = recommendations.slice(0, 3);
  const comparisonCandidates = recommendations.slice(0, 6);
  const comparisonQueryString = toComparisonQueryString(
    planningState,
    comparisonCandidates.map((destination) => destination.slug),
  );
  const destinationLookup = new Map(
    recommendations.map((destination) => [destination.slug, destination]),
  );

  return (
    <div className="space-y-12 py-8 sm:py-10">
      <section className="space-y-6 border-b border-line pb-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          <div className="space-y-5">
            <p className="text-xs text-muted">{currentWindowLabel}</p>
            <h1 className="display-title max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-5xl">
              California road trips, ranked for what&rsquo;s actually in season this week.
            </h1>
            <div className="flex flex-wrap gap-2">
              <Link
                href={hasSavedDefaults ? `/plan?${queryString}` : "/onboarding"}
                className={buttonVariants({ variant: "primary" })}
              >
                {hasSavedDefaults ? "Refine brief" : "Start onboarding"}
              </Link>
              <Link
                href={`/destinations/${topRecommendations[0]?.slug ?? "big-sur-carmel"}`}
                className={buttonVariants({ variant: "secondary" })}
              >
                Best current pick
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <p className="text-xs text-muted">Current brief</p>
              <h2 className="text-lg font-semibold">
                {labelOrigin(planningState.origin)} · {labelTripLength(planningState.tripLength).toLowerCase()} · {labelGroupProfile(planningState.groupProfile).toLowerCase()}
              </h2>
            </CardHeader>
            <CardBody>
              <NowPlanningControls state={planningState} />
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Now"
          title="Ranked picks this week"
          description="Already filtered by season, weather, drive burden, group fit, and Plan B quality."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topRecommendations.map((destination) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              origin={planningState.origin}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Peaking now"
          title="Seasonal collections"
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {seasonalCollections.map((collection) => (
            <Card key={collection.name}>
              <CardBody className="space-y-2 pt-5">
                <h3 className="font-semibold">{collection.name}</h3>
                <p className="text-sm text-muted">
                  {collection.slugs
                    .map((slug) => destinationLookup.get(slug)?.name)
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Comparison · leader vs. runners-up</p>
            <h2 className="text-lg font-semibold">Why the leader wins</h2>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="py-2 pr-4 font-medium">Destination</th>
                    <th className="py-2 pr-4 font-medium">Fit</th>
                    <th className="py-2 pr-4 font-medium">Best reason</th>
                    <th className="py-2 font-medium">Biggest risk</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonSet.map((destination) => (
                    <tr key={destination.slug} className="border-b border-line/60 last:border-0 align-top">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/destinations/${destination.slug}`}
                          className="font-medium hover:text-ocean"
                        >
                          {destination.name}
                        </Link>
                        <p className="text-xs text-muted">{destination.region}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <span className="tabular-nums font-semibold">{destination.fitScore}</span>
                          <FitScoreBadge score={destination.fitScore} showScore={false} size="sm" />
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-foreground">{destination.bestActivity}</td>
                      <td className="py-3 text-muted">{destination.mainWarning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pt-4">
              <Link
                href={`/compare?${comparisonQueryString}`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Full comparison
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Avoid this week</p>
            <h2 className="text-lg font-semibold">Caution list</h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm leading-6 text-foreground">
              {cautionList.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-danger">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
