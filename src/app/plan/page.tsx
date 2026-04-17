import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
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
  labelTripFormat,
  labelLodgingStyle,
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
    <div className="space-y-10 py-8">
      <SectionHeading
        eyebrow="Plan"
        title="Constraints in, shortlist out"
      />

      {status === "onboarding-complete" ? (
        <StatusNote tone="default" label="Onboarding complete" message="Your brief is active." />
      ) : null}
      {status === "onboarding-session-only" ? (
        <StatusNote tone="warm" label="Session-only brief" message="Sign in to persist defaults." />
      ) : null}
      {planningState.usedProfileDefaults && user ? (
        <StatusNote
          tone="default"
          label="Profile defaults"
          message={`Seeded from ${preferences.originCity}.`}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Trip brief</p>
            <h2 className="text-lg font-semibold">Inputs that drive ranking</h2>
          </CardHeader>
          <CardBody className="space-y-5">
            <form action="/plan" className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Origin" htmlFor="plan-origin">
                  <Select id="plan-origin" name="origin" defaultValue={planningState.origin}>
                    {originOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Trip length" htmlFor="plan-trip-length">
                  <Select id="plan-trip-length" name="tripLength" defaultValue={planningState.tripLength}>
                    {tripLengthOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Start date" htmlFor="plan-start-date">
                  <input
                    id="plan-start-date"
                    type="date"
                    name="startDate"
                    defaultValue={planningState.startDate ?? ""}
                    className={inputClass}
                  />
                </Field>

                <Field label="Driving tolerance" htmlFor="plan-driving-tolerance">
                  <Select id="plan-driving-tolerance" name="drivingTolerance" defaultValue={planningState.drivingTolerance}>
                    {drivingToleranceOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Group" htmlFor="plan-group-profile">
                  <Select id="plan-group-profile" name="groupProfile" defaultValue={planningState.groupProfile}>
                    {groupProfileOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Format" htmlFor="plan-trip-format">
                  <Select id="plan-trip-format" name="tripFormat" defaultValue={planningState.tripFormat}>
                    {tripFormatOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Intensity" htmlFor="plan-trip-intensity">
                  <Select id="plan-trip-intensity" name="tripIntensity" defaultValue={planningState.tripIntensity}>
                    {tripIntensityOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Lodging" htmlFor="plan-lodging-style">
                  <Select id="plan-lodging-style" name="lodgingStyle" defaultValue={planningState.lodgingStyle}>
                    {lodgingStyleOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-xs text-muted">Interests</legend>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="interestMode"
                      value="open"
                      defaultChecked={planningState.interestMode === "open"}
                      className="h-4 w-4 accent-[var(--color-ocean)]"
                    />
                    Open to anything
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="interestMode"
                      value="specific"
                      defaultChecked={planningState.interestMode === "specific"}
                      className="h-4 w-4 accent-[var(--color-ocean)]"
                    />
                    Bias by selected
                  </label>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {interestOptions.map((interest) => (
                    <label
                      key={interest.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="interests"
                        value={interest.id}
                        defaultChecked={planningState.interests.includes(interest.id)}
                        className="h-4 w-4 rounded accent-[var(--color-ocean)]"
                      />
                      {interest.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className={buttonVariants({ variant: "primary" })}>
                Update shortlist
              </button>
            </form>

            <p className="pt-2 text-sm italic leading-6 text-muted">
              “{describePlanningState(planningState)}”
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Shortlist</p>
            <h2 className="text-lg font-semibold">Top 3 ranked options</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/compare?${comparisonQueryString}`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Full comparison
              </Link>
              <span className="text-xs text-muted">
                {comparisonCandidates.length} options · swipe through side by side
              </span>
            </div>

            <div className="space-y-3">
              {comparisonSet.map((destination, index) => (
                <Link
                  key={destination.slug}
                  href={`/destinations/${destination.slug}?${queryString}`}
                  className="block rounded-lg bg-muted-soft/50 p-4 transition-colors hover:bg-muted-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs text-muted">Rank {index + 1} · {destination.region}</p>
                      <h3 className="text-lg font-semibold">{destination.name}</h3>
                      <p className="text-sm text-muted">{destination.currentVerdict}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-semibold tabular-nums">{destination.fitScore}</p>
                      <FitScoreBadge score={destination.fitScore} showScore={false} size="sm" className="mt-1" />
                    </div>
                  </div>
                  <dl className="mt-3 grid gap-1 text-sm leading-6 sm:grid-cols-2">
                    <Row label="Best" value={destination.bestActivity} />
                    <Row label="Risk" value={destination.mainWarning} muted />
                    <Row label="Base" value={destination.lodging.bestBase} />
                    <Row label="Plan B" value={destination.planB.trigger} muted />
                  </dl>
                </Link>
              ))}
            </div>

            <p className="text-xs text-muted">
              None fit? Retune the brief on the left.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-md bg-muted-soft px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ocean/30";

function Select({
  id,
  name,
  defaultValue,
  children,
}: Readonly<{
  id: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
}>) {
  return (
    <select id={id} name={name} defaultValue={defaultValue} className={inputClass}>
      {children}
    </select>
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
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({
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
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={muted ? "text-muted" : "text-foreground"}>{value}</dd>
    </div>
  );
}

function StatusNote({
  tone,
  label,
  message,
}: Readonly<{
  tone: "default" | "warm";
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
