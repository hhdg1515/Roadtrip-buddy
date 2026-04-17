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
import { getCurrentUser, getUserPreferences } from "@/lib/account";
import { buildScoringContext } from "@/lib/data/openseason";
import { getDestinationBySlugFromRepository } from "@/lib/data/repository";
import { formatWeatherMetrics, getPrimaryAlert } from "@/lib/live-conditions";
import {
  getPlanningState,
  labelDrivingTolerance,
  labelGroupProfile,
  labelLodgingStyle,
  labelPlanningDate,
  labelTripFormat,
  labelTripIntensity,
  rankingContextFromPlanning,
  toPlanningQueryString,
} from "@/lib/planning";
import { calculateTripFitScore } from "@/lib/scoring/trip-fit";
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
  const rankingContext = rankingContextFromPlanning(planningState);
  const scoringContext = buildScoringContext(
    destination,
    planningState.origin,
    planningState.tripLength,
    rankingContext,
  );
  const contextualFitScore = calculateTripFitScore(destination.breakdown, scoringContext);
  const saveReturnTo = `/plans/${destination.slug}?${toPlanningQueryString(planningState)}`;

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
        <div className="space-y-3">
          <p className="text-xs text-muted">Selected plan · {destination.region}</p>
          <h1 className="display-title text-4xl font-semibold leading-[1.05] sm:text-5xl">
            {destination.name}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-foreground">
            {destination.currentVerdict}
          </p>
          <dl className="mt-3 space-y-1 text-sm leading-6">
            <TextRow label="Why it fits" value={destination.whyNow} />
            <TextRow label="Main risk" value={destination.mainWarning} />
            <TextRow label="Backup" value={destination.planB.alternative} />
          </dl>
        </div>

        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Trip verdict</p>
            <div className="flex items-center justify-between gap-3">
              <FitScoreBadge score={contextualFitScore} />
              {planningState.startDate ? (
                <span className="text-xs text-muted">{labelPlanningDate(planningState.startDate)}</span>
              ) : null}
            </div>
          </CardHeader>
          <CardBody className="space-y-2 text-sm leading-6">
            <dl className="space-y-1">
              <TextRow label="Best activity" value={destination.bestActivity} />
              <TextRow label="Drive tolerance" value={labelDrivingTolerance(planningState.drivingTolerance)} />
              <TextRow label="Group" value={labelGroupProfile(planningState.groupProfile)} />
              <TextRow label="Format" value={labelTripFormat(planningState.tripFormat)} />
              <TextRow label="Intensity" value={labelTripIntensity(planningState.tripIntensity)} />
              <TextRow label="Lodging" value={labelLodgingStyle(planningState.lodgingStyle)} />
              <TextRow label="Base town" value={destination.lodging.bestBase} />
              <TextRow label="Plan B trigger" value={destination.planB.trigger} />
            </dl>
            {weatherMetrics.length > 0 ? (
              <p className="text-muted">{weatherMetrics.join(" · ")}</p>
            ) : null}
            {primaryAlert ? (
              <p className="text-danger">⚠ {primaryAlert.title}</p>
            ) : null}
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <DestinationHeroImage
          slug={destination.slug}
          name={destination.name}
          region={destination.region}
          summary={destination.summary}
        />
        <DestinationMapCard destination={destination} focusOrigin={planningState.origin} />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Day by day</p>
            <h2 className="text-2xl font-semibold">Practical itinerary</h2>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {destination.itinerary.map((day) => (
            <Card key={day.day}>
              <CardHeader>
                <p className="text-xs text-muted">{day.day}</p>
              </CardHeader>
              <CardBody className="space-y-1.5 text-sm leading-6">
                <TextRow label="Morning" value={day.morning} />
                <TextRow label="Midday" value={day.midday} />
                <TextRow label="Afternoon" value={day.afternoon} />
                <TextRow label="Evening" value={day.evening} />
                <p className="mt-2 text-xs text-muted">{day.note}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Conditions & warnings</p>
            <h2 className="text-base font-semibold">What to avoid</h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-1.5 text-sm leading-6">
              {destination.avoid.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-danger">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Backup</p>
            <h2 className="text-base font-semibold">Plan B</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm leading-6">
            <PlanBCard plan={destination.planB} />
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
                  <FormSubmitButton pendingLabel="Saving...">
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
              <Link
                href={`/destinations/${destination.slug}`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Destination detail
              </Link>
              {planningState.groupProfile === "mixed" ? (
                <Link
                  href={`/split-group/${destination.slug}?${toPlanningQueryString(planningState)}`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  Split group
                </Link>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </section>
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

function TextRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
