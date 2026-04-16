import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser, getSavedTripSummaries, getUserPreferences } from "@/lib/account";
import { formatUpdatedAt } from "@/lib/live-conditions";
import { deleteSavedTripAction, renameSavedTripAction } from "@/app/saved/actions";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SavedPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = getFirstValue(resolvedSearchParams.status);
  const [{ isConfigured }, user, savedTrips] = await Promise.all([
    getUserPreferences(),
    getCurrentUser(),
    getSavedTripSummaries(),
  ]);

  if (!isConfigured) {
    return (
      <div className="space-y-12 py-10">
        <SectionHeading
          eyebrow="Saved"
          title="Saved trips need Supabase auth"
          description="This page becomes useful after auth is configured, because saved plans are scoped to the current user."
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-12 py-10">
        <SectionHeading
          eyebrow="Saved"
          title="Sign in before saved trips become useful"
          description="Saved plans live behind auth because each saved itinerary belongs to a specific user session and profile."
        />
        <Card>
          <CardHeader>
            <p className="eyebrow">Sign in required</p>
            <h2 className="display-title text-3xl font-semibold">No session yet</h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6">
            <p>
              Use the profile page to request a magic link. After that, any saved trip plan will
              appear here with its live-condition context.
            </p>
            <Link
              href="/profile?next=%2Fsaved"
              className={buttonVariants({ variant: "primary" })}
            >
              Open profile sign-in
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-10">
      <SectionHeading
        eyebrow="Saved"
        title="Trips that stay useful after generation"
        description="A saved trip should keep its live fit score and current warning attached, instead of freezing into a stale itinerary export."
      />

      {status === "signed-in" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Signed in</Badge>
            </div>
            <p className="mt-3">Your session is active. Saved plans will now load from Supabase.</p>
          </CardBody>
        </Card>
      ) : null}

      {status === "deleted" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone="soft">Plan removed</Badge>
            </div>
            <p className="mt-3">The saved plan was deleted from your account.</p>
          </CardBody>
        </Card>
      ) : null}

      {status === "delete-error" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone="danger">Delete failed</Badge>
            </div>
            <p className="mt-3">The saved plan could not be removed. Try again.</p>
          </CardBody>
        </Card>
      ) : null}

      {status === "renamed" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Title updated</Badge>
            </div>
            <p className="mt-3">The saved trip title was updated.</p>
          </CardBody>
        </Card>
      ) : null}

      {status === "rename-error" ? (
        <Card>
          <CardBody className="pt-6 text-sm leading-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone="danger">Rename failed</Badge>
            </div>
            <p className="mt-3">The saved trip title could not be updated. Try again.</p>
          </CardBody>
        </Card>
      ) : null}

      {savedTrips.length === 0 ? (
        <Card>
          <CardHeader>
            <p className="eyebrow">Nothing saved yet</p>
            <h2 className="display-title text-3xl font-semibold">Start from any generated plan</h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6">
            <p>
              The fastest way to populate this page is to open a destination plan and hit
              “Save this plan”.
            </p>
            <Link href="/plan" className={buttonVariants({ variant: "primary" })}>
              Open planning flow
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {savedTrips.map((trip) => (
            <Card key={trip.id}>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">Saved trip</p>
                    <h2 className="text-3xl font-semibold tracking-tight">{trip.title}</h2>
                  </div>
                  {trip.fitScore != null ? (
                    <div className="text-right">
                      <p className="text-3xl font-bold">{trip.fitScore}</p>
                      <p className="text-sm text-muted">{trip.fitLabel}</p>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{trip.destinationName}</Badge>
                  <Badge tone="soft">{trip.region}</Badge>
                  <Badge>Saved {formatSavedAt(trip.savedAt)}</Badge>
                  <Badge tone="warm">{formatOrigin(trip.userOrigin)}</Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-4 text-sm leading-6">
                <form action={renameSavedTripAction} className="space-y-3">
                  <input type="hidden" name="id" value={trip.id} />
                  <div className="space-y-2">
                    <label htmlFor={`trip-title-${trip.id}`} className="text-sm font-semibold text-foreground">
                      Trip title
                    </label>
                    <Input
                      id={`trip-title-${trip.id}`}
                      name="title"
                      defaultValue={trip.title}
                      maxLength={120}
                    />
                  </div>
                  <FormSubmitButton
                    variant="secondary"
                    size="sm"
                    pendingLabel="Saving title..."
                  >
                    Save title
                  </FormSubmitButton>
                </form>

                {trip.currentVerdict ? <p>{trip.currentVerdict}</p> : null}
                <div className="rounded-[22px] bg-muted-soft px-4 py-4">
                  <p className="font-semibold text-foreground">Current trip-shaping risk</p>
                  <p className="mt-2 text-muted">
                    {trip.mainWarning ?? "Live destination conditions are still syncing."}
                  </p>
                </div>
                {trip.updatedAt ? (
                  <p className="text-muted">
                    Destination snapshot refreshed {formatUpdatedAt(trip.updatedAt)}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/plans/${trip.slug}`}
                    className={buttonVariants({ variant: "primary" })}
                  >
                    Open plan
                  </Link>
                  <Link
                    href={`/destinations/${trip.slug}`}
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    Check conditions
                  </Link>
                  <form action={deleteSavedTripAction}>
                    <input type="hidden" name="id" value={trip.id} />
                    <FormSubmitButton
                      variant="ghost"
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

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
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
