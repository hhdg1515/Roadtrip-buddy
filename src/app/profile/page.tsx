import { Badge } from "@/components/ui/badge";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Textarea } from "@/components/ui/textarea";
import { getSavedTripSummaries, getUserPreferences } from "@/lib/account";
import { formatUpdatedAt } from "@/lib/live-conditions";
import { sanitizeNextPath } from "@/lib/safe-next-path";
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
      <div className="space-y-10 py-8">
        <SectionHeading
          eyebrow="Profile"
          title="Supabase auth not configured"
        />
        <Card>
          <CardBody className="space-y-2 text-sm leading-6 text-muted">
            <p>
              Profile, saved trips, and persistent preferences need Supabase auth env vars.
            </p>
            <p>
              Add `NEXT_PUBLIC_SUPABASE_URL` and a browser-safe key to activate this page.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-10 py-8">
        <SectionHeading
          eyebrow="Profile"
          title="Sign in to save plans"
        />

        {notice ? <StatusCard tone={notice.tone} title={notice.title} body={notice.body} /> : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <Card>
            <CardHeader>
              <p className="text-xs text-muted">Magic link</p>
              <h2 className="text-lg font-semibold">Email sign-in</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <form action={requestMagicLinkAction} className="space-y-3">
                <input type="hidden" name="next" value={next} />
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs text-muted">
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
              <p className="text-sm text-muted">
                The link signs you in without a password.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs text-muted">What unlocks</p>
              <h2 className="text-lg font-semibold">Why sign in</h2>
            </CardHeader>
            <CardBody className="space-y-2 text-sm leading-6 text-muted">
              <p>Saved trips stay attached to live conditions.</p>
              <p>Origin, group, and activity defaults persist across visits.</p>
              {next !== "/profile" ? (
                <p>
                  After sign-in you'll return to{" "}
                  <span className="font-medium text-foreground">{next}</span>.
                </p>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-8">
      <SectionHeading
        eyebrow="Profile"
        title="Defaults that sharpen ranking"
      />

      {notice ? <StatusCard tone={notice.tone} title={notice.title} body={notice.body} /> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Account</p>
            <h2 className="text-base font-semibold">{user.email}</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm leading-6">
            <p className="text-muted">Session active.</p>
            <form action={signOutAction}>
              <FormSubmitButton variant="secondary" pendingLabel="Signing out...">
                Sign out
              </FormSubmitButton>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Saved plans</p>
            <h2 className="text-2xl font-semibold tabular-nums">{savedTrips.length}</h2>
          </CardHeader>
          <CardBody className="text-sm text-muted">
            {savedTrips.length > 0
              ? "Connected to live condition updates."
              : "Save from any trip plan to start."}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Preferences updated</p>
            <h2 className="text-base font-semibold">
              {preferences.updatedAt ? formatUpdatedAt(preferences.updatedAt) : "Not yet"}
            </h2>
          </CardHeader>
          <CardBody className="text-sm text-muted">
            Moves when your defaults change.
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <p className="text-xs text-muted">Defaults</p>
          <h2 className="text-lg font-semibold">Persisted trip setup</h2>
        </CardHeader>
        <CardBody className="space-y-5">
          <form action={savePreferencesAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
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

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Favorite activities"
                helper="Comma separated. Example: Scenic views, Easy hiking."
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
                helper="Example: snow uncertainty, long dirt roads, heavy crowds."
                htmlFor="avoidances"
              >
                <Textarea
                  id="avoidances"
                  name="avoidances"
                  defaultValue={preferences.avoidances.join(", ")}
                />
              </Field>
            </div>

            <FormSubmitButton pendingLabel="Saving...">
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
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs text-muted">
        {label}
      </label>
      {children}
      {helper ? <p className="text-xs text-muted">{helper}</p> : null}
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
    <div className="flex items-center gap-3 rounded-md bg-muted-soft px-4 py-3 text-sm">
      <Badge tone={tone}>{title}</Badge>
      <span className="text-muted">{body}</span>
    </div>
  );
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
        body: "Session active.",
      };
    case "signed-out":
      return {
        tone: "soft" as const,
        title: "Signed out",
        body: "Session cleared.",
      };
    case "preferences-saved":
      return {
        tone: "default" as const,
        title: "Preferences saved",
        body: "Defaults written to Supabase.",
      };
    case "sign-in-required":
      return {
        tone: "warm" as const,
        title: "Sign in required",
        body: "Saving plans and defaults needs an authenticated session.",
      };
    case "invalid-email":
      return {
        tone: "danger" as const,
        title: "Email looks invalid",
        body: "Use a real email so Supabase can send the magic link.",
      };
    case "auth-error":
      return {
        tone: "danger" as const,
        title: "Auth failed",
        body: "Try requesting a fresh magic link.",
      };
    case "preferences-error":
      return {
        tone: "danger" as const,
        title: "Preferences failed",
        body: "The update did not complete. Try again.",
      };
    case "supabase-missing":
      return {
        tone: "danger" as const,
        title: "Supabase unavailable",
        body: "Auth configuration is missing in this environment.",
      };
    default:
      return null;
  }
}
