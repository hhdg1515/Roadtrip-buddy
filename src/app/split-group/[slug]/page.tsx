import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityChip, inferActivityKind } from "@/components/ui/activity-chip";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { PlanBCard } from "@/components/ui/plan-b-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { getUserPreferences } from "@/lib/account";
import { getDestinationBySlugFromRepository } from "@/lib/data/repository";
import type { Destination } from "@/lib/data/openseason";
import {
  getPlanningState,
  labelOrigin,
  labelPlanningDate,
  labelTripLength,
  toPlanningQueryString,
} from "@/lib/planning";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SplitGroupPlanPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const { preferences } = await getUserPreferences();
  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const destination = await getDestinationBySlugFromRepository(slug);

  if (!destination) {
    notFound();
  }

  const driveHours = destination.driveHours[planningState.origin];
  const tracks = buildTracks(destination);
  const queryString = toPlanningQueryString(planningState);

  return (
    <div className="space-y-10 py-8">
      <section className="grid gap-6 pb-2 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-3">
          <p className="text-xs text-muted">Split group · {destination.region}</p>
          <h1 className="display-title text-4xl font-semibold leading-[1.05] sm:text-5xl">
            {destination.name}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-foreground">
            One trip, two tracks. Active and easy sides rejoin for meals and views.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{labelOrigin(planningState.origin)} · {driveHours}h</span>
            <span>·</span>
            <span>{labelTripLength(planningState.tripLength)}</span>
            {planningState.startDate ? (
              <>
                <span>·</span>
                <span>Starts {labelPlanningDate(planningState.startDate)}</span>
              </>
            ) : null}
            <FitScoreBadge score={destination.fitScore} size="sm" />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={`/destinations/${destination.slug}?${queryString}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Destination detail
            </Link>
            <Link
              href={`/plans/${destination.slug}?${queryString}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Full trip plan
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Why it splits well</p>
            <h2 className="text-base font-semibold">{destination.bestActivity}</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm leading-6">
            <p className="text-foreground">{destination.whyNow}</p>
            {destination.riskBadges.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {destination.riskBadges.slice(0, 3).map((risk) => (
                  <RiskBadge key={risk} label={risk} />
                ))}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Shared base</p>
            <h2 className="text-lg font-semibold">{tracks.sharedBase.town}</h2>
          </CardHeader>
          <CardBody className="grid gap-4 text-sm leading-6 md:grid-cols-3">
            <InfoBlock label="Town + lodging" value={tracks.sharedBase.lodging} />
            <InfoBlock label="Breakfast" value={tracks.sharedBase.breakfast} />
            <InfoBlock label="Dinner" value={tracks.sharedBase.dinner} />
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <TrackCard
          title="Active track"
          eyebrow="Hikers / skiers"
          items={tracks.active}
        />
        <TrackCard
          title="Low-effort track"
          eyebrow="Non-hikers / food-first"
          items={tracks.lowEffort}
        />
      </section>

      <section>
        <Card>
          <CardHeader>
            <p className="text-xs text-muted">Rejoin points</p>
            <h2 className="text-lg font-semibold">Where the two tracks meet</h2>
          </CardHeader>
          <CardBody className="grid gap-3 text-sm leading-6 md:grid-cols-3">
            {tracks.rejoin.map((point) => (
              <div key={point.label}>
                <p className="text-xs text-muted">{point.label}</p>
                <p className="mt-1 font-semibold text-foreground">{point.place}</p>
                <p className="mt-1 text-muted">{point.note}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      <section>
        <PlanBCard plan={destination.planB} />
      </section>
    </div>
  );
}

function InfoBlock({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-foreground">{value}</p>
    </div>
  );
}

type TrackItem = {
  name: string;
  detail: string;
  timing: string;
  difficulty?: string;
  gear?: string;
};

function TrackCard({
  title,
  eyebrow,
  items,
}: Readonly<{
  title: string;
  eyebrow: string;
  items: TrackItem[];
}>) {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs text-muted">{eyebrow}</p>
        <h2 className="text-lg font-semibold">{title}</h2>
      </CardHeader>
      <CardBody className="space-y-3">
        {items.map((item) => (
          <div key={item.name} className="pt-3 first:pt-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-xs text-muted">{item.timing}{item.difficulty ? ` · ${item.difficulty}` : ""}</p>
              </div>
              <ActivityChip label={item.name} kind={inferActivityKind(item.name)} size="sm" />
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground">{item.detail}</p>
            {item.gear ? (
              <p className="mt-1 text-xs text-muted">Gear · {item.gear}</p>
            ) : null}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

type Tracks = {
  sharedBase: { town: string; lodging: string; breakfast: string; dinner: string };
  active: TrackItem[];
  lowEffort: TrackItem[];
  rejoin: Array<{ label: string; place: string; note: string }>;
};

function buildTracks(destination: Destination): Tracks {
  const activities = destination.activities;
  const activeActivities = activities.filter((activity) =>
    /moderate|strenuous|long|ski|alpine|main/i.test(`${activity.difficulty} ${activity.name}`),
  );
  const easyActivities = activities.filter((activity) =>
    /very easy|easy/i.test(activity.difficulty),
  );

  const activePool = activeActivities.length > 0 ? activeActivities : activities.slice(0, 2);
  const easyPool = easyActivities.length > 0 ? easyActivities : activities.slice(-2);

  return {
    sharedBase: {
      town: destination.foodSupport.nearbyTown,
      lodging: `${destination.lodging.bestBase} · ${destination.lodging.bestFor}`,
      breakfast:
        destination.foodSupport.cafes[0] ??
        "Coffee + bakery before the group splits for the morning.",
      dinner:
        destination.foodSupport.dinner[0] ??
        "Reconvene at dinner in town so the day closes out together.",
    },
    active: activePool.slice(0, 3).map((activity) => ({
      name: activity.name,
      detail: activity.whyItFits,
      timing: activity.bestTime,
      difficulty: activity.difficulty,
      gear: inferGear(destination, activity.name),
    })),
    lowEffort: buildLowEffortItems(destination, easyPool),
    rejoin: buildRejoinPoints(destination),
  };
}

function buildLowEffortItems(
  destination: Destination,
  easyPool: Destination["activities"],
): TrackItem[] {
  const items: TrackItem[] = easyPool.slice(0, 2).map((activity) => ({
    name: activity.name,
    detail: activity.whyItFits,
    timing: activity.bestTime,
    difficulty: activity.difficulty,
  }));

  const hangout = destination.foodSupport.hangouts[0];
  if (hangout) {
    items.push({
      name: hangout,
      detail:
        "Low-effort town block — cafes, browsing, or a scenic viewpoint to kill time comfortably.",
      timing: "Afternoon",
    });
  }

  const stop = destination.suggestedStops.find((entry) =>
    /viewpoint|overlook|pull|scenic|village|harbor|town|beach/i.test(entry),
  );
  if (stop && items.length < 3) {
    items.push({
      name: stop,
      detail: "Drive-in scenic stop that works without any real walking commitment.",
      timing: "Morning or afternoon",
    });
  }

  return items;
}

function buildRejoinPoints(destination: Destination) {
  return [
    {
      label: "Lunch",
      place:
        destination.foodSupport.cafes[1] ??
        destination.foodSupport.cafes[0] ??
        destination.foodSupport.nearbyTown,
      note: "Midday checkpoint — pick a spot both tracks can reach without rushing.",
    },
    {
      label: "Sunset viewpoint",
      place:
        destination.suggestedStops.find((entry) =>
          /viewpoint|overlook|pull|scenic|beach|bluff|ridge|bridge/i.test(entry),
        ) ?? destination.suggestedStops[0] ?? "Scenic overlook near base",
      note: "Reconvene outdoors before dinner — the trip feels complete even on a split day.",
    },
    {
      label: "Dinner",
      place:
        destination.foodSupport.dinner[0] ??
        `${destination.foodSupport.nearbyTown} dinner strip`,
      note: "Close the day out together — this is how a split group still feels like one trip.",
    },
  ];
}

function inferGear(destination: Destination, activityName: string) {
  const text = activityName.toLowerCase();
  if (/ski|snowboard/.test(text)) return "Skis, boots, layers, goggles";
  if (/snowshoe|snow/.test(text)) return "Waterproof layers, traction";
  if (/hike|trail|peak|summit/.test(text)) {
    const hasAlpine = /alpine|high|summit|ridge/.test(text);
    return hasAlpine
      ? "Trail shoes, warm layers, wind shell, plenty of water"
      : "Trail shoes, layers, water";
  }
  if (/coast|beach|bluff/.test(text)) return "Windbreaker, layers";
  return destination.region.toLowerCase().includes("desert")
    ? "Sun protection, extra water"
    : "Layers, water, snacks";
}
