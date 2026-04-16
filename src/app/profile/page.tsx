import { Badge } from "@/components/ui/badge";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Textarea } from "@/components/ui/textarea";
import { getSavedTripSummaries, getUserPreferences } from "@/lib/account";
import { formatUpdatedAt } from "@/lib/live-conditions";
import {
  requestMagicLinkAction,
  savePreferencesAction,
  signOutAction,
} from "@/app/profile/actions";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfilePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = getFirstValue(resolvedSearchParams.status);
  const next = sanitizeNextPath(getFirstValue(resolvedSearchParams.next));
  const [{ isConfigured, user, preferences }, savedTrips] = await Promise.all([
    getUserPreferences(),
    getSavedTripSummaries(),
  ]);
  const notice = getProfileNotice(status);

  if (!isConfigured) {
    return (
      <div className="space-y-12 py-10">
        <SectionHeading
          eyebrow="Profile"
          title="Supabase auth is not configured yet"
          description="Profile, saved trips, and persistent preferences all depend on Supabase auth being available in this environment."
        />
        <Card>
          <CardHeader>
            <p className="eyebrow">Setup required</p>
            <h2 className="display-title text-3xl font-semibold">Add your auth env values first</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm leading-7 text-muted">
            <p>
              This page becomes live after `NEXT_PUBLIC_SUPABASE_URL` and a browser-safe
              Supabase key are available.
            </p>
            <p>
              Once that is in place, the page will handle magic-link sign-in, preferences, and
              saved trip access.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-12 py-10">
        <SectionHeading
          eyebrow="Profile"
          title="Sign in to save plans and keep conditions attached"
          description="OpenSeason uses magic-link email login for MVP. It keeps the auth flow light while still unlocking saved trips and persistent preferences."
        />

        {notice ? <StatusCard tone={notice.tone} title={notice.title} body={notice.body} /> : null}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <p className="eyebrow">Magic link</p>
              <h2 className="display-title text-3xl font-semibold">Email sign-in</h2>
            </CardHeader>
            <CardBody className="space-y-5">
              <form action={requestMagicLinkAction} className="space-y-4">
                <input type="hidden" name="next" value={next} />
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <FormSubmitButton pendingLabel="Sending link...">
                  Send magic link
                </FormSubmitButton>
              </form>
              <p className="text-sm leading-6 text-muted">
                The link arrives by email and signs you back into OpenSeason without a password.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <p className="eyebrow">What unlocks</p>
              <h2 className="display-title text-3xl font-semibold">Why sign in for MVP</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-7 text-muted">
              <p>Saved trip plans stop being dead exports and keep their live-condition context.</p>
              <p>Your default origin, group style, and activity preferences persist across visits.</p>
              {next !== "/profile" ? (
                <p>
                  After sign-in, you can go straight back to <span className="font-semibold text-foreground">{next}</span>.
                </p>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-10">
      <SectionHeading
        eyebrow="Profile"
        title="Stored defaults should sharpen ranking, not block exploration"
        description="Preferences exist so future road-trip decisions start closer to the right answer without turning the product into a setup wizard."
      />

      {notice ? <StatusCard tone={notice.tone} title={notice.title} body={notice.body} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="eyebrow">Account</p>
            <h2 className="text-2xl font-semibold tracking-tight">{user.email}</h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6">
            <p>Magic-link auth is active for this session.</p>
            <form action={signOutAction}>
              <FormSubmitButton variant="secondary" pendingLabel="Signing out...">
                Sign out
              </FormSubmitButton>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Saved plans</p>
            <h2 className="text-3xl font-semibold tracking-tight">{savedTrips.length}</h2>
          </CardHeader>
          <CardBody className="text-sm leading-6">
            {savedTrips.length > 0
              ? "Your saved plans now stay connected to destination condition updates."
              : "No saved plans yet. Save from any generated trip plan to start building your shortlist."}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Preferences refreshed</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              {preferences.updatedAt ? formatUpdatedAt(preferences.updatedAt) : "Not yet"}
            </h2>
          </CardHeader>
          <CardBody className="text-sm leading-6">
            This timestamp moves whenever your defaults change.
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <p className="eyebrow">Preference defaults</p>
          <h2 className="display-title text-3xl font-semibold">Persisted trip setup</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          <form action={savePreferencesAction} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Origin city" htmlFor="originCity">
                <Input id="originCity" name="originCity" defaultValue={preferences.originCity} />
              </Field>
              <Field label="Driving tolerance" htmlFor="drivingTolerance">
                <Input
                  id="drivingTolerance"
                  name="drivingTolerance"
                  defaultValue={preferences.drivingTolerance}
                />
              </Field>
              <Field label="Group default" htmlFor="groupDefault">
                <Input
                  id="groupDefault"
                  name="groupDefault"
                  defaultValue={preferences.groupDefault}
                />
              </Field>
              <Field label="Lodging preference" htmlFor="lodgingPreference">
                <Input
                  id="lodgingPreference"
                  name="lodgingPreference"
                  defaultValue={preferences.lodgingPreference}
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Favorite activities"
                helper="Comma or line separated. Example: Scenic views, Easy hiking, Good food."
                htmlFor="favoriteActivities"
              >
                <Textarea
                  id="favoriteActivities"
                  name="favoriteActivities"
                  defaultValue={preferences.favoriteActivities.join(", ")}
                />
              </Field>
              <Field
                label="Avoidances"
                helper="Use this for things like snow uncertainty, long dirt roads, or heavy crowds."
                htmlFor="avoidances"
              >
                <Textarea
                  id="avoidances"
                  name="avoidances"
                  defaultValue={preferences.avoidances.join(", ")}
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              {preferences.favoriteActivities.map((interest) => (
                <Badge key={interest}>{interest}</Badge>
              ))}
            </div>

            <FormSubmitButton pendingLabel="Saving preferences...">
              Save defaults
            </FormSubmitButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  helper,
  children,
}: Readonly<{
  label: string;
  htmlFor: string;
  helper?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {helper ? <p className="text-sm leading-6 text-muted">{helper}</p> : null}
    </div>
  );
}

function StatusCard({
  tone,
  title,
  body,
}: Readonly<{
  tone: "default" | "warm" | "danger" | "soft";
  title: string;
  body: string;
}>) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-3 pt-6 text-sm leading-6">
        <Badge tone={tone}>{title}</Badge>
        <p className="text-foreground">{body}</p>
      </CardBody>
    </Card>
  );
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeNextPath(value: string | undefined) {
  return value?.startsWith("/") ? value : "/profile";
}

function getProfileNotice(status: string | undefined) {
  switch (status) {
    case "check-email":
      return {
        tone: "warm" as const,
        title: "Check your inbox",
        body: "A magic link was requested. Open it from your email to finish signing in.",
      };
    case "signed-in":
      return {
        tone: "default" as const,
        title: "Signed in",
        body: "Your session is active. You can now save plans and persist profile defaults.",
      };
    case "signed-out":
      return {
        tone: "soft" as const,
        title: "Signed out",
        body: "The current session has been cleared.",
      };
    case "preferences-saved":
      return {
        tone: "default" as const,
        title: "Preferences saved",
        body: "Your default trip settings were written to Supabase.",
      };
    case "sign-in-required":
      return {
        tone: "warm" as const,
        title: "Sign in required",
        body: "Saving trips and profile defaults requires an authenticated session.",
      };
    case "invalid-email":
      return {
        tone: "danger" as const,
        title: "Email looks invalid",
        body: "Use a real email address so Supabase can send the magic link.",
      };
    case "auth-error":
      return {
        tone: "danger" as const,
        title: "Auth failed",
        body: "The sign-in step did not complete. Try requesting a fresh magic link.",
      };
    case "preferences-error":
      return {
        tone: "danger" as const,
        title: "Preferences failed",
        body: "The preferences update did not complete. Try again.",
      };
    case "supabase-missing":
      return {
        tone: "danger" as const,
        title: "Supabase unavailable",
        body: "This environment is missing the auth configuration required for profile features.",
      };
    default:
      return null;
  }
}
