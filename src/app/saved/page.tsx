import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser, getSavedTripSummaries, getUserPreferences } from "@/lib/account";
import { formatUpdatedAt } from "@/lib/live-conditions";
import { pickPlanningQueryString, withQueryString } from "@/lib/planning";
import { deleteSavedTripAction, renameSavedTripAction } from "@/app/saved/actions";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SavedPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = getFirstValue(resolvedSearchParams.status);
  const planningQueryString = pickPlanningQueryString(resolvedSearchParams);
  const savedPath = withQueryString("/saved", planningQueryString);
  const planPath = withQueryString("/plan", planningQueryString);
  const [{ isConfigured }, user, savedTrips] = await Promise.all([
    getUserPreferences(),
    getCurrentUser(),
    getSavedTripSummaries(),
  ]);

  if (!isConfigured) {
    return (
      <div className="space-y-10 py-8">
        <SectionHeading eyebrow="Saved" title="Saved trips need Supabase auth" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-10 py-8">
        <SectionHeading eyebrow="Saved" title="Sign in to see saved trips" />
        <Card>
          <CardBody className="space-y-3 text-sm leading-6">
            <p className="text-muted">
              Request a magic link on the profile page. Saved trips will appear here with
              live condition context.
            </p>
            <Link
              href={`/profile?next=${encodeURIComponent(savedPath)}`}
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              Open profile sign-in
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  const notice = getSavedNotice(status);

  return (
    <div className="space-y-10 py-8">
      <SectionHeading eyebrow="Saved" title="Your trips, still live" />

      {notice ? <StatusNote tone={notice.tone} label={notice.label} message={notice.message} /> : null}

      {savedTrips.length === 0 ? (
        <Card>
          <CardBody className="space-y-3 text-sm leading-6">
            <p className="text-muted">
              Nothing saved yet. Open a plan and hit save.
            </p>
            <Link href={planPath} className={buttonVariants({ variant: "primary", size: "sm" })}>
              Open planning
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {savedTrips.map((trip) => (
            <Card key={trip.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs text-muted">
                      {trip.region} · {formatOrigin(trip.userOrigin)} · saved {formatSavedAt(trip.savedAt)}
                    </p>
                    <h2 className="text-lg font-semibold">{trip.title}</h2>
                    <p className="text-xs text-muted">{trip.destinationName}</p>
                  </div>
                  {trip.fitScore != null ? (
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-semibold tabular-nums">{trip.fitScore}</p>
                      <FitScoreBadge score={trip.fitScore} showScore={false} size="sm" className="mt-1" />
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardBody className="space-y-4 text-sm leading-6">
                {trip.currentVerdict ? <p>{trip.currentVerdict}</p> : null}
                <div>
                  <p className="text-xs text-muted">Current risk</p>
                  <p className="mt-0.5 text-muted">
                    {trip.mainWarning ?? "Live conditions syncing."}
                  </p>
                </div>

                <form action={renameSavedTripAction} className="space-y-2">
                  <input type="hidden" name="id" value={trip.id} />
                  <label htmlFor={`trip-title-${trip.id}`} className="block text-xs text-muted">
                    Rename
                  </label>
                  <Input
                    id={`trip-title-${trip.id}`}
                    name="title"
                    defaultValue={trip.title}
                    maxLength={120}
                  />
                  <FormSubmitButton variant="secondary" size="sm" pendingLabel="Saving...">
                    Save title
                  </FormSubmitButton>
                </form>

                {trip.updatedAt ? (
                  <p className="text-xs text-muted">
                    Refreshed {formatUpdatedAt(trip.updatedAt)}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={trip.destinationHref}
                    className={buttonVariants({ variant: "primary", size: "sm" })}
                  >
                    Open trip
                  </Link>
                  <form action={deleteSavedTripAction}>
                    <input type="hidden" name="id" value={trip.id} />
                    <FormSubmitButton
                      variant="ghost"
                      size="sm"
                      pendingLabel="Removing..."
                      className="text-danger hover:bg-danger/8"
                    >
                      Remove
                    </FormSubmitButton>
                  </form>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusNote({
  tone,
  label,
  message,
}: Readonly<{
  tone: "default" | "soft" | "danger";
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

function getSavedNotice(status: string | undefined) {
  switch (status) {
    case "signed-in":
      return { tone: "default" as const, label: "Signed in", message: "Saved plans loaded." };
    case "deleted":
      return { tone: "soft" as const, label: "Removed", message: "Plan deleted." };
    case "delete-error":
      return { tone: "danger" as const, label: "Delete failed", message: "Try again." };
    case "renamed":
      return { tone: "default" as const, label: "Title updated", message: "Saved." };
    case "rename-error":
      return { tone: "danger" as const, label: "Rename failed", message: "Try again." };
    default:
      return null;
  }
}

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatOrigin(origin: string) {
  switch (origin) {
    case "bay-area":
      return "Bay Area";
    case "los-angeles":
      return "Los Angeles";
    case "san-diego":
      return "San Diego";
    case "sacramento":
      return "Sacramento";
    default:
      return origin;
  }
}
