import Link from "next/link";
import { DestinationCard } from "@/components/home/destination-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import { getRankedDestinations } from "@/lib/data/repository";
import {
  cautionList,
  currentWindowLabel,
  seasonalCollections,
} from "@/lib/data/openseason";
import {
  formatUpdatedAt,
  formatWeatherMetrics,
  getPrimaryAlert,
} from "@/lib/live-conditions";
import {
  getPlanningState,
  labelDrivingTolerance,
  labelGroupProfile,
  labelInterest,
  labelTripFormat,
  labelLodgingStyle,
  labelOrigin,
  labelPlanningDate,
  labelTripIntensity,
  labelTripLength,
  toComparisonQueryString,
  toPlanningQueryString,
} from "@/lib/planning";

export default async function Home() {
  const { preferences, user } = await getUserPreferences();
  const planningState = getPlanningState({}, preferences);
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
  const leadDestination = topRecommendations[0];
  const leadWeatherMetrics = formatWeatherMetrics(leadDestination?.liveWeather).slice(0, 2);
  const leadAlert = getPrimaryAlert(leadDestination?.activeAlerts);

  return (
    <div className="space-y-16 py-10 sm:space-y-20 sm:py-14">
      <section className="hero-wash rounded-[36px] border border-white/10 px-6 py-8 text-white shadow-[0_30px_100px_rgba(24,50,58,0.22)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="eyebrow text-white/74">{currentWindowLabel}</p>
              <h1 className="display-title max-w-4xl text-5xl font-semibold leading-[0.95] sm:text-6xl">
                California road trips that actually fit right now.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
                OpenSeason is not a generic trip list. It ranks where to go, why it works,
                what to avoid, and what backup plan still holds if conditions change.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={hasSavedDefaults ? `/plan?${queryString}` : "/onboarding"}
                className={buttonVariants({ variant: "surface" })}
              >
                {hasSavedDefaults ? "Refine trip brief" : "Start onboarding"}
              </Link>
              <Link
                href={`/destinations/${topRecommendations[0]?.slug ?? "big-sur-carmel"}`}
                className={buttonVariants({
                  variant: "surface",
                  className: "bg-white/8",
                })}
              >
                Check best current pick
              </Link>
            </div>
          </div>

          <Card className="border-white/12 bg-white/10 text-white shadow-none">
            <CardHeader>
              <p className="eyebrow text-white/70">
                {user ? "Current profile-driven brief" : "Current planning brief"}
              </p>
              <h2 className="display-title text-3xl font-semibold">
                {labelOrigin(planningState.origin)}, {labelTripLength(planningState.tripLength).toLowerCase()},{" "}
                {labelGroupProfile(planningState.groupProfile).toLowerCase()}
              </h2>
            </CardHeader>
            <CardBody className="space-y-6 text-sm text-white/84">
              <div className="flex flex-wrap gap-2">
                {planningState.startDate ? (
                  <Badge className="bg-white/16 text-white">
                    {labelPlanningDate(planningState.startDate)}
                  </Badge>
                ) : null}
                <Badge className="bg-white/16 text-white">
                  {labelDrivingTolerance(planningState.drivingTolerance)}
                </Badge>
                <Badge className="bg-white/16 text-white">
                  {labelTripFormat(planningState.tripFormat)}
                </Badge>
                <Badge className="bg-white/16 text-white">
                  {labelTripIntensity(planningState.tripIntensity)}
                </Badge>
                <Badge className="bg-white/16 text-white">
                  {labelLodgingStyle(planningState.lodgingStyle)}
                </Badge>
                {planningState.interestMode === "open" ? (
                  <Badge className="bg-white/16 text-white">Open to anything</Badge>
                ) : (
                  planningState.interests.map((interest) => (
                    <Badge key={interest} className="bg-white/16 text-white">
                      {labelInterest(interest)}
                    </Badge>
                  ))
                )}
              </div>
              <div className="rounded-[24px] border border-white/12 bg-black/10 p-5">
                <p className="eyebrow text-white/60">Seasonal banner</p>
                <p className="mt-3 text-base leading-7">
                  Mid-April in California favors waterfall trips, coast loops, and the
                  last comfortable desert window. High Sierra expectations still need to
                  stay conservative.
                </p>
                {leadWeatherMetrics.length > 0 ? (
                  <p className="mt-4 text-sm leading-6 text-white/72">
                    Live on the current leader: {leadWeatherMetrics.join(" · ")}
                  </p>
                ) : null}
                {leadAlert ? (
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    Current alert pressure: {leadAlert.title}
                  </p>
                ) : null}
                {topRecommendations[0]?.updatedAt ? (
                  <p className="mt-4 text-sm text-white/65">
                    Live snapshot refreshed {formatUpdatedAt(topRecommendations[0].updatedAt)}
                  </p>
                ) : null}
                {user ? (
                  <p className="mt-4 text-sm leading-6 text-white/65">
                    This homepage is currently seeded from your saved profile defaults.
                  </p>
                ) : null}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Now"
          title="Ranked picks for this week"
          description="The app starts with a decision. These rankings already account for seasonality, weather, drive burden, group fit, and the quality of a usable Plan B."
        />
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {topRecommendations.map((destination) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              origin={planningState.origin}
            />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Collections"
          title="What is peaking in this season"
          description="The app should feel alive. Seasonal collections are how we surface timely windows without making users search destination by destination."
        />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {seasonalCollections.map((collection) => (
            <Card key={collection.name}>
              <CardHeader className="space-y-4">
                <Badge tone="warm">{collection.name}</Badge>
                <h3 className="text-2xl font-semibold tracking-tight">{collection.name}</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-sm leading-6 text-muted">{collection.description}</p>
                <p className="text-sm text-foreground">
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <p className="eyebrow">Comparison</p>
            <h2 className="display-title text-3xl font-semibold">
              Why the leader wins right now
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {comparisonSet.map((destination, index) => (
              <div
                key={destination.slug}
                className="rounded-[24px] border border-white/40 bg-white/50 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                      Option {index + 1}
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight">
                      {destination.name}
                    </h3>
                    <p className="text-sm leading-6 text-muted">{destination.currentVerdict}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{destination.fitScore}</p>
                    <p className="text-sm text-muted">{destination.fitLabel}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-foreground sm:grid-cols-2">
                  <p>
                    <span className="font-semibold">Best reason:</span>{" "}
                    {destination.bestActivity}
                  </p>
                  <p>
                    <span className="font-semibold">Biggest risk:</span>{" "}
                    {destination.mainWarning}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Link
                href={`/compare?${comparisonQueryString}`}
                className={buttonVariants({ variant: "secondary" })}
              >
                Open scrollable comparison
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Avoid / caution</p>
            <h2 className="display-title text-3xl font-semibold">
              What should not be ignored
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {cautionList.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-danger/14 bg-danger/6 px-4 py-4 text-sm leading-6 text-foreground"
              >
                {item}
              </div>
            ))}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
