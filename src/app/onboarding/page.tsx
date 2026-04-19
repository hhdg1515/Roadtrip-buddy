import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import {
  drivingToleranceOptions,
  groupProfileOptions,
  interestOptions,
  originOptions,
} from "@/lib/data/openseason";
import {
  getPlanningState,
  pickPlanningQueryString,
  withQueryString,
} from "@/lib/planning";
import { completeOnboardingAction } from "@/app/onboarding/actions";

const inputClass =
  "h-10 w-full rounded-md bg-muted-soft px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ocean/30";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OnboardingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { user, preferences } = await getUserPreferences();
  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const planPath = withQueryString("/plan", pickPlanningQueryString(resolvedSearchParams));

  return (
    <div className="space-y-10 py-8">
      <SectionHeading
        eyebrow="Onboarding"
        title="Set four defaults, then plan"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Trip defaults</p>
            <h2 className="text-lg font-semibold">How you usually travel</h2>
          </CardHeader>
          <CardBody className="space-y-5">
            <form action={completeOnboardingAction} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Origin city" htmlFor="onboarding-origin">
                  <select
                    id="onboarding-origin"
                    name="origin"
                    defaultValue={planningState.origin}
                    className={inputClass}
                  >
                    {originOptions.map((origin) => (
                      <option key={origin.id} value={origin.id}>
                        {origin.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Drive tolerance" htmlFor="onboarding-driving-tolerance">
                  <select
                    id="onboarding-driving-tolerance"
                    name="drivingTolerance"
                    defaultValue={planningState.drivingTolerance}
                    className={inputClass}
                  >
                    {drivingToleranceOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Typical group" htmlFor="onboarding-group-profile">
                  <select
                    id="onboarding-group-profile"
                    name="groupProfile"
                    defaultValue={planningState.groupProfile}
                    className={inputClass}
                  >
                    {groupProfileOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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

              <div className="flex flex-wrap gap-2">
                <FormSubmitButton pendingLabel="Building shortlist...">
                  See my shortlist
                </FormSubmitButton>
                <Link href={planPath} className={buttonVariants({ variant: "ghost" })}>
                  Skip for now
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Why this is short</p>
            <h2 className="text-lg font-semibold">Four defaults is enough</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm leading-6 text-muted">
            <p>
              Origin, drive tolerance, group, and activity bias feed the shortlist.
              Trip length, date, format, and lodging live in `/plan` — you can see their
              effect there immediately.
            </p>
            <p>
              {user
                ? "Signed in — these defaults save to your profile."
                : "You're not signed in. That's fine; the brief still works for this session."}
            </p>
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
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
