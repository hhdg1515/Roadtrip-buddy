import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import { getPlanningState } from "@/lib/planning";
import { completeOnboardingAction } from "@/app/onboarding/actions";

export default async function OnboardingPage() {
  const { user, preferences } = await getUserPreferences();
  const planningState = getPlanningState({}, preferences);

  return (
    <div className="space-y-12 py-10">
      <SectionHeading
        eyebrow="Onboarding"
        title="Start with a useful trip brief"
        description="This should stay light. Set the four defaults that matter most, then finish the rest in the planning screen after you see actual shortlist pressure."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <Card>
          <CardHeader>
            <p className="eyebrow">Trip defaults</p>
            <h2 className="display-title text-3xl font-semibold">Tell the app how you usually travel</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            <form action={completeOnboardingAction} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Origin city" htmlFor="onboarding-origin">
                  <select
                    id="onboarding-origin"
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

                <Field label="Weekend drive tolerance" htmlFor="onboarding-driving-tolerance">
                  <select
                    id="onboarding-driving-tolerance"
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

                <Field label="Typical group" htmlFor="onboarding-group-profile">
                  <select
                    id="onboarding-group-profile"
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
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                  Favorite trip types
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
                    <span>Bias future shortlists with selected interests</span>
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

              <div className="flex flex-wrap gap-3">
                <FormSubmitButton pendingLabel="Building shortlist...">
                  See my shortlist
                </FormSubmitButton>
                <Link href="/plan" className={buttonVariants({ variant: "ghost" })}>
                  Skip setup for now
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Why this screen exists</p>
            <h2 className="display-title text-3xl font-semibold">Onboarding should stay light</h2>
          </CardHeader>
          <CardBody className="space-y-5 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Minimum useful defaults</Badge>
              <Badge tone="soft">Skip allowed</Badge>
              {user ? <Badge tone="warm">Signed-in defaults save automatically</Badge> : null}
            </div>

            <p>
              The job of onboarding is not to trap the user in a questionnaire. It should only set
              origin, drive tolerance, group type, and activity bias.
            </p>
            <p>
              This form feeds straight into the ranked shortlist. Trip length, timing, trip format,
              and lodging are better handled in `/plan`, where you can see their effect immediately.
            </p>

            <div className="rounded-[24px] border border-white/40 bg-white/55 p-5">
              <p className="eyebrow">What happens next</p>
              <div className="mt-3 space-y-3">
                <p>1. Submit this brief.</p>
                <p>2. Review the shortlist in `/plan`.</p>
                <p>3. Add trip format, date, and lodging details there.</p>
                <p>4. Open the option you actually want to inspect.</p>
              </div>
            </div>

            {!user ? (
              <div className="rounded-[24px] border border-dashed border-line bg-muted-soft/60 p-5">
                <p className="font-semibold text-foreground">Not signed in is fine.</p>
                <p className="mt-2 text-muted">
                  You can still complete onboarding and get a useful shortlist now. Sign in later
                  only if you want saved plans and persistent defaults.
                </p>
              </div>
            ) : null}
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
