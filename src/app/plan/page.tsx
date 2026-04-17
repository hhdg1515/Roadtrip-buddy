import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import { getRankedDestinations } from "@/lib/data/repository";
import {
  drivingToleranceOptions,
  groupProfileOptions,
  interestOptions,
  lodgingStyleOptions,
  originOptions,
  tripFormatOptions,
  tripIntensityOptions,
  tripLengthOptions,
} from "@/lib/data/openseason";
import {
  describePlanningState,
  getPlanningState,
  labelDrivingTolerance,
  labelGroupProfile,
  labelInterest,
  labelTripFormat,
  labelLodgingStyle,
  labelPlanningDate,
  labelTripIntensity,
  toComparisonQueryString,
  toPlanningQueryString,
} from "@/lib/planning";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlanPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = getFirstValue(resolvedSearchParams.status);
  const { preferences, user } = await getUserPreferences();
  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const ranked = await getRankedDestinations(planningState.origin, planningState.tripLength, {
    drivingTolerance: planningState.drivingTolerance,
    groupProfile: planningState.groupProfile,
    tripFormat: planningState.tripFormat,
    tripIntensity: planningState.tripIntensity,
    lodgingStyle: planningState.lodgingStyle,
    startDate: planningState.startDate,
    interests: planningState.interests,
  });
  const comparisonSet = ranked.slice(0, 3);
  const comparisonCandidates = ranked.slice(0, 6);
  const queryString = toPlanningQueryString(planningState);
  const comparisonQueryString = toComparisonQueryString(
    planningState,
    comparisonCandidates.map((destination) => destination.slug),
  );

  return (
    <div className="space-y-12 py-10">
      <SectionHeading
        eyebrow="Plan"
        title="Constraints first, itinerary second"
        description="This page should narrow the field, not auto-choose for you. Tune the constraints, review the ranked shortlist, then open whichever plan you actually want to inspect."
      />

      {status === "onboarding-complete" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Onboarding complete</Badge>
            </div>
            <p className="mt-3">
              Your trip brief is active now. Review the shortlist, open the option you actually
              want, and come back here if you want to retune the inputs.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {status === "onboarding-session-only" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone="warm">Session-only brief</Badge>
            </div>
            <p className="mt-3">
              Your onboarding choices are active in this shortlist now, but they were not saved to
              a profile because you are not signed in. Continue planning here, or sign in later if
              you want these defaults to persist.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {planningState.usedProfileDefaults && user ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Using profile defaults</Badge>
            </div>
            <p className="mt-3">
              This plan is currently seeded from your saved profile defaults for{" "}
              <span className="font-semibold">{preferences.originCity}</span>. Change anything
              below and re-run the shortlist.
            </p>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <p className="eyebrow">Plan input</p>
            <h2 className="display-title text-3xl font-semibold">Trip brief that actually drives ranking</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            <form action="/plan" className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Origin" htmlFor="plan-origin">
                  <select
                    id="plan-origin"
                    name="origin"
                    defaultValue={planningState.origin}
                    className="h-12 w-full rounded-[18px] border border-line bg-white/85 px-4 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18"
                  >
                    {originOptions.map((origin) => (
                      <option key={origin.id} value={origin.id}>
                        {origin.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Trip length" htmlFor="plan-trip-length">
                  <select
                    id="plan-trip-length"
                    name="tripLength"
                    defaultValue={planningState.tripLength}
                    className="h-12 w-full rounded-[18px] border border-line bg-white/85 px-4 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18"
                  >
                    {tripLengthOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Start date" htmlFor="plan-start-date">
                  <input
                    id="plan-start-date"
                    type="date"
                    name="startDate"
                    defaultValue={planningState.startDate ?? ""}
                    className="h-12 w-full rounded-[18px] border border-line bg-white/85 px-4 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18"
                  />
                </Field>

                <Field label="Driving tolerance" htmlFor="plan-driving-tolerance">
                  <select
                    id="plan-driving-tolerance"
                    name="drivingTolerance"
                    defaultValue={planningState.drivingTolerance}
                    className="h-12 w-full rounded-[18px] border border-line bg-white/85 px-4 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18"
                  >
                    {drivingToleranceOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Group style" htmlFor="plan-group-profile">
                  <select
                    id="plan-group-profile"
                    name="groupProfile"
                    defaultValue={planningState.groupProfile}
                    className="h-12 w-full rounded-[18px] border border-line bg-white/85 px-4 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18"
                  >
                    {groupProfileOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Trip format" htmlFor="plan-trip-format">
                  <select
                    id="plan-trip-format"
                    name="tripFormat"
                    defaultValue={planningState.tripFormat}
                    className="h-12 w-full rounded-[18px] border border-line bg-white/85 px-4 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18"
                  >
                    {tripFormatOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Day intensity" htmlFor="plan-trip-intensity">
                  <select
                    id="plan-trip-intensity"
                    name="tripIntensity"
                    defaultValue={planningState.tripIntensity}
                    className="h-12 w-full rounded-[18px] border border-line bg-white/85 px-4 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18"
                  >
                    {tripIntensityOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Lodging base" htmlFor="plan-lodging-style">
                  <select
                    id="plan-lodging-style"
                    name="lodgingStyle"
                    defaultValue={planningState.lodgingStyle}
                    className="h-12 w-full rounded-[18px] border border-line bg-white/85 px-4 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18"
                  >
                    {lodgingStyleOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                  Interests
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-[18px] border border-white/50 bg-white/70 px-4 py-3 text-sm text-foreground">
                    <input
                      type="radio"
                      name="interestMode"
                      value="open"
                      defaultChecked={planningState.interestMode === "open"}
                      className="h-4 w-4 border-line accent-[var(--color-ocean)]"
                    />
                    <span>Open to anything right now</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-[18px] border border-white/50 bg-white/70 px-4 py-3 text-sm text-foreground">
                    <input
                      type="radio"
                      name="interestMode"
                      value="specific"
                      defaultChecked={planningState.interestMode === "specific"}
                      className="h-4 w-4 border-line accent-[var(--color-ocean)]"
                    />
                    <span>Bias the shortlist with selected interests</span>
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {interestOptions.map((interest) => (
                    <label
                      key={interest.id}
                      className="flex items-center gap-3 rounded-[18px] border border-white/50 bg-white/70 px-4 py-3 text-sm text-foreground"
                    >
                      <input
                        type="checkbox"
                        name="interests"
                        value={interest.id}
                        defaultChecked={planningState.interests.includes(interest.id)}
                        className="h-4 w-4 rounded border-line accent-[var(--color-ocean)]"
                      />
                      <span>{interest.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className={buttonVariants({ variant: "primary" })}>
                Update shortlist
              </button>
            </form>

            <div className="rounded-[24px] border border-white/40 bg-white/55 p-5 text-sm leading-7">
              “{describePlanningState(planningState)}”
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Shortlist</p>
            <h2 className="display-title text-3xl font-semibold">Choose a ranked option to inspect</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {planningState.startDate ? (
                <Badge>{labelPlanningDate(planningState.startDate)}</Badge>
              ) : null}
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

            <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-white/40 bg-white/55 p-4 text-sm leading-6 text-muted">
              <Link
                href={`/compare?${comparisonQueryString}`}
                className={buttonVariants({ variant: "secondary" })}
              >
                Compare shortlist cards
              </Link>
              <p>
                Use this when the shortlist feels close and you want to swipe across the top{" "}
                {comparisonCandidates.length} options in one screen.
              </p>
            </div>

            {comparisonSet.map((destination, index) => (
              <Link
                key={destination.slug}
                href={`/plans/${destination.slug}?${queryString}`}
                className="block rounded-[24px] border border-white/40 bg-white/55 p-5 transition hover:-translate-y-0.5 hover:border-ocean/25 hover:bg-white/80 hover:shadow-[0_20px_45px_rgba(27,74,83,0.08)]"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                      Rank {index + 1}
                    </p>
                    <h3 className="text-2xl font-semibold">{destination.name}</h3>
                    <p className="text-sm text-muted">{destination.currentVerdict}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{destination.fitScore}</p>
                    <p className="text-sm text-muted">{destination.fitLabel}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted">
                  This is a ranked option, not the final answer. Click the card to inspect the full
                  trip plan, then come back here if another option looks better.
                </p>

                <div className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold">Best reason:</span>{" "}
                    {destination.bestActivity}
                  </p>
                  <p>
                    <span className="font-semibold">Biggest risk:</span>{" "}
                    {destination.mainWarning}
                  </p>
                  <p>
                    <span className="font-semibold">Best base:</span>{" "}
                    {destination.lodging.bestBase}
                  </p>
                  <p>
                    <span className="font-semibold">Plan B:</span>{" "}
                    {destination.planB.trigger}
                  </p>
                </div>
              </Link>
            ))}

            <div className="rounded-[24px] border border-dashed border-line bg-muted-soft/50 p-5 text-sm leading-6 text-muted">
              If none of these feel right, change the trip brief on the left and rerun the shortlist.
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: Readonly<{
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold uppercase tracking-[0.14em] text-muted"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
