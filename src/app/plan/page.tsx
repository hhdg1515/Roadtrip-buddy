import Link from "next/link";
import { DestinationGrid } from "@/components/destinations/destination-grid";
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
  labelOrigin,
  toPlanningQueryString,
} from "@/lib/planning";
import { PlanChipGroup } from "./plan-chip-group";
import { PlanLiveForm } from "./plan-live-form";

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
  const planningQueryString = toPlanningQueryString(planningState);
  const planningShortlist = ranked.slice(0, 6);
  const exploreHref = `/explore?${planningQueryString}`;

  return (
    <div className="space-y-8 py-8">
      <SectionHeading
        eyebrow="Plan"
        title="Tell us about this trip"
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
          message={`Seeded from ${labelOrigin(preferences.origin)}.`}
        />
      ) : null}

      <Card>
        <CardHeader>
          <p className="eyebrow">Trip brief</p>
          <h2 className="display-title text-[22px] text-foreground">
            Inputs that drive ranking
          </h2>
        </CardHeader>
        <CardBody className="space-y-6">
          <PlanLiveForm className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            <div className="space-y-5">
              <ChipField label="Driving tolerance">
                <PlanChipGroup
                  name="drivingTolerance"
                  options={drivingToleranceOptions}
                  defaultValue={planningState.drivingTolerance}
                />
              </ChipField>

              <ChipField label="Group">
                <PlanChipGroup
                  name="groupProfile"
                  options={groupProfileOptions}
                  defaultValue={planningState.groupProfile}
                />
              </ChipField>

              <ChipField label="Format">
                <PlanChipGroup
                  name="tripFormat"
                  options={tripFormatOptions}
                  defaultValue={planningState.tripFormat}
                />
              </ChipField>

              <ChipField label="Intensity">
                <PlanChipGroup
                  name="tripIntensity"
                  options={tripIntensityOptions}
                  defaultValue={planningState.tripIntensity}
                />
              </ChipField>

              <ChipField label="Lodging">
                <PlanChipGroup
                  name="lodgingStyle"
                  options={lodgingStyleOptions}
                  defaultValue={planningState.lodgingStyle}
                />
              </ChipField>
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

            <p className="text-sm italic leading-6 text-muted">
              &ldquo;{describePlanningState(planningState)}&rdquo;
            </p>

            <div className="pt-2 text-xs text-muted">
              Updates automatically. {ranked.length} destinations currently fit this brief.
            </div>
          </PlanLiveForm>
        </CardBody>
      </Card>

      {planningShortlist.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Ranked shortlist</p>
              <h2 className="display-title text-[22px] text-foreground">
                Best current matches for this trip
              </h2>
              <p className="mt-1 text-[13px] leading-[1.55] text-[#6b5c44]">
                Showing top {planningShortlist.length} of {ranked.length}. Open the full brief before deciding whether a place stays in consideration.
              </p>
            </div>
            <Link href={exploreHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
              Browse all in Explore
            </Link>
          </div>
          <DestinationGrid
            destinations={planningShortlist}
            origin={planningState.origin}
            planningState={planningState}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            enablePeek
          />
        </section>
      ) : null}
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

function ChipField({
  label,
  children,
}: Readonly<{
  label: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">{label}</p>
      {children}
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
