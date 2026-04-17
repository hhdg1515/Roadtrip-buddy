import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationHeroImage } from "@/components/destinations/destination-hero-image";
import { DestinationMapCard } from "@/components/destinations/destination-map-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { PlanBCard } from "@/components/ui/plan-b-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { getCurrentUser, getUserPreferences } from "@/lib/account";
import { getDestinationBySlugFromRepository } from "@/lib/data/repository";
import { formatWeatherMetrics, getPrimaryAlert } from "@/lib/live-conditions";
import {
  getPlanningState,
  labelDrivingTolerance,
  labelGroupProfile,
  labelInterest,
  labelTripFormat,
  labelLodgingStyle,
  labelPlanningDate,
  labelTripIntensity,
  toPlanningQueryString,
} from "@/lib/planning";
import { saveTripPlanAction } from "@/app/plans/actions";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlanDetailPage({ params, searchParams }: PageProps) {
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

  const weatherMetrics = formatWeatherMetrics(destination.liveWeather).slice(0, 3);
  const primaryAlert = getPrimaryAlert(destination.activeAlerts);
  const saved = getFirstValue(resolvedSearchParams.saved);
  const status = getFirstValue(resolvedSearchParams.status);
  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const saveReturnTo = `/plans/${destination.slug}?${toPlanningQueryString(planningState)}`;

  return (
    <div className="space-y-12 py-10">
      {saved === "1" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Plan saved</Badge>
            </div>
            <p className="mt-3">
              This trip is now in your saved list and will continue reflecting current destination
              conditions.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {status === "save-error" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone="danger">Save failed</Badge>
            </div>
            <p className="mt-3">
              The plan could not be stored in Supabase. Try again after confirming your session is
              active.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {status === "signed-in" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone="default">Signed in</Badge>
            </div>
            <p className="mt-3">
              Your session is active now. Save this plan whenever you are ready.
            </p>
          </CardBody>
        </Card>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="hero-wash border-white/10 text-white">
          <CardHeader>
            <p className="eyebrow text-white/66">Selected trip plan</p>
            <h1 className="display-title text-5xl font-semibold leading-[0.96]">
              {destination.name}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/84">
              {destination.currentVerdict}
            </p>
          </CardHeader>
          <CardBody className="space-y-4 text-sm text-white/82">
            <p>
              <span className="font-semibold">Why this plan fits:</span>{" "}
              {destination.whyNow}
            </p>
            <p>
              <span className="font-semibold">Main risk:</span>{" "}
              {destination.mainWarning}
            </p>
            <p>
              <span className="font-semibold">Backup strategy:</span>{" "}
              {destination.planB.alternative}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Plan summary</p>
            <h2 className="display-title text-3xl font-semibold">Trip verdict</h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              {planningState.startDate ? <Badge>{labelPlanningDate(planningState.startDate)}</Badge> : null}
              <FitScoreBadge score={destination.fitScore} />
              <Badge tone="soft">{destination.bestActivity}</Badge>
              <Badge tone="warm">{labelDrivingTolerance(planningState.drivingTolerance)}</Badge>
              <Badge tone="soft">{labelGroupProfile(planningState.groupProfile)}</Badge>
              <Badge tone="soft">{labelTripFormat(planningState.tripFormat)}</Badge>
              <Badge tone="soft">{labelTripIntensity(planningState.tripIntensity)}</Badge>
              <Badge tone="soft">{labelLodgingStyle(planningState.lodgingStyle)}</Badge>
              {destination.riskBadges.map((risk) => (
                <RiskBadge key={risk} label={risk} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {planningState.interestMode === "open" ? (
                <Badge>Open to anything</Badge>
              ) : (
                planningState.interests.map((interest) => (
                  <Badge key={interest}>{labelInterest(interest)}</Badge>
                ))
              )}
            </div>
            {weatherMetrics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weatherMetrics.map((metric) => (
                  <Badge key={metric} tone="soft">
                    {metric}
                  </Badge>
                ))}
              </div>
            ) : null}
            <p>{destination.currentVerdict}</p>
            {primaryAlert ? (
              <p>
                <span className="font-semibold">Active alert:</span> {primaryAlert.title}
              </p>
            ) : null}
            <p>
              <span className="font-semibold">Best base:</span>{" "}
              {destination.lodging.bestBase}
            </p>
            <p>
              <span className="font-semibold">Trip style:</span>{" "}
              {labelTripFormat(planningState.tripFormat)} with{" "}
              {labelTripIntensity(planningState.tripIntensity).toLowerCase()} and{" "}
              {labelLodgingStyle(planningState.lodgingStyle).toLowerCase()}.
            </p>
            <p>
              <span className="font-semibold">Plan B trigger:</span>{" "}
              {destination.planB.trigger}
            </p>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <DestinationHeroImage
          slug={destination.slug}
          name={destination.name}
          region={destination.region}
          summary={destination.summary}
        />
        <DestinationMapCard destination={destination} focusOrigin={planningState.origin} />
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow">Day by day</p>
          <h2 className="display-title text-4xl font-semibold">Practical itinerary</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {destination.itinerary.map((day) => (
            <Card key={day.day}>
              <CardHeader>
                <p className="eyebrow">{day.day}</p>
              </CardHeader>
              <CardBody className="space-y-4 text-sm leading-6">
                <p>
                  <span className="font-semibold">Morning:</span> {day.morning}
                </p>
                <p>
                  <span className="font-semibold">Midday:</span> {day.midday}
                </p>
                <p>
                  <span className="font-semibold">Afternoon:</span> {day.afternoon}
                </p>
                <p>
                  <span className="font-semibold">Evening:</span> {day.evening}
                </p>
                <p className="rounded-[20px] bg-muted-soft px-4 py-4 text-muted">
                  {day.note}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="eyebrow">Conditions and warnings</p>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6">
            {destination.avoid.map((item) => (
              <div key={item} className="rounded-[20px] bg-danger/6 px-4 py-4">
                {item}
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Plan B</p>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6">
            <PlanBCard plan={destination.planB} />
            <div className="flex flex-wrap gap-3 pt-2">
              {user ? (
                <form action={saveTripPlanAction}>
                  <input type="hidden" name="slug" value={destination.slug} />
                  <input type="hidden" name="returnTo" value={saveReturnTo} />
                  <input type="hidden" name="origin" value={planningState.origin} />
                  <input type="hidden" name="tripLength" value={planningState.tripLength} />
                  <input type="hidden" name="startDate" value={planningState.startDate ?? ""} />
                  <input
                    type="hidden"
                    name="drivingTolerance"
                    value={planningState.drivingTolerance}
                  />
                  <input type="hidden" name="groupProfile" value={planningState.groupProfile} />
                  <input type="hidden" name="tripFormat" value={planningState.tripFormat} />
                  <input type="hidden" name="tripIntensity" value={planningState.tripIntensity} />
                  <input type="hidden" name="lodgingStyle" value={planningState.lodgingStyle} />
                  <input type="hidden" name="interestMode" value={planningState.interestMode} />
                  {planningState.interests.map((interest) => (
                    <input key={interest} type="hidden" name="interests" value={interest} />
                  ))}
                  <FormSubmitButton pendingLabel="Saving plan...">
                    Save this plan
                  </FormSubmitButton>
                </form>
              ) : (
                <Link
                  href={`/profile?next=${encodeURIComponent(saveReturnTo)}`}
                  className={buttonVariants({ variant: "primary" })}
                >
                  Sign in to save
                </Link>
              )}
              <Link
                href={`/destinations/${destination.slug}`}
                className={buttonVariants({ variant: "secondary" })}
              >
                View destination detail
              </Link>
              {planningState.groupProfile === "mixed" ? (
                <Link
                  href={`/split-group/${destination.slug}?${toPlanningQueryString(planningState)}`}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Plan for a mixed group
                </Link>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
